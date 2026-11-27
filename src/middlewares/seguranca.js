const { registarAuditoria } = require("./auditoria");

// Guarda tentativas por IP e por Email (em memória + persistência leve)
const falhasLogin = new Map();
const cadastrosPorIp = new Map();

function obterIp(req) {
  return (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "ip").split(",")[0].trim();
}

function chaveAlvo(req) {
  const email = (req.body && req.body.email ? String(req.body.email).toLowerCase().trim() : "");
  const ip = obterIp(req);
  return email ? `email:${email}` : `ip:${ip}`;
}

// 1. Verifica antes do login se a conta/IP está bloqueada
function verificarBloqueioLogin(req, res, next) {
  if (req.method !== "POST" || !req.path.toLowerCase().includes("login")) return next();

  const chave = chaveAlvo(req);
  const reg = falhasLogin.get(chave);
  if (!reg) return next();

  if (reg.permanente) {
    return res.status(423).json({
      error: true,
      message: "🔒 Conta bloqueada por segurança após 11 tentativas falhadas. Peça ao Subadmin ou Administração para redefinir a sua senha."
    });
  }

  if (reg.bloqueadoAte && Date.now() < reg.bloqueadoAte) {
    const mins = Math.ceil((reg.bloqueadoAte - Date.now()) / 60000);
    return res.status(429).json({
      error: true,
      message: `⏳ Muitas tentativas incorretas (${reg.falhas}ª falha). Tente novamente em ${mins} minuto(s).`
    });
  }

  // Intercepta a resposta do login para saber se acertou (200/201) ou errou (400/401/404)
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const falhou = res.statusCode >= 400 || (body && body.error === true);

    if (!falhou) {
      // Acertou a senha -> zera tudo imediatamente
      falhasLogin.delete(chave);
    } else {
      const atual = falhasLogin.get(chave) || { falhas: 0, bloqueadoAte: 0, permanente: false };
      atual.falhas += 1;

      if (atual.falhas >= 11) {
        atual.permanente = true;
        registarAuditoria({
          igrejaId: body?.igrejaId || 1,
          modulo: "SEGURANÇA",
          acao: "Bloqueio Permanente (11 Falhas de Login)",
          detalhes: `Alvo: ${chave} | IP: ${obterIp(req)}`,
          responsavel: "Escudo Anti-Invasão"
        });
      } else if (atual.falhas >= 9) {
        atual.bloqueadoAte = Date.now() + 6 * 60 * 60 * 1000; // 6 horas
      } else if (atual.falhas >= 6) {
        atual.bloqueadoAte = Date.now() + 1 * 60 * 60 * 1000; // 1 hora
      }

      falhasLogin.set(chave, atual);
    }
    return originalJson(body);
  };

  next();
}

// 2. Desbloqueia automaticamente quando o Subadmin/Admin redefine a senha
function desbloquearConta(email) {
  if (!email) return;
  falhasLogin.delete(`email:${String(email).toLowerCase().trim()}`);
}

// 3. Proteção Anti-Robô no Cadastro Público
function protegerCadastroRobo(req, res, next) {
  const isCadastroMembro = req.method === "POST" && (req.path.includes("/membros") && !req.path.includes("login"));
  if (!isCadastroMembro) return next();

  // A) Verifica Campo Isca Invisível (Honeypot)
  if (req.body && req.body._website_isca && String(req.body._website_isca).trim() !== "") {
    return res.status(400).json({ error: true, message: "Submissão bloqueada pelo filtro anti-spam." });
  }

  // B) Verifica Tempo Mínimo Humano (3 segundos desde abertura do formulário)
  if (req.body && req.body._tempo_abertura) {
    const decorrido = Date.now() - Number(req.body._tempo_abertura);
    if (decorrido < 3000) {
      return res.status(400).json({ error: true, message: "Preenchimento demasiado rápido. Aguarde alguns segundos e tente novamente." });
    }
  }

  // C) Limite de 3 cadastros por hora por IP
  const ip = obterIp(req);
  const agora = Date.now();
  const janela = 60 * 60 * 1000; // 1 hora
  const regIp = cadastrosPorIp.get(ip) || { count: 0, inicio: agora };

  if (agora - regIp.inicio > janela) {
    regIp.count = 0;
    regIp.inicio = agora;
  }

  regIp.count += 1;
  cadastrosPorIp.set(ip, regIp);

  if (regIp.count > 3) {
    return res.status(429).json({
      error: true,
      message: "Limite de 3 cadastros por hora atingido neste dispositivo. Tente novamente mais tarde."
    });
  }

  next();
}

module.exports = { verificarBloqueioLogin, desbloquearConta, protegerCadastroRobo };

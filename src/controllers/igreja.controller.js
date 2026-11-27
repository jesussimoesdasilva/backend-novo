const igrejaService = require("../services/igreja.service");
const prisma = require("../config/prisma"); // <-- ADICIONA AQUI
const bcrypt = require("bcryptjs");
const { desbloquearConta } = require("../middlewares/seguranca");

async function listIgrejas(req, res, next) {
  try { res.json(await igrejaService.getAllIgrejas()); } catch (err) { next(err); }
}

async function getIgreja(req, res, next) {
  try {
    const i = await igrejaService.getIgrejaById(req.params.id);
    if (!i) return res.status(404).json({ error: true, message: "Igreja não encontrada" });
    res.json(i);
  } catch (err) { next(err); }
}

async function addIgreja(req, res, next) {
  try {
    const { nome, slug, subadminEmail, subadminSenha } = req.body;
    if (!nome || !slug || !subadminEmail || !subadminSenha) {
      return res.status(400).json({ error: true, message: "Nome, slug, email e senha obrigatórios" });
    }
    res.status(201).json(await igrejaService.createIgreja(req.body));
  } catch (err) { next(err); }
}

async function editIgreja(req, res, next) {
  try {
    const { nome, slug } = req.body;
    if (!nome || !slug) return res.status(400).json({ error: true, message: "Nome e slug obrigatórios" });
    res.json(await igrejaService.updateIgreja(req.params.id, req.body));
  } catch (err) { next(err); }
}

async function removeIgreja(req, res, next) {
  try {
    await igrejaService.deleteIgreja(req.params.id);
    res.json({ ok: true, message: "Igreja apagada" });
  } catch (err) { next(err); }
}

async function uploadLogo(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: true, message: "Nenhum ficheiro" });
    const url = "/logos/" + req.file.filename;
    const atual = await igrejaService.getIgrejaById(req.params.id);
    const igreja = await igrejaService.updateIgreja(req.params.id, {
      ...atual,
      logoUrl: url,
    });
    res.json({ ok: true, url, igreja });
  } catch (err) { next(err); }
}

async function uploadImagensHero(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: true, message: "Nenhum ficheiro" });
    const urls = req.files.map(f => "/logos/" + f.filename);
    const atual = await igrejaService.getIgrejaById(req.params.id);
    const igreja = await igrejaService.updateIgreja(req.params.id, {
      ...atual,
      imagensHero: JSON.stringify(urls),
    });
    res.json({ ok: true, urls, igreja });
  } catch (err) { next(err); }
}

async function salvarCorFundo(req, res, next) {
  try {
    const { cor } = req.body;
    if (!cor) return res.status(400).json({ error: true, message: "Cor obrigatória" });
    const atual = await igrejaService.getIgrejaById(req.params.id);
    const igreja = await igrejaService.updateIgreja(req.params.id, {
      ...atual,
      corFundo: cor,
    });
    res.json({ ok: true, igreja });
  } catch (err) { next(err); }
}

async function salvarCorBarraTopo(req, res, next) {
  try {
    const { cor } = req.body;
    if (!cor) return res.status(400).json({ error: true, message: "Cor obrigatória" });
    const atual = await igrejaService.getIgrejaById(req.params.id);
    const igreja = await igrejaService.updateIgreja(req.params.id, {
      ...atual,
      corBarraTopo: cor,
    });
    res.json({ ok: true, igreja });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: true, message: "Email e senha obrigatórios" });
    const igreja = await igrejaService.loginSubadmin(email, senha);
    res.json({
      ok: true,
      igreja: { 
        id: igreja.id, 
        nome: igreja.nome, 
        slug: igreja.slug, 
        icone: igreja.icone, 
        descricao: igreja.descricao,
        ativo: igreja.ativo,
        dataExpiracao: igreja.dataExpiracao
      }
    });
  } catch (err) { res.status(401).json({ error: true, message: err.message }); }
}

const codigosAdminMaster = new Map();

async function obterConfigAdminMaster() {
  const reg = await prisma.documento.findFirst({ where: { tipo: "ADMIN_MASTER_CFG" } });
  const padrao = {
    nome: "Admin Master",
    email: "admin@master.com",
    telefone: "923000000",
    bi: "000000000LA000",
    senhaHash: await bcrypt.hash("123456", 10)
  };
  if (!reg) {
    const ig = await prisma.igreja.findFirst();
    if (ig) {
      await prisma.documento.create({
        data: { igrejaId: ig.id, nome: "Config Admin Master", tipo: "ADMIN_MASTER_CFG", url: JSON.stringify(padrao) }
      });
    }
    return padrao;
  }
  try { return { ...padrao, ...JSON.parse(reg.url), _docId: reg.id }; } catch (e) { return padrao; }
}

async function loginAdminMaster(req, res) {
  try {
    const { email, senha } = req.body;
    const cfg = await obterConfigAdminMaster();
    if (String(email).toLowerCase().trim() !== cfg.email.toLowerCase().trim()) {
      return res.status(401).json({ error: true, message: "Email do Admin Master incorreto." });
    }
    const ok = await bcrypt.compare(senha, cfg.senhaHash);
    if (!ok) return res.status(401).json({ error: true, message: "Senha incorreta." });

    res.json({ ok: true, admin: { nome: cfg.nome, email: cfg.email, telefone: cfg.telefone, bi: cfg.bi } });
  } catch (err) { res.status(500).json({ error: true, message: err.message }); }
}

async function salvarConfigAdminMaster(req, res) {
  try {
    const { nome, email, telefone, bi, novaSenha } = req.body;
    const cfg = await obterConfigAdminMaster();
    const atualizado = {
      nome: nome || cfg.nome,
      email: (email || cfg.email).toLowerCase().trim(),
      telefone: telefone || cfg.telefone,
      bi: bi || cfg.bi,
      senhaHash: (novaSenha && novaSenha.length >= 6) ? await bcrypt.hash(novaSenha, 10) : cfg.senhaHash
    };

    if (cfg._docId) {
      await prisma.documento.update({ where: { id: cfg._docId }, data: { url: JSON.stringify(atualizado) } });
    } else {
      const ig = await prisma.igreja.findFirst();
      if (ig) await prisma.documento.create({ data: { igrejaId: ig.id, nome: "Config Admin Master", tipo: "ADMIN_MASTER_CFG", url: JSON.stringify(atualizado) } });
    }
    desbloquearConta(atualizado.email);
    res.json({ ok: true, admin: { nome: atualizado.nome, email: atualizado.email, telefone: atualizado.telefone, bi: atualizado.bi } });
  } catch (err) { res.status(500).json({ error: true, message: err.message }); }
}

async function solicitarCodigoAdmin(req, res) {
  try {
    const { email, telefone, bi } = req.body;
    const cfg = await obterConfigAdminMaster();

    if (String(email).toLowerCase().trim() !== cfg.email.toLowerCase().trim()) {
      return res.status(404).json({ message: "Email do Admin Master não encontrado." });
    }
    if (String(telefone).trim() !== String(cfg.telefone).trim() || String(bi).trim().toUpperCase() !== String(cfg.bi).trim().toUpperCase()) {
      return res.status(400).json({ message: "Telefone ou B.I. não conferem com os dados das Configurações." });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    codigosAdminMaster.set(cfg.email, { codigo, expira: Date.now() + 10 * 60 * 1000 });
    res.json({ ok: true, message: "Código gerado com sucesso!", codigo });
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function redefinirSenhaAdmin(req, res) {
  try {
    const { email, codigo, novaSenha } = req.body;
    const cfg = await obterConfigAdminMaster();
    const reg = codigosAdminMaster.get(cfg.email);

    if (!reg || reg.codigo !== String(codigo).trim()) {
      return res.status(400).json({ message: "Código inválido." });
    }
    if (Date.now() > reg.expira) {
      codigosAdminMaster.delete(cfg.email);
      return res.status(400).json({ message: "Código expirado. Gere um novo." });
    }
    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ message: "A nova senha deve ter pelo menos 6 caracteres." });
    }

    const atualizado = { ...cfg, senhaHash: await bcrypt.hash(novaSenha, 10) };
    delete atualizado._docId;
    if (cfg._docId) {
      await prisma.documento.update({ where: { id: cfg._docId }, data: { url: JSON.stringify(atualizado) } });
    }
    codigosAdminMaster.delete(cfg.email);
    desbloquearConta(cfg.email);

    res.json({ ok: true, message: "Senha do Admin Master redefinida com sucesso!" });
  } catch (err) { res.status(500).json({ message: err.message }); }
}


async function renovarAssinatura(req, res) {
  try {
    const { id } = req.params;
    const igreja = await prisma.igreja.findUnique({ where: { id: Number(id) } });
    
    // Se já tem data, soma mais 30 dias. Se não tem, começa de hoje.
    const dataBase = igreja.dataExpiracao && igreja.dataExpiracao > new Date() 
      ? new Date(igreja.dataExpiracao) 
      : new Date();
    
    dataBase.setDate(dataBase.getDate() + 30);

    const atualizada = await prisma.igreja.update({
      where: { id: Number(id) },
      data: { dataExpiracao: dataBase }
    });
    res.json(atualizada);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { 
  listIgrejas, getIgreja, addIgreja, editIgreja, removeIgreja, 
  uploadLogo, uploadImagensHero, salvarCorFundo, salvarCorBarraTopo, login,
  loginAdminMaster, salvarConfigAdminMaster, solicitarCodigoAdmin, redefinirSenhaAdmin, renovarAssinatura 
};

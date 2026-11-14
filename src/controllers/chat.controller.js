const service = require("../services/chat.service");

async function listContactos(req, res, next) {
  try {
    const { igrejaId } = req.params;
    const { meuId, comNaoLidas } = req.query;
    
    const contactos = await service.listContactos(igrejaId, meuId);
    
    if (comNaoLidas === 'true') {
      const contagem = await service.contarNaoLidasPorContacto(igrejaId, meuId);
      contactos.forEach(c => {
        c.naoLidas = contagem.find(x => x.deId === c.id)?.count || 0;
      });
    } else {
      contactos.forEach(c => { c.naoLidas = 0; });
    }

    // ORDENAÇÃO: 4 grupos
    // 0º - Tem SMS + Online (mais SMS primeiro)
    // 1º - Tem SMS + Offline (mais SMS primeiro)
    // 2º - Sem SMS + Online (alfabético)
    // 3º - Sem SMS + Offline (alfabético)
    contactos.sort((a, b) => {
      const temSMS_A = a.naoLidas > 0;
      const temSMS_B = b.naoLidas > 0;

      const grupoA = temSMS_A ? (a.isOnline ? 0 : 1) : (a.isOnline ? 2 : 3);
      const grupoB = temSMS_B ? (b.isOnline ? 0 : 1) : (b.isOnline ? 2 : 3);

      if (grupoA !== grupoB) return grupoA - grupoB;

      // Dentro do mesmo grupo:
      if (temSMS_A) {
        // Grupos 0 e 1: mais SMS primeiro
        if (a.naoLidas !== b.naoLidas) return b.naoLidas - a.naoLidas;
      }
      // Grupos 2 e 3 (e empate de SMS nos grupos 0 e 1): alfabético
      return a.nome.localeCompare(b.nome);
    });
    
    res.json(contactos);
  } catch (err) { next(err); }
}

async function listMensagens(req, res, next) {
  try { 
    const { deId, paraId } = req.query;
    res.json(await service.listMensagens(deId, paraId)); 
  } catch (err) { next(err); }
}

async function enviar(req, res, next) {
  try {
    const { deId, paraId, texto } = req.body;
    if (!deId || !paraId || !texto) return res.status(400).json({ error: true, message: "Dados incompletos" });
    res.status(201).json(await service.createMensagem(req.params.igrejaId, deId, paraId, texto));
  } catch (err) { next(err); }
}

async function marcarLidas(req, res, next) {
  try {
    const { deId, paraId } = req.body;
    await service.marcarLidas(deId, paraId);
    res.json({ ok: true });
  } catch (err) { next(err); }
}

async function contarNaoLidas(req, res, next) {
  try { 
    res.json({ count: await service.contarNaoLidas(req.params.igrejaId, req.query.meuId) }); 
  } catch (err) { next(err); }
}

module.exports = { listContactos, listMensagens, enviar, marcarLidas, contarNaoLidas };
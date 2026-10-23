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
    }
    
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
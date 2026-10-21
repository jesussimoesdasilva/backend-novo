const service = require("../services/aviso.service");

async function list(req, res, next) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 4;
    res.json(await service.listAvisos(req.params.igrejaId, page, limit));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { titulo, texto } = req.body;
    if (!titulo || !texto) return res.status(400).json({ error: true, message: "Título e texto são obrigatórios" });
    res.status(201).json(await service.createAviso(req.params.igrejaId, req.body));
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try { await service.deleteAviso(req.params.id); res.json({ ok: true }); } catch (err) { next(err); }
}

module.exports = { list, create, remove };
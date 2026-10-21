const service = require("../services/evento.service");

async function list(req, res, next) {
  try { res.json(await service.listEventos(req.params.igrejaId)); } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { title, startsAt } = req.body;
    if (!title || !startsAt) return res.status(400).json({ error: true, message: "Título e data são obrigatórios" });
    res.status(201).json(await service.createEvento(req.params.igrejaId, req.body));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { title, startsAt } = req.body;
    if (!title || !startsAt) return res.status(400).json({ error: true, message: "Título e data são obrigatórios" });
    res.json(await service.updateEvento(req.params.id, req.body));
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try { await service.deleteEvento(req.params.id); res.json({ ok: true }); } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };
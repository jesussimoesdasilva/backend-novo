const service = require("../services/sector.service");

async function list(req, res, next) {
  try { res.json(await service.listSectores(req.params.igrejaId)); } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    if (!req.body.nome || !req.body.departamentoId) return res.status(400).json({ error: true, message: "Nome e departamento obrigatórios" });
    res.status(201).json(await service.createSector(req.params.igrejaId, req.body));
  } catch (err) { next(err); }
}

async function setLider(req, res, next) {
  try { res.json(await service.updateLider(req.params.id, req.body.membroId)); } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try { await service.deleteSector(req.params.id); res.json({ ok: true }); } catch (err) { next(err); }
}

module.exports = { list, create, setLider, remove };
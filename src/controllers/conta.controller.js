const service = require("../services/conta.service");

async function list(req, res, next) {
  try { res.json(await service.listContas(req.params.igrejaId)); } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { banco, tipo, numero } = req.body;
    if (!banco || !tipo || !numero) return res.status(400).json({ error: true, message: "Banco, tipo e número são obrigatórios" });
    res.status(201).json(await service.createConta(req.params.igrejaId, req.body));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try { res.json(await service.updateConta(req.params.id, req.body)); } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try { await service.deleteConta(req.params.id); res.json({ ok: true }); } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };
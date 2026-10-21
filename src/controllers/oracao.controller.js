const service = require("../services/oracao.service");

async function create(req, res) {
  try { res.status(201).json(await service.criarPedido(req.params.igrejaId, req.body)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function list(req, res) {
  try { res.json(await service.listarPedidos(req.params.igrejaId, req.query.tipo)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function updateStatus(req, res) {
  try { res.json(await service.atualizarStatus(req.params.id, req.body.status)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function remove(req, res) {
  try { await service.apagarPedido(req.params.id); res.json({ ok: true }); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function listPublic(req, res) {
  try { res.json(await service.listarTestemunhosPublicos(req.params.igrejaId)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

module.exports = { create, list, updateStatus, remove, listPublic };
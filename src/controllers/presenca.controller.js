const service = require("../services/presenca.service");

async function registarPresenca(req, res) {
  try { res.status(201).json(await service.registarPresenca(req.body)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function listarPresencas(req, res) {
  try { res.json(await service.listarPresencas(req.params.igrejaId)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function criarEscala(req, res) {
  try { res.status(201).json(await service.criarEscala(req.body)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function listarEscalas(req, res) {
  try { res.json(await service.listarEscalas(req.params.igrejaId)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function listarEscalasMembro(req, res) {
  try { res.json(await service.listarEscalasMembro(req.params.membroId)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function apagarEscala(req, res) {
  try { await service.apagarEscala(req.params.id); res.json({ ok: true }); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function editarEscala(req, res) {
  try { res.json(await service.editarEscala(req.params.id, req.body)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function responderEscalaMembro(req, res) {
  try {
    const { membroId, nomeMembro, status, motivo } = req.body;
    res.json(await service.responderEscalaMembro(req.params.id, membroId, nomeMembro, status, motivo));
  } catch (err) { res.status(500).json({ message: err.message }); }
}

module.exports = { registarPresenca, listarPresencas, criarEscala, listarEscalas, listarEscalasMembro, apagarEscala, editarEscala, responderEscalaMembro };

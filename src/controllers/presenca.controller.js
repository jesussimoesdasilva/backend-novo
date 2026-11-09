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

module.exports = { registarPresenca, listarPresencas, criarEscala, listarEscalas };
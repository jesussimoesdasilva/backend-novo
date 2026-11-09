const service = require("../services/documento.service");

async function listarDocumentos(req, res) {
  try { res.json(await service.listarDocumentos(req.params.igrejaId)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function criarDocumento(req, res) {
  try { res.status(201).json(await service.criarDocumento(req.body)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function apagarDocumento(req, res) {
  try { await service.apagarDocumento(req.params.id); res.json({ message: "Documento apagado." }); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

module.exports = { listarDocumentos, criarDocumento, apagarDocumento };
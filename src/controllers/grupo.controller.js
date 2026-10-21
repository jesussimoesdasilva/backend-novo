const grupoService = require("../services/grupo.service");

// ===== CHAT DO DEPARTAMENTO =====
async function listarMensagensDepto(req, res) {
  try {
    res.json(await grupoService.obterMensagensDepto(req.params.deptoId));
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function enviarMensagemDepto(req, res) {
  try {
    const { deptoId } = req.params;
    const { membroId, texto } = req.body;
    const pertence = await grupoService.verificarMembroDoDepto(membroId, deptoId);
    if (!pertence) return res.status(403).json({ message: "Acesso restrito aos membros deste departamento." });
    res.status(201).json(await grupoService.criarMensagemDepto(membroId, deptoId, texto));
  } catch (err) { res.status(500).json({ message: err.message }); }
}

// ===== CHAT DO SECTOR =====
async function listarMensagensSector(req, res) {
  try {
    res.json(await grupoService.obterMensagensSector(req.params.sectorId));
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function enviarMensagemSector(req, res) {
  try {
    const { sectorId } = req.params;
    const { membroId, texto } = req.body;
    const pertence = await grupoService.verificarMembroDoSector(membroId, sectorId);
    if (!pertence) return res.status(403).json({ message: "Acesso restrito aos membros deste sector." });
    res.status(201).json(await grupoService.criarMensagemSector(membroId, sectorId, texto));
  } catch (err) { res.status(500).json({ message: err.message }); }
}

// ===== MODERAÇÃO =====
async function silenciarMensagem(req, res) {
  try {
    await grupoService.esconderMensagem(req.params.msgId);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
}

// ===== GALERIA =====
async function listarFotosSector(req, res) {
  try {
    res.json(await grupoService.obterFotosDoSector(req.params.sectorId));
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function uploadFotoAtividade(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "Nenhuma foto enviada" });
    const { sectorId } = req.params;
    const { legenda, igrejaId } = req.body;
    const url = '/logos/' + req.file.filename;
    res.status(201).json(await grupoService.criarFotoAtividade(igrejaId, sectorId, url, legenda));
  } catch (err) { res.status(500).json({ message: err.message }); }
}

module.exports = {
  listarMensagensDepto, enviarMensagemDepto,
  listarMensagensSector, enviarMensagemSector,
  silenciarMensagem, listarFotosSector, uploadFotoAtividade
};
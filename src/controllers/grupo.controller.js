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

// ===== GALERIA DO SECTOR =====
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
    
    const foto = await grupoService.criarFotoAtividade(igrejaId, sectorId, url, legenda);
    res.status(201).json(foto);
  } catch (err) { 
    // Se for o erro de limite de tamanho ou tipo, devolve JSON em vez de HTML
    if (err.message.includes('Limite de') || err.code === 'LIMIT_FILE_SIZE' || err.message.includes('Apenas')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message }); 
  }
}

async function apagarFotoAtividade(req, res) {
  try {
    await grupoService.apagarFotoAtividade(req.params.id);
    res.json({ message: "Foto apagada com sucesso" });
  } catch (err) { res.status(500).json({ message: err.message }); }
}

// ===== GALERIA DO DEPARTAMENTO (NOVO) =====
async function obterFotosDoDepartamento(req, res) {
  try {
    res.json(await grupoService.obterFotosDoDepartamento(req.params.deptoId));
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function criarFotoDepartamento(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "Nenhuma foto enviada" });
    const { deptoId } = req.params;
    const { legenda, igrejaId } = req.body;
    const url = '/logos/' + req.file.filename;
    
    const foto = await grupoService.criarFotoDepartamento(igrejaId, deptoId, url, legenda);
    res.status(201).json(foto);
  } catch (err) {
    if (err.message.includes('Limite de') || err.code === 'LIMIT_FILE_SIZE' || err.message.includes('Apenas')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

async function apagarFotoDepartamento(req, res) {
  try {
    await grupoService.apagarFotoDepartamento(req.params.fotoId);
    res.json({ message: "Foto apagada com sucesso" });
  } catch (err) { res.status(500).json({ message: err.message }); }
}

// ===== EXPORTS =====
module.exports = {
  listarMensagensDepto, enviarMensagemDepto,
  listarMensagensSector, enviarMensagemSector,
  silenciarMensagem,
  listarFotosSector, uploadFotoAtividade, apagarFotoAtividade,
  // NOVAS:
  obterFotosDoDepartamento, criarFotoDepartamento, apagarFotoDepartamento
};
const service = require("../services/midia.service");

async function list(req, res) {
  try {
    const lista = await service.listarMidias(req.params.igrejaId);
    res.json(lista);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function create(req, res) {
  try {
    const { titulo, tipo } = req.body;
    let url = req.body.url; 
    let isArquivo = false;

    // Se o admin fez upload de um ficheiro (vídeo ou áudio)
    if (req.file) {
      url = '/midia/' + req.file.filename;
      isArquivo = true;
    }

    if (!titulo || !tipo || !url) {
      return res.status(400).json({ message: "Título, tipo e ficheiro/link são obrigatórios." });
    }

    const midia = await service.criarMidia(req.params.igrejaId, titulo, tipo, url, isArquivo);
    res.status(201).json(midia);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function remove(req, res) {
  try {
    await service.deletarMidia(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
}

module.exports = { list, create, remove };
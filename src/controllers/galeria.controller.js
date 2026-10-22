const service = require("../services/galeria.service");

async function listAlbuns(req, res, next) {
  try { res.json(await service.listAlbuns(req.params.igrejaId)); } catch (err) { next(err); }
}

async function getAlbum(req, res, next) {
  try {
    const album = await service.getAlbum(req.params.id);
    if (!album) return res.status(404).json({ error: true, message: "Álbum não encontrado" });
    res.json(album);
  } catch (err) { next(err); }
}

async function createAlbum(req, res, next) {
  try {
    if (!req.body.nome) return res.status(400).json({ error: true, message: "Nome do álbum obrigatório" });
    res.status(201).json(await service.createAlbum(req.params.igrejaId, req.body));
  } catch (err) { next(err); }
}

async function updateAlbum(req, res, next) {
  try { res.json(await service.updateAlbum(req.params.id, req.body)); } catch (err) { next(err); }
}

async function setCapaAlbum(req, res, next) {
  try {
    const { capaUrl } = req.body;
    if (!capaUrl) return res.status(400).json({ error: true, message: "Nenhuma imagem enviada" });
    res.json(await service.setCapaAlbum(req.params.id, capaUrl));
  } catch (err) { next(err); }
}

async function deleteAlbum(req, res, next) {
  try { await service.deleteAlbum(req.params.id); res.json({ ok: true }); } catch (err) { next(err); }
}

async function listFotos(req, res, next) {
  try { res.json(await service.listFotosByAlbum(req.params.albumId)); } catch (err) { next(err); }
}

async function uploadFotos(req, res, next) {
  try {
    const { fotos } = req.body;
    if (!fotos || fotos.length === 0) return res.status(400).json({ error: true, message: "Nenhuma foto enviada" });
    
    const fotosCriadas = [];
    for (const url of fotos) {
      const foto = await service.createFoto(req.params.igrejaId, req.params.albumId, {
        titulo: req.body.titulo || null,
        url
      });
      fotosCriadas.push(foto);
    }
    
    res.status(201).json(fotosCriadas);
  } catch (err) { next(err); }
}

async function deleteFoto(req, res, next) {
  try { await service.deleteFoto(req.params.id); res.json({ ok: true }); } catch (err) { next(err); }
}

module.exports = { 
  listAlbuns, getAlbum, createAlbum, updateAlbum, setCapaAlbum, deleteAlbum,
  listFotos, uploadFotos, deleteFoto
};
const prisma = require("../config/prisma");

async function listAlbuns(igrejaId) {
  return await prisma.album.findMany({
    where: { igrejaId: Number(igrejaId) },
    orderBy: { criadoEm: 'desc' },
    include: { _count: { select: { fotos: true } } }
  });
}

async function getAlbum(id) {
  return await prisma.album.findUnique({ 
    where: { id: Number(id) },
    include: { fotos: { orderBy: { criadoEm: 'desc' } } }
  });
}

async function createAlbum(igrejaId, data) {
  return await prisma.album.create({
    data: {
      igrejaId: Number(igrejaId),
      nome: data.nome,
      descricao: data.descricao || null,
      dataEvento: data.dataEvento ? new Date(data.dataEvento) : null,
      privado: data.privado === true || data.privado === 'true',
    },
  });
}

async function updateAlbum(id, data) {
  return await prisma.album.update({
    where: { id: Number(id) },
    data: {
      nome: data.nome,
      descricao: data.descricao,
      dataEvento: data.dataEvento ? new Date(data.dataEvento) : null,
      privado: data.privado === true || data.privado === 'true',
    },
  });
}

async function setCapaAlbum(id, capaUrl) {
  return await prisma.album.update({
    where: { id: Number(id) },
    data: { capaUrl },
  });
}

async function deleteAlbum(id) {
  return await prisma.album.delete({ where: { id: Number(id) } });
}

async function listFotosByAlbum(albumId) {
  return await prisma.foto.findMany({
    where: { albumId: Number(albumId) },
    orderBy: { criadoEm: 'desc' }
  });
}

async function createFoto(igrejaId, albumId, data) {
  return await prisma.foto.create({
    data: {
      igrejaId: Number(igrejaId),
      albumId: albumId ? Number(albumId) : null,
      titulo: data.titulo || null,
      url: data.url
    },
  });
}

async function deleteFoto(id) {
  return await prisma.foto.delete({ where: { id: Number(id) } });
}

module.exports = { 
  listAlbuns, getAlbum, createAlbum, updateAlbum, setCapaAlbum, deleteAlbum,
  listFotosByAlbum, createFoto, deleteFoto
};
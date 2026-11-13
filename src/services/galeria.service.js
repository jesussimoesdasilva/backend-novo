const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");

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

// APAGA ÁLBUM INTEIRO
async function deleteAlbum(id) {
  const album = await prisma.album.findUnique({ 
    where: { id: Number(id) },
    include: { fotos: true }
  });
  if (!album) throw new Error("Álbum não encontrado");

  // 1. Apaga a capa
  if (album.capaUrl) {
    try {
      const urlParts = album.capaUrl.split('/upload/');
      if (urlParts.length > 1) {
        let publicId = urlParts[1].replace(/^v\d+\//, '');
        publicId = publicId.split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (err) { console.error("Erro ao apagar capa:", err); }
  }

  // 2. Apaga todas as fotos do álbum
  for (const foto of album.fotos) {
    if (foto.url) {
      try {
        const urlParts = foto.url.split('/upload/');
        if (urlParts.length > 1) {
          let publicId = urlParts[1].replace(/^v\d+\//, '');
          publicId = publicId.split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) { console.error("Erro ao apagar foto:", err); }
    }
  }

  // 3. Apaga o álbum da base de dados
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

// APAGA UMA FOTO INDIVIDUAL
async function deleteFoto(id) {
  const foto = await prisma.foto.findUnique({ where: { id: Number(id) } });
  if (!foto) throw new Error("Foto não encontrada");

  if (foto.url) {
    try {
      const urlParts = foto.url.split('/upload/');
      if (urlParts.length > 1) {
        let publicId = urlParts[1].replace(/^v\d+\//, '');
        publicId = publicId.split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (err) {
      console.error("Erro ao apagar foto da galeria no Cloudinary:", err);
    }
  }

  return await prisma.foto.delete({ where: { id: Number(id) } });
}

module.exports = { 
  listAlbuns, getAlbum, createAlbum, updateAlbum, setCapaAlbum, deleteAlbum,
  listFotosByAlbum, createFoto, deleteFoto
};
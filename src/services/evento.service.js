const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");

async function listEventos(igrejaId) {
  return await prisma.evento.findMany({
    where: { igrejaId: Number(igrejaId) },
    orderBy: { startsAt: "asc" },
  });
}

async function createEvento(igrejaId, data) {
  return await prisma.evento.create({
    data: {
      igrejaId: Number(igrejaId),
      title: data.title,
      description: data.description || null,
      local: data.local || null,
      imagem: data.imagem || null,
      startsAt: new Date(data.startsAt),
    },
  });
}

async function updateEvento(id, data) {
  return await prisma.evento.update({
    where: { id: Number(id) },
    data: {
      title: data.title,
      description: data.description,
      local: data.local,
      imagem: data.imagem,
      startsAt: new Date(data.startsAt),
    },
  });
}

async function deleteEvento(id) {
  // 1. Vai buscar o evento para ver se tem imagem
  const evento = await prisma.evento.findUnique({ where: { id: Number(id) } });
  if (!evento) throw new Error("Evento não encontrado");

  // 2. Se tiver imagem, apaga no Cloudinary
  if (evento.imagem) {
    try {
      const urlParts = evento.imagem.split('/');
      const fileName = urlParts.pop();
      const folder = urlParts.pop();
      const publicId = `${folder}/${fileName.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("Erro ao apagar imagem do evento:", err);
    }
  }

  // 3. Apaga o registo da base de dados
  return await prisma.evento.delete({ where: { id: Number(id) } });
}

module.exports = { listEventos, createEvento, updateEvento, deleteEvento };
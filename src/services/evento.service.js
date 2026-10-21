const prisma = require("../config/prisma");

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
  return await prisma.evento.delete({ where: { id: Number(id) } });
}

module.exports = { listEventos, createEvento, updateEvento, deleteEvento };
const prisma = require("../config/prisma");

async function listAvisos(igrejaId, page = 1, limit = 4) {
  const skip = (page - 1) * limit;
  const total = await prisma.aviso.count({ where: { igrejaId: Number(igrejaId) } });

  const avisos = await prisma.aviso.findMany({
    where: { igrejaId: Number(igrejaId) },
    orderBy: { criadoEm: "desc" },
    skip: Number(skip),
    take: Number(limit),
  });

  return {
    avisos,
    total,
    paginaAtual: Number(page),
    totalPaginas: Math.ceil(total / limit),
    porPagina: Number(limit)
  };
}

async function createAviso(igrejaId, data) {
  return await prisma.aviso.create({
    data: {
      igrejaId: Number(igrejaId),
      titulo: data.titulo,
      texto: data.texto,
    },
  });
}

async function deleteAviso(id) {
  return await prisma.aviso.delete({ where: { id: Number(id) } });
}

module.exports = { listAvisos, createAviso, deleteAviso };
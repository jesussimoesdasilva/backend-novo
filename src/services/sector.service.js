const prisma = require("../config/prisma");

async function listSectores(igrejaId) {
  return await prisma.sector.findMany({
    where: { igrejaId: Number(igrejaId) },
    include: { 
      lider: { select: { nome: true } },
      membros: { select: { id: true, nome: true } }, // <-- A CORREÇÃO AQUI
      _count: { select: { membros: true } } 
    },
    orderBy: { nome: "asc" },
  });
}

async function createSector(igrejaId, data) {
  return await prisma.sector.create({
    data: {
      igrejaId: Number(igrejaId),
      departamentoId: Number(data.departamentoId),
      nome: data.nome,
      descricao: data.descricao || null,
    },
  });
}

async function updateLider(id, membroId) {
  return await prisma.sector.update({
    where: { id: Number(id) },
    data: { liderId: membroId ? Number(membroId) : null }
  });
}

async function deleteSector(id) {
  return await prisma.sector.delete({ where: { id: Number(id) } });
}

module.exports = { listSectores, createSector, updateLider, deleteSector };
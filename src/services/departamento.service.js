const prisma = require("../config/prisma");

async function listDepartamentos(igrejaId) {
  return await prisma.departamento.findMany({
    where: { igrejaId: Number(igrejaId) },
    include: {
      lider: true,
      _count: { select: { membros: true, sectores: true } },
      sectores: {
        include: {
          lider: true,
          membros: { select: { id: true, nome: true } }, // <-- A CORREÇÃO AQUI
          _count: { select: { membros: true } }
        }
      }
    },
    orderBy: { nome: 'asc' }
  });
}

async function getDepartamentoById(id) {
  return await prisma.departamento.findUnique({
    where: { id: Number(id) },
    include: {
      lider: true,
      sectores: {
        include: {
          lider: true,
          membros: { select: { id: true, nome: true } }, // <-- A CORREÇÃO AQUI
          _count: { select: { membros: true } }
        }
      }
    }
  });
}

async function createDepartamento(igrejaId, data) {
  return await prisma.departamento.create({
    data: {
      igrejaId: Number(igrejaId),
      nome: data.nome,
      icone: data.icone || null,
      descricao: data.descricao || null,
      liderId: data.liderId ? Number(data.liderId) : null
    }
  });
}

async function updateDepartamento(id, data) {
  return await prisma.departamento.update({
    where: { id: Number(id) },
    data: {
      nome: data.nome,
      icone: data.icone,
      descricao: data.descricao,
      liderId: data.liderId ? Number(data.liderId) : null
    }
  });
}

async function deleteDepartamento(id) {
  return await prisma.departamento.delete({ where: { id: Number(id) } });
}

async function definirLiderSector(sectorId, membroId) {
  return await prisma.sector.update({
    where: { id: Number(sectorId) },
    data: { liderId: membroId ? Number(membroId) : null }
  });
}

module.exports = {
  listDepartamentos,
  getDepartamentoById,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
  definirLiderSector
};
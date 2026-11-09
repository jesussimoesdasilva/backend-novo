const prisma = require("../config/prisma");

async function registarPresenca(data) {
  return await prisma.presenca.create({
    data: {
      igrejaId: Number(data.igrejaId),
      membroId: Number(data.membroId),
      tipo: data.tipo
    }
  });
}

async function listarPresencas(igrejaId) {
  return await prisma.presenca.findMany({
    where: { igrejaId: Number(igrejaId) },
    include: { membro: true },
    orderBy: { data: 'desc' }
  });
}

async function criarEscala(data) {
  return await prisma.escala.create({
    data: {
      igrejaId: Number(data.igrejaId),
      titulo: data.titulo,
      descricao: data.descricao,
      data: new Date(data.data),
      membros: { connect: data.membrosIds.map(id => ({ id: Number(id) })) }
    },
    include: { membros: true }
  });
}

async function listarEscalas(igrejaId) {
  return await prisma.escala.findMany({
    where: { igrejaId: Number(igrejaId) },
    include: { membros: true },
    orderBy: { data: 'asc' }
  });
}

module.exports = { registarPresenca, listarPresencas, criarEscala, listarEscalas };
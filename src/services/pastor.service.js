const prisma = require("../config/prisma");

async function listPastores(igrejaId) {
  return await prisma.pastor.findMany({
    where: { igrejaId: Number(igrejaId) },
    orderBy: { criadoEm: 'asc' }
  });
}

async function getPastor(id) {
  return await prisma.pastor.findUnique({
    where: { id: Number(id) }
  });
}

async function createPastor(igrejaId, data) {
  return await prisma.pastor.create({
    data: {
      igrejaId: Number(igrejaId),
      nome: data.nome,
      cargo: data.cargo || 'Pastor',
      bio: data.bio || null,
      telefone: data.telefone || null,
      email: data.email || null,
      versiculo: data.versiculo || null,
      conselho: data.conselho || null,
    },
  });
}

async function updatePastor(id, data) {
  return await prisma.pastor.update({
    where: { id: Number(id) },
    data: {
      nome: data.nome,
      cargo: data.cargo,
      bio: data.bio,
      telefone: data.telefone,
      email: data.email,
      versiculo: data.versiculo,
      conselho: data.conselho,
    },
  });
}

async function deletePastor(id) {
  return await prisma.pastor.delete({ where: { id: Number(id) } });
}

module.exports = { listPastores, getPastor, createPastor, updatePastor, deletePastor };
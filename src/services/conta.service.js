const prisma = require("../config/prisma");

async function listContas(igrejaId) {
  return await prisma.contaBancaria.findMany({
    where: { igrejaId: Number(igrejaId) },
    orderBy: { criadoEm: "desc" }
  });
}

async function createConta(igrejaId, data) {
  return await prisma.contaBancaria.create({
    data: {
      igrejaId: Number(igrejaId),
      banco: data.banco,
      tipo: data.tipo,
      numero: data.numero,
      titular: data.titular || null,
    },
  });
}

async function updateConta(id, data) {
  return await prisma.contaBancaria.update({
    where: { id: Number(id) },
    data: {
      banco: data.banco,
      tipo: data.tipo,
      numero: data.numero,
      titular: data.titular || null,
    },
  });
}

async function deleteConta(id) {
  return await prisma.contaBancaria.delete({ where: { id: Number(id) } });
}

module.exports = { listContas, createConta, updateConta, deleteConta };
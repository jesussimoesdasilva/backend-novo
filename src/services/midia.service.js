const prisma = require("../config/prisma");

async function listarMidias(igrejaId) {
  return await prisma.midia.findMany({
    where: { igrejaId: Number(igrejaId) },
    orderBy: { criadoEm: 'desc' }
  });
}

async function criarMidia(igrejaId, titulo, tipo, url, isArquivo) {
  return await prisma.midia.create({
    data: {
      igrejaId: Number(igrejaId),
      titulo,
      tipo,
      url,
      isArquivo
    }
  });
}

async function deletarMidia(id) {
  return await prisma.midia.delete({
    where: { id: Number(id) }
  });
}

module.exports = { listarMidias, criarMidia, deletarMidia };
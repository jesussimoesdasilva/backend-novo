const prisma = require("../config/prisma");

async function listarDocumentos(igrejaId) {
  return await prisma.documento.findMany({
    where: { igrejaId: Number(igrejaId) },
    include: { membro: { select: { nome: true } } },
    orderBy: { criadoEm: 'desc' }
  });
}

async function criarDocumento(data) {
  return await prisma.documento.create({
    data: {
      igrejaId: Number(data.igrejaId),
      nome: data.nome,
      url: data.url,
      tipo: data.tipo,
      membroId: data.membroId ? Number(data.membroId) : null
    }
  });
}

async function apagarDocumento(id) {
  return await prisma.documento.delete({ where: { id: Number(id) } });
}

module.exports = { listarDocumentos, criarDocumento, apagarDocumento };
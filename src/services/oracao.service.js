const prisma = require("../config/prisma");

async function criarPedido(igrejaId, data) {
  return await prisma.pedidoOracao.create({
    data: {
      igrejaId: Number(igrejaId),
      name: data.name || null,
      contact: data.contact || null,
      message: data.message,
      tipo: data.tipo // PEDIDO ou TESTEMUNHO
    }
  });
}

async function listarPedidos(igrejaId, tipo) {
  return await prisma.pedidoOracao.findMany({
    where: { igrejaId: Number(igrejaId), tipo: tipo },
    orderBy: { createdAt: 'desc' }
  });
}

async function atualizarStatus(id, status) {
  return await prisma.pedidoOracao.update({
    where: { id: Number(id) },
    data: { status }
  });
}

async function apagarPedido(id) {
  return await prisma.pedidoOracao.delete({
    where: { id: Number(id) }
  });
}

async function listarTestemunhosPublicos(igrejaId) {
  return await prisma.pedidoOracao.findMany({
    where: { igrejaId: Number(igrejaId), tipo: 'TESTEMUNHO', status: 'APROVADO' },
    orderBy: { createdAt: 'desc' }
  });
}

module.exports = { criarPedido, listarPedidos, atualizarStatus, apagarPedido, listarTestemunhosPublicos };
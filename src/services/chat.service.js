const prisma = require("../config/prisma");

// Lista todos os membros da igreja para o utilizador escolher com quem falar
async function listContactos(igrejaId, meuId) {
  return await prisma.membro.findMany({
    where: { 
      igrejaId: Number(igrejaId),
      id: { not: Number(meuId) } // Não mostrar o próprio
    },
    select: { id: true, nome: true, foto: true, cargo: true },
    orderBy: { nome: 'asc' }
  });
}

// Lista as mensagens entre dois utilizadores
async function listMensagens(deId, paraId) {
  return await prisma.mensagem.findMany({
    where: {
      OR: [
        { deId: Number(deId), paraId: Number(paraId) },
        { deId: Number(paraId), paraId: Number(deId) }
      ]
    },
    orderBy: { criadoEm: 'asc' },
    include: {
      de: { select: { id: true, nome: true, foto: true } }
    }
  });
}

// Envia uma mensagem
async function createMensagem(igrejaId, deId, paraId, texto) {
  return await prisma.mensagem.create({
    data: {
      igrejaId: Number(igrejaId),
      deId: Number(deId),
      paraId: Number(paraId),
      texto: texto
    },
    include: {
      de: { select: { id: true, nome: true, foto: true } }
    }
  });
}

// Marca as mensagens como lidas (quando o destinatário abre a conversa)
async function marcarLidas(deId, paraId) {
  return await prisma.mensagem.updateMany({
    where: {
      deId: Number(paraId),
      paraId: Number(deId),
      lida: false
    },
    data: { lida: true }
  });
}

// Conta quantas mensagens não lidas o utilizador tem
async function contarNaoLidas(igrejaId, meuId) {
  return await prisma.mensagem.count({
    where: {
      igrejaId: Number(igrejaId),
      paraId: Number(meuId),
      lida: false
    }
  });
}

module.exports = { listContactos, listMensagens, createMensagem, marcarLidas, contarNaoLidas };
const prisma = require("../config/prisma");

async function listContactos(igrejaId, meuId) {
  const membros = await prisma.membro.findMany({
    where: { 
      igrejaId: Number(igrejaId),
      id: { not: Number(meuId) }
    },
    select: { id: true, nome: true, foto: true, cargo: true }
  });

  const ultimasMensagens = await prisma.mensagem.groupBy({
    by: ['deId'],
    where: {
      igrejaId: Number(igrejaId),
      OR: [
        { deId: Number(meuId) },
        { paraId: Number(meuId) }
      ]
    },
    _max: { criadoEm: true }
  });

  const contactosComData = membros.map(m => {
    const ultima = ultimasMensagens.find(u => u.deId === m.id);
    return {
      ...m,
      ultimaMensagem: ultima ? ultima._max.criadoEm : null
    };
  });

  contactosComData.sort((a, b) => {
    if (!a.ultimaMensagem && !b.ultimaMensagem) return 0;
    if (!a.ultimaMensagem) return 1;
    if (!b.ultimaMensagem) return -1;
    return new Date(b.ultimaMensagem) - new Date(a.ultimaMensagem);
  });

  return contactosComData.map(c => ({
    id: c.id,
    nome: c.nome,
    foto: c.foto,
    cargo: c.cargo
  }));
}

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

async function contarNaoLidas(igrejaId, meuId) {
  return await prisma.mensagem.count({
    where: {
      igrejaId: Number(igrejaId),
      paraId: Number(meuId),
      lida: false
    }
  });
}

async function contarNaoLidasPorContacto(igrejaId, meuId) {
  const mensagens = await prisma.mensagem.findMany({
    where: {
      igrejaId: Number(igrejaId),
      paraId: Number(meuId),
      lida: false
    },
    select: { deId: true }
  });

  const contagem = {};
  mensagens.forEach(m => {
    contagem[m.deId] = (contagem[m.deId] || 0) + 1;
  });

  return Object.keys(contagem).map(deId => ({
    deId: Number(deId),
    count: contagem[deId]
  }));
}

module.exports = { 
  listContactos, 
  listMensagens, 
  createMensagem, 
  marcarLidas, 
  contarNaoLidas,
  contarNaoLidasPorContacto 
};
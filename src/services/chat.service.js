const prisma = require("../config/prisma");

// Lista todos os membros da igreja para o utilizador escolher com quem falar
async function listContactos(igrejaId, meuId) {
  // 1. Vai buscar todos os membros da igreja (exceto eu)
  const membros = await prisma.membro.findMany({
    where: { 
      igrejaId: Number(igrejaId),
      id: { not: Number(meuId) }
    },
    select: { id: true, nome: true, foto: true, cargo: true }
  });

  // 2. Vai buscar a data da última mensagem de cada membro comigo
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

  // 3. Junta as duas listas
  const contactosComData = membros.map(m => {
    const ultima = ultimasMensagens.find(u => u.deId === m.id);
    return {
      ...m,
      ultimaMensagem: ultima ? ultima._max.criadoEm : null
    };
  });

  // 4. Ordena: quem tem mensagem mais recente fica no topo. Quem não tem, fica no fim.
  contactosComData.sort((a, b) => {
    if (!a.ultimaMensagem && !b.ultimaMensagem) return 0;
    if (!a.ultimaMensagem) return 1;
    if (!b.ultimaMensagem) return -1;
    return new Date(b.ultimaMensagem) - new Date(a.ultimaMensagem);
  });

  // 5. Devolve apenas os dados que o frontend precisa
  return contactosComData.map(c => ({
    id: c.id,
    nome: c.nome,
    foto: c.foto,
    cargo: c.cargo
  }));
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

// Conta quantas mensagens não lidas o utilizador tem (total)
async function contarNaoLidas(igrejaId, meuId) {
  return await prisma.mensagem.count({
    where: {
      igrejaId: Number(igrejaId),
      paraId: Number(meuId),
      lida: false
    }
  });
}

// Conta quantas mensagens não lidas há por cada contacto (para o pontinho vermelho)
async function contarNaoLidasPorContacto(igrejaId, meuId) {
  const mensagens = await prisma.mensagem.findMany({
    where: {
      igrejaId: Number(igrejaId),
      paraId: Number(meuId),
      lida: false
    },
    select: { deId: true }
  });

  // Conta manualmente quantas mensagens cada pessoa enviou
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
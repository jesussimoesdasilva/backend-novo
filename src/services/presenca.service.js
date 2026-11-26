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

async function listarEscalasMembro(membroId) {
  return await prisma.escala.findMany({
    where: {
      membros: { some: { id: Number(membroId) } }
    },
    include: { membros: { select: { id: true, nome: true } } },
    orderBy: { data: 'asc' }
  });
}

async function apagarEscala(id) {
  return await prisma.escala.delete({ where: { id: Number(id) } });
}

async function editarEscala(id, data) {
  const escalaAtual = await prisma.escala.findUnique({ where: { id: Number(id) } });
  const descAtual = escalaAtual?.descricao || "";
  const blocoRespostas = descAtual.includes("||RESPOSTAS:") ? "||RESPOSTAS:" + descAtual.split("||RESPOSTAS:")[1] : "";

  return await prisma.escala.update({
    where: { id: Number(id) },
    data: {
      titulo: data.titulo,
      descricao: (data.descricao || "") + blocoRespostas,
      data: new Date(data.data),
      membros: {
        set: data.membrosIds.map(mId => ({ id: Number(mId) }))
      }
    },
    include: { membros: true }
  });
}

async function responderEscalaMembro(escalaId, membroId, nomeMembro, status, motivo) {
  const escala = await prisma.escala.findUnique({ where: { id: Number(escalaId) } });
  if (!escala) throw new Error("Escala não encontrada");

  const partes = (escala.descricao || "").split("||RESPOSTAS:");
  const textoLimpo = partes[0];
  let respostas = {};
  if (partes[1]) {
    try { respostas = JSON.parse(partes[1]); } catch (e) {}
  }

  respostas[membroId] = {
    nome: nomeMembro,
    status, // "CONFIRMADO" ou "INDISPONIVEL"
    motivo: motivo || "",
    em: new Date().toISOString()
  };

  return await prisma.escala.update({
    where: { id: Number(escalaId) },
    data: {
      descricao: textoLimpo + "||RESPOSTAS:" + JSON.stringify(respostas)
    },
    include: { membros: true }
  });
}

module.exports = { registarPresenca, listarPresencas, criarEscala, listarEscalas, listarEscalasMembro, apagarEscala, editarEscala, responderEscalaMembro };

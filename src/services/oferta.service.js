const prisma = require("../config/prisma");

async function listOfertas(igrejaId) {
  return await prisma.oferta.findMany({
    where: { igrejaId: Number(igrejaId) },
    orderBy: { criadoEm: "desc" },
    include: { membro: { select: { nome: true, bi: true, telefone: true } } }
  });
}

async function createOferta(igrejaId, data) {
  // Gera um código. Se for SAIDA, começa por SAI-, senão OF-
  const prefixo = data.finalidade === 'SAIDA' ? 'SAI-' : 'OF-';
  const codigo = prefixo + Math.floor(100000 + Math.random() * 900000);
  
  const membroId = data.membroId ? Number(data.membroId) : null;

  // Se for uma saída de dinheiro, já nasce como VALIDADO.
  // Se for oferta/dízimo normal, nasce como PENDENTE.
  const status = data.finalidade === 'SAIDA' ? 'VALIDADO' : 'PENDENTE';

  return await prisma.oferta.create({
    data: {
      igrejaId: Number(igrejaId),
      membroId: membroId,
      codigo: codigo,
      nomeDoador: data.nomeDoador || data.descricao || null, // Aceita nomeDoador ou descricao
      bi: data.bi || null,
      telefone: data.telefone || null,
      finalidade: data.finalidade,
      valor: Number(data.valor),
      metodo: data.metodo || 'N/A', // <-- Se não vier método (SAIDA), grava N/A
      referencia: data.referencia || null,
      status: status // <-- AQUI está a correção
    },
  });
}

async function consultarOferta(codigo, igrejaId) {
  return await prisma.oferta.findFirst({
    where: { codigo: codigo, igrejaId: Number(igrejaId) }
  });
}

async function preValidarOferta(id) {
  return await prisma.oferta.update({
    where: { id: Number(id) },
    data: { status: "AGUARDANDO_PASTOR" },
  });
}

async function validarOferta(id) {
  return await prisma.oferta.update({
    where: { id: Number(id) },
    data: { status: "VALIDADO", validadoEm: new Date() },
  });
}

async function negarOferta(id) {
  return await prisma.oferta.update({
    where: { id: Number(id) },
    data: { status: "NEGADO" },
  });
}

async function getEstatisticas(igrejaId) {
  const ofertas = await prisma.oferta.findMany({
    where: { igrejaId: Number(igrejaId) }
  });

  let totalDizimos = 0;
  let totalOfertas = 0;
  let totalSaidas = 0;
  let totalPendente = 0;

  ofertas.forEach(o => {
    if (o.status === "VALIDADO") {
      if (o.finalidade === "Dízimo") {
        totalDizimos += o.valor;
      } else if (o.finalidade === "SAIDA") {
        totalSaidas += o.valor; // <-- Soma as saídas
      } else {
        totalOfertas += o.valor;
      }
    } else if (o.status === "PENDENTE" || o.status === "AGUARDANDO_PASTOR") {
      totalPendente += o.valor;
    }
  });

  // O Saldo Real é: Entradas - Saídas
  const saldoReal = (totalDizimos + totalOfertas) - totalSaidas;

  return { totalDizimos, totalOfertas, totalSaidas, totalPendente, saldoReal };
}

async function getRelatorioDizimistas(igrejaId, mes, ano) {
  let whereClause = { 
    igrejaId: Number(igrejaId), 
    finalidade: "Dízimo",
    status: "VALIDADO"
  };

  if (mes && ano) {
    const start = new Date(Date.UTC(Number(ano), Number(mes) - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(Number(ano), Number(mes), 0, 23, 59, 59));
    whereClause.criadoEm = { gte: start, lte: end };
  } else if (ano) {
    const start = new Date(Date.UTC(Number(ano), 0, 1, 0, 0, 0));
    const end = new Date(Date.UTC(Number(ano), 11, 31, 23, 59, 59));
    whereClause.criadoEm = { gte: start, lte: end };
  }

  const ofertas = await prisma.oferta.findMany({
    where: whereClause,
    include: { 
      membro: { 
        include: { 
          sectores: true,
          departamento: true 
        } 
      } 
    }
  });

  const dizimistas = {};
  let totalGeral = 0;

  ofertas.forEach(o => {
    if (!o.membroId || !o.membro) return;
    
    let nomeSector = '-';
    if (o.membro.sectores && o.membro.sectores.length > 0) {
      nomeSector = o.membro.sectores[0].nome;
    }

    if (!dizimistas[o.membroId]) {
      dizimistas[o.membroId] = {
        nome: o.membro.nome,
        bi: o.membro.bi || '-',
        telefone: o.membro.telefone || '-',
        sector: nomeSector,
        departamento: o.membro.departamento?.nome || '-',
        totalDizimado: 0,
        ultimaData: o.criadoEm
      };
    }
    dizimistas[o.membroId].totalDizimado += o.valor;
    totalGeral += o.valor;

    if (new Date(o.criadoEm) > new Date(dizimistas[o.membroId].ultimaData)) {
      dizimistas[o.membroId].ultimaData = o.criadoEm;
    }
  });

  return {
    dados: Object.values(dizimistas),
    totalGeral: totalGeral
  };
}

module.exports = { 
  listOfertas, createOferta, consultarOferta, 
  preValidarOferta, validarOferta, negarOferta, 
  getEstatisticas, getRelatorioDizimistas 
};
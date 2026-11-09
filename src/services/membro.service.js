const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

// ===== FUNÇÕES ORIGINAIS DO SERVICE =====

async function listMembros(igrejaId) {
  return await prisma.membro.findMany({
    where: { igrejaId: Number(igrejaId) },
    include: { departamento: true, sectores: true },
    orderBy: { nome: 'asc' }
  });
}

async function promoverPastor(id) {
  return await prisma.membro.update({
    where: { id: Number(id) },
    data: { cargo: "Pastor", role: "pastor" },
  });
}

async function redefinirSenha(id) {
  const hash = await bcrypt.hash("123456", 10);
  return await prisma.membro.update({
    where: { id: Number(id) },
    data: { password: hash },
  });
}

async function deleteMembro(id) {
  return await prisma.membro.delete({ where: { id: Number(id) } });
}

async function atualizarSectoresMembro(id, sectorIds) {
  return await prisma.membro.update({
    where: { id: Number(id) },
    data: { sectores: { set: sectorIds.map(id => ({ id: Number(id) })) } },
  });
}

// ===== FUNÇÕES PARA OS PDFs =====

async function buscarMembroCompletoParaPDF(id) {
  return await prisma.membro.findUnique({
    where: { id: Number(id) },
    include: { 
      igreja: true, 
      departamento: true,
      documentos: true,
      presencas: { orderBy: { data: 'desc' }, take: 5 }
    }
  });
}

async function buscarDadosParaRelatorioMembros(igrejaId) {
  const membros = await prisma.membro.findMany({
    where: { igrejaId: Number(igrejaId) },
    orderBy: { nome: 'asc' }
  });
  const igreja = await prisma.igreja.findUnique({ where: { id: Number(igrejaId) } });
  const pastor = await prisma.pastor.findFirst({ where: { igrejaId: Number(igrejaId) } });
  return { membros, igreja, pastor };
}

async function buscarDadosParaRelatorioBatismos(igrejaId) {
  const membros = await prisma.membro.findMany({
    where: { igrejaId: Number(igrejaId), dataBatismo: { not: null } },
    include: { departamento: true },
    orderBy: { dataBatismo: 'asc' }
  });
  const igreja = await prisma.igreja.findUnique({ where: { id: Number(igrejaId) } });
  const pastor = await prisma.pastor.findFirst({ where: { igrejaId: Number(igrejaId) } });
  return { membros, igreja, pastor };
}

async function buscarDadosParaRelatorioPresencas(igrejaId) {
  const presencas = await prisma.presenca.findMany({
    where: { igrejaId: Number(igrejaId) },
    include: { membro: true },
    orderBy: { data: 'desc' }
  });
  const igreja = await prisma.igreja.findUnique({ where: { id: Number(igrejaId) } });
  const pastor = await prisma.pastor.findFirst({ where: { igrejaId: Number(igrejaId) } });
  return { presencas, igreja, pastor };
}

// ===== EXPORTAR TODAS AS FUNÇÕES =====
module.exports = { 
  listMembros, 
  promoverPastor, 
  redefinirSenha, 
  deleteMembro, 
  atualizarSectoresMembro,
  buscarMembroCompletoParaPDF,
  buscarDadosParaRelatorioMembros,
  buscarDadosParaRelatorioBatismos,
  buscarDadosParaRelatorioPresencas
};
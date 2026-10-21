const prisma = require("../config/prisma");

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
  const bcrypt = require("bcryptjs");
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

module.exports = { 
  listMembros, promoverPastor, redefinirSenha, deleteMembro, atualizarSectoresMembro 
};
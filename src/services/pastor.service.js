const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

async function listPastores(igrejaId) {
  return await prisma.pastor.findMany({
    where: { igrejaId: Number(igrejaId) },
    orderBy: { criadoEm: 'asc' }
  });
}

async function getPastor(id) {
  return await prisma.pastor.findUnique({ where: { id: Number(id) } });
}

async function createPastor(igrejaId, data) {
  // Encripta a senha antes de guardar
  const hash = await bcrypt.hash(data.senha || '123456', 10);
  return await prisma.pastor.create({
    data: {
      igrejaId: Number(igrejaId),
      nome: data.nome,
      cargo: data.cargo || 'Pastor',
      bio: data.bio || null,
      telefone: data.telefone || null,
      email: data.email || null,
      password: hash, // <-- Guarda a senha encriptada
      versiculo: data.versiculo || null,
      conselho: data.conselho || null,
    },
  });
}

async function loginPastor(email, senha) {
  const pastor = await prisma.pastor.findFirst({ where: { email } });
  if (!pastor) throw new Error("Pastor não encontrado com este email.");
  if (!pastor.password) throw new Error("Senha não configurada para este pastor.");
  
  const valid = await bcrypt.compare(senha, pastor.password);
  if (!valid) throw new Error("Senha incorreta.");
  return pastor;
}

async function updatePastor(id, data) {
  return await prisma.pastor.update({
    where: { id: Number(id) },
    data: {
      nome: data.nome, cargo: data.cargo, bio: data.bio,
      telefone: data.telefone, email: data.email,
      versiculo: data.versiculo, conselho: data.conselho,
    },
  });
}

async function deletePastor(id) {
  return await prisma.pastor.delete({ where: { id: Number(id) } });
}

module.exports = { listPastores, getPastor, createPastor, updatePastor, deletePastor, loginPastor };
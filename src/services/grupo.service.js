const prisma = require("../config/prisma");

// ===== CHAT DO DEPARTAMENTO =====
async function obterMensagensDepto(deptoId) {
  return await prisma.mensagemGrupo.findMany({
    where: { deptoId: Number(deptoId), isSilenciado: false },
    include: { membro: { select: { nome: true, foto: true } } },
    orderBy: { criadoEm: 'asc' }
  });
}

async function verificarMembroDoDepto(membroId, deptoId) {
  const membro = await prisma.membro.findUnique({
    where: { id: Number(membroId) },
    include: { departamento: true, sectores: true }
  });
  if (!membro) return false;
  const pertenceDiretamente = membro.departamentoId === Number(deptoId);
  const pertenceViaSector = membro.sectores.some(s => s.departamentoId === Number(deptoId));
  return pertenceDiretamente || pertenceViaSector;
}

async function criarMensagemDepto(membroId, deptoId, texto) {
  const membro = await prisma.membro.findUnique({ where: { id: Number(membroId) } });
  return await prisma.mensagemGrupo.create({
    data: { igrejaId: membro.igrejaId, deptoId: Number(deptoId), membroId: Number(membroId), texto }
  });
}

// ===== CHAT DO SECTOR =====
async function obterMensagensSector(sectorId) {
  return await prisma.mensagemGrupo.findMany({
    where: { sectorId: Number(sectorId), isSilenciado: false },
    include: { membro: { select: { nome: true, foto: true } } },
    orderBy: { criadoEm: 'asc' }
  });
}

async function verificarMembroDoSector(membroId, sectorId) {
  const membro = await prisma.membro.findUnique({
    where: { id: Number(membroId) },
    include: { sectores: true }
  });
  if (!membro) return false;
  return membro.sectores.some(s => s.id === Number(sectorId));
}

async function criarMensagemSector(membroId, sectorId, texto) {
  const membro = await prisma.membro.findUnique({ where: { id: Number(membroId) } });
  return await prisma.mensagemGrupo.create({
    data: { igrejaId: membro.igrejaId, sectorId: Number(sectorId), membroId: Number(membroId), texto }
  });
}

// ===== MODERAÇÃO =====
async function esconderMensagem(msgId) {
  return await prisma.mensagemGrupo.update({
    where: { id: Number(msgId) },
    data: { isSilenciado: true }
  });
}

// ===== GALERIA DE ATIVIDADES =====
async function obterFotosDoSector(sectorId) {
  return await prisma.fotoAtividade.findMany({
    where: { sectorId: Number(sectorId) },
    orderBy: { criadoEm: 'desc' }
  });
}

async function criarFotoAtividade(igrejaId, sectorId, url, legenda) {
  return await prisma.fotoAtividade.create({
    data: { igrejaId: Number(igrejaId), sectorId: Number(sectorId), url, legenda }
  });
}

module.exports = {
  obterMensagensDepto, verificarMembroDoDepto, criarMensagemDepto,
  obterMensagensSector, verificarMembroDoSector, criarMensagemSector,
  esconderMensagem, obterFotosDoSector, criarFotoAtividade
};
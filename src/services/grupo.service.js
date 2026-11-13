const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");

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

async function apagarFotoAtividade(fotoId) {
  // 1. Vai buscar a foto
  const foto = await prisma.fotoAtividade.findUnique({ where: { id: Number(fotoId) } });
  if (!foto) throw new Error("Foto não encontrada");

  // 2. Apaga no Cloudinary
  if (foto.url) {
    try {
      const urlParts = foto.url.split('/');
      const fileName = urlParts.pop();
      const folder = urlParts.pop();
      const publicId = `${folder}/${fileName.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("Erro ao apagar foto da atividade no Cloudinary:", err);
    }
  }

  // 3. Apaga da base de dados
  return await prisma.fotoAtividade.delete({ where: { id: Number(fotoId) } });
}

module.exports = {
  obterMensagensDepto, verificarMembroDoDepto, criarMensagemDepto,
  obterMensagensSector, verificarMembroDoSector, criarMensagemSector,
  esconderMensagem, obterFotosDoSector, criarFotoAtividade, apagarFotoAtividade
};
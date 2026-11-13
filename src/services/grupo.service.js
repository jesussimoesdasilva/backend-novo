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

// ===== GALERIA DE ATIVIDADES (SECTOR) =====
async function obterFotosDoSector(sectorId) {
  return await prisma.fotoAtividade.findMany({
    where: { sectorId: Number(sectorId) },
    orderBy: { criadoEm: 'desc' }
  });
}

async function criarFotoAtividade(igrejaId, sectorId, url, legenda) {
  // Limite de 10 fotos por sector
  const LIMITE_FOTOS = 10;
  const totalAtual = await prisma.fotoAtividade.count({ where: { sectorId: Number(sectorId) } });
  
  if (totalAtual >= LIMITE_FOTOS) {
    throw new Error(`Limite de ${LIMITE_FOTOS} fotos atingido neste sector. Apague algumas para adicionar novas.`);
  }

  return await prisma.fotoAtividade.create({
    data: { igrejaId: Number(igrejaId), sectorId: Number(sectorId), url, legenda }
  });
}

async function apagarFotoAtividade(fotoId) {
  const foto = await prisma.fotoAtividade.findUnique({ where: { id: Number(fotoId) } });
  if (!foto) throw new Error("Foto não encontrada");

  if (foto.url) {
    try {
      const urlParts = foto.url.split('/upload/');
      if (urlParts.length > 1) {
        let publicId = urlParts[1].replace(/^v\d+\//, ''); 
        publicId = publicId.split('.')[0]; 
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (err) {
      console.error("Erro ao apagar foto do Cloudinary:", err);
    }
  }

  return await prisma.fotoAtividade.delete({ where: { id: Number(fotoId) } });
}

// ===== GALERIA DO DEPARTAMENTO (NOVO) =====
async function obterFotosDoDepartamento(deptoId) {
  return await prisma.fotoDepartamento.findMany({
    where: { departamentoId: Number(deptoId) },
    orderBy: { criadoEm: 'desc' }
  });
}

async function contarFotosDoDepartamento(deptoId) {
  return await prisma.fotoDepartamento.count({
    where: { departamentoId: Number(deptoId) }
  });
}

async function criarFotoDepartamento(igrejaId, deptoId, url, legenda) {
  const LIMITE_FOTOS = 10;
  
  const totalAtual = await contarFotosDoDepartamento(deptoId);
  if (totalAtual >= LIMITE_FOTOS) {
    throw new Error(`Limite de ${LIMITE_FOTOS} fotos atingido neste departamento. Apague algumas para adicionar novas.`);
  }

  return await prisma.fotoDepartamento.create({
    data: { igrejaId: Number(igrejaId), departamentoId: Number(deptoId), url, legenda }
  });
}

async function apagarFotoDepartamento(fotoId) {
  const foto = await prisma.fotoDepartamento.findUnique({ where: { id: Number(fotoId) } });
  if (!foto) throw new Error("Foto não encontrada");

  if (foto.url) {
    try {
      const urlParts = foto.url.split('/upload/');
      if (urlParts.length > 1) {
        let publicId = urlParts[1].replace(/^v\d+\//, '');
        publicId = publicId.split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (err) {
      console.error("Erro ao apagar foto do Cloudinary:", err);
    }
  }

  return await prisma.fotoDepartamento.delete({ where: { id: Number(fotoId) } });
}

// ===== EXPORTS =====
module.exports = {
  obterMensagensDepto, verificarMembroDoDepto, criarMensagemDepto,
  obterMensagensSector, verificarMembroDoSector, criarMensagemSector,
  esconderMensagem, obterFotosDoSector, criarFotoAtividade,
  apagarFotoAtividade,
  // NOVAS:
  obterFotosDoDepartamento, contarFotosDoDepartamento, criarFotoDepartamento, apagarFotoDepartamento
};
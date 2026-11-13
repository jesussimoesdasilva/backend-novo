const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary"); 

async function listSectores(igrejaId) {
  return await prisma.sector.findMany({
    where: { igrejaId: Number(igrejaId) },
    include: { 
      lider: { select: { nome: true } },
      membros: { select: { id: true, nome: true } }, // <-- A CORREÇÃO AQUI
      _count: { select: { membros: true } } 
    },
    orderBy: { nome: "asc" },
  });
}

async function createSector(igrejaId, data) {
  return await prisma.sector.create({
    data: {
      igrejaId: Number(igrejaId),
      departamentoId: Number(data.departamentoId),
      nome: data.nome,
      descricao: data.descricao || null,
    },
  });
}

async function updateLider(id, membroId) {
  return await prisma.sector.update({
    where: { id: Number(id) },
    data: { liderId: membroId ? Number(membroId) : null }
  });
}

async function deleteSector(id) {
  // 1. Vai buscar o sector com todas as suas fotos de atividades
  const sector = await prisma.sector.findUnique({
    where: { id: Number(id) },
    include: { fotosAtividades: true } // <-- Assume que a relação no Prisma se chama "fotosAtividades"
  });
  if (!sector) throw new Error("Sector não encontrado");

  // 2. Apaga todas as fotos do sector no Cloudinary
  if (sector.fotosAtividades && sector.fotosAtividades.length > 0) {
    for (const foto of sector.fotosAtividades) {
      if (foto.url) {
        try {
          const urlParts = foto.url.split('/');
          const fileName = urlParts.pop();
          const folder = urlParts.pop();
          const publicId = `${folder}/${fileName.split('.')[0]}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Erro ao apagar foto do sector no Cloudinary:", err);
        }
      }
    }
  }

  // 3. Apaga o sector (e as fotos associadas) da base de dados
  return await prisma.sector.delete({ where: { id: Number(id) } });
}

module.exports = { listSectores, createSector, updateLider, deleteSector };
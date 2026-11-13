const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary"); // <-- ADICIONA ESTA LINHA

async function listSectores(igrejaId) {
  return await prisma.sector.findMany({
    where: { igrejaId: Number(igrejaId) },
    include: { 
      lider: { select: { nome: true } },
      membros: { select: { id: true, nome: true } }, 
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

// ==== A FUNÇÃO DELETE SECTOR ATUALIZADA ====
async function deleteSector(id) {
  // 1. Vai buscar o sector com todas as suas fotos de atividades
  const sector = await prisma.sector.findUnique({
    where: { id: Number(id) },
    include: { fotosAtividade: true } // <-- Nome correto da relação
  });
  if (!sector) throw new Error("Sector não encontrado");

  // 2. Apaga todas as fotos do sector no Cloudinary
  if (sector.fotosAtividade && sector.fotosAtividade.length > 0) {
    for (const foto of sector.fotosAtividade) {
      if (foto.url) {
        try {
          const urlParts = foto.url.split('/');
          const fileName = urlParts.pop();
          const folder = urlParts.pop();
          const publicId = `${folder}/${fileName.split('.')[0]}`;
          await cloudinary.uploader.destroy(publicId);
          console.log("Foto do sector apagada:", publicId);
        } catch (err) {
          console.error("Erro ao apagar foto do sector no Cloudinary:", err);
        }
      }
    }
  }

  // 3. Apaga o sector (as fotos são apagadas em cascata pela base de dados)
  return await prisma.sector.delete({ where: { id: Number(id) } });
}

module.exports = { listSectores, createSector, updateLider, deleteSector };
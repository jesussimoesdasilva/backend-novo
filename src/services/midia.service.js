const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");

async function listarMidias(igrejaId) {
  return await prisma.midia.findMany({
    where: { igrejaId: Number(igrejaId) },
    orderBy: { criadoEm: 'desc' }
  });
}

async function criarMidia(igrejaId, titulo, tipo, url, isArquivo) {
  return await prisma.midia.create({
    data: {
      igrejaId: Number(igrejaId),
      titulo,
      tipo,
      url,
      isArquivo
    }
  });
}

async function deleteMidia(id) {
  // 1. Vai buscar a mídia para ver se é um ficheiro
  const midia = await prisma.midia.findUnique({ where: { id: Number(id) } });
  if (!midia) throw new Error("Mídia não encontrada");

  // 2. Se for um ficheiro carregado (não for link do YouTube), apaga no Cloudinary
  if (midia.isArquivo && midia.url) {
    try {
      const urlParts = midia.url.split('/');
      const fileName = urlParts.pop();
      const folder = urlParts.pop();
      const publicId = `${folder}/${fileName.split('.')[0]}`;
      
      // Determina o resource_type correto
      const resourceType = midia.tipo === 'VIDEO' ? 'video' : 'raw';
      
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      console.log("Ficheiro de mídia apagado:", publicId);
    } catch (err) {
      console.error("Erro ao apagar mídia do Cloudinary:", err);
    }
  }

  // 3. Apaga o registo da base de dados
  return await prisma.midia.delete({ where: { id: Number(id) } });
}

module.exports = { listarMidias, criarMidia, deletarMidia };
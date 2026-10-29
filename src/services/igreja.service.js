const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

async function getAllIgrejas() {
  return await prisma.igreja.findMany({
    include: {
      _count: {
        select: { membros: true, departamentos: true, sectores: true, eventos: true }
      }
    }
  });
}

async function getIgrejaById(id) {
  return await prisma.igreja.findUnique({
    where: { id: Number(id) },
    include: {
      departamentos: { include: { sectores: true } },
      _count: { select: { membros: true, eventos: true } }
    }
  });
}

async function getIgrejaBySlug(slug) {
  return await prisma.igreja.findUnique({
    where: { slug },
    include: {
      departamentos: { include: { sectores: true } },
      pastores: true, avisos: true, eventos: true
    }
  });
}

async function createIgreja(data) {
  const senhaHash = await bcrypt.hash(data.subadminSenha, 10);
  return await prisma.igreja.create({
    data: {
      nome: data.nome, slug: data.slug,
      descricao: data.descricao || null, icone: data.icone || "⛪",
      endereco: data.endereco || null, telefone: data.telefone || null,
      email: data.email || null, sobre: data.sobre || null,
      heroSmall: data.heroSmall || null, heroTitulo: data.heroTitulo || null, heroDestaque: data.heroDestaque || null,
      subadminEmail: data.subadminEmail, subadminSenha: senhaHash,
    },
    select: { id: true, nome: true, slug: true, descricao: true, icone: true, subadminEmail: true, criadoEm: true }
  });
}

async function updateIgreja(id, data) {
  const updateData = {
    nome: data.nome,
    slug: data.slug,
    descricao: data.descricao,
    icone: data.icone,
    endereco: data.endereco,
    telefone: data.telefone,
    email: data.email,
    sobre: data.sobre,
    heroSmall: data.heroSmall,
    heroTitulo: data.heroTitulo,
    heroDestaque: data.heroDestaque,
    logoUrl: data.logoUrl,
    imagensHero: data.imagensHero,
    corFundo: data.corFundo,
    corBarraTopo: data.corBarraTopo,
    ativo: data.ativo,
  };

  // 1. Guarda o email do subadmin (se vier no pedido)
  if (data.subadminEmail) {
    updateData.subadminEmail = data.subadminEmail;
  }

  // 2. Guarda a senha do subadmin (se vier no pedido)
  if (data.subadminSenha) {
    // Verifica se a senha já está encriptada (ex: se vier do getIgrejaById ao fazer upload de imagem)
    const isJaEncriptada = data.subadminSenha.startsWith('$2a$') || data.subadminSenha.startsWith('$2b$');
    
    if (isJaEncriptada) {
      updateData.subadminSenha = data.subadminSenha;
    } else {
      updateData.subadminSenha = await bcrypt.hash(data.subadminSenha, 10);
    }
  }

  return await prisma.igreja.update({
    where: { id: Number(id) },
    data: updateData,
  });
}

async function deleteIgreja(id) {
  return await prisma.igreja.delete({ where: { id: Number(id) } });
}

async function loginSubadmin(email, senha) {
  const igreja = await prisma.igreja.findUnique({ where: { subadminEmail: email } });
  if (!igreja) throw new Error("Email não encontrado");
  
  // Verifica se a senha existe na base de dados antes de comparar
  if (!igreja.subadminSenha) {
    throw new Error("Senha não configurada. Peça ao Admin Master para configurar o seu acesso.");
  }

  const ok = await bcrypt.compare(senha, igreja.subadminSenha);
  if (!ok) throw new Error("Senha inválida");
  
  return igreja;
}

module.exports = { getAllIgrejas, getIgrejaById, getIgrejaBySlug, createIgreja, updateIgreja, deleteIgreja, loginSubadmin };
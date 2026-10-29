const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

async function publicRegister(req, res) {
  try {
    const { nome, email, password, telefone, bi, endereco, dataNascimento, foto } = req.body;

    // Verifica se o email já existe
    const existe = await prisma.membro.findUnique({ where: { email } });
    if (existe) return res.status(400).json({ message: "Este email já está registado." });

    const hash = await bcrypt.hash(password, 10);
    const membro = await prisma.membro.create({
      data: {
        igrejaId: Number(req.params.igrejaId),
        nome,
        email,
        password: hash,
        telefone,
        bi,
        endereco,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        foto: foto || null // Agora recebe o link do Cloudinary
      }
    });
    res.status(201).json(membro);
  } catch (err) { res.status(400).json({ message: err.message }); }
}
async function login(req, res) {
  try {
    const { email, senha } = req.body;
    
    const membro = await prisma.membro.findUnique({ 
      where: { email },
      include: {
        departamento: true,
        sectores: {
          include: {
            departamento: true // <-- A CORREÇÃO ESTÁ AQUI! Traz o departamento de cada sector
          }
        },
        lideraSetores: true,
        lideraDeptos: true
      }
    });
    
    if (!membro) return res.status(404).json({ message: "Utilizador não encontrado" });
    const valid = await bcrypt.compare(senha, membro.password);
    if (!valid) return res.status(401).json({ message: "Senha incorreta" });
    
    res.json({ membro });
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function verificarTelefone(req, res) { res.json({ ok: true }); }
async function verCodigo(req, res) { res.json({ ok: true }); }
async function redefinirSenhaComCodigo(req, res) { res.json({ ok: true }); }

async function list(req, res) {
  try {
    const lista = await prisma.membro.findMany({
      where: { igrejaId: Number(req.params.igrejaId) },
      include: { departamento: true, sectores: true },
      orderBy: { nome: 'asc' }
    });
    res.json(lista);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function create(req, res) {
  try {
    const { nome, email, senha, telefone, bi, endereco, departamentoId } = req.body;
    const hash = await bcrypt.hash(senha || '123456', 10);
    const novo = await prisma.membro.create({
      data: {
        igrejaId: Number(req.params.igrejaId),
        nome, email, password: hash, telefone, bi, endereco,
        departamentoId: departamentoId ? Number(departamentoId) : null,
        status: 'ATIVO'
      }
    });
    res.status(201).json(novo);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function aprovar(req, res) {
  try {
    const m = await prisma.membro.update({
      where: { id: Number(req.params.id) },
      data: { status: 'ATIVO' }
    });
    res.json(m);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function promover(req, res) {
  try {
    const m = await prisma.membro.update({
      where: { id: Number(req.params.id) },
      data: { cargo: 'Pastor', role: 'pastor' }
    });
    res.json(m);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function setSectores(req, res) {
  try {
    const { sectorIds } = req.body;
    const m = await prisma.membro.update({
      where: { id: Number(req.params.id) },
      data: { sectores: { set: sectorIds.map(id => ({ id: Number(id) })) } }
    });
    res.json(m);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function resetPassword(req, res) {
  try {
    const hash = await bcrypt.hash("123456", 10);
    await prisma.membro.update({
      where: { id: Number(req.params.id) },
      data: { password: hash }
    });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function remove(req, res) {
  try {
    await prisma.membro.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function updatePerfil(req, res) {
  try {
    const { nome, telefone, endereco, bi, senha } = req.body;
    
    // Prepara os dados para atualizar
    const dadosParaAtualizar = { nome, telefone, endereco, bi };

    // Se veio uma nova senha, encripta-a antes de guardar
    if (senha && senha.length >= 6) {
      const hash = await bcrypt.hash(senha, 10);
      dadosParaAtualizar.password = hash;
    }

    const membro = await prisma.membro.update({
      where: { id: Number(req.params.id) },
      data: dadosParaAtualizar
    });
    res.json(membro);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function updateFoto(req, res) {
  try {
    const { fotoUrl } = req.body;
    if (!fotoUrl) return res.status(400).json({ message: "Nenhuma foto enviada" });
    const membro = await prisma.membro.update({
      where: { id: Number(req.params.id) },
      data: { foto: fotoUrl }
    });
    res.json(membro);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

module.exports = {
  publicRegister, login, verificarTelefone, verCodigo, redefinirSenhaComCodigo,
  list, create, aprovar, promover, setSectores, resetPassword, remove,
  updatePerfil, updateFoto
};
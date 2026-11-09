const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const PDFDocument = require('pdfkit');
const membroService = require("../services/membro.service");

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
    const { cargo } = req.body;
    let role = 'member'; // Valor por defeito
    if (cargo === 'Pastor') role = 'pastor';
    else if (cargo === 'Secretário') role = 'secretario';

    const m = await prisma.membro.update({
      where: { id: Number(req.params.id) },
      data: { cargo, role } // <-- O role é sempre atualizado
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

async function gerarFichaMembroPDF(req, res) {
  try {
    const { membroId } = req.params;
    const membro = await membroService.buscarMembroCompletoParaPDF(membroId);
    if (!membro) return res.status(404).json({ message: "Membro não encontrado" });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ficha-${membro.nome.replace(/\s+/g, '-')}.pdf`);
    doc.pipe(res);

    // Cabeçalho
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(20).text(membro.igreja.nome.toUpperCase(), 40, 40);
    doc.fillColor('#64748b').font('Helvetica').fontSize(12).text('Ficha Individual do Membro', 40, 65);
    doc.fillColor('#facc15').rect(40, 85, 520, 3).fill();
    doc.fillColor('#94a3b8').fontSize(9).text(`Emitido em: ${new Date().toLocaleDateString('pt-PT')}`, 40, 95);

    // Foto e Dados Pessoais
    let y = 130;
    if (membro.foto) {
      try { doc.image(membro.foto, 40, y, { width: 100, height: 100, fit: [100, 100] }); } 
      catch(e) { doc.rect(40, y, 100, 100).stroke('#e2e8f0'); doc.fillColor('#94a3b8').fontSize(10).text('Sem Foto', 60, y + 45); }
    } else {
      doc.rect(40, y, 100, 100).stroke('#e2e8f0'); 
      doc.fillColor('#94a3b8').fontSize(10).text('Sem Foto', 60, y + 45);
    }

    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(16).text(membro.nome, 160, y);
    doc.font('Helvetica').fontSize(10).fillColor('#334155');
    doc.text(`Email: ${membro.email || '-'}`, 160, y + 25);
    doc.text(`Telefone: ${membro.telefone || '-'}`, 160, y + 40);
    doc.text(`BI: ${membro.bi || '-'}`, 160, y + 55);
    doc.text(`Nascimento: ${membro.dataNascimento ? new Date(membro.dataNascimento).toLocaleDateString('pt-PT') : '-'}`, 160, y + 70);
    doc.text(`Batismo: ${membro.dataBatismo ? new Date(membro.dataBatismo).toLocaleDateString('pt-PT') : '-'}`, 160, y + 85);

    // Departamento e Cargo
    y += 130;
    doc.fillColor('#020617').rect(40, y, 520, 40).fill();
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11);
    doc.text(`DEPARTAMENTO: ${membro.departamento ? membro.departamento.nome : 'Sem departamento'}`, 50, y + 15);
    doc.text(`CARGO: ${membro.cargo || 'Membro'}`, 350, y + 15);

    // Documentos
    y += 60;
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(12).text('DOCUMENTOS ANEXADOS', 40, y);
    y += 20;
    if (membro.documentos && membro.documentos.length > 0) {
      membro.documentos.forEach(d => { doc.fillColor('#334155').font('Helvetica').fontSize(10).text(`- ${d.nome} (${d.tipo})`, 50, y); y += 15; });
    } else {
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(10).text('Nenhum documento anexado.', 50, y); y += 15;
    }

    // Presenças
    y += 20;
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(12).text('PRESENCAS RECENTES', 40, y);
    y += 20;
    if (membro.presencas && membro.presencas.length > 0) {
      membro.presencas.forEach(p => { doc.fillColor('#334155').font('Helvetica').fontSize(10).text(`- ${p.tipo} - ${new Date(p.data).toLocaleDateString('pt-PT')}`, 50, y); y += 15; });
    } else {
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(10).text('Nenhuma presenca registada.', 50, y); y += 15;
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  publicRegister, login, verificarTelefone, verCodigo, redefinirSenhaComCodigo,
  list, create, aprovar, promover, setSectores, resetPassword, remove,
  updatePerfil, updateFoto, gerarFichaMembroPDF
};
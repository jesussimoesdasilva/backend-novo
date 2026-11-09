const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const PDFDocument = require('pdfkit');
const membroService = require("../services/membro.service");
const https = require('https');

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
    const { finalidade } = req.query; // Recebe a finalidade
    const membro = await membroService.buscarMembroCompletoParaPDF(membroId);
    if (!membro) return res.status(404).json({ message: "Membro não encontrado" });

    // Vai buscar o Pastor para a assinatura
    const pastor = await prisma.pastor.findFirst({ where: { igrejaId: membro.igrejaId } });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ficha-${membro.nome.replace(/\s+/g, '-')}.pdf`);
    doc.pipe(res);

    // ===== 1. LOGOTIPO DA IGREJA =====
    const logoUrl = membro.igreja.logoUrl || membro.igreja.icone;
    if (logoUrl && logoUrl.startsWith('http')) {
      try {
        const logoBuffer = await new Promise((resolve, reject) => {
          https.get(logoUrl, (response) => {
            const data = [];
            response.on('data', (chunk) => data.push(chunk));
            response.on('end', () => resolve(Buffer.concat(data)));
          }).on('error', reject);
        });
        doc.image(logoBuffer, 40, 40, { width: 50, height: 50 });
      } catch (e) { console.log("Erro ao carregar logo", e.message); }
    }

    // ===== 2. CABEÇALHO =====
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(20).text(membro.igreja.nome.toUpperCase(), 100, 40);
    doc.fillColor('#64748b').font('Helvetica').fontSize(12).text('Ficha Individual do Membro', 100, 65);
    doc.fillColor('#facc15').rect(40, 95, 520, 3).fill();
    doc.fillColor('#94a3b8').fontSize(9).text(`Emitido em: ${new Date().toLocaleDateString('pt-PT')}`, 40, 105);

    // ===== 3. FOTO E DADOS PESSOAIS =====
    let y = 140;
    if (membro.foto && membro.foto.startsWith('http')) {
      try {
        const fotoBuffer = await new Promise((resolve, reject) => {
          https.get(membro.foto, (response) => {
            const data = [];
            response.on('data', (chunk) => data.push(chunk));
            response.on('end', () => resolve(Buffer.concat(data)));
          }).on('error', reject);
        });
        doc.image(fotoBuffer, 40, y, { width: 100, height: 100, fit: [100, 100] });
      } catch(e) { 
        doc.rect(40, y, 100, 100).stroke('#e2e8f0'); 
        doc.fillColor('#94a3b8').fontSize(10).text('Sem Foto', 60, y + 45);
      }
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
    doc.text(`Endereço: ${membro.endereco || '-'}`, 160, y + 100);

    // ===== 4. DEPARTAMENTO E CARGO =====
    y += 145;
    doc.fillColor('#020617').rect(40, y, 520, 40).fill();
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11);
    doc.text(`DEPARTAMENTO: ${membro.departamento ? membro.departamento.nome : 'Sem departamento'}`, 50, y + 15);
    doc.text(`CARGO: ${membro.cargo || 'Membro'}`, 350, y + 15);

    // ===== 5. DOCUMENTOS =====
    y += 60;
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(12).text('DOCUMENTOS ANEXADOS', 40, y);
    y += 20;
    if (membro.documentos && membro.documentos.length > 0) {
      membro.documentos.forEach(d => { doc.fillColor('#334155').font('Helvetica').fontSize(10).text(`- ${d.nome} (${d.tipo})`, 50, y); y += 15; });
    } else {
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(10).text('Nenhum documento anexado.', 50, y); y += 15;
    }

    // ===== 6. PRESENÇAS =====
    y += 20;
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(12).text('PRESENCAS RECENTES', 40, y);
    y += 20;
    if (membro.presencas && membro.presencas.length > 0) {
      membro.presencas.forEach(p => { doc.fillColor('#334155').font('Helvetica').fontSize(10).text(`- ${p.tipo} - ${new Date(p.data).toLocaleDateString('pt-PT')}`, 50, y); y += 15; });
    } else {
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(10).text('Nenhuma presenca registada.', 50, y); y += 15;
    }

    // ===== 7. FINALIDADE E ASSINATURA =====
    const textoFinalidade = finalidade || 'Diversos Efeitos';
    
    // Coloca no fundo da página
    let footerY = 600; 
    
    // Texto de Declaração Formal
    doc.fillColor('#334155').font('Helvetica').fontSize(10);
    doc.text(`Certificamos, para os devidos efeitos, que a presente Ficha Individual se destina a comprovar a situação do membro para fins de ${textoFinalidade}.`, 40, footerY, { align: 'justify', width: 520 });
    
    // Assinatura Centralizada
    const centroX = 40 + (520 / 2); // Centro exato da área útil (300)
    
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(11);
    doc.text('O Pastor', centroX - 30, footerY + 60); // "O Pastor" por cima da linha
    
    doc.moveTo(centroX - 100, footerY + 75).lineTo(centroX + 100, footerY + 75).stroke('#020617'); // Linha
    
    doc.font('Helvetica-Bold').fontSize(11).text(pastor ? pastor.nome : 'Nome do Pastor', centroX - 100, footerY + 80, { width: 200, align: 'center' });
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(pastor ? (pastor.cargo || 'Pastor') : 'Pastor', centroX - 100, footerY + 95, { width: 200, align: 'center' });

    doc.end(); // <-- ESTA LINHA É OBRIGATÓRIA PARA FECHAR O PDF

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
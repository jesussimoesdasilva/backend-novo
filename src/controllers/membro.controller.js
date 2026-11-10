const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const PDFDocument = require('pdfkit');
const membroService = require("../services/membro.service");
const https = require('https');

// ===== FUNÇÕES ORIGINAIS =====
async function publicRegister(req, res) {
  try {
    const { nome, email, password, telefone, bi, endereco, dataNascimento, foto } = req.body;
    const existe = await prisma.membro.findUnique({ where: { email } });
    if (existe) return res.status(400).json({ message: "Este email já está registado." });
    const hash = await bcrypt.hash(password, 10);
    const membro = await prisma.membro.create({
      data: { igrejaId: Number(req.params.igrejaId), nome, email, password: hash, telefone, bi, endereco, dataNascimento: dataNascimento ? new Date(dataNascimento) : null, foto: foto || null }
    });
    res.status(201).json(membro);
  } catch (err) { res.status(400).json({ message: err.message }); }
}

async function login(req, res) {
  try {
    const { email, senha, igrejaSlug } = req.body; // <-- Recebe o slug

    const membro = await prisma.membro.findUnique({ 
      where: { email },
      include: {
        igreja: true,
        departamento: true,
        sectores: { include: { departamento: true } },
        lideraSetores: true,
        lideraDeptos: true
      }
    });

    if (!membro) return res.status(404).json({ message: "Utilizador não encontrado" });

    // Verifica se o membro pertence à igreja
    if (membro.igreja.slug !== igrejaSlug) {
      return res.status(403).json({ message: "Este email não pertence a esta igreja." });
    }

    const valid = await bcrypt.compare(senha, membro.password);
    if (!valid) return res.status(401).json({ message: "Senha incorreta" });

    res.json({ membro });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
}
async function verificarTelefone(req, res) { res.json({ ok: true }); }
async function verCodigo(req, res) { res.json({ ok: true }); }
async function redefinirSenhaComCodigo(req, res) { res.json({ ok: true }); }

async function list(req, res) {
  try {
    const lista = await prisma.membro.findMany({ where: { igrejaId: Number(req.params.igrejaId) }, include: { departamento: true, sectores: true }, orderBy: { nome: 'asc' } });
    res.json(lista);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function create(req, res) {
  try {
    const { nome, email, senha, telefone, bi, endereco, departamentoId } = req.body;
    const hash = await bcrypt.hash(senha || '123456', 10);
    const novo = await prisma.membro.create({ data: { igrejaId: Number(req.params.igrejaId), nome, email, password: hash, telefone, bi, endereco, departamentoId: departamentoId ? Number(departamentoId) : null, status: 'ATIVO' } });
    res.status(201).json(novo);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function aprovar(req, res) {
  try { const m = await prisma.membro.update({ where: { id: Number(req.params.id) }, data: { status: 'ATIVO' } }); res.json(m); } catch (err) { res.status(500).json({ message: err.message }); }
}

async function promover(req, res) {
  try {
    const { cargo } = req.body;
    let role = 'member';
    if (cargo === 'Pastor') role = 'pastor';
    else if (cargo === 'Secretário') role = 'secretario';
    const m = await prisma.membro.update({ where: { id: Number(req.params.id) }, data: { cargo, role } });
    res.json(m);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function setSectores(req, res) {
  try {
    const { sectorIds } = req.body;
    const m = await prisma.membro.update({ where: { id: Number(req.params.id) }, data: { sectores: { set: sectorIds.map(id => ({ id: Number(id) })) } } });
    res.json(m);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function resetPassword(req, res) {
  try { const hash = await bcrypt.hash("123456", 10); await prisma.membro.update({ where: { id: Number(req.params.id) }, data: { password: hash } }); res.json({ ok: true }); } catch (err) { res.status(500).json({ message: err.message }); }
}

async function remove(req, res) {
  try { await prisma.membro.delete({ where: { id: Number(req.params.id) } }); res.json({ ok: true }); } catch (err) { res.status(500).json({ message: err.message }); }
}

async function updatePerfil(req, res) {
  try {
    const { nome, telefone, endereco, bi, senha } = req.body;
    const dadosParaAtualizar = { nome, telefone, endereco, bi };
    if (senha && senha.length >= 6) { const hash = await bcrypt.hash(senha, 10); dadosParaAtualizar.password = hash; }
    const membro = await prisma.membro.update({ where: { id: Number(req.params.id) }, data: dadosParaAtualizar });
    res.json(membro);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function updateFoto(req, res) {
  try {
    const { fotoUrl } = req.body;
    if (!fotoUrl) return res.status(400).json({ message: "Nenhuma foto enviada" });
    const membro = await prisma.membro.update({ where: { id: Number(req.params.id) }, data: { foto: fotoUrl } });
    res.json(membro);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

// ===== FUNÇÕES DE PDF =====
async function gerarFichaMembroPDF(req, res) {
  try {
    const { membroId } = req.params;
    const { finalidade } = req.query;
    const membro = await membroService.buscarMembroCompletoParaPDF(membroId);
    if (!membro) return res.status(404).json({ message: "Membro não encontrado" });
    const pastor = await prisma.pastor.findFirst({ where: { igrejaId: membro.igrejaId } });
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ficha-${membro.nome.replace(/\s+/g, '-')}.pdf`);
    doc.pipe(res);

    // Logotipo
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

    // Cabeçalho
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(20).text(membro.igreja.nome.toUpperCase(), 100, 40);
    doc.fillColor('#64748b').font('Helvetica').fontSize(12).text('Ficha Individual do Membro', 100, 65);
    doc.fillColor('#facc15').rect(40, 95, 520, 3).fill();
    doc.fillColor('#94a3b8').fontSize(9).text(`Emitido em: ${new Date().toLocaleDateString('pt-PT')}`, 40, 105);

    // Foto e Dados
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
    doc.text(`Endereço: ${membro.endereco || '-'}`, 160, y + 85);

    // Sectores
    const nomesSectores = membro.sectores && membro.sectores.length > 0 
      ? membro.sectores.map(s => s.nome).join(', ') 
      : 'Nenhum';
    doc.text(`Sectores: ${nomesSectores}`, 160, y + 100);

       // Sacramentos (4 linhas extra)
    y += 130;
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(12).text('SACRAMENTOS', 40, y);
    y += 20;
    doc.font('Helvetica').fontSize(10).fillColor('#334155');
    doc.text(`Batismo: ${membro.dataBatismo ? new Date(membro.dataBatismo).toLocaleDateString('pt-PT') : '-'}`, 50, y); y += 15;

    // Só mostra Primeira Comunhão e Crisma se o membro tiver essas datas
    if (membro.dataPrimeiraComunhao) {
      doc.text(`Primeira Comunhão: ${new Date(membro.dataPrimeiraComunhao).toLocaleDateString('pt-PT')}`, 50, y); y += 15;
    }
    if (membro.dataCrisma) {
      doc.text(`Crisma: ${new Date(membro.dataCrisma).toLocaleDateString('pt-PT')}`, 50, y); y += 15;
    }

    doc.text(`Casamento: ${membro.dataCasamento ? new Date(membro.dataCasamento).toLocaleDateString('pt-PT') : '-'}`, 50, y); y += 15;
    doc.text(`Óbito: ${membro.dataObito ? new Date(membro.dataObito).toLocaleDateString('pt-PT') : '-'}`, 50, y); y += 15;
    // Departamento e Cargo
    y += 10;
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

    // Finalidade e Assinatura
    const textoFinalidade = finalidade || 'Diversos Efeitos';
    let footerY = 640; // desceu mais para caber os sacramentos
    doc.fillColor('#334155').font('Helvetica').fontSize(10);
    doc.text(`Certificamos, para os devidos efeitos, que a presente Ficha Individual se destina a comprovar a situação do membro para fins de ${textoFinalidade}.`, 40, footerY, { align: 'justify', width: 520 });
    const centroX = 40 + (520 / 2);
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(11);
    doc.text('O Pastor', centroX - 30, footerY + 60);
    doc.moveTo(centroX - 100, footerY + 75).lineTo(centroX + 100, footerY + 75).stroke('#020617');
    doc.font('Helvetica-Bold').fontSize(11).text(pastor ? pastor.nome : 'Nome do Pastor', centroX - 100, footerY + 80, { width: 200, align: 'center' });
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(pastor ? (pastor.cargo || 'Pastor') : 'Pastor', centroX - 100, footerY + 95, { width: 200, align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function gerarPDFMembrosSecretario(req, res) {
  try {
    const { igrejaId } = req.params;
    const { membros, igreja, pastor } = await membroService.buscarDadosParaRelatorioMembros(igrejaId);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-membros-${igreja.slug}.pdf`);
    doc.pipe(res);

    // Logotipo
    const logoUrl = igreja.logoUrl || igreja.icone;
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

    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(20).text(igreja.nome.toUpperCase(), 100, 40);
    doc.fillColor('#64748b').font('Helvetica').fontSize(12).text('Relatório Oficial de Membros', 100, 65);
    doc.fillColor('#facc15').rect(40, 95, 520, 3).fill();
    doc.fillColor('#94a3b8').fontSize(9).text(`Emitido em: ${new Date().toLocaleDateString('pt-PT')}`, 40, 105);

    // Cartões de Resumo
    const total = membros.length;
    const batizados = membros.filter(m => m.dataBatismo).length;
    const ativos = membros.filter(m => m.status === 'ATIVO').length;
    let somaIdades = 0, comIdade = 0;
    membros.forEach(m => {
      if (m.dataNascimento) {
        somaIdades += new Date().getFullYear() - new Date(m.dataNascimento).getFullYear();
        comIdade++;
      }
    });
    const mediaIdade = comIdade > 0 ? Math.round(somaIdades / comIdade) : 0;

    const resumoY = 130;
    const boxWidth = 120;
    const boxHeight = 50;
    const gap = 13;

    doc.rect(40, resumoY, boxWidth, boxHeight).fill('#f8fafc').stroke('#e2e8f0');
    doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold').text('TOTAL', 45, resumoY + 8);
    doc.fillColor('#020617').fontSize(16).text(total.toString(), 45, resumoY + 22);

    doc.rect(40 + boxWidth + gap, resumoY, boxWidth, boxHeight).fill('#f8fafc').stroke('#e2e8f0');
    doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold').text('BATISMOS', 40 + boxWidth + gap + 5, resumoY + 8);
    doc.fillColor('#020617').fontSize(16).text(batizados.toString(), 40 + boxWidth + gap + 5, resumoY + 22);

    doc.rect(40 + (boxWidth + gap) * 2, resumoY, boxWidth, boxHeight).fill('#f8fafc').stroke('#e2e8f0');
    doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold').text('ATIVOS', 40 + (boxWidth + gap) * 2 + 5, resumoY + 8);
    doc.fillColor('#020617').fontSize(16).text(ativos.toString(), 40 + (boxWidth + gap) * 2 + 5, resumoY + 22);

    doc.rect(40 + (boxWidth + gap) * 3, resumoY, boxWidth, boxHeight).fill('#020617').stroke('#020617');
    doc.fillColor('#facc15').fontSize(8).font('Helvetica-Bold').text('MÉDIA IDADE', 40 + (boxWidth + gap) * 3 + 5, resumoY + 8);
    doc.fillColor('#ffffff').fontSize(16).text(`${mediaIdade} anos`, 40 + (boxWidth + gap) * 3 + 5, resumoY + 22);

    let tableY = 210;
    doc.fillColor('#020617').rect(40, tableY, 520, 20).fill();
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    doc.text('NOME', 45, tableY + 6);
    doc.text('EMAIL', 200, tableY + 6);
    doc.text('TELEFONE', 370, tableY + 6);
    doc.text('CARGO', 460, tableY + 6);

    tableY += 20;
    doc.font('Helvetica').fontSize(9);
    membros.forEach((m, i) => {
      if (tableY > 700) { doc.addPage(); tableY = 40; }
      if (i % 2 === 0) doc.fillColor('#f8fafc').rect(40, tableY, 520, 20).fill();
      doc.fillColor('#020617');
      doc.text(m.nome || '-', 45, tableY + 6, { width: 150 });
      doc.text(m.email || '-', 200, tableY + 6, { width: 160 });
      doc.text(m.telefone || '-', 370, tableY + 6, { width: 85 });
      doc.text(m.cargo || 'Membro', 460, tableY + 6, { width: 95 });
      tableY += 20;
    });

    // Assinatura com MUITO espaço
    let footerY = 680; // <-- Aumentado para descer a assinatura
    const centroX = 40 + (520 / 2);
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(11);
    doc.text('O Pastor', centroX - 30, footerY);
    doc.moveTo(centroX - 100, footerY + 20).lineTo(centroX + 100, footerY + 20).stroke('#020617'); // <-- Linha mais abaixo
    doc.font('Helvetica-Bold').fontSize(11).text(pastor ? pastor.nome : 'Nome do Pastor', centroX - 100, footerY + 25, { width: 200, align: 'center' });
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(pastor ? (pastor.cargo || 'Pastor') : 'Pastor', centroX - 100, footerY + 40, { width: 200, align: 'center' });

    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function gerarPDFBatismosSecretario(req, res) {
  try {
    const { igrejaId } = req.params;
    const { membros, igreja, pastor } = await membroService.buscarDadosParaRelatorioBatismos(igrejaId);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-batismos-${igreja.slug}.pdf`);
    doc.pipe(res);

    const logoUrl = igreja.logoUrl || igreja.icone;
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

    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(20).text(igreja.nome.toUpperCase(), 100, 40);
    doc.fillColor('#64748b').font('Helvetica').fontSize(12).text('Relatório Oficial de Batismos', 100, 65);
    doc.fillColor('#facc15').rect(40, 95, 520, 3).fill();
    doc.fillColor('#94a3b8').fontSize(9).text(`Emitido em: ${new Date().toLocaleDateString('pt-PT')}`, 40, 105);

    const totalBatismos = membros.length;
    let y = 130;
    doc.rect(40, y, 520, 50).fill('#f8fafc').stroke('#e2e8f0');
    doc.fillColor('#64748b').fontSize(10).font('Helvetica-Bold').text('TOTAL DE BATISMOS REGISTADOS', 50, y + 12);
    doc.fillColor('#020617').fontSize(22).text(totalBatismos.toString(), 50, y + 25);

    let tableY = y + 70;
    doc.fillColor('#020617').rect(40, tableY, 520, 20).fill();
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
    doc.text('NOME', 45, tableY + 6);
    doc.text('DATA DE BATISMO', 300, tableY + 6);
    doc.text('DEPARTAMENTO', 450, tableY + 6);

    tableY += 20;
    doc.font('Helvetica').fontSize(9);
    membros.forEach((m, i) => {
      if (tableY > 700) { doc.addPage(); tableY = 40; }
      if (i % 2 === 0) doc.fillColor('#f8fafc').rect(40, tableY, 520, 20).fill();
      doc.fillColor('#020617');
      doc.text(m.nome || '-', 45, tableY + 6, { width: 250 });
      doc.text(m.dataBatismo ? new Date(m.dataBatismo).toLocaleDateString('pt-PT') : '-', 300, tableY + 6, { width: 140 });
      doc.text(m.departamento ? m.departamento.nome : 'Sem departamento', 450, tableY + 6, { width: 105 });
      tableY += 20;
    });

    let footerY = 680;
    const centroX = 40 + (520 / 2);
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(11);
    doc.text('O Pastor', centroX - 30, footerY);
    doc.moveTo(centroX - 100, footerY + 20).lineTo(centroX + 100, footerY + 20).stroke('#020617');
    doc.font('Helvetica-Bold').fontSize(11).text(pastor ? pastor.nome : 'Nome do Pastor', centroX - 100, footerY + 25, { width: 200, align: 'center' });
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(pastor ? (pastor.cargo || 'Pastor') : 'Pastor', centroX - 100, footerY + 40, { width: 200, align: 'center' });

    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function gerarPDFPresencasSecretario(req, res) {
  try {
    const { igrejaId } = req.params;
    const { presencas, igreja, pastor } = await membroService.buscarDadosParaRelatorioPresencas(igrejaId);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-presencas-${igreja.slug}.pdf`);
    doc.pipe(res);

    const logoUrl = igreja.logoUrl || igreja.icone;
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

    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(20).text(igreja.nome.toUpperCase(), 100, 40);
    doc.fillColor('#64748b').font('Helvetica').fontSize(12).text('Relatório Oficial de Presenças', 100, 65);
    doc.fillColor('#facc15').rect(40, 95, 520, 3).fill();
    doc.fillColor('#94a3b8').fontSize(9).text(`Emitido em: ${new Date().toLocaleDateString('pt-PT')}`, 40, 105);

    const totalPresencas = presencas.length;
    let y = 130;
    doc.rect(40, y, 520, 50).fill('#f8fafc').stroke('#e2e8f0');
    doc.fillColor('#64748b').fontSize(10).font('Helvetica-Bold').text('TOTAL DE PRESENÇAS REGISTADAS', 50, y + 12);
    doc.fillColor('#020617').fontSize(22).text(totalPresencas.toString(), 50, y + 25);

    let tableY = y + 70;
    doc.fillColor('#020617').rect(40, tableY, 520, 20).fill();
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
    doc.text('MEMBRO', 45, tableY + 6);
    doc.text('TIPO', 300, tableY + 6);
    doc.text('DATA', 450, tableY + 6);

    tableY += 20;
    doc.font('Helvetica').fontSize(9);
    presencas.forEach((p, i) => {
      if (tableY > 700) { doc.addPage(); tableY = 40; }
      if (i % 2 === 0) doc.fillColor('#f8fafc').rect(40, tableY, 520, 20).fill();
      doc.fillColor('#020617');
      doc.text(p.membro ? p.membro.nome : '-', 45, tableY + 6, { width: 250 });
      doc.text(p.tipo || '-', 300, tableY + 6, { width: 140 });
      doc.text(new Date(p.data).toLocaleDateString('pt-PT'), 450, tableY + 6, { width: 105 });
      tableY += 20;
    });

    let footerY = 680;
    const centroX = 40 + (520 / 2);
    doc.fillColor('#020617').font('Helvetica-Bold').fontSize(11);
    doc.text('O Pastor', centroX - 30, footerY);
    doc.moveTo(centroX - 100, footerY + 20).lineTo(centroX + 100, footerY + 20).stroke('#020617');
    doc.font('Helvetica-Bold').fontSize(11).text(pastor ? pastor.nome : 'Nome do Pastor', centroX - 100, footerY + 25, { width: 200, align: 'center' });
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(pastor ? (pastor.cargo || 'Pastor') : 'Pastor', centroX - 100, footerY + 40, { width: 200, align: 'center' });

    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function editarMembroSecretario(req, res) {
  try {
    const { id } = req.params;
    const { departamentoId, dataBatismo, dataPrimeiraComunhao, dataCrisma, dataCasamento, dataObito } = req.body;

    const membro = await prisma.membro.update({
      where: { id: Number(id) },
      data: {
        departamentoId: departamentoId ? Number(departamentoId) : null,
        dataBatismo: dataBatismo ? new Date(dataBatismo) : null,
        dataPrimeiraComunhao: dataPrimeiraComunhao ? new Date(dataPrimeiraComunhao) : null,
        dataCrisma: dataCrisma ? new Date(dataCrisma) : null,
        dataCasamento: dataCasamento ? new Date(dataCasamento) : null,
        dataObito: dataObito ? new Date(dataObito) : null
      }
    });
    res.json(membro);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  publicRegister, login, verificarTelefone, verCodigo, redefinirSenhaComCodigo,
  list, create, aprovar, promover, setSectores, resetPassword, remove,
  updatePerfil, updateFoto, gerarFichaMembroPDF, gerarPDFMembrosSecretario, gerarPDFBatismosSecretario, gerarPDFPresencasSecretario, editarMembroSecretario
};
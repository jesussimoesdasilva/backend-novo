const prisma = require("../config/prisma");
const service = require("../services/oferta.service");
const PDFDocument = require('pdfkit');
const https = require('https'); // Necessário para o logotipo

async function list(req, res, next) {
  try { res.json(await service.listOfertas(req.params.igrejaId)); } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { finalidade, valor, metodo } = req.body;
    
    if (!finalidade || !valor) {
      return res.status(400).json({ error: true, message: "Finalidade e valor são obrigatórios" });
    }
    if (finalidade !== 'SAIDA' && !metodo) {
      return res.status(400).json({ error: true, message: "Método é obrigatório para ofertas/dízimos" });
    }

    const oferta = await service.createOferta(req.params.igrejaId, req.body);
    res.status(201).json({ message: "Registo efetuado", oferta });
  } catch (err) { 
    console.error("ERRO AO CRIAR:", err);
    next(err); 
  }
}

async function consultar(req, res, next) {
  try {
    const oferta = await service.consultarOferta(req.params.codigo, req.params.igrejaId);
    if (!oferta) return res.status(404).json({ error: true, message: "Oferta não encontrada. Verifique o código." });
    res.json(oferta);
  } catch (err) { next(err); }
}

async function preValidar(req, res, next) {
  try { res.json(await service.preValidarOferta(req.params.id)); } catch (err) { next(err); }
}

async function validar(req, res, next) {
  try { res.json(await service.validarOferta(req.params.id)); } catch (err) { next(err); }
}

async function negar(req, res, next) {
  try { res.json(await service.negarOferta(req.params.id)); } catch (err) { next(err); }
}

async function estatisticas(req, res, next) {
  try { res.json(await service.getEstatisticas(req.params.igrejaId)); } catch (err) { next(err); }
}

async function relatorioDizimistas(req, res, next) {
  try {
    const { mes, ano } = req.query;
    res.json(await service.getRelatorioDizimistas(req.params.igrejaId, mes, ano));
  } catch (err) { next(err); }
}

async function gerarComprovativoPDF(req, res) {
  try {
    const { igrejaId, codigo } = req.params;
    const oferta = await prisma.oferta.findFirst({
      where: { codigo, igrejaId: Number(igrejaId) },
      include: { igreja: true, membro: true }
    });
    if (!oferta) return res.status(404).json({ message: "Oferta não encontrada" });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="comprovativo-${codigo}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).fillColor('#020617').text(oferta.igreja.nome, { align: 'center' });
    doc.fontSize(12).fillColor('#64748b').text('Comprovativo Oficial de Oferta', { align: 'center' });
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#facc15').lineWidth(2).stroke();
    doc.moveDown(1);

    doc.fontSize(14).fillColor('#020617').text('Detalhes da Oferta', { underline: true });
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#334155');
    doc.text(`Código: ${oferta.codigo}`);
    doc.text(`Valor: ${oferta.valor.toLocaleString('pt-AO')} Kz`);
    doc.text(`Finalidade: ${oferta.finalidade}`);
    doc.text(`Método: ${oferta.metodo || 'Não especificado'}`);
    doc.text(`Doador: ${oferta.membro ? oferta.membro.nome : (oferta.nomeDoador || 'Anónimo')}`);
    doc.text(`Data: ${new Date(oferta.criadoEm).toLocaleDateString('pt-PT')}`);
    doc.moveDown(2);
    doc.fontSize(14).fillColor('#020617').text('Obrigado pela sua fidelidade!', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(10).fillColor('#64748b').text('Este comprovativo foi gerado automaticamente pelo Sistema de Gestão Eclesiástica.', { align: 'center' });
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#facc15').lineWidth(1).stroke();
    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function zerarFinancas(req, res) {
  try {
    const igrejaId = Number(req.params.igrejaId);
    const resultado = await prisma.oferta.deleteMany({ where: { igrejaId } });
    res.json({ message: `Finanças zeradas. ${resultado.count} registos apagados.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function gerarPDFMembros(req, res) {
  try {
    const igrejaId = Number(req.params.igrejaId);
    const igreja = await prisma.igreja.findUnique({ where: { id: igrejaId } });
    const membros = await prisma.membro.findMany({ where: { igrejaId }, orderBy: { nome: 'asc' } });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-membros-${igreja.slug}.pdf"`);
    doc.pipe(res);

    // --- LOGOTIPO (Corrigido para o Cloudinary) ---
    if (igreja.logoUrl) {
      await new Promise((resolve) => {
        https.get(igreja.logoUrl, (response) => {
          const data = [];
          response.on('data', (chunk) => data.push(chunk));
          response.on('end', () => {
            const buffer = Buffer.concat(data);
            doc.image(buffer, 40, 40, { width: 60 });
            resolve();
          });
        }).on('error', () => resolve());
      });
    }

    // Cabeçalho
    doc.fontSize(20).fillColor('#020617').text(igreja.nome, { align: 'center' });
    doc.fontSize(12).fillColor('#64748b').text('Relatório Oficial de Membros', { align: 'center' });
    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#facc15').lineWidth(2).stroke();
    doc.moveDown(1);

    // Data
    doc.fontSize(10).fillColor('#94a3b8').text(`Emitido em: ${new Date().toLocaleString('pt-PT')}`, { align: 'right' });
    doc.moveDown(1);

    // Tabela
    const tableTop = doc.y;
    doc.rect(40, tableTop, 515, 20).fill('#020617');
    doc.fillColor('#ffffff').fontSize(10).text('Nome', 45, tableTop + 5);
    doc.text('Email', 250, tableTop + 5);
    doc.text('Telefone', 400, tableTop + 5);
    doc.text('Cargo', 505, tableTop + 5);

    let y = tableTop + 25;
    doc.fillColor('#000000');

    membros.forEach((m, i) => {
      if (i % 2 === 0) { doc.rect(40, y - 3, 515, 20).fill('#f8fafc'); doc.fillColor('#000000'); }
      doc.fontSize(9).text(m.nome, 45, y, { width: 200 });
      doc.text(m.email || '-', 250, y, { width: 140 });
      doc.text(m.telefone || '-', 400, y, { width: 90 });
      doc.text(m.cargo || 'Membro', 505, y, { width: 50 });
      y += 22;
      if (y > 750) { doc.addPage(); y = 40; }
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { 
  list, create, consultar, preValidar, validar, negar, estatisticas, 
  relatorioDizimistas, gerarComprovativoPDF, zerarFinancas, gerarPDFMembros 
};
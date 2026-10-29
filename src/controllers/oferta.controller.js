const service = require("../services/oferta.service");
const prisma = require("../config/prisma"); // <-- ADICIONA ESTA LINHA
const PDFDocument = require('pdfkit');

async function list(req, res, next) {
  try { res.json(await service.listOfertas(req.params.igrejaId)); } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { finalidade, valor, metodo } = req.body;
    
    // Se for uma SAIDA (despesa), não exige o método. Se for oferta/dízimo, exige.
    if (!finalidade || !valor) {
      return res.status(400).json({ error: true, message: "Finalidade e valor são obrigatórios" });
    }
    if (finalidade !== 'SAIDA' && !metodo) {
      return res.status(400).json({ error: true, message: "Método é obrigatório para ofertas/dízimos" });
    }

    const oferta = await service.createOferta(req.params.igrejaId, req.body);
    res.status(201).json({ message: "Registo efetuado", oferta });
  } catch (err) { 
    console.error("ERRO AO CRIAR:", err); // Mostra o erro no CMD
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

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function gerarComprovativoPDF(req, res) {
  try {
    const { igrejaId, codigo } = req.params;

    // 1. Vai buscar a oferta à base de dados
    const oferta = await prisma.oferta.findFirst({
      where: { codigo, igrejaId: Number(igrejaId) },
      include: { igreja: true, membro: true }
    });

    if (!oferta) return res.status(404).json({ message: "Oferta não encontrada" });

    // 2. Cria o documento PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configura os headers para forçar o download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="comprovativo-${codigo}.pdf"`);

    doc.pipe(res);

    // 3. Desenha o cabeçalho
    doc.fontSize(20).fillColor('#020617').text(oferta.igreja.nome, { align: 'center' });
    doc.fontSize(12).fillColor('#64748b').text('Comprovativo Oficial de Oferta', { align: 'center' });
    doc.moveDown(2);

    // Linha divisória
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#facc15').lineWidth(2).stroke();
    doc.moveDown(1);

    // 4. Desenha os dados da oferta
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

    // 5. Mensagem de agradecimento
    doc.fontSize(14).fillColor('#020617').text('Obrigado pela sua fidelidade!', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(10).fillColor('#64748b').text('Este comprovativo foi gerado automaticamente pelo Sistema de Gestão Eclesiástica.', { align: 'center' });

    // Linha final
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#facc15').lineWidth(1).stroke();

    // Finaliza o PDF
    doc.end();

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { list, create, consultar, preValidar, validar, negar, estatisticas, relatorioDizimistas, gerarComprovativoPDF };
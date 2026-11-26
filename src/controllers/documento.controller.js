const service = require("../services/documento.service");
const prisma = require("../config/prisma");

async function listarDocumentos(req, res) {
  try {
    const todos = await service.listarDocumentos(req.params.igrejaId);
    const normais = Array.isArray(todos) ? todos.filter(d => d.tipo !== "AUDIT_LOG" && d.tipo !== "TURMA_EBD") : [];
    res.json(normais);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function listarAuditoria(req, res) {
  try {
    const logs = await prisma.documento.findMany({
      where: { igrejaId: Number(req.params.igrejaId), tipo: "AUDIT_LOG" },
      orderBy: { criadoEm: "desc" },
      take: 150
    });
    const formatados = logs.map(l => {
      let info = { modulo: "GERAL", acao: l.nome, detalhes: "-", responsavel: "Sistema" };
      try { info = JSON.parse(l.url); } catch (e) {}
      return { id: l.id, criadoEm: l.criadoEm, modulo: info.modulo, acao: info.acao, detalhes: info.detalhes, responsavel: info.responsavel };
    });
    res.json(formatados);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function listarTurmas(req, res) {
  try {
    const itens = await prisma.documento.findMany({
      where: { igrejaId: Number(req.params.igrejaId), tipo: "TURMA_EBD" },
      orderBy: { criadoEm: "desc" }
    });
    const turmas = itens.map(t => {
      let dados = { nome: t.nome, professor: "", horario: "", categoria: "Catequese / Escola Bíblica", alunosIds: [], criancas: [] };
      try { dados = JSON.parse(t.url); } catch (e) {}
      return { id: t.id, criadoEm: t.criadoEm, ...dados };
    });
    res.json(turmas);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function criarTurma(req, res) {
  try {
    const { igrejaId, nome, professor, horario, categoria, alunosIds, criancas } = req.body;
    const nova = await prisma.documento.create({
      data: {
        igrejaId: Number(igrejaId),
        nome,
        tipo: "TURMA_EBD",
        url: JSON.stringify({ nome, professor, horario, categoria, alunosIds: alunosIds || [], criancas: criancas || [] })
      }
    });
    res.status(201).json(nova);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function atualizarTurma(req, res) {
  try {
    const { nome, professor, horario, categoria, alunosIds, criancas } = req.body;
    const atualizada = await prisma.documento.update({
      where: { id: Number(req.params.id) },
      data: {
        nome,
        url: JSON.stringify({ nome, professor, horario, categoria, alunosIds: alunosIds || [], criancas: criancas || [] })
      }
    });
    res.json(atualizada);
  } catch (err) { res.status(500).json({ message: err.message }); }
}

async function criarDocumento(req, res) {
  try { res.status(201).json(await service.criarDocumento(req.body)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function apagarDocumento(req, res) {
  try { await service.apagarDocumento(req.params.id); res.json({ message: "Apagado." }); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

module.exports = { listarDocumentos, listarAuditoria, listarTurmas, criarTurma, atualizarTurma, criarDocumento, apagarDocumento };

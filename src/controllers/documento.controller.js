const service = require("../services/documento.service");
const prisma = require("../config/prisma");

async function listarDocumentos(req, res) {
  try {
    const todos = await service.listarDocumentos(req.params.igrejaId);
    const normais = Array.isArray(todos) ? todos.filter(d => d.tipo !== "AUDIT_LOG") : [];
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

async function criarDocumento(req, res) {
  try { res.status(201).json(await service.criarDocumento(req.body)); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

async function apagarDocumento(req, res) {
  try { await service.apagarDocumento(req.params.id); res.json({ message: "Documento apagado." }); } 
  catch (err) { res.status(500).json({ message: err.message }); }
}

module.exports = { listarDocumentos, listarAuditoria, criarDocumento, apagarDocumento };

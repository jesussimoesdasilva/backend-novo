const service = require("../services/patrimonio.service");
const { registarAuditoria } = require("../middlewares/auditoria");

async function listBens(req, res, next) {
  try { res.json(await service.listBens(req.params.igrejaId)); } catch (err) { next(err); }
}

async function createBem(req, res, next) {
  try {
    const bem = await service.createBem(req.params.igrejaId, req.body);
    await registarAuditoria({
      igrejaId: req.params.igrejaId,
      modulo: "PATRIMÓNIO",
      acao: "Novo Bem Registado",
      detalhes: `${bem.nome} (${bem.categoria}) — ${Number(bem.valor || 0).toLocaleString("pt-AO")} Kz`,
      responsavel: req.body.responsavel || "Gestor de Património"
    });
    res.status(201).json(bem);
  } catch (err) { next(err); }
}

async function updateBem(req, res, next) {
  try { res.json(await service.updateBem(req.params.id, req.body)); } catch (err) { next(err); }
}

async function devolverBem(req, res, next) {
  try {
    const bem = await service.devolverBem(req.params.id);
    await registarAuditoria({
      igrejaId: bem.igrejaId,
      modulo: "PATRIMÓNIO",
      acao: "Bem Devolvido",
      detalhes: `${bem.nome} devolvido para ${bem.localizacao}`,
      responsavel: "Gestor de Património"
    });
    res.json(bem);
  } catch (err) { next(err); }
}

async function listMembrosAptos(req, res, next) {
  try { res.json(await service.listMembrosAptosEmprestimo(req.params.igrejaId)); } catch (err) { next(err); }
}

async function criarPedido(req, res, next) {
  try {
    const ped = await service.criarPedido(req.params.igrejaId, req.body);
    await registarAuditoria({
      igrejaId: req.params.igrejaId,
      modulo: "PATRIMÓNIO",
      acao: `Pedido de ${req.body.tipo}`,
      detalhes: `Bem #${req.body.patrimonioId} — ${req.body.motivo || req.body.novaLocalizacao || "-"}`,
      responsavel: req.body.solicitadoPor || "Gestor de Património"
    });
    res.status(201).json(ped);
  } catch (err) { next(err); }
}

async function listPedidos(req, res, next) {
  try { res.json(await service.listPedidos(req.params.igrejaId, req.query.status)); } catch (err) { next(err); }
}

async function responderPedido(req, res, next) {
  try {
    const { acao, pastorNome } = req.body;
    const ped = await service.responderPedido(req.params.pedidoId, acao, pastorNome);
    await registarAuditoria({
      igrejaId: ped.igrejaId,
      modulo: "PATRIMÓNIO",
      acao: `Pedido ${acao}`,
      detalhes: `Pedido #${ped.id} (${ped.tipo})`,
      responsavel: pastorNome || "Pastor / Padre"
    });
    res.json(ped);
  } catch (err) { next(err); }
}

module.exports = { listBens, createBem, updateBem, devolverBem, listMembrosAptos, criarPedido, listPedidos, responderPedido };

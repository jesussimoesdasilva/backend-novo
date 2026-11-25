const service = require("../services/patrimonio.service");

async function listBens(req, res, next) {
  try {
    res.json(await service.listBens(req.params.igrejaId));
  } catch (err) { next(err); }
}

async function createBem(req, res, next) {
  try {
    res.status(201).json(await service.createBem(req.params.igrejaId, req.body));
  } catch (err) { next(err); }
}

async function updateBem(req, res, next) {
  try {
    res.json(await service.updateBem(req.params.id, req.body));
  } catch (err) { next(err); }
}

async function devolverBem(req, res, next) {
  try {
    res.json(await service.devolverBem(req.params.id));
  } catch (err) { next(err); }
}

async function listMembrosAptos(req, res, next) {
  try {
    res.json(await service.listMembrosAptosEmprestimo(req.params.igrejaId));
  } catch (err) { next(err); }
}

async function criarPedido(req, res, next) {
  try {
    res.status(201).json(await service.criarPedido(req.params.igrejaId, req.body));
  } catch (err) { next(err); }
}

async function listPedidos(req, res, next) {
  try {
    res.json(await service.listPedidos(req.params.igrejaId, req.query.status));
  } catch (err) { next(err); }
}

async function responderPedido(req, res, next) {
  try {
    const { acao, pastorNome } = req.body;
    res.json(await service.responderPedido(req.params.pedidoId, acao, pastorNome));
  } catch (err) { next(err); }
}

module.exports = {
  listBens,
  createBem,
  updateBem,
  devolverBem,
  listMembrosAptos,
  criarPedido,
  listPedidos,
  responderPedido
};

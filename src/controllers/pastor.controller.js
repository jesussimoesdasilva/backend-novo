const service = require("../services/pastor.service");

async function list(req, res, next) {
  try { res.json(await service.listPastores(req.params.igrejaId)); } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    const pastor = await service.getPastor(req.params.id);
    if (!pastor) return res.status(404).json({ error: true, message: "Pastor não encontrado" });
    res.json(pastor);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: true, message: "O nome é obrigatório" });
    res.status(201).json(await service.createPastor(req.params.igrejaId, req.body));
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: "Email e senha obrigatórios" });
    const pastor = await service.loginPastor(email, senha);
    res.json({ ok: true, pastor });
  } catch (err) { res.status(401).json({ message: err.message }); }
}

async function update(req, res, next) {
  try { res.json(await service.updatePastor(req.params.id, req.body)); } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try { await service.deletePastor(req.params.id); res.json({ ok: true }); } catch (err) { next(err); }
}

module.exports = { list, get, create, update, remove, login };
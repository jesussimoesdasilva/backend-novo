const service = require("../services/departamento.service");

async function list(req, res, next) {
  try { res.json(await service.listDepartamentos(req.params.igrejaId)); } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    if (!req.body.nome) return res.status(400).json({ error: true, message: "Nome obrigatório" });
    res.status(201).json(await service.createDepartamento(req.params.igrejaId, req.body));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try { res.json(await service.updateDepartamento(req.params.id, req.body)); } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try { await service.deleteDepartamento(req.params.id); res.json({ ok: true }); } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const depto = await service.getDepartamentoById(req.params.id);
    if (!depto) return res.status(404).json({ message: "Departamento não encontrado" });
    res.json(depto);
  } catch (err) { next(err); }
}

// --- NOVO: Definir Líder do Sector ---
async function setLiderSector(req, res, next) {
  try {
    const { membroId } = req.body;
    res.json(await service.definirLiderSector(req.params.sectorId, membroId));
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove, getById, setLiderSector };
const service = require("../services/oferta.service");

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

module.exports = { list, create, consultar, preValidar, validar, negar, estatisticas, relatorioDizimistas };
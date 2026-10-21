const igrejaService = require("../services/igreja.service");

async function listIgrejas(req, res, next) {
  try { res.json(await igrejaService.getAllIgrejas()); } catch (err) { next(err); }
}

async function getIgreja(req, res, next) {
  try {
    const i = await igrejaService.getIgrejaById(req.params.id);
    if (!i) return res.status(404).json({ error: true, message: "Igreja não encontrada" });
    res.json(i);
  } catch (err) { next(err); }
}

async function addIgreja(req, res, next) {
  try {
    const { nome, slug, subadminEmail, subadminSenha } = req.body;
    if (!nome || !slug || !subadminEmail || !subadminSenha) {
      return res.status(400).json({ error: true, message: "Nome, slug, email e senha obrigatórios" });
    }
    res.status(201).json(await igrejaService.createIgreja(req.body));
  } catch (err) { next(err); }
}

async function editIgreja(req, res, next) {
  try {
    const { nome, slug } = req.body;
    if (!nome || !slug) return res.status(400).json({ error: true, message: "Nome e slug obrigatórios" });
    res.json(await igrejaService.updateIgreja(req.params.id, req.body));
  } catch (err) { next(err); }
}

async function removeIgreja(req, res, next) {
  try {
    await igrejaService.deleteIgreja(req.params.id);
    res.json({ ok: true, message: "Igreja apagada" });
  } catch (err) { next(err); }
}

async function uploadLogo(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: true, message: "Nenhum ficheiro" });
    const url = "/logos/" + req.file.filename;
    const atual = await igrejaService.getIgrejaById(req.params.id);
    const igreja = await igrejaService.updateIgreja(req.params.id, {
      ...atual,
      logoUrl: url,
    });
    res.json({ ok: true, url, igreja });
  } catch (err) { next(err); }
}

async function uploadImagensHero(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: true, message: "Nenhum ficheiro" });
    const urls = req.files.map(f => "/logos/" + f.filename);
    const atual = await igrejaService.getIgrejaById(req.params.id);
    const igreja = await igrejaService.updateIgreja(req.params.id, {
      ...atual,
      imagensHero: JSON.stringify(urls),
    });
    res.json({ ok: true, urls, igreja });
  } catch (err) { next(err); }
}

async function salvarCorFundo(req, res, next) {
  try {
    const { cor } = req.body;
    if (!cor) return res.status(400).json({ error: true, message: "Cor obrigatória" });
    const atual = await igrejaService.getIgrejaById(req.params.id);
    const igreja = await igrejaService.updateIgreja(req.params.id, {
      ...atual,
      corFundo: cor,
    });
    res.json({ ok: true, igreja });
  } catch (err) { next(err); }
}

async function salvarCorBarraTopo(req, res, next) {
  try {
    const { cor } = req.body;
    if (!cor) return res.status(400).json({ error: true, message: "Cor obrigatória" });
    const atual = await igrejaService.getIgrejaById(req.params.id);
    const igreja = await igrejaService.updateIgreja(req.params.id, {
      ...atual,
      corBarraTopo: cor,
    });
    res.json({ ok: true, igreja });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: true, message: "Email e senha obrigatórios" });
    const igreja = await igrejaService.loginSubadmin(email, senha);
    res.json({
      ok: true,
      igreja: { id: igreja.id, nome: igreja.nome, slug: igreja.slug, icone: igreja.icone, descricao: igreja.descricao }
    });
  } catch (err) { res.status(401).json({ error: true, message: err.message }); }
}

module.exports = { 
  listIgrejas, getIgreja, addIgreja, editIgreja, removeIgreja, 
  uploadLogo, uploadImagensHero, salvarCorFundo, salvarCorBarraTopo, login 
};
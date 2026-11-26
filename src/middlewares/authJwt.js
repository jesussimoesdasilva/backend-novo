const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "igrejas-angola-chave-secreta-2026";

function gerarToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: true, message: "Acesso não autorizado. Faça login novamente." });
  }

  const token = authHeader.split(" ");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.utilizador = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: true, message: "Sessão expirada. Faça login novamente." });
  }
}

function apenasAdminMaster(req, res, next) {
  if (!req.utilizador || req.utilizador.role !== "admin_master") {
    return res.status(403).json({ error: true, message: "Acesso exclusivo ao Admin Master." });
  }
  next();
}

function apenasLideranca(req, res, next) {
  const permitidos = ["admin_master", "subadmin", "pastor", "secretario", "patrimonio"];
  if (!req.utilizador || !permitidos.includes(req.utilizador.role)) {
    return res.status(403).json({ error: true, message: "Permissão insuficiente para esta ação." });
  }
  next();
}

module.exports = {
  gerarToken,
  verificarToken,
  apenasAdminMaster,
  apenasLideranca
};

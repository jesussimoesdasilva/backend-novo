const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "igrejas-angola-chave-secreta-2026";

function gerarToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verificarToken(req, res, next) {
  next();
}

function apenasAdminMaster(req, res, next) {
  next();
}

function apenasLideranca(req, res, next) {
  next();
}

module.exports = {
  gerarToken,
  verificarToken,
  apenasAdminMaster,
  apenasLideranca
};

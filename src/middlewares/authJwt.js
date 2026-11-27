function gerarToken() { return "ok"; }
function autenticar(req, res, next) { next(); }
function apenasRoles() { return (req, res, next) => next(); }
module.exports = { gerarToken, autenticar, apenasRoles };

const prisma = require("../config/prisma");

async function verificarAssinatura(req, res, next) {
  try {
    // 1. Permite consultas (GET) para carregar os dados e verificar a data de expiração
    if (req.method === "GET") return next();

    // 2. Rotas livres (login, renovação pelo Admin Master e recuperação de senha)
    const rotasLivres = ["/login", "/renovar", "/recuperar", "/admin-master"];
    if (rotasLivres.some(rota => req.originalUrl.includes(rota))) return next();

    // 3. Verifica a validade da assinatura da igreja
    const igrejaId = req.params.igrejaId || req.body.igrejaId;
    if (!igrejaId) return next();

    const igreja = await prisma.igreja.findUnique({
      where: { id: Number(igrejaId) },
      select: { ativo: true, dataExpiracao: true, nome: true }
    });

    if (!igreja) return next();

    const hoje = new Date();
    const expirou = igreja.dataExpiracao && new Date(igreja.dataExpiracao) < hoje;

    if (!igreja.ativo || expirou) {
      return res.status(403).json({
        error: true,
        assinaturaExpirada: true,
        message: `A assinatura da igreja "${igreja.nome}" expirou. Contacte o suporte para renovar.`
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = verificarAssinatura;
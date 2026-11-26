const prisma = require("../config/prisma");

async function registarAuditoria({ igrejaId, modulo, acao, detalhes, responsavel }) {
  try {
    if (!igrejaId) return;
    await prisma.documento.create({
      data: {
        igrejaId: Number(igrejaId),
        nome: `[${modulo}] ${acao}`,
        tipo: "AUDIT_LOG",
        url: JSON.stringify({
          modulo,
          acao,
          detalhes: detalhes || "-",
          responsavel: responsavel || "Sistema / Liderança"
        })
      }
    });
  } catch (e) {
    console.error("Falha silenciosa ao gravar auditoria:", e.message);
  }
}

module.exports = { registarAuditoria };

const prisma = require("../config/prisma");

// 1. Listar bens da igreja (com dados de quem tem emprestado)
async function listBens(igrejaId) {
  return await prisma.patrimonio.findMany({
    where: { igrejaId: Number(igrejaId) },
    include: {
      emprestadoPara: { select: { id: true, nome: true, telefone: true } }
    },
    orderBy: { criadoEm: "desc" }
  });
}

// 2. Criar novo bem
async function createBem(igrejaId, data) {
  return await prisma.patrimonio.create({
    data: {
      igrejaId: Number(igrejaId),
      nome: data.nome,
      categoria: data.categoria,
      localizacao: data.localizacao,
      valor: Number(data.valor),
      numeroSerie: data.numeroSerie || null,
      dataAquisicao: data.dataAquisicao ? new Date(data.dataAquisicao) : null,
      estado: data.estado || "Bom",
      responsavel: data.responsavel || null,
      fotoUrl: data.fotoUrl || null,
      status: "ATIVO"
    }
  });
}

// 3. Editar dados básicos do bem
async function updateBem(id, data) {
  return await prisma.patrimonio.update({
    where: { id: Number(id) },
    data: {
      nome: data.nome,
      categoria: data.categoria,
      localizacao: data.localizacao,
      valor: Number(data.valor),
      numeroSerie: data.numeroSerie || null,
      dataAquisicao: data.dataAquisicao ? new Date(data.dataAquisicao) : null,
      estado: data.estado,
      responsavel: data.responsavel || null,
      fotoUrl: data.fotoUrl !== undefined ? data.fotoUrl : undefined
    }
  });
}

// 4. Registar devolução de bem emprestado
async function devolverBem(id) {
  return await prisma.patrimonio.update({
    where: { id: Number(id) },
    data: {
      status: "ATIVO",
      emprestadoParaId: null,
      dataEmprestimo: null,
      dataDevolucaoPrev: null
    }
  });
}

// 5. Listar apenas membros aptos para empréstimo (com dízimo VALIDADO no mês atual)
async function listMembrosAptosEmprestimo(igrejaId) {
  const hoje = new Date();
  const start = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1));
  const end = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59));

  const ofertasValidas = await prisma.oferta.findMany({
    where: {
      igrejaId: Number(igrejaId),
      finalidade: "Dízimo",
      status: "VALIDADO",
      criadoEm: { gte: start, lte: end },
      membroId: { not: null }
    },
    select: {
      membro: { select: { id: true, nome: true, telefone: true } }
    }
  });

  // Remover duplicados caso o membro tenha pago mais de uma vez no mês
  const mapa = new Map();
  ofertasValidas.forEach(o => {
    if (o.membro) mapa.set(o.membro.id, o.membro);
  });

  return Array.from(mapa.values());
}

// 6. Criar pedido ao Pastor (MOVIMENTACAO, EMPRESTIMO ou ABATE)
async function criarPedido(igrejaId, data) {
  return await prisma.pedidoPatrimonio.create({
    data: {
      igrejaId: Number(igrejaId),
      patrimonioId: Number(data.patrimonioId),
      tipo: data.tipo, // MOVIMENTACAO, EMPRESTIMO, ABATE
      solicitadoPor: data.solicitadoPor,
      novaLocalizacao: data.novaLocalizacao || null,
      membroId: data.membroId ? Number(data.membroId) : null,
      dataDevolucaoPrev: data.dataDevolucaoPrev ? new Date(data.dataDevolucaoPrev) : null,
      motivo: data.motivo || null,
      status: "PENDENTE"
    }
  });
}

// 7. Listar pedidos de aprovação (para o Pastor e acompanhamento)
async function listPedidos(igrejaId, status) {
  const where = { igrejaId: Number(igrejaId) };
  if (status) where.status = status;

  return await prisma.pedidoPatrimonio.findMany({
    where,
    include: {
      patrimonio: { select: { id: true, nome: true, localizacao: true, categoria: true, valor: true } },
      membro: { select: { id: true, nome: true, telefone: true } }
    },
    orderBy: { criadoEm: "desc" }
  });
}

// 8. Pastor Aprovar ou Negar Pedido
async function responderPedido(pedidoId, acao, pastorNome) {
  const pedido = await prisma.pedidoPatrimonio.findUnique({
    where: { id: Number(pedidoId) }
  });

  if (!pedido) throw new Error("Pedido não encontrado.");

  // Atualiza o pedido
  const pedidoAtualizado = await prisma.pedidoPatrimonio.update({
    where: { id: Number(pedidoId) },
    data: {
      status: acao, // "APROVADO" ou "NEGADO"
      respondidoPor: pastorNome,
      respondidoEm: new Date()
    }
  });

  // Se o Pastor APROVOU, aplica a mudança real no bem
  if (acao === "APROVADO") {
    if (pedido.tipo === "MOVIMENTACAO") {
      await prisma.patrimonio.update({
        where: { id: pedido.patrimonioId },
        data: { localizacao: pedido.novaLocalizacao }
      });
    } else if (pedido.tipo === "EMPRESTIMO") {
      await prisma.patrimonio.update({
        where: { id: pedido.patrimonioId },
        data: {
          status: "EMPRESTADO",
          emprestadoParaId: pedido.membroId,
          dataEmprestimo: new Date(),
          dataDevolucaoPrev: pedido.dataDevolucaoPrev
        }
      });
    } else if (pedido.tipo === "ABATE") {
      await prisma.patrimonio.update({
        where: { id: pedido.patrimonioId },
        data: {
          status: "ABATIDO",
          motivoAbate: pedido.motivo,
          dataAbate: new Date(),
          aprovadoPor: pastorNome
        }
      });
    }
  }

  return pedidoAtualizado;
}

module.exports = {
  listBens,
  createBem,
  updateBem,
  devolverBem,
  listMembrosAptosEmprestimo,
  criarPedido,
  listPedidos,
  responderPedido
};

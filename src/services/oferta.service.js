const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");

async function listOfertas(igrejaId) {
  return await prisma.oferta.findMany({
    where: { igrejaId: Number(igrejaId) },
    orderBy: { criadoEm: "desc" },
    include: { membro: { select: { nome: true, bi: true, telefone: true } } }
  });
}

async function createOferta(igrejaId, data) {
  // Gera um código. Se for SAIDA, começa por SAI-, senão OF-
  const prefixo = data.finalidade === 'SAIDA' ? 'SAI-' : 'OF-';
  const codigo = prefixo + Math.floor(100000 + Math.random() * 900000);
  
  const membroId = data.membroId ? Number(data.membroId) : null;

  // Se for uma saída de dinheiro, já nasce como VALIDADO.
  // Se for oferta/dízimo normal, nasce como PENDENTE.
  const status = data.finalidade === 'SAIDA' ? 'VALIDADO' : 'PENDENTE';

  return await prisma.oferta.create({
    data: {
      igrejaId: Number(igrejaId),
      membroId: membroId,
      codigo: codigo,
      nomeDoador: data.nomeDoador || data.descricao || null,
      bi: data.bi || null,
      telefone: data.telefone || null,
      finalidade: data.finalidade,
      valor: Number(data.valor),
      metodo: data.metodo || 'N/A',
      referencia: data.referencia || null,
      status: status,
      comprovativoUrl: data.comprovativoUrl || null
    },
  });
}

async function consultarOferta(codigo, igrejaId) {
  return await prisma.oferta.findFirst({
    where: { codigo: codigo, igrejaId: Number(igrejaId) }
  });
}

async function preValidarOferta(id) {
  return await prisma.oferta.update({
    where: { id: Number(id) },
    data: { status: "AGUARDANDO_PASTOR" },
  });
}

async function validarOferta(id) {
  return await prisma.oferta.update({
    where: { id: Number(id) },
    data: { status: "VALIDADO", validadoEm: new Date() },
  });
}

async function negarOferta(id) {
  // 1. Vai buscar a oferta para ver se tem comprovativo
  const oferta = await prisma.oferta.findUnique({ where: { id: Number(id) } });
  
  if (!oferta) throw new Error("Oferta não encontrada");

  // 2. Se tiver comprovativo, apaga no Cloudinary
  if (oferta.comprovativoUrl) {
    try {
      const urlParts = oferta.comprovativoUrl.split('/upload/');
      if (urlParts.length > 1) {
        let publicId = urlParts[1].replace(/^v\d+\//, '');
        publicId = publicId.split('.')[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        console.log("Ficheiro apagado do Cloudinary:", publicId);
      }
    } catch (err) {
      console.error("Erro ao apagar ficheiro no Cloudinary:", err);
    }
  }

  // 3. Atualiza o status para NEGADO e limpa o link na base de dados
  return await prisma.oferta.update({
    where: { id: Number(id) },
    data: { 
      status: "NEGADO",
      comprovativoUrl: null
    },
  });
}

async function getEstatisticas(igrejaId) {
  const ofertas = await prisma.oferta.findMany({
    where: { igrejaId: Number(igrejaId) }
  });

  let totalDizimos = 0;
  let totalOfertas = 0;
  let totalSaidas = 0;
  let totalPendente = 0;

  ofertas.forEach(o => {
    if (o.status === "VALIDADO") {
      if (o.finalidade === "Dízimo") {
        totalDizimos += o.valor;
      } else if (o.finalidade === "SAIDA") {
        totalSaidas += o.valor;
      } else {
        totalOfertas += o.valor;
      }
    } else if (o.status === "PENDENTE" || o.status === "AGUARDANDO_PASTOR") {
      totalPendente += o.valor;
    }
  });

  const saldoReal = (totalDizimos + totalOfertas) - totalSaidas;

  return { totalDizimos, totalOfertas, totalSaidas, totalPendente, saldoReal };
}

async function getRelatorioDizimistas(igrejaId, mes, ano) {
  let whereClause = { 
    igrejaId: Number(igrejaId), 
    finalidade: "Dízimo",
    status: "VALIDADO"
  };

  if (mes && ano) {
    const start = new Date(Date.UTC(Number(ano), Number(mes) - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(Number(ano), Number(mes), 0, 23, 59, 59));
    whereClause.criadoEm = { gte: start, lte: end };
  } else if (ano) {
    const start = new Date(Date.UTC(Number(ano), 0, 1, 0, 0, 0));
    const end = new Date(Date.UTC(Number(ano), 11, 31, 23, 59, 59));
    whereClause.criadoEm = { gte: start, lte: end };
  }

  const ofertas = await prisma.oferta.findMany({
    where: whereClause,
    include: { 
      membro: { 
        include: { 
          sectores: true,
          departamento: true 
        } 
      } 
    }
  });

  const dizimistas = {};
  let totalGeral = 0;

  ofertas.forEach(o => {
    if (!o.membroId || !o.membro) return;
    
    let nomeSector = '-';
    if (o.membro.sectores && o.membro.sectores.length > 0) {
      nomeSector = o.membro.sectores[0].nome;
    }

    if (!dizimistas[o.membroId]) {
      dizimistas[o.membroId] = {
        nome: o.membro.nome,
        bi: o.membro.bi || '-',
        telefone: o.membro.telefone || '-',
        sector: nomeSector,
        departamento: o.membro.departamento?.nome || '-',
        totalDizimado: 0,
        ultimaData: o.criadoEm
      };
    }
    dizimistas[o.membroId].totalDizimado += o.valor;
    totalGeral += o.valor;

    if (new Date(o.criadoEm) > new Date(dizimistas[o.membroId].ultimaData)) {
      dizimistas[o.membroId].ultimaData = o.criadoEm;
    }
  });

  return {
    dados: Object.values(dizimistas),
    totalGeral: totalGeral
  };
}

// ===== FUNÇÃO NOVA: O MEU DÍZIMO (HISTÓRICO ANUAL) =====
async function meusDizimos(membroId, ano) {
  const inicioAno = new Date(ano, 0, 1, 0, 0, 0);
  const fimAno = new Date(ano, 11, 31, 23, 59, 59);

  const dizimos = await prisma.oferta.findMany({
    where: {
      membroId: Number(membroId),
      finalidade: 'Dízimo',
      criadoEm: { gte: inicioAno, lte: fimAno }
    },
    orderBy: { criadoEm: 'asc' }
  });

  return dizimos;
}

async function getRelatorioFidelidade(igrejaId, mes, ano) {
  // Define o intervalo do mês
  const start = new Date(Date.UTC(Number(ano), Number(mes) - 1, 1));
  const end = new Date(Date.UTC(Number(ano), Number(mes), 0, 23, 59, 59));

  // 1. Vai buscar todos os membros da igreja
  const membros = await prisma.membro.findMany({
    where: { igrejaId: Number(igrejaId) },
    select: { id: true, nome: true, telefone: true, foto: true }
  });

  // 2. Vai buscar todos os dízimos desta igreja (histórico completo)
  const todasOfertas = await prisma.oferta.findMany({
    where: { igrejaId: Number(igrejaId), finalidade: 'Dízimo' }
  });

  // 3. Calcula a fidelidade de cada membro
  const relatorio = membros.map(membro => {
    const ofertasMembro = todasOfertas.filter(o => o.membroId === membro.id);
    
    // Regra: Se nunca teve nenhum dízimo VALIDADO, é isento.
    const isDizimista = ofertasMembro.some(o => o.status === 'VALIDADO');
    if (!isDizimista) return null;

    // Verifica se pagou no mês atual (VALIDADO ou AGUARDANDO_PASTOR)
    const pagouEsteMes = ofertasMembro.some(o => {
      const d = new Date(o.criadoEm);
      return d >= start && d <= end && (o.status === 'VALIDADO' || o.status === 'AGUARDANDO_PASTOR');
    });

    // Calcula o total pago no ano
    const totalPagoAno = ofertasMembro.filter(o => 
      new Date(o.criadoEm).getFullYear() === Number(ano) && o.status === 'VALIDADO'
    ).reduce((acc, o) => acc + o.valor, 0);

    return {
      id: membro.id,
      nome: membro.nome,
      telefone: membro.telefone,
      foto: membro.foto,
      statusMes: pagouEsteMes ? 'PAGO' : 'FALTA',
      totalPagoAno
    };
  }).filter(m => m !== null); // Remove os isentos

  return relatorio;
}

module.exports = { 
  listOfertas, createOferta, consultarOferta, 
  preValidarOferta, validarOferta, negarOferta, 
  getEstatisticas, getRelatorioDizimistas,
  meusDizimos, getRelatorioFidelidade
};
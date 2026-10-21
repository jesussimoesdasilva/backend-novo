const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar as rotas
const igrejaRoutes = require('./routes/igreja.routes');
const membroRoutes = require('./routes/membro.routes');
const departamentoRoutes = require('./routes/departamento.routes');
const sectorRoutes = require('./routes/sector.routes');
const grupoRoutes = require('./routes/grupo.routes'); // <-- A ROTA DO CHAT E GALERIA AQUI
const pastorRoutes = require('./routes/pastor.routes');
const eventoRoutes = require('./routes/evento.routes');
const avisoRoutes = require('./routes/aviso.routes');
const ofertaRoutes = require('./routes/oferta.routes');
const contaRoutes = require('./routes/conta.routes');
const galeriaRoutes = require('./routes/galeria.routes');
const chatRoutes = require('./routes/chat.routes');
const oracaoRoutes = require('./routes/oracao.routes');
const midiaRoutes = require('./routes/midia.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Pastas de ficheiros públicos
app.use('/logos', express.static(path.join(__dirname, '..', 'public', 'logos')));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ligar as rotas
app.use('/api/igrejas', igrejaRoutes);
app.use('/api/membros', membroRoutes);
app.use('/api/departamentos', departamentoRoutes);
app.use('/api/sectores', sectorRoutes);
app.use('/api/grupos', grupoRoutes); // <-- A CORREÇÃO ESTÁ AQUI!
app.use('/api/pastores', pastorRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/avisos', avisoRoutes);
app.use('/api/ofertas', ofertaRoutes);
app.use('/api/contas', contaRoutes);
app.use('/api/galeria', galeriaRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/oracao', oracaoRoutes);
app.use('/api/midia', midiaRoutes);

// Rotas para as páginas HTML
app.get('/igreja/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'site-igreja.html'));
});

app.get('/igreja/:slug/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'site-igreja-admin.html'));
});

app.get('/igreja/:slug/pastor', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'painel-pastor.html'));
});

module.exports = app;
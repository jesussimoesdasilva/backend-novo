const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

// ROTAS
app.use('/api/igrejas', require('./routes/igreja.routes'));
app.use('/api/membros', require('./routes/membro.routes'));
app.use('/api/departamentos', require('./routes/departamento.routes'));
app.use('/api/sectores', require('./routes/sector.routes'));
app.use('/api/grupos', require('./routes/grupo.routes'));
app.use('/api/pastores', require('./routes/pastor.routes'));
app.use('/api/eventos', require('./routes/evento.routes'));
app.use('/api/avisos', require('./routes/aviso.routes'));
app.use('/api/ofertas', require('./routes/oferta.routes'));
app.use('/api/contas', require('./routes/conta.routes'));
app.use('/api/galeria', require('./routes/galeria.routes'));
app.use('/api/chat', require('./routes/chat.routes')); // <-- CHAT AQUI
app.use('/api/oracao', require('./routes/oracao.routes'));
app.use('/api/midia', require('./routes/midia.routes'));

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
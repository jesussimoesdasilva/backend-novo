function errorHandler(err, req, res, next) {
  console.error("❌ Erro:", err.message);

  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor";

  res.status(status).json({
    error: true,
    message: message,
  });
}

module.exports = errorHandler;
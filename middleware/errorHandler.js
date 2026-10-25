function notFound(req, res) {
  res.status(404).json({ error: "Route not found." });
}

function errorHandler(error, req, res, next) {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}

module.exports = { notFound, errorHandler };

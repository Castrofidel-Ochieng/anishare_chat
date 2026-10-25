const express = require("express");
const helmet = require("helmet");
const path = require("path");
const roomRoutes = require("./routes/roomRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: "20kb" }));
  app.use(express.urlencoded({ extended: false, limit: "20kb" }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Vanish Chat" });
  });

  app.use("/api/rooms", roomRoutes);
  app.use("/api/messages", messageRoutes);
  app.use(express.static(path.join(__dirname, "public")));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const { createApp } = require("./app");
const { testDatabaseConnection, pool } = require("./config/database");
const { registerChatSocket } = require("./sockets/chatSocket");
const { startCleanupService, stopCleanupService } = require("./services/messageCleanupService");

const PORT = Number(process.env.PORT || 3000);
const app = createApp();
const server = http.createServer(app);
const io = new Server(server);

registerChatSocket(io);

async function start() {
  await testDatabaseConnection();
  startCleanupService();

  server.listen(PORT, () => {
    console.log(`Vanish Chat running at http://localhost:${PORT}`);
  });
}

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received. Shutting down Vanish Chat...`);
  stopCleanupService();
  io.close();
  server.close(async () => {
    try {
      await pool.end();
    } catch (error) {
      console.error("Error closing MySQL pool:", error.message);
    }
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

start().catch(async (error) => {
  console.error("Could not start Vanish Chat:", error.message);
  try { await pool.end(); } catch {}
  process.exit(1);
});

const Message = require("../models/Message");

let timer = null;
let isRunning = false;

async function cleanup() {
  if (isRunning) return;
  isRunning = true;
  try {
    const deleted = await Message.deleteExpired();
    if (deleted > 0) console.log(`Expired-message cleanup deleted ${deleted} message(s).`);
  } catch (error) {
    console.error("Expired-message cleanup failed:", error.message);
  } finally {
    isRunning = false;
  }
}

function startCleanupService() {
  if (timer) return;
  void cleanup();
  timer = setInterval(() => void cleanup(), 60_000);
  timer.unref?.();
}

function stopCleanupService() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { startCleanupService, stopCleanupService };

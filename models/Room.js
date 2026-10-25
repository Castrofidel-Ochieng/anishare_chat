const { pool } = require("../config/database");

async function findOrCreate(roomName) {
  const now = Date.now();
  await pool.execute(
    `INSERT INTO rooms (room_name, created_at)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE room_name = VALUES(room_name)`,
    [roomName, now]
  );

  const [rows] = await pool.execute(
    "SELECT id, room_name, created_at FROM rooms WHERE room_name = ? LIMIT 1",
    [roomName]
  );
  return rows[0] || null;
}

async function findByName(roomName) {
  const [rows] = await pool.execute(
    "SELECT id, room_name, created_at FROM rooms WHERE room_name = ? LIMIT 1",
    [roomName]
  );
  return rows[0] || null;
}

module.exports = { findOrCreate, findByName };

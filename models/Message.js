const { pool } = require("../config/database");

async function create({ roomId, username, content, createdAt, expiresAt }) {
  const [result] = await pool.execute(
    `INSERT INTO messages (room_id, username, content, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [roomId, username, content, createdAt, expiresAt]
  );

  return {
    id: result.insertId,
    room_id: roomId,
    username,
    content,
    created_at: createdAt,
    expires_at: expiresAt
  };
}

async function findRecentByRoom(roomId, limit = 100) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 100));
  const [rows] = await pool.execute(
    `SELECT m.id, m.username, m.content, m.created_at, m.expires_at
     FROM messages m
     WHERE m.room_id = ? AND m.expires_at > ?
     ORDER BY m.created_at DESC
     LIMIT ${safeLimit}`,
    [roomId, Date.now()]
  );
  return rows.reverse();
}

async function deleteExpired() {
  const [result] = await pool.execute(
    "DELETE FROM messages WHERE expires_at <= ?",
    [Date.now()]
  );
  return result.affectedRows;
}

module.exports = { create, findRecentByRoom, deleteExpired };

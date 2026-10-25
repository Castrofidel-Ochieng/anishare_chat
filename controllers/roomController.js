const Room = require("../models/Room");

function validateRoomName(value) {
  return (
    typeof value === "string" && /^[a-zA-Z0-9_-]{1,30}$/.test(value.trim())
  );
}

async function listRooms(req, res, next) {
  try {
    const { pool } = require("../config/database");
    const [rooms] = await pool.execute(
      "SELECT room_name, created_at FROM rooms ORDER BY room_name ASC LIMIT 100",
    );
    res.json({ rooms });
  } catch (error) {
    next(error);
  }
}

async function ensureRoom(req, res, next) {
  try {
    const roomName = req.body?.room;
    if (!validateRoomName(roomName)) {
      return res
        .status(400)
        .json({
          error:
            "Room must use 1–30 letters, numbers, underscores, or hyphens.",
        });
    }
    const room = await Room.findOrCreate(roomName.trim());
    res
      .status(200)
      .json({
        room: { room_name: room.room_name, created_at: room.created_at },
      });
  } catch (error) {
    next(error);
  }
}

module.exports = { listRooms, ensureRoom, validateRoomName };

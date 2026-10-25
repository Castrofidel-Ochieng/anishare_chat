const Room = require("../models/Room");
const Message = require("../models/Message");
const { validateRoomName } = require("./roomController");

async function listMessages(req, res, next) {
  try {
    const roomName = String(req.params.room || "").trim();
    if (!validateRoomName(roomName)) {
      return res.status(400).json({ error: "Invalid room name." });
    }
    const room = await Room.findByName(roomName);
    if (!room) return res.json({ messages: [] });

    const messages = await Message.findRecentByRoom(room.id);
    res.json({ messages, room: room.room_name });
  } catch (error) {
    next(error);
  }
}

module.exports = { listMessages };

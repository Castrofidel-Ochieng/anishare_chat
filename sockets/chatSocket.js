const Room = require("../models/Room");
const Message = require("../models/Message");
const { validateRoomName } = require("../controllers/roomController");

const MESSAGE_LIFETIME = 48 * 60 * 60 * 1000;

function registerChatSocket(io) {
  io.on("connection", (socket) => {
    socket.on("join-room", async (data, acknowledge) => {
      const ack = typeof acknowledge === "function" ? acknowledge : () => {};
      try {
        if (!data || typeof data !== "object") {
          return ack({ ok: false, error: "Please provide a display name and room." });
        }

        const username = typeof data.username === "string" ? data.username.trim() : "";
        const roomName = typeof data.room === "string" ? data.room.trim() : "";

        if (username.length < 1 || username.length > 24) {
          return ack({ ok: false, error: "Display name must be 1–24 characters." });
        }
        if (!validateRoomName(roomName)) {
          return ack({ ok: false, error: "Room must use 1–30 letters, numbers, underscores, or hyphens." });
        }

        const room = await Room.findOrCreate(roomName);

        if (socket.data.roomName) socket.leave(socket.data.roomName);
        socket.data.username = username;
        socket.data.roomName = roomName;
        socket.data.roomId = room.id;
        await socket.join(roomName);

        const messages = await Message.findRecentByRoom(room.id);
        ack({
          ok: true,
          room: roomName,
          messages: messages.map((message) => ({
            ...message,
            id: Number(message.id),
            room: roomName
          }))
        });
      } catch (error) {
        console.error("join-room failed:", error);
        ack({ ok: false, error: "Could not join the room. Please try again." });
      }
    });

    socket.on("send-message", async (rawContent, acknowledge) => {
      const ack = typeof acknowledge === "function" ? acknowledge : () => {};
      try {
        const { username, roomName, roomId } = socket.data;
        if (!username || !roomName || !roomId) {
          return ack({ ok: false, error: "Join a room before sending messages." });
        }
        if (typeof rawContent !== "string") {
          return ack({ ok: false, error: "Message must be text." });
        }

        const content = rawContent.trim();
        if (!content || content.length > 1000) {
          return ack({ ok: false, error: "Messages must contain 1–1000 characters." });
        }

        const createdAt = Date.now();
        const expiresAt = createdAt + MESSAGE_LIFETIME;
        const message = await Message.create({
          roomId, username, content, createdAt, expiresAt
        });
        message.id = Number(message.id);
        message.room = roomName;

        io.to(roomName).emit("new-message", message);
        ack({ ok: true, messageId: message.id });
      } catch (error) {
        console.error("send-message failed:", error);
        ack({ ok: false, error: "Message could not be sent. Please try again." });
      }
    });

    socket.on("disconnect", () => {
      socket.data.username = undefined;
      socket.data.roomName = undefined;
      socket.data.roomId = undefined;
    });
  });
}

module.exports = { registerChatSocket };

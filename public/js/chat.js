(() => {
  const socket = io();
  const joinForm = document.getElementById("joinForm");
  const chat = document.getElementById("chat");
  const messagesEl = document.getElementById("messages");
  const statusEl = document.getElementById("status");
  const connectionStatus = document.getElementById("connectionStatus");
  const sendButton = document.getElementById("sendButton");
  const sendForm = document.getElementById("sendForm");
  const messageInput = document.getElementById("messageInput");
  const roomInput = document.getElementById("room");
  const usernameInput = document.getElementById("username");
  const changeRoomButton = document.getElementById("changeRoomButton");

  let joined = false;
  let currentRoom = "";
  const displayedMessages = new Map();

  function setStatus(message, isError = false) {
    statusEl.textContent = message || "";
    statusEl.classList.toggle("error", isError);
  }

  function showEmptyState() {
    if (displayedMessages.size === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.dataset.empty = "true";
      empty.textContent = "You're at the beginning. Send the first message to start the conversation.";
      messagesEl.appendChild(empty);
    }
  }

  function removeEmptyState() {
    messagesEl.querySelector('[data-empty="true"]')?.remove();
  }

  function formatRemaining(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  function addMessage(message) {
    if (!message || displayedMessages.has(String(message.id))) return;
    if (Number(message.expires_at) <= Date.now()) return;
    if (message.room && message.room !== currentRoom) return;

    removeEmptyState();
    const item = document.createElement("article");
    item.className = "message";
    if (message.username === usernameInput.value.trim()) item.classList.add("own");

    const author = document.createElement("span");
    author.className = "message-author";
    author.textContent = message.username;

    const content = document.createElement("p");
    content.textContent = message.content;

    const expiry = document.createElement("small");
    item.append(author, content, expiry);
    messagesEl.appendChild(item);

    const key = String(message.id);
    const entry = { item, message, timer: null };
    displayedMessages.set(key, entry);

    function updateExpiry() {
      const remaining = Number(message.expires_at) - Date.now();
      if (remaining <= 0) {
        item.remove();
        clearInterval(entry.timer);
        displayedMessages.delete(key);
        showEmptyState();
        return;
      }
      expiry.textContent = `Expires in ${formatRemaining(remaining)}`;
    }

    updateExpiry();
    entry.timer = setInterval(updateExpiry, 30_000);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function clearMessages() {
    for (const entry of displayedMessages.values()) clearInterval(entry.timer);
    displayedMessages.clear();
    messagesEl.replaceChildren();
  }

  socket.on("connect", () => {
    connectionStatus.textContent = "Connected";
    if (currentRoom && usernameInput.value.trim()) {
      joinRoom(usernameInput.value.trim(), currentRoom);
    } else {
      connectionStatus.textContent = "Ready to join";
    }
  });

  socket.on("disconnect", () => {
    joined = false;
    sendButton.disabled = true;
    connectionStatus.textContent = "Reconnecting…";
    setStatus("Connection lost. Trying to reconnect.");
  });

  socket.on("connect_error", () => {
    connectionStatus.textContent = "Connection problem";
    setStatus("Unable to connect to the chat server.", true);
  });

  function joinRoom(username, room) {
    joined = false;
    sendButton.disabled = true;
    clearMessages();
    currentRoom = room;
    socket.emit("join-room", { username, room }, (response) => {
      if (!response?.ok) {
        setStatus(response?.error || "Could not join the room.", true);
        return;
      }
      currentRoom = response.room;
      joined = true;
      chat.hidden = false;
      joinForm.hidden = true;
      document.getElementById("roomTitle").textContent = `# ${currentRoom}`;
      connectionStatus.textContent = "Connected · Messages expire in 48 hours";
      sendButton.disabled = false;
      setStatus("");
      (response.messages || []).forEach((message) => addMessage({ ...message, room: currentRoom }));
      showEmptyState();
      messageInput.focus();
    });
  }

  joinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const room = roomInput.value.trim();
    if (!username || !room) return;
    if (!/^[a-zA-Z0-9_-]{1,30}$/.test(room)) {
      setStatus("Room names can contain letters, numbers, underscores, and hyphens.", true);
      return;
    }
    if (!socket.connected) {
      setStatus("Please wait while the connection is restored.", true);
      return;
    }
    joinRoom(username, room);
  });

  socket.on("new-message", (message) => {
    if (message.room === currentRoom) addMessage(message);
  });

  sendForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const content = messageInput.value.trim();
    if (!content || !joined || !socket.connected) return;

    sendButton.disabled = true;
    socket.emit("send-message", content, (response) => {
      sendButton.disabled = !joined;
      if (!response?.ok) {
        setStatus(response?.error || "Message could not be sent.", true);
        return;
      }
      setStatus("");
      messageInput.value = "";
      messageInput.focus();
    });
  });

  changeRoomButton.addEventListener("click", () => {
    joined = false;
    sendButton.disabled = true;
    chat.hidden = true;
    joinForm.hidden = false;
    setStatus("Enter a display name and room to join.");
    roomInput.focus();
  });

  socket.on("chat-error", (message) => setStatus(message, true));
})();

const joinScreen = document.getElementById("join");
const app = document.getElementById("app");

const nameInput = document.getElementById("nameInput");
const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");

const roomTitle = document.getElementById("roomTitle");
const userNameEl = document.getElementById("userName");

const messagesEl = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let userName = "";
let roomName = "";

const socket = new WebSocket(`ws://${location.hostname}:3000`);

joinBtn.onclick = () => {
  userName = nameInput.value.trim();
  roomName = roomInput.value.trim();

  if (!userName || !roomName) {
    alert("Enter name and room");
    return;
  }

  socket.send(JSON.stringify({
    type: "join",
    name: userName,
    room: roomName
  }));

  joinScreen.classList.add("hidden");
  app.classList.remove("hidden");

  roomTitle.textContent = `Room: ${roomName}`;
  userNameEl.textContent = userName;
};

sendBtn.onclick = () => {
  if (!messageInput.value.trim()) return;

  socket.send(JSON.stringify({
    type: "message",
    text: messageInput.value,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  }));

  messageInput.value = "";
};

messageInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

socket.onmessage = e => {
  const msg = JSON.parse(e.data);
  addMessage(msg);
};

function addMessage(msg) {
  const div = document.createElement("div");
  div.className = msg.name === userName ? "msg me" : "msg";

  div.innerHTML = `
    <div class="bubble">
      <div class="author">${msg.name}</div>
      <div class="text">${msg.text}</div>
      <div class="time">${msg.time}</div>
    </div>
  `;

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
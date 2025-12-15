const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const server = http.createServer((req, res) => {
  const filePath =
    req.url === "/" ? "/public/index.html" : `/public${req.url}`;

  const fullPath = path.join(__dirname, filePath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });
const rooms = new Map();

wss.on("connection", ws => {
  ws.on("message", data => {
    const msg = JSON.parse(data);

    if (msg.type === "join") {
      ws.name = msg.name;
      ws.room = msg.room;

      if (!rooms.has(ws.room)) {
        rooms.set(ws.room, new Set());
      }
      rooms.get(ws.room).add(ws);
      return;
    }

    if (msg.type === "message") {
      const clients = rooms.get(ws.room) || [];
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            name: ws.name,
            text: msg.text,
            time: msg.time
          }));
        }
      }
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms.has(ws.room)) {
      rooms.get(ws.room).delete(ws);
    }
  });
});

server.listen(3000, () => {
  console.log("LAN Chat running on http://0.0.0.0:3000");
});
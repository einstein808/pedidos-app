const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Novo cliente conectado.");

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Cliente desconectado.");
  });
});

const broadcast = (event, data) => {
  const message = JSON.stringify({ event, data });

  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message); // Apenas uma serialização aqui
    }
  });
};


module.exports = { wss, broadcast };

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { WebSocketServer } = require("ws");

const app = express();
const PORT = 4000;

// Middlewares
app.use(bodyParser.json({ limit: "2mb" })); // Permite imagens em Base64
app.use(cors());

let orders = []; // Armazena os pedidos
let currentId = 1; // Gerenciador de IDs

// WebSocket Server
const wss = new WebSocketServer({ noServer: true });
const clients = new Set(); // Para manter rastreamento dos clientes conectados

// Evento de conexão do WebSocket
wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("close", () => {
    clients.delete(ws); // Remove o cliente ao desconectar
  });
});

// Envia eventos para todos os clientes conectados
const broadcast = (event, data) => {
  const message = JSON.stringify({ event, order: data });
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};

// Rotas
app.get("/orders", (req, res) => {
  res.json(orders);
});

app.post("/orders", (req, res) => {
  const { drink, photo } = req.body;

  if (!drink || !photo) {
    return res.status(400).json({ message: "Bebida e foto são obrigatórios" });
  }

  const newOrder = {
    id: currentId++,
    drink,
    photo,
    status: "Pendente",
  };

  orders.push(newOrder);

  // Envia o evento via WebSocket
  broadcast("orderCreated", newOrder);

  res.status(201).json(newOrder);
});

app.put("/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const orderIndex = orders.findIndex((order) => order.id === parseInt(id));

  if (orderIndex === -1) {
    return res.status(404).json({ message: "Pedido não encontrado" });
  }

  orders[orderIndex].status = status;

  // Envia o evento de atualização via WebSocket
  broadcast("orderUpdated", orders[orderIndex]);

  res.json(orders[orderIndex]);
});

// Inicialização do servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Manipula as conexões WebSocket no servidor HTTP
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

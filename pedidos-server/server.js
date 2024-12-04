const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { WebSocketServer } = require("ws");

const app = express();
const PORT = 4000;

// Configurar o banco de dados SQLite
const db = new sqlite3.Database("database.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite.");
  }
});

// Criar tabelas no banco de dados
db.serialize(() => {
  db.run(` 
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drinks TEXT NOT NULL,  -- Armazenar como JSON
      photo TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS drinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      photo TEXT,
      status TEXT NOT NULL
    )
   `);
});

// Middlewares
app.use(bodyParser.json({ limit: "2mb" }));
app.use(cors());

// WebSocket Server
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

// Gerenciar conexões WebSocket
wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Novo cliente conectado.");

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Cliente desconectado.");
  });
});

// Função para enviar eventos via WebSocket
const broadcast = (event, data) => {
  const message = JSON.stringify({ event, data });
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};

// Rotas para pedidos
app.post("/orders", (req, res) => {
  const { drinks, photo } = req.body;

  if (!drinks || !photo) {
    return res.status(400).json({ message: "Drinks e foto são obrigatórios." });
  }

  const newOrder = {
    drinks: JSON.stringify(drinks),
    photo,
    status: "Pendente",
  };

  const query = "INSERT INTO orders (drinks, photo, status) VALUES (?, ?, ?)";
  db.run(query, [newOrder.drinks, photo, "Pendente"], function (err) {
    if (err) {
      return res.status(500).json({ message: "Erro ao salvar pedido no banco de dados." });
    }

    const order = { id: this.lastID, ...newOrder, drinks: drinks };

    // Envia evento via WebSocket
    broadcast("orderCreated", order);

    res.status(201).json(order);
  });
});

app.put("/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "O status é obrigatório." });
  }

  const query = "UPDATE orders SET status = ? WHERE id = ?";
  db.run(query, [status, id], function (err) {
    if (err) {
      console.error("Erro ao atualizar o status do pedido:", err.message);
      return res.status(500).json({ message: "Erro ao atualizar o status do pedido." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    db.get("SELECT * FROM orders WHERE id = ?", [id], (err, row) => {
      if (err) {
        console.error("Erro ao buscar pedido atualizado:", err.message);
        return res.status(500).json({ message: "Erro ao buscar pedido atualizado." });
      }

      const updatedOrder = {
        id: row.id,
        drinks: JSON.parse(row.drinks),
        photo: row.photo,
        status: row.status,
      };

      // Envia evento de atualização via WebSocket
      broadcast("orderUpdated", updatedOrder);

      res.json(updatedOrder);
    });
  });
});

app.get("/orders", (req, res) => {
  db.all("SELECT * FROM orders", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar pedidos:", err.message);
      return res.status(500).json({ message: "Erro ao buscar pedidos" });
    }

    const orders = rows.map((row) => ({
      id: row.id,
      drinks: JSON.parse(row.drinks),
      photo: row.photo,
      status: row.status,
    }));

    res.json(orders);
  });
});

// Rotas para drinks
app.post("/drinks", (req, res) => {
  const { name, ingredients, photo, status } = req.body;

  if (!name || !ingredients || !status) {
    return res.status(400).json({ message: "Nome, ingredientes e status são obrigatórios" });
  }

  db.run(
    "INSERT INTO drinks (name, ingredients, photo, status) VALUES (?, ?, ?, ?)",
    [name, ingredients, photo || null, status],
    function (err) {
      if (err) {
        console.error("Erro ao salvar drink:", err.message);
        return res.status(500).json({ message: "Erro ao salvar drink" });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        ingredients,
        photo,
        status,
      });
    }
  );
});

app.get("/drinks", (req, res) => {
  db.all("SELECT * FROM drinks WHERE status = 'Ativo'", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar drinks:", err.message);
      return res.status(500).json({ message: "Erro ao buscar drinks" });
    }

    res.json(rows);
  });
});

// Inicializa o servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Configura o WebSocket no servidor HTTP
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const sqlite3 = require("sqlite3").verbose(); // Importa o SQLite

const app = express();
const PORT = 4000;

// Middlewares
app.use(bodyParser.json({ limit: "2mb" })); // Permite imagens em Base64
app.use(cors());

// Configuração do banco de dados SQLite
const db = new sqlite3.Database("banco.sqlite", (err) => {
  if (err) {
    console.error("Erro ao conectar ao SQLite:", err.message);
  } else {
    console.log("Conectado ao SQLite.");
  }
});

// Cria a tabela de pedidos
db.run(
  `CREATE TABLE IF NOT EXISTS orders (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     drink TEXT NOT NULL,
     photo TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'Pendente'
  )`,
  (err) => {
    if (err) {
      console.error("Erro ao criar tabela:", err.message);
    } else {
      console.log("Tabela 'orders' verificada/criada com sucesso.");
    }
  }
);
db.run(
  `CREATE TABLE IF NOT EXISTS drinks (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     ingredients TEXT NOT NULL,
     photo TEXT NOT NULL,
     status TEXT NOT NULL CHECK(status IN ('Ativo', 'Arquivado')) DEFAULT 'Ativo'
  )`,
  (err) => {
    if (err) {
      console.error("Erro ao criar tabela 'drinks':", err.message);
    } else {
      console.log("Tabela 'drinks' verificada/criada com sucesso.");
    }
  }
);

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
  db.all("SELECT * FROM orders", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao buscar pedidos" });
    }
    res.json(rows);
  });
});
app.post("/drinks", (req, res) => {
  const { name, ingredients, photo, status } = req.body;

  if (!name || !ingredients || !photo || !status) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  const query = `INSERT INTO drinks (name, ingredients, photo, status) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, ingredients, photo, status], function (err) {
    if (err) {
      console.error("Erro ao inserir drink:", err.message);
      res.status(500).json({ message: "Erro ao salvar o drink." });
    } else {
      res.status(201).json({ id: this.lastID, name, ingredients, photo, status });
    }
  });
});
app.get("/drinks", (req, res) => {
  db.all("SELECT * FROM drinks WHERE status = 'Ativo'", [], (err, rows) => {
    if (err) {
      console.error("Erro ao listar drinks:", err.message);
      res.status(500).json({ message: "Erro ao buscar drinks." });
    } else {
      res.json(rows);
    }
  });
});


app.post("/orders", (req, res) => {
  const { drink, photo } = req.body;

  if (!drink || !photo) {
    return res.status(400).json({ message: "Bebida e foto são obrigatórios" });
  }

  const query = "INSERT INTO orders (drink, photo) VALUES (?, ?)";
  db.run(query, [drink, photo], function (err) {
    if (err) {
      return res.status(500).json({ message: "Erro ao criar pedido" });
    }

    const newOrder = {
      id: this.lastID,
      drink,
      photo,
      status: "Pendente",
    };

    // Envia o evento via WebSocket
    broadcast("orderCreated", newOrder);

    res.status(201).json(newOrder);
  });
});

app.put("/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = "UPDATE orders SET status = ? WHERE id = ?";
  db.run(query, [status, id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Erro ao atualizar pedido" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    db.get("SELECT * FROM orders WHERE id = ?", [id], (err, order) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao buscar pedido atualizado" });
      }

      // Envia o evento de atualização via WebSocket
      broadcast("orderUpdated", order);

      res.json(order);
    });
  });
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


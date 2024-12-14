const express = require("express");
const db = require("../db/database");
const { broadcast } = require("../websockets/websocket");

const router = express.Router();

router.post("/", (req, res) => {
  const { drinks, photo, name, whatsapp, eventId } = req.body;

  if (!drinks || (!photo && !name)) {
    return res
      .status(400)
      .json({ message: "Drinks e pelo menos um identificador (nome ou foto) são obrigatórios." });
  }

  // Validating the eventId if it's provided
  if (eventId && isNaN(eventId)) {
    return res.status(400).json({ message: "Event ID inválido." });
  }

  const newOrder = {
    drinks: JSON.stringify(drinks),
    photo: photo || null,
    name: name || null,
    whatsapp: whatsapp || null,
    eventId: eventId || null,  // Add eventId to the order
    status: "Pendente",
  };

  db.run(
    "INSERT INTO orders (drinks, photo, name, whatsapp, eventId, status) VALUES (?, ?, ?, ?, ?, ?)",
    [newOrder.drinks, newOrder.photo, newOrder.name, newOrder.whatsapp, newOrder.eventId, newOrder.status],
    function (err) {
      if (err) {
        console.error("Erro ao criar pedido:", err.message);
        return res.status(500).json({ message: "Erro ao criar pedido." });
      }

      const orderId = this.lastID;

      const orderData = {
        id: orderId,
        drinks: JSON.parse(newOrder.drinks),
        photo: newOrder.photo,
        name: newOrder.name,
        whatsapp: newOrder.whatsapp,
        eventId: newOrder.eventId,  // Include eventId in the response
        status: newOrder.status,
      };

      broadcast("orderCreated", orderData);

      res.status(201).json(orderData);
    }
  );
});


router.get("/", (req, res) => {
    db.all("SELECT * FROM orders", [], (err, rows) => {
      if (err) {
        console.error("Erro ao buscar pedidos:", err.message);
        return res.status(500).json({ message: "Erro ao buscar pedidos." });
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
  
  router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    if (!status) {
      return res.status(400).json({ message: "O status é obrigatório." });
    }
  
    // Busca os dados atuais para garantir mesclagem
    db.get("SELECT * FROM orders WHERE id = ?", [id], (err, row) => {
      if (err) {
        console.error("Erro ao buscar pedido:", err.message);
        return res.status(500).json({ message: "Erro ao buscar pedido." });
      }
  
      if (!row) {
        return res.status(404).json({ message: "Pedido não encontrado." });
      }
  
      // Mescla os dados existentes com as atualizações
      const updatedOrder = {
        ...row,
        status, // Atualiza apenas o status
      };
  
      db.run(
        "UPDATE orders SET status = ? WHERE id = ?",
        [updatedOrder.status, id],
        function (err) {
          if (err) {
            console.error("Erro ao atualizar pedido:", err.message);
            return res.status(500).json({ message: "Erro ao atualizar pedido." });
          }
  
          broadcast("orderUpdated", {
            id: updatedOrder.id,
            drinks: JSON.parse(updatedOrder.drinks),
            photo: updatedOrder.photo,
            name: updatedOrder.name,
            status: updatedOrder.status,
          });
  
          res.json({
            id: updatedOrder.id,
            drinks: JSON.parse(updatedOrder.drinks),
            photo: updatedOrder.photo,
            name: updatedOrder.name,
            status: updatedOrder.status,
          });
        }
      );
    });
  });
  
  router.get("/latest", (req, res) => {
    // Consulta os últimos 20 pedidos ordenados por ID (do mais recente para o mais antigo)
    const query = "SELECT * FROM orders ORDER BY id DESC LIMIT 20";
  
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Erro ao buscar os últimos pedidos:", err.message);
        return res.status(500).json({ message: "Erro ao buscar os últimos pedidos." });
      }
  
      // Formata os resultados
      const orders = rows.map((row) => ({
        id: row.id,
        drinks: JSON.parse(row.drinks),
        photo: row.photo,
        name: row.name,
        whatsapp: row.whatsapp,
        status: row.status,
      }));
  
      // Retorna os pedidos em ordem cronológica (mais antigo primeiro)
      res.json(orders.reverse());
    });
  });
module.exports = router;

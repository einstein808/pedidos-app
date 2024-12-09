const express = require("express");
const db = require("../db/database");
const { broadcast } = require("../websockets/websocket");

const router = express.Router();

router.post("/", (req, res) => {
  const { drinks, photo, name } = req.body;

  if (!drinks || (!photo && !name)) {
    return res
      .status(400)
      .json({ message: "Drinks e pelo menos um identificador (nome ou foto) são obrigatórios." });
  }

  const newOrder = {
    drinks: JSON.stringify(drinks),
    photo: photo || null,
    name: name || null,
    status: "Pendente",
  };

  db.run(
    "INSERT INTO orders (drinks, photo, name, status) VALUES (?, ?, ?, ?)",
    [newOrder.drinks, newOrder.photo, newOrder.name, "Pendente"],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Erro ao salvar pedido no banco de dados." });
      }
      res.status(201).json({ id: this.lastID, ...newOrder });
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

  db.run("UPDATE orders SET status = ? WHERE id = ?", [status, id], function (err) {
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

      broadcast("orderUpdated", updatedOrder);
      res.json(updatedOrder);
    });
  });
});

module.exports = router;

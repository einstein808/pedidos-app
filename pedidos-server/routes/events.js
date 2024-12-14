const express = require("express");
const db = require("../db/database");

const router = express.Router();

// Rota para adicionar um novo evento
router.post("/", (req, res) => {
  const { name, description, isActive, location, guestCount, date } = req.body;

  // Verificação de campos obrigatórios
  if (!name || !location || !guestCount || !date || isActive === undefined) {
    return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  db.run(
    `
    INSERT INTO events (name, description, isActive, location, guestCount, date)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [name, description || null, isActive, location, guestCount, date],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Erro ao salvar evento." });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        description,
        isActive,
        location,
        guestCount,
        date,
      });
    }
  );
});

// Rota para exibir o dashboard com número de drinks por evento e drinks mais vendidos
router.get("/dashboard", (req, res) => {
    // Consulta para pegar o número de drinks por evento, quantidade de pessoas e localidade
    db.all(`
      SELECT e.id AS eventId, e.name AS eventName, e.guestCount, e.location, COUNT(o.id) AS drinkCount
      FROM events e
      LEFT JOIN orders o ON o.eventId = e.id
      GROUP BY e.id
    `, [], (err, eventDrinkCounts) => {
      if (err) {
        console.error("Erro ao buscar número de drinks por evento:", err.message);
        return res.status(500).json({ message: "Erro ao buscar número de drinks por evento." });
      }
  
      // Consulta para pegar os drinks com mais saída (mais pedidos)
      db.all(`
        SELECT d.name AS drinkName, SUM(o.quantity) AS totalOrders
        FROM drinks d
        LEFT JOIN orders o ON o.drinks LIKE '%' || d.name || '%'
        GROUP BY d.id
        ORDER BY totalOrders DESC
        LIMIT 5
      `, [], (err, topDrinks) => {
        if (err) {
          console.error("Erro ao buscar drinks mais vendidos:", err.message);
          return res.status(500).json({ message: "Erro ao buscar drinks mais vendidos." });
        }
      
        // Retorna os dados combinados
        res.json({
          eventDrinkCounts,  // Número de drinks, pessoas e localidade por evento
          topDrinks,         // Drinks mais vendidos
        });
      });
    });
  });
  
  
router.get("/ativos", (req, res) => {
    db.all("SELECT * FROM events WHERE isActive = 1", [], (err, rows) => {
      if (err) {
        console.error("Erro ao buscar eventos:", err.message);
        return res.status(500).json({ message: "Erro ao buscar eventos." });
      }
  
      res.json(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          isActive: row.isActive,
          location: row.location,
          guestCount: row.guestCount,
          date: row.date,
        }))
      );
    });
  });

// Rota para buscar todos os eventos
router.get("/", (req, res) => {
  db.all("SELECT * FROM events", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar eventos:", err.message);
      return res.status(500).json({ message: "Erro ao buscar eventos." });
    }

    res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        isActive: row.isActive,
        location: row.location,
        guestCount: row.guestCount,
        date: row.date,
      }))
    );
  });
});

// Rota para alterar o status de um evento
router.put("/:id/status", (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined || (isActive !== 1 && isActive !== 0)) {
    return res.status(400).json({ message: "Status inválido. Use 1 (ativo) ou 0 (inativo)." });
  }

  db.run("UPDATE events SET isActive = ? WHERE id = ?", [isActive, id], function (err) {
    if (err) {
      console.error("Erro ao atualizar status do evento:", err.message);
      return res.status(500).json({ message: "Erro ao atualizar status do evento." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Evento não encontrado." });
    }

    res.json({ message: "Status do evento atualizado com sucesso." });
  });
});

// Rota para excluir um evento
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM events WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Erro ao excluir evento:", err.message);
      return res.status(500).json({ message: "Erro ao excluir evento." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Evento não encontrado." });
    }

    res.json({ message: "Evento excluído com sucesso." });
  });
});
// Rota para buscar eventos ativos
  


module.exports = router;

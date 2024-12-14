const express = require("express");
const db = require("../db/database");

const router = express.Router();

// Rota para adicionar um novo evento
router.post("/", (req, res) => {
  const { name, description, isActive } = req.body;

  // Verificação se o nome e o status de atividade foram fornecidos
  if (!name || isActive === undefined) {
    return res.status(400).json({ message: "Nome e status de atividade são obrigatórios" });
  }

  // Inserção do evento no banco de dados
  db.run(
    "INSERT INTO events (name, description, isActive) VALUES (?, ?, ?)",
    [name, description || null, isActive],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Erro ao salvar evento" });
      }

      // Retorna o evento recém-criado
      res.status(201).json({
        id: this.lastID,
        name,
        description,
        isActive,
      });
    }
  );
});

// Rota para buscar todos os eventos (ativos e inativos)
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
      }))
    );
  });
});

// Rota para buscar eventos ativos
router.get("/ativos", (req, res) => {
  db.all("SELECT * FROM events WHERE isActive = 1", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar eventos ativos:", err.message);
      return res.status(500).json({ message: "Erro ao buscar eventos ativos." });
    }

    res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        isActive: row.isActive,
      }))
    );
  });
});

// Rota para buscar eventos inativos
router.get("/inativos", (req, res) => {
  db.all("SELECT * FROM events WHERE isActive = 0", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar eventos inativos:", err.message);
      return res.status(500).json({ message: "Erro ao buscar eventos inativos." });
    }

    res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        isActive: row.isActive,
      }))
    );
  });
});

// Rota para alterar o status de um evento (Ativo/Inativo)
router.put("/:id/status", (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  // Verificação de status válido (1 para ativo, 0 para inativo)
  if (isActive === undefined || (isActive !== 1 && isActive !== 0)) {
    return res.status(400).json({ message: "Status inválido. Use 1 (ativo) ou 0 (inativo)." });
  }

  // Atualização do status do evento
  db.run("UPDATE events SET isActive = ? WHERE id = ?", [isActive, id], function (err) {
    if (err) {
      console.error("Erro ao atualizar status do evento:", err.message);
      return res.status(500).json({ message: "Erro ao atualizar status do evento." });
    }

    // Se o evento não for encontrado
    if (this.changes === 0) {
      return res.status(404).json({ message: "Evento não encontrado." });
    }

    // Retorna mensagem de sucesso
    res.json({ message: "Status do evento atualizado com sucesso." });
  });
});

// Rota para excluir um evento
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // Exclusão do evento
  db.run("DELETE FROM events WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Erro ao excluir evento:", err.message);
      return res.status(500).json({ message: "Erro ao excluir evento." });
    }

    // Se o evento não for encontrado
    if (this.changes === 0) {
      return res.status(404).json({ message: "Evento não encontrado." });
    }

    // Retorna mensagem de sucesso
    res.json({ message: "Evento excluído com sucesso." });
  });
});

module.exports = router;

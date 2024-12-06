const express = require("express");
const db = require("../db/database");

const router = express.Router();

// Rota para adicionar um novo drink
router.post("/", (req, res) => {
  const { name, ingredients, photo, status } = req.body;

  if (!name || !ingredients || !status) {
    return res.status(400).json({ message: "Nome, ingredientes e status são obrigatórios" });
  }

  db.run(
    "INSERT INTO drinks (name, ingredients, photo, status) VALUES (?, ?, ?, ?)",
    [name, ingredients, photo || null, status],
    function (err) {
      if (err) {
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

// Rota para buscar drinks ativos
router.get("/ativos", (req, res) => {
  db.all("SELECT * FROM drinks WHERE status = 'Ativo'", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar drinks ativos:", err.message);
      return res.status(500).json({ message: "Erro ao buscar drinks." });
    }

    res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        ingredients: row.ingredients,
        photo: row.photo,
        status: row.status,
      }))
    );
  });
});

// Rota para buscar drinks inativos
router.get("/inativos", (req, res) => {
  db.all("SELECT * FROM drinks WHERE status = 'Inativo'", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar drinks inativos:", err.message);
      return res.status(500).json({ message: "Erro ao buscar drinks." });
    }

    res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        ingredients: row.ingredients,
        photo: row.photo,
        status: row.status,
      }))
    );
  });
});

// Rota para alterar o status de um drink
router.put("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || (status !== "Ativo" && status !== "Inativo")) {
    return res.status(400).json({ message: "Status inválido. Use 'Ativo' ou 'Inativo'." });
  }

  db.run("UPDATE drinks SET status = ? WHERE id = ?", [status, id], function (err) {
    if (err) {
      console.error("Erro ao atualizar status do drink:", err.message);
      return res.status(500).json({ message: "Erro ao atualizar status do drink." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Drink não encontrado." });
    }

    res.json({ message: "Status atualizado com sucesso." });
  });
});

// Rota para deletar um drink
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM drinks WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Erro ao excluir drink:", err.message);
      return res.status(500).json({ message: "Erro ao excluir drink." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Drink não encontrado." });
    }

    res.json({ message: "Drink excluído com sucesso." });
  });
});

module.exports = router;

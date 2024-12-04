const express = require("express");
const db = require("../db/database");

const router = express.Router();

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

// Endpoint para GET drinks...
router.get("/", (req, res) => {
    db.all("SELECT * FROM drinks WHERE status = 'Ativo'", [], (err, rows) => {
      if (err) {
        console.error("Erro ao buscar drinks:", err.message);
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
  
module.exports = router;

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
    // Consulta para o número total de drinks por evento (contando a quantidade de drinks, não o número de pedidos)
    const eventDrinkCountsQuery = `
      SELECT 
        e.id AS eventId, 
        e.name AS eventName, 
        e.location,
        SUM(oi.quantidade) AS drinkCount
      FROM events e
      LEFT JOIN orders o ON o.eventId = e.id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY e.id
    `;

    // Consulta para os drinks mais vendidos (somando a quantidade de cada drink)
    const topDrinksQuery = `
      SELECT 
        d.name AS drinkName, 
        SUM(oi.quantidade) AS drinkOrders
      FROM drinks d
      LEFT JOIN order_items oi ON oi.drink_id = d.id
      GROUP BY d.id
      ORDER BY drinkOrders DESC
      LIMIT 10
    `;

    // Realiza ambas as consultas de forma assíncrona
    Promise.all([
        new Promise((resolve, reject) => {
            db.all(eventDrinkCountsQuery, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        }),
        new Promise((resolve, reject) => {
            db.all(topDrinksQuery, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        }),
    ])
        .then(([eventDrinkCounts, topDrinks]) => {
            // Envia a resposta com os dados
            res.json({ eventDrinkCounts, topDrinks });
        })
        .catch((err) => {
            console.error("Erro ao buscar dados do dashboard:", err);
            res.status(500).json({ message: "Erro ao buscar dados do dashboard" });
        });
});

// Rota para retornar os números de WhatsApp relacionados a um evento específico
// Rota para retornar os números de WhatsApp relacionados a um evento específico
router.get("/whatsapp/:eventoId", (req, res) => {
    const { eventoId } = req.params;

    // Consulta SQL para buscar os números de WhatsApp únicos dos clientes que realizaram pedidos para o evento
    const query = `
    SELECT DISTINCT o.whatsapp
FROM orders o
WHERE o.eventId = ?
  AND o.whatsapp IS NOT NULL
  AND o.whatsapp != ''

        
    `;

    db.all(query, [eventoId], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar números de WhatsApp:", err.message);
            return res.status(500).json({ message: "Erro ao buscar números de WhatsApp" });
        }

        // Verificar se algum número foi encontrado
        if (rows.length === 0) {
            return res.status(404).json({ message: "Nenhum número de WhatsApp encontrado para este evento." });
        }

        // Retornar os números de WhatsApp encontrados sem duplicidade
        res.json(rows);
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

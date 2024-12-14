const express = require("express");
const db = require("../db/database");
const { broadcast } = require("../websockets/websocket");

const router = express.Router();

// Supondo que você tenha uma tabela de "drinks" com o id e o nome correspondente
// Função para obter o nome do drink, agora retornando uma Promise
const getDrinkNameById = (drinkId) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT name FROM drinks WHERE id = ?", [drinkId], (err, row) => {
      if (err) {
        reject("Erro ao buscar nome do drink");
      } else {
        resolve(row ? row.name : null);
      }
    });
  });
};
function getDrinkIdByName(name) {
  return new Promise((resolve, reject) => {
    db.get("SELECT id FROM drinks WHERE name = ?", [name], (err, row) => {
      if (err) {
        reject("Erro ao buscar drink ID: " + err.message);
      } else if (row) {
        resolve(row.id); // Retorna o id do drink
      } else {
        reject(`Drink ${name} não encontrado.`);
      }
    });
  });
}


router.post("/", async (req, res) => {
  const { photo, name, whatsapp, eventId, drinks } = req.body;

  if (!drinks || !Array.isArray(drinks) || drinks.length === 0) {
    return res.status(400).json({ message: "Drinks são obrigatórios." });
  }

  // Validando o eventId se fornecido
  if (eventId && isNaN(eventId)) {
    return res.status(400).json({ message: "Event ID inválido." });
  }

  const newOrder = {
    photo: photo || null,
    name: name || null,
    whatsapp: whatsapp || null,
    eventId: eventId || null, // Relaciona ao evento, se fornecido
    status: "Pendente",
    data: new Date().toISOString(),
  };

  try {
    // Inicia a transação de inserção no banco
    const orderId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO orders (photo, name, whatsapp, eventId, status, data) VALUES (?, ?, ?, ?, ?, ?)",
        [newOrder.photo, newOrder.name, newOrder.whatsapp, newOrder.eventId, newOrder.status, newOrder.data],
        function (err) {
          if (err) {
            console.error("Erro ao criar pedido:", err.message);
            reject(err);
          } else {
            resolve(this.lastID); // Retorna o id do pedido criado
          }
        }
      );
    });

    // Agora buscamos os nomes dos drinks e inserimos na tabela order_items
    const drinksWithNames = await Promise.all(
      drinks.map(async ({ drink_id, quantity }) => {
        const drinkName = await getDrinkNameById(drink_id);
        return { name: drinkName, quantity };
      })
    );

    // Registrar os drinks na tabela order_items
    for (const { name, quantity } of drinksWithNames) {
      const drinkId = await getDrinkIdByName(name); // Função para buscar o drink_id a partir do nome
      db.run(
        "INSERT INTO order_items (order_id, drink_id, quantidade) VALUES (?, ?, ?)",
        [orderId, drinkId, quantity],
        (err) => {
          if (err) {
            console.error("Erro ao adicionar item ao pedido:", err.message);
          }
        }
      );
    }

    // Criando o objeto de resposta com os drinks com nome
    const orderData = {
      id: orderId,
      photo: newOrder.photo,
      name: newOrder.name,
      whatsapp: newOrder.whatsapp,
      eventId: newOrder.eventId,
      status: newOrder.status,
      drinks: drinksWithNames, // Drinks com nome
      data: newOrder.data,
    };

    // Envia a mensagem para o WebSocket
    broadcast("orderCreated", orderData);

    res.status(201).json(orderData);

  } catch (err) {
    console.error("Erro ao processar pedido:", err);
    res.status(500).json({ message: "Erro ao criar pedido." });
  }
});




// Rota para listar todos os pedidos
router.get("/", (req, res) => {
  db.all("SELECT * FROM orders", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar pedidos:", err.message);
      return res.status(500).json({ message: "Erro ao buscar pedidos." });
    }

    const orders = [];
    let pendingItems = rows.length;

    if (pendingItems === 0) return res.json([]); // Retorna uma lista vazia se não houver pedidos

    rows.forEach((row) => {
      const order = {
        id: row.id,
        photo: row.photo,
        name: row.name,
        whatsapp: row.whatsapp,
        status: row.status,
        drinks: [],
        data: row.data,
      };

      // Alterar a consulta para incluir o nome do drink
      const query = `
        SELECT oi.quantidade AS quantity, d.name AS drink_name
        FROM order_items oi
        JOIN drinks d ON oi.drink_id = d.id
        WHERE oi.order_id = ?
      `;

      db.all(query, [row.id], (err, items) => {
        if (err) {
          console.error("Erro ao buscar itens do pedido:", err.message);
          return res.status(500).json({ message: "Erro ao buscar itens do pedido." });
        }

        // Formatar a resposta para incluir nome do drink
        order.drinks = items.map(item => ({
          name: item.drink_name,
          quantity: item.quantity,
        }));

        orders.push(order);

        pendingItems--;

        if (pendingItems === 0) {
          res.json(orders);
        }
      });
    });
  });
});


// Rota para atualizar o status de um pedido
// Rota para atualizar o status de um pedido
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "O status é obrigatório." });
  }

  // Primeiro, atualize o status no banco de dados
  db.run(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar pedido:", err.message);
        return res.status(500).json({ message: "Erro ao atualizar pedido." });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Pedido não encontrado." });
      }

      // Recuperar os detalhes completos do pedido, incluindo os drinks
      const query = `
        SELECT o.*, oi.quantidade AS quantity, d.name AS drink_name
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN drinks d ON oi.drink_id = d.id
        WHERE o.id = ?
      `;

      db.all(query, [id], (err, rows) => {
        if (err) {
          console.error("Erro ao recuperar detalhes do pedido:", err.message);
          return res.status(500).json({ message: "Erro ao recuperar detalhes do pedido." });
        }

        if (rows.length === 0) {
          return res.status(404).json({ message: "Pedido não encontrado." });
        }

        // Montar o objeto do pedido completo
        const order = {
          id: rows[0].id,
          photo: rows[0].photo,
          name: rows[0].name,
          whatsapp: rows[0].whatsapp,
          eventId: rows[0].eventId,
          status: rows[0].status,
          data: rows[0].data,
          drinks: rows.map(row => ({
            name: row.drink_name,
            quantity: row.quantity
          })),
        };

        // Emitir o evento WebSocket com os dados completos
        broadcast("orderUpdated", order);

        // Responder com os dados do pedido atualizados
        res.json(order);
      });
    }
  );
});

// Rota para listar os últimos 20 pedidos
// Rota para listar os últimos 20 pedidos
router.get("/latest", (req, res) => {
  const query = "SELECT * FROM orders ORDER BY id DESC LIMIT 20";

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar os últimos pedidos:", err.message);
      return res.status(500).json({ message: "Erro ao buscar os últimos pedidos." });
    }

    const orders = [];
    let pendingItems = rows.length;

    if (pendingItems === 0) return res.json([]); // Retorna uma lista vazia se não houver pedidos

    rows.forEach((row) => {
      const order = {
        id: row.id,
        photo: row.photo,
        name: row.name,
        whatsapp: row.whatsapp,
        status: row.status,
        drinks: [],
        data: row.data,
      };

      // Alterar a consulta para incluir o nome do drink
      const query = `
        SELECT oi.quantidade AS quantity, d.name AS drink_name
        FROM order_items oi
        JOIN drinks d ON oi.drink_id = d.id
        WHERE oi.order_id = ?
      `;

      db.all(query, [row.id], (err, items) => {
        if (err) {
          console.error("Erro ao buscar itens do pedido:", err.message);
          return res.status(500).json({ message: "Erro ao buscar itens do pedido." });
        }

        // Formatar a resposta para incluir nome do drink
        order.drinks = items.map(item => ({
          name: item.drink_name,
          quantity: item.quantity,
        }));

        orders.push(order);

        pendingItems--;

        if (pendingItems === 0) {
          res.json(orders.reverse());
        }
      });
    });
  });
});


module.exports = router;

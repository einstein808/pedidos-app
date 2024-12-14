const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("database.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite.");
  }
});

// Atualizar esquema do banco de dados
db.serialize(() => {
  // Criar ou atualizar a tabela "orders" (ordens), removendo a coluna 'drinks'
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      photo TEXT,
      name TEXT,
      status TEXT NOT NULL,
      whatsapp TEXT,
      eventId INTEGER,  -- Relacionamento com a tabela events
      data TEXT NOT NULL, -- Data da ordem
      FOREIGN KEY (eventId) REFERENCES events(id)
    )
  `, (err) => {
    if (err) {
      console.error("Erro ao criar ou verificar tabela orders:", err.message);
    } else {
      console.log("Tabela orders criada ou já existente.");
    }
  });

  // A tabela "drinks" permanece inalterada
  console.log("A tabela drinks permanece inalterada.");

  // Criar ou atualizar a tabela "order_items" (itens do pedido)
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      drink_id INTEGER,
      quantidade INTEGER DEFAULT 1,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (drink_id) REFERENCES drinks(id)
    )
  `, (err) => {
    if (err) {
      console.error("Erro ao criar a tabela order_items:", err.message);
    } else {
      console.log("Tabela order_items criada ou já existente.");
    }
  });
  db.run(`
    CREATE TABLE IF NOT EXISTS drinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      photo TEXT,
      status TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error("Erro ao criar ou verificar tabela drinks:", err.message);
    } else {
      console.log("Tabela drinks está atualizada.");
    }
  });

  // Criar ou atualizar a tabela "events" (eventos)
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT,
      guestCount INTEGER,
      date TEXT,
      isActive BOOLEAN NOT NULL DEFAULT 1
    )
  `, (err) => {
    if (err) {
      console.error("Erro ao criar ou verificar tabela events:", err.message);
    } else {
      console.log("Tabela events criada ou já existente.");
    }
  });
});

module.exports = db;

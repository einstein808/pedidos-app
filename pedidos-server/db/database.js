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
  // Criar a tabela "orders" se ela não existir e adicionar "eventId"
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drinks TEXT NOT NULL,
      photo TEXT,
      name TEXT,
      status TEXT NOT NULL,
      whatsapp TEXT,
      eventId INTEGER,  -- Adicionando campo eventId
      FOREIGN KEY (eventId) REFERENCES events(id)  -- Relacionando com a tabela events
    )
  `, (err) => {
    if (err) {
      console.error("Erro ao criar ou verificar tabela orders:", err.message);
    } else {
      console.log("Tabela orders criada ou já existente.");
    }
  });

  // Garantir que a tabela "drinks" esteja correta
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

  // Criar a tabela "events" se não existir
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      isActive BOOLEAN NOT NULL DEFAULT 1 -- Indica se o evento está ativo (1) ou não (0)
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

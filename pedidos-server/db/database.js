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
  // Criar ou atualizar a tabela "orders"
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drinks TEXT NOT NULL,
      photo TEXT,
      name TEXT,
      status TEXT NOT NULL,
      whatsapp TEXT,
      eventId INTEGER,  -- Relacionamento com a tabela events
      FOREIGN KEY (eventId) REFERENCES events(id)
    )
  `, (err) => {
    if (err) {
      console.error("Erro ao criar ou verificar tabela orders:", err.message);
    } else {
      console.log("Tabela orders criada ou já existente.");
    }
  });
  db.run(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    drink_id INTEGER,
    quantity INTEGER DEFAULT 1,
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

  // Criar ou atualizar a tabela "events" com os novos campos
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT,        -- Campo de localização
      guestCount INTEGER,   -- Campo de número de convidados
      date TEXT,            -- Campo de data do evento
      isActive BOOLEAN NOT NULL DEFAULT 1 -- Indica se o evento está ativo
    )
  `, (err) => {
    if (err) {
      console.error("Erro ao criar ou verificar tabela events:", err.message);
    } else {
      console.log("Tabela events criada ou já existente.");
    }
  });

  // Atualizar a tabela "events" para incluir novos campos, caso já existam
  const columnsToAdd = [
    { column: "location", type: "TEXT" },
    { column: "guestCount", type: "INTEGER" },
    { column: "date", type: "TEXT" }
  ];

  columnsToAdd.forEach(({ column, type }) => {
    db.run(`ALTER TABLE events ADD COLUMN ${column} ${type}`, (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error(`Erro ao adicionar coluna ${column}:`, err.message);
      }
    });
  });
});

module.exports = db;

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Definindo o caminho para o banco de dados
const dbPath = path.join(__dirname, 'db.sqlite');

// Criando ou abrindo o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('Banco de dados aberto com sucesso.');
  }
});

// Função para inicializar o banco de dados e criar tabelas se não existirem
const initializeDatabase = () => {
  db.serialize(() => {
    // Criar a tabela de pedidos
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        drink TEXT NOT NULL,
        photo TEXT,
        status TEXT DEFAULT 'Pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar a tabela de drinks
    db.run(`
      CREATE TABLE IF NOT EXISTS drinks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ingredients TEXT,
        photo TEXT,
        is_active BOOLEAN DEFAULT 1
      )
    `);
  });
};

// Função para inserir um novo pedido
const insertOrder = (name, drink, photo, callback) => {
  const stmt = db.prepare('INSERT INTO orders (name, drink, photo) VALUES (?, ?, ?)');
  stmt.run(name, drink, photo, function(err) {
    callback(err, this.lastID);
  });
  stmt.finalize();
};

// Função para obter todos os pedidos
const getAllOrders = (callback) => {
  db.all('SELECT * FROM orders', (err, rows) => {
    callback(err, rows);
  });
};

// Função para atualizar o status de um pedido
const updateOrderStatus = (id, status, callback) => {
  const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
  stmt.run(status, id, function(err) {
    callback(err);
  });
  stmt.finalize();
};

// Função para inserir um drink
const insertDrink = (name, ingredients, photo, isActive, callback) => {
  const stmt = db.prepare('INSERT INTO drinks (name, ingredients, photo, is_active) VALUES (?, ?, ?, ?)');
  stmt.run(name, ingredients, photo, isActive, function(err) {
    callback(err, this.lastID);
  });
  stmt.finalize();
};

// Função para obter drinks com status ativo ou inativo
const getDrinks = (isActive, callback) => {
  const stmt = db.prepare('SELECT * FROM drinks WHERE is_active = ?');
  stmt.all(isActive, (err, rows) => {
    callback(err, rows);
  });
  stmt.finalize();
};

// Função para atualizar o status do drink
const updateDrinkStatus = (id, isActive, callback) => {
  const stmt = db.prepare('UPDATE drinks SET is_active = ? WHERE id = ?');
  stmt.run(isActive, id, function(err) {
    callback(err);
  });
  stmt.finalize();
};

// Exportar funções
module.exports = {
  initializeDatabase,
  insertOrder,
  getAllOrders,
  updateOrderStatus,
  insertDrink,
  getDrinks,
  updateDrinkStatus,
};
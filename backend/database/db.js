const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

let db = null;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }
  return db;
}

function init() {
  const database = getDb();

  // Users table
  database.serialize(() => {
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sellers table
    database.run(`
      CREATE TABLE IF NOT EXISTS sellers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Customers table
    database.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Enquiries table
    database.run(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        engagement_number TEXT,
        invoice_number TEXT,
        date TEXT,
        status TEXT DEFAULT 'pending',
        seller_id TEXT,
        customer_id TEXT,
        total_amount REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES sellers(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    // Enquiry items table
    database.run(`
      CREATE TABLE IF NOT EXISTS enquiry_items (
        id TEXT PRIMARY KEY,
        enquiry_id TEXT NOT NULL,
        description TEXT,
        part_number TEXT,
        made TEXT,
        quantity REAL DEFAULT 0,
        unit_price REAL DEFAULT 0,
        sale_price REAL DEFAULT 0,
        sub_name TEXT,
        uom TEXT,
        total REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized');
  });
}

function close() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = {
  getDb,
  init,
  close,
};


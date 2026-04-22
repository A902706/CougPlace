const Database = require('better-sqlite3');

const db = new Database('cougplace.db');

// USERS TABLE
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  password TEXT,
  firstName TEXT,
  lastName TEXT,
  gender TEXT,
  age INTEGER
);
`).run();

// LISTINGS TABLE (THIS FIXES YOUR ERROR)
db.prepare(`
CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  title TEXT,
  description TEXT,
  category TEXT,
  price REAL,
  pickupArea TEXT,
  image TEXT,
  status TEXT,
  sellerName TEXT,
  sellerEmail TEXT
);
`).run();

module.exports = db;
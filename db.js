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
  age INTEGER,
  role TEXT DEFAULT 'user'
);
`).run();

// LISTINGS TABLE
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

/*ADMIN ACCOUNT for testing
if you delete the database for some reason or what ever run this to add it
ONLY ONCE THEN DELETE IT after you run it
db.prepare(`
  INSERT INTO users (email, password, firstName, lastName, gender, age, role)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  "admin@wsu.edu",
  "admin123", 
  "Admin",
  "User",
  "Other",
  25,
  "admin"
);
admin@wsu.edu
admin123 */
module.exports = db;
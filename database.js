const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 1. Establish the physical path for our database file
const dbPath = path.join(__dirname, "social_feed.db");

// 2. Connect to the SQLite Database engine
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to link database engine:", err.message);
  } else {
    console.log("Connected smoothly to local SQLite database storage.");
  }
});

// 3. Create the table structure automatically if it doesn't exist yet
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS micro_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      post_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;

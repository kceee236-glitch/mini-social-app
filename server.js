const express = require("express");
const cors = require("cors");
const db = require("./database"); // Pulls in our newly created database module

const app = express();
app.use(cors());
app.use(express.json());

// CHANNEL 1: FETCH GLOBAL FEED LOGS (Sorted newest first)
app.get("/api/posts", (req, res) => {
  const sql = "SELECT * FROM micro_posts ORDER BY id DESC";

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// CHANNEL 2: INJECT NEW SOCIAL PUBLIC POSTS
app.post("/api/posts", (req, res) => {
  const { name, text } = req.body;

  if (!name || !text) {
    return res
      .status(400)
      .json({ error: "Username and text parameters are required." });
  }

  const sql = "INSERT INTO micro_posts (username, post_text) VALUES (?, ?)";
  db.run(sql, [name.trim(), text.trim()], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res
      .status(201)
      .json({ message: "Post broadcast successfully!", postId: this.lastID });
  });
});

// Set the port dynamically for cloud environments (Render requires process.env.PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SUCCESS! Mini Social Platform running on port ${PORT}`);
});

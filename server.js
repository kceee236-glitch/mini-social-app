const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const db = require("./database");

const app = express();

// 1. Lock down CORS strictly to your Netlify domain
app.use(
  cors({
    origin: "https://kceechatify.netlify.app",
  }),
);

// 2. Prevent payload flooding (limit JSON payload size to 10KB)
app.use(express.json({ limit: "10kb" }));

// 3. Return a completely blank page when visiting the main domain URL (/)
app.get("/", (req, res) => {
  res.status(200).send("");
});

// 4. Send a blank page if opened directly in a web browser (HTML request)
app.use((req, res, next) => {
  const acceptsHtml =
    req.headers.accept && req.headers.accept.includes("text/html");
  if (acceptsHtml) {
    return res.status(200).send("");
  }
  next();
});

// 5. Protect API routes against spam (max 50 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many requests from this IP. Please wait a bit." },
});
app.use("/api/", apiLimiter);

// GET timeline
app.get("/api/posts", (req, res) => {
  const sql = "SELECT * FROM micro_posts ORDER BY id DESC LIMIT 100";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST new message with server-side length validation
app.post("/api/posts", (req, res) => {
  const { name, text } = req.body;

  if (!name || !text) {
    return res
      .status(400)
      .json({ error: "Username and message text are required." });
  }

  // Enforce max character lengths
  if (name.trim().length > 30 || text.trim().length > 280) {
    return res
      .status(400)
      .json({ error: "Username or post text exceeds maximum allowed length." });
  }

  const sql = "INSERT INTO micro_posts (username, post_text) VALUES (?, ?)";
  db.run(sql, [name.trim(), text.trim()], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res
      .status(201)
      .json({ message: "Post broadcast successfully!", postId: this.lastID });
  });
});

// 6. Catch-all: Send a blank page for any non-existent routes (replaces Express 404 HTML)
app.use((req, res) => {
  res.status(404).send("");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running safely on port ${PORT}`));

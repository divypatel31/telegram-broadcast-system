import express from "express";
import cors from "cors";
import sendRoutes from "./routes/sendRoutes";
import "./services/telegramService";
import { PORT } from "./config/env";
import { db } from "./config/db";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", sendRoutes);

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

db.query("SELECT 1")
  .then(() => {
    console.log("✅ PostgreSQL Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("❌ DB Error:", err);
  });

  // ... (keep the top part of index.ts the same)

db.query("SELECT 1")
  .then(async () => {
    console.log("✅ PostgreSQL Connected");

    // ✅ NEW: Auto-create the history table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS broadcast_history (
        id SERIAL PRIMARY KEY,
        message TEXT,
        file_path TEXT,
        success_count INT,
        fail_count INT,
        total_targets INT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("📜 Broadcast history table ready");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("❌ DB Error:", err);
  });
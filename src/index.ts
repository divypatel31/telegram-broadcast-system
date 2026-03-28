import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import sendRoutes from "./routes/sendRoutes";
import "./services/telegramService";
import { PORT } from "./config/env";
import { db } from "./config/db";
import { startCronJobs } from "./services/cronService";
const app = express();

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "🛑 Too many requests from this IP. Please try again in 15 minutes." },
  standardHeaders: true, 
  legacyHeaders: false, 
});

app.use("/api", apiLimiter, sendRoutes);

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

db.query("SELECT 1")
  .then(async () => {
    console.log("✅ PostgreSQL Connected");

    // History Table
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

    // ✅ NEW: Scheduled Broadcasts Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS scheduled_broadcasts (
        id SERIAL PRIMARY KEY,
        broadcast_id VARCHAR(255) UNIQUE,
        message TEXT,
        file_path TEXT,
        scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("📜 Database tables ready");

    // ✅ NEW: Start the background loop!
    startCronJobs();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("❌ DB Error:", err);
  });
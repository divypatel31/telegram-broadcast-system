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
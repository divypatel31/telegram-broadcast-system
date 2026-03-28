import { Request, Response } from "express";
import { sendToAllUsers, cancelBroadcast } from "../services/senderService";
import path from "path";
import fs from "fs";
import { db } from "../config/db";

// ✅ NEW IMPORTS for JWT
import jwt from "jsonwebtoken";
import { ADMIN_PASSWORD, JWT_SECRET } from "../config/env";

// ✅ NEW: JWT Login Controller
export const loginController = (req: Request, res: Response) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    // Generate a token that expires in 24 hours
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
};

export const sendFileController = async (req: any, res: Response) => {
  try {
    const { message, scheduledAt } = req.body; // ✅ Extract scheduledAt
    const broadcastId = (req.query.broadcastId as string) || req.body.broadcastId;

    let filePath: string | null = null;

    if (req.file) {
      filePath = path.resolve(req.file.path);
      if (!fs.existsSync(filePath)) {
        console.error(`File missing at path: ${filePath}`);
        return res.status(500).json({ error: "Server failed to save the file." });
      }
    } 
    else if (!message || message.trim() === "") {
      return res.status(400).json({ error: "You must provide either a file or a message." });
    }

    // ✅ NEW: If a schedule time is provided, save it to the DB and stop!
    if (scheduledAt) {
      console.log(`📅 Broadcast ${broadcastId} scheduled for ${scheduledAt}`);
      await db.query(
        "INSERT INTO scheduled_broadcasts (broadcast_id, message, file_path, scheduled_at) VALUES ($1, $2, $3, $4)",
        [broadcastId, message, filePath, scheduledAt]
      );
      return res.json({ message: "Broadcast scheduled successfully!", result: { scheduled: true } });
    }

    // ✅ If no schedule time, send it immediately like normal
    console.log(`🚀 Starting Immediate Broadcast ID: ${broadcastId}`);
    const result = await sendToAllUsers(message, filePath, broadcastId);

    res.json({ message: "Sending finished", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send" });
  }
};

export const getUserCount = async (req: Request, res: Response) => {
  try {
    const result = await db.query("SELECT COUNT(*) FROM users");
    const count = parseInt(result.rows[0].count, 10);
    res.json({ count });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ error: "Failed to fetch user count" });
  }
};

export const getBroadcastHistory = async (req: Request, res: Response) => {
  try {
    // 1. Get the requested page from the URL (default to page 1, 10 items per page)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // 2. Fetch exactly 10 records for that specific page
    const result = await db.query(
      "SELECT * FROM broadcast_history ORDER BY sent_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    // 3. Count total records so the frontend knows how many pages exist
    const countResult = await db.query("SELECT COUNT(*) FROM broadcast_history");
    const totalRecords = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalRecords / limit);

    // 4. Send the data AND the pagination math back to React
    res.json({
      data: result.rows,
      pagination: {
        total: totalRecords,
        page,
        totalPages,
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch broadcast history" });
  }
};

export const cancelBroadcastController = (req: Request, res: Response) => {
  const broadcastId = (req.query.broadcastId as string) || req.body.broadcastId;
  
  if (broadcastId) {
    console.log(`🛑 Received Abort Signal for Broadcast ID: ${broadcastId}`);
    cancelBroadcast(broadcastId);
  } else {
    console.log("⚠️ Abort signal received, but NO broadcastId was provided!");
  }
  
  res.json({ message: "Broadcast abort signal received." });
};
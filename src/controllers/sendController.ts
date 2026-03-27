import { Request, Response } from "express";
import { sendToAllUsers, cancelBroadcast } from "../services/senderService";
import path from "path";
import fs from "fs";
import { db } from "../config/db";

export const sendFileController = async (req: any, res: Response) => {
  try {
    const { message } = req.body;
    
    // ✅ FIX: Read ID from the URL Query string instead of the form body
    const broadcastId = req.query.broadcastId as string || req.body.broadcastId;

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

    console.log(`🚀 Starting Broadcast ID: ${broadcastId}`);
    const result = await sendToAllUsers(message, filePath, broadcastId);

    res.json({
      message: "Sending finished",
      result,
    });
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
    const result = await db.query(
      "SELECT * FROM broadcast_history ORDER BY sent_at DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch broadcast history" });
  }
};

export const cancelBroadcastController = (req: Request, res: Response) => {
  const { broadcastId } = req.body;
  
  if (broadcastId) {
    console.log(`🛑 Received Abort Signal for Broadcast ID: ${broadcastId}`);
    cancelBroadcast(broadcastId);
  } else {
    console.log("⚠️ Abort signal received, but NO broadcastId was provided!");
  }
  
  res.json({ message: "Broadcast abort signal received." });
};
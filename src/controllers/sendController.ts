import { Request, Response } from "express";
import { sendToAllUsers } from "../services/senderService";
import { db } from "../config/db";
import path from "path";
import fs from "fs";

export const sendFileController = async (req: any, res: Response) => {
  try {
    const { message } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 1. Convert the path to an absolute Windows path
    const filePath = path.resolve(req.file.path);

    // 2. Safety check: Verify the file actually exists on the hard drive
    if (!fs.existsSync(filePath)) {
      console.error(`File missing at path: ${filePath}`);
      return res.status(500).json({ error: "Server failed to save the file." });
    }

    const result = await sendToAllUsers(message, filePath);

    res.json({
      message: "Sending started",
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
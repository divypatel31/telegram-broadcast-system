import { Request, Response } from "express";
import { sendToAllUsers } from "../services/senderService";

export const sendFileController = async (req: any, res: Response) => {
  try {
    const { message } = req.body;

    // ✅ define filePath
    const filePath = `http://localhost:5000/uploads/${req.file.filename}`;

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
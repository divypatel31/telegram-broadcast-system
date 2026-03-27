import { Request, Response, NextFunction } from "express";
import { ADMIN_API_KEY } from "../config/env";

export const verifyApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized: Invalid API Key" });
  }

  // If the key matches, allow the request to proceed
  next();
};
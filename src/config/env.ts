import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 5000;

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

// DB config
export const DB_USER = process.env.DB_USER as string;
export const DB_HOST = process.env.DB_HOST as string;
export const DB_NAME = process.env.DB_NAME as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const DB_PORT = Number(process.env.DB_PORT);
export const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "my-secret-password";
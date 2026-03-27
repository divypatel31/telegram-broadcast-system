import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_BOT_TOKEN } from "../config/env";
import { db } from "../config/db";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log("🤖 Telegram bot started...");

// ✅ Handle incoming messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id.toString();

  console.log("📩 User Chat ID:", chatId);

  try {
    // 🔍 Check if user already exists
    const result = await db.query(
      "SELECT * FROM users WHERE chat_id = $1",
      [chatId]
    );

    // 🆕 New user → save + welcome
    if (result.rows.length === 0) {
      await db.query(
        "INSERT INTO users (chat_id) VALUES ($1)",
        [chatId]
      );

      await bot.sendMessage(
        chatId,
        "🎉 Welcome! You are now connected. You will receive updates here."
      );

      console.log("✅ New user saved + welcomed");
    } else {
      console.log("ℹ️ Existing user");
    }

  } catch (error) {
    console.error("❌ DB error:", error);
  }
});

// ✅ Send text message
export const sendMessage = async (chatId: string, text: string) => {
  try {
    await bot.sendMessage(chatId, text);
    console.log(`✅ Message sent to ${chatId}`);
  } catch (error) {
    console.error(`❌ Message failed for ${chatId}:`, error);
  }
};

// ✅ Send file with caption (BEST VERSION)
export const sendFile = async (
  chatId: string,
  fileUrl: string,
  caption?: string
) => {
  try {
    await bot.sendDocument(chatId, fileUrl, {
      caption: caption || "",
    });

    console.log(`📁 File sent to ${chatId}`);
  } catch (error) {
    console.error(`❌ File failed for ${chatId}:`, error);
  }
};

export default bot;
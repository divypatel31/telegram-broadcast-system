import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_BOT_TOKEN } from "../config/env";
import { db } from "../config/db";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log("🤖 Telegram bot started...");

// ✅ Handle incoming messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id.toString();
  const text = msg.text?.toLowerCase().trim();

  console.log(`📩 Message from ${chatId}: ${text}`);

  try {
    // 🛑 1. Handle Unsubscribe ("/stop")
    if (text === "/stop") {
      await db.query("DELETE FROM users WHERE chat_id = $1", [chatId]);
      await bot.sendMessage(
        chatId,
        "🚫 You have been unsubscribed. You will no longer receive files. Send /start to rejoin.",
        { parse_mode: "HTML" } // ✅ Added HTML support
      );
      console.log(`🚪 User ${chatId} unsubscribed.`);
      return; 
    }

    // 🔍 2. Check if user already exists
    const result = await db.query(
      "SELECT * FROM users WHERE chat_id = $1",
      [chatId]
    );

    // 🆕 3. New user → save + welcome
    if (result.rows.length === 0) {
      await db.query("INSERT INTO users (chat_id) VALUES ($1)", [chatId]);

      await bot.sendMessage(
        chatId,
        "🎉 Welcome! You are now connected. You will receive updates here.\n\n(Type /stop at any time to unsubscribe)",
        { parse_mode: "HTML" } // ✅ Added HTML support
      );

      console.log("✅ New user saved + welcomed");
    } else {
      console.log("ℹ️ Existing user");
    }
  } catch (error) {
    console.error("❌ DB error:", error);
  }
});

// ✅ Send text message (UPDATED for HTML)
export const sendMessage = async (chatId: string, text: string) => {
  try {
    // ✅ Pass parse_mode: "HTML" to enable bold, italics, links, etc.
    await bot.sendMessage(chatId, text, { parse_mode: "HTML" });
    console.log(`✅ Message sent to ${chatId}`);
  } catch (error) {
    console.error(`❌ Message failed for ${chatId}:`, error);
  }
};

// ✅ Send file with caption (UPDATED for HTML)
export const sendFile = async (
  chatId: string,
  fileUrl: string,
  caption?: string
) => {
  try {
    await bot.sendDocument(chatId, fileUrl, {
      caption: caption || "",
      parse_mode: "HTML", // ✅ Pass parse_mode inside the options object
    });

    console.log(`📁 File sent to ${chatId}`);
  } catch (error) {
    console.error(`❌ File failed for ${chatId}:`, error);
  }
};

export default bot;
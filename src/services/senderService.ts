import { db } from "../config/db";
import { sendFile } from "./telegramService";
import { delay } from "../utils/delay";

export const sendToAllUsers = async (message: string, filePath: string) => {
  try {
    const result = await db.query("SELECT chat_id FROM users");
    const users = result.rows;

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        console.log(`📤 Sending to: ${user.chat_id}`);

        // ✅ Send file WITH caption (message)
        await sendFile(user.chat_id, filePath, message);

        successCount++;
        console.log(`✅ Sent to ${user.chat_id}`);

        // ⏳ Delay to avoid Telegram spam block
        await delay(2000);

      } catch (err: any) {
        failCount++;
        
        // 🛑 AUTO-CLEANUP: Check if user blocked the bot
        // Telegram API returns a 403 code or a specific description when blocked
        const errorMessage = err.response?.body?.description || err.message || "";
        const errorCode = err.response?.body?.error_code || err.response?.statusCode;
        
        if (errorMessage.includes("blocked by the user") || errorCode === 403) {
           console.log(`🚫 User ${user.chat_id} blocked the bot. Removing from DB...`);
           await db.query("DELETE FROM users WHERE chat_id = $1", [user.chat_id]);
           continue; // Move directly to the next user, skipping the retry attempt
        }

        console.error(`❌ Failed for ${user.chat_id}:`, errorMessage);

        // 🔁 Retry once (optional but powerful) for non-block network errors
        try {
          console.log(`🔁 Retrying for ${user.chat_id}...`);
          await delay(3000);
          await sendFile(user.chat_id, filePath, message);
          console.log(`✅ Retry success for ${user.chat_id}`);
        } catch (retryErr) {
          console.error(`❌ Retry failed for ${user.chat_id}`);
        }
      }
    }

    return {
      success: true,
      total: users.length,
      sent: successCount,
      failed: failCount,
    };

  } catch (error) {
    console.error("❌ Global send error:", error);
    throw error;
  }
};
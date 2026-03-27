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

      } catch (err) {
        failCount++;
        console.error(`❌ Failed for ${user.chat_id}:`, err);

        // 🔁 Retry once (optional but powerful)
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
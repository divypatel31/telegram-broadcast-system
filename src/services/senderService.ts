import { db } from "../config/db";
import { sendFile, sendMessage } from "./telegramService"; 
import { delay } from "../utils/delay";

const cancelledBroadcasts = new Set<string>();

export const cancelBroadcast = (broadcastId: string) => {
  cancelledBroadcasts.add(broadcastId);
};

export const sendToAllUsers = async (message: string, filePath: string | null, broadcastId: string) => {
  try {
    // ✅ CHECKPOINT 1: Did the admin abort while the file was uploading to your server?
    if (broadcastId && cancelledBroadcasts.has(broadcastId)) {
      console.log(`🛑 Broadcast ${broadcastId} aborted BEFORE sending started.`);
      cancelledBroadcasts.delete(broadcastId); // Clean memory
      
      await db.query(
        `INSERT INTO broadcast_history (message, file_path, success_count, fail_count, total_targets) VALUES ($1, $2, $3, $4, $5)`,
        [`[ABORTED] ` + (message ? message : "[File Only - No Caption]"), filePath ? filePath : null, 0, 0, 0]
      );
      return { success: true, total: 0, sent: 0, failed: 0, aborted: true };
    }

    const result = await db.query("SELECT chat_id FROM users");
    const users = result.rows;

    let successCount = 0;
    let failCount = 0;
    let wasCancelled = false; 

    for (const user of users) {
      // ✅ CHECKPOINT 2: Did the admin abort right before this specific user?
      if (broadcastId && cancelledBroadcasts.has(broadcastId)) {
        console.log(`🛑 Broadcast ${broadcastId} aborted by admin.`);
        wasCancelled = true;
        break; 
      }

      try {
        console.log(`📤 Sending to: ${user.chat_id}`);

        if (filePath) {
          await sendFile(user.chat_id, filePath, message);
        } else {
          await sendMessage(user.chat_id, message);
        }

        // ✅ CHECKPOINT 3: Did the admin abort EXACTLY while Telegram was receiving the file?
        if (broadcastId && cancelledBroadcasts.has(broadcastId)) {
          console.log(`🛑 Broadcast ${broadcastId} aborted right after sending to ${user.chat_id}.`);
          successCount++;
          wasCancelled = true;
          break; 
        }

        successCount++;
        console.log(`✅ Sent to ${user.chat_id}`);
        await delay(2000);

      } catch (err: any) {
        failCount++;
        
        const errorMessage = err.response?.body?.description || err.message || "";
        const errorCode = err.response?.body?.error_code || err.response?.statusCode;
        
        if (errorMessage.includes("blocked by the user") || errorCode === 403) {
           console.log(`🚫 User ${user.chat_id} blocked the bot. Removing from DB...`);
           await db.query("DELETE FROM users WHERE chat_id = $1", [user.chat_id]);
           continue; 
        }

        // ✅ CHECKPOINT 4: Abort check if an error happened
        if (broadcastId && cancelledBroadcasts.has(broadcastId)) {
          wasCancelled = true;
          break; 
        }

        console.error(`❌ Failed for ${user.chat_id}:`, errorMessage);

        try {
          console.log(`🔁 Retrying for ${user.chat_id}...`);
          await delay(3000);
          
          if (broadcastId && cancelledBroadcasts.has(broadcastId)) {
            wasCancelled = true;
            break; 
          }
          
          if (filePath) {
            await sendFile(user.chat_id, filePath, message);
          } else {
            await sendMessage(user.chat_id, message);
          }
          console.log(`✅ Retry success for ${user.chat_id}`);
        } catch (retryErr) {
          console.error(`❌ Retry failed for ${user.chat_id}`);
        }
      }
    }

    // ✅ Clean up memory once the loop is broken or finished
    if (broadcastId) {
      cancelledBroadcasts.delete(broadcastId);
    }

    const statusPrefix = wasCancelled ? "[ABORTED] " : "";
    
    await db.query(
      `INSERT INTO broadcast_history 
      (message, file_path, success_count, fail_count, total_targets) 
      VALUES ($1, $2, $3, $4, $5)`,
      [
        statusPrefix + (message ? message : "[File Only - No Caption]"), 
        filePath ? filePath : null, 
        successCount, 
        failCount, 
        users.length
      ]
    );
    console.log("💾 Broadcast saved to history");

    return {
      success: true,
      total: users.length,
      sent: successCount,
      failed: failCount,
      aborted: wasCancelled 
    };

  } catch (error) {
    console.error("❌ Global send error:", error);
    throw error;
  }
};
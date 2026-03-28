import cron from "node-cron";
import { db } from "../config/db";
import { sendToAllUsers } from "./senderService";

export const startCronJobs = () => {
  // ✅ Run this check EVERY SINGLE MINUTE
  cron.schedule("* * * * *", async () => {
    try {
      // Find all broadcasts that are 'pending' and where the time has arrived (or passed)
      const res = await db.query(
        "SELECT * FROM scheduled_broadcasts WHERE status = 'pending' AND scheduled_at <= NOW()"
      );
      
      const jobs = res.rows;
      
      if (jobs.length > 0) {
        console.log(`⏰ Found ${jobs.length} scheduled broadcast(s) ready to send!`);
      }

      for (const job of jobs) {
        console.log(`🚀 Executing scheduled broadcast: ${job.broadcast_id}`);
        
        // Mark as processing so it doesn't get picked up twice
        await db.query("UPDATE scheduled_broadcasts SET status = 'processing' WHERE id = $1", [job.id]);
        
        // Trigger the exact same sending function we use for manual broadcasts
        await sendToAllUsers(job.message, job.file_path, job.broadcast_id);
        
        // Mark as completed
        await db.query("UPDATE scheduled_broadcasts SET status = 'completed' WHERE id = $1", [job.id]);
      }
    } catch (error) {
      console.error("❌ Cron Job Error:", error);
    }
  });

  console.log("⏱️  Cron scheduler started. Checking for broadcasts every minute.");
};
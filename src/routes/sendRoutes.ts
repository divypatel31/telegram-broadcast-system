import express from "express";
import { 
  sendFileController, 
  getUserCount, 
  getBroadcastHistory, 
  cancelBroadcastController,
  loginController 
} from "../controllers/sendController"; 
import { upload } from "../utils/upload"; 
import { verifyToken } from "../middlewares/auth"; // ✅ Import the new middleware

const router = express.Router();

// ✅ Open Login Route
router.post("/login", loginController);

// ✅ Protected Routes (Using verifyToken instead of verifyApiKey)
router.post("/send-file", verifyToken, upload.single("file"), sendFileController);
router.get("/users/count", verifyToken, getUserCount); 
router.get("/history", verifyToken, getBroadcastHistory); 
router.post("/cancel", verifyToken, cancelBroadcastController);

export default router;
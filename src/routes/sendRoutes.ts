import express from "express";
import { sendFileController, getUserCount, getBroadcastHistory, cancelBroadcastController } from "../controllers/sendController"; // ✅ Import new controller
import { upload } from "../utils/upload"; 
import { verifyApiKey } from "../middlewares/auth"; 

const router = express.Router();

router.post("/send-file", verifyApiKey, upload.single("file"), sendFileController);
router.get("/users/count", verifyApiKey, getUserCount); 
router.get("/history", verifyApiKey, getBroadcastHistory); 
router.post("/cancel", verifyApiKey, cancelBroadcastController); // ✅ Add Cancel route

export default router;
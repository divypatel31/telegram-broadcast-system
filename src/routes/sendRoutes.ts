import express from "express";
import { sendFileController } from "../controllers/sendController";
import { upload } from "../utils/upload"; // ✅ ADD THIS

const router = express.Router();

router.post("/send-file", upload.single("file"), sendFileController); // ✅ FIX

export default router;
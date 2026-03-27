import express from "express";
import { sendFileController, getUserCount } from "../controllers/sendController"; // ✅ ADD getUserCount
import { upload } from "../utils/upload"; 

const router = express.Router();

router.post("/send-file", upload.single("file"), sendFileController);
router.get("/users/count", getUserCount); // ✅ ADD THIS ROUTE

export default router;
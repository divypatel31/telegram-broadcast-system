import multer, { StorageEngine } from "multer";
import { Request } from "express";
import fs from "fs";
import path from "path";

// 1. Define the absolute path to the uploads directory
const uploadDir = path.join(process.cwd(), "uploads");

// 2. Automatically create the folder if it does not exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    // 3. Tell multer to use the absolute path
    cb(null, uploadDir); 
  },
  filename: (req: Request, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });
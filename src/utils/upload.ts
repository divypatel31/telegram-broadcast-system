import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Keep the original extension, but make the name unique to prevent overwriting
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  },
});

// ✅ NEW: Security Filter
const fileFilter = (req: any, file: any, cb: any) => {
  // 1. Block dangerous executable scripts
  const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.msi', '.js', '.vbs', '.php'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (dangerousExts.includes(ext)) {
    return cb(new Error("Security Error: Executable files are not allowed."));
  }
  
  // 2. Accept everything else
  cb(null, true);
};

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // ✅ NEW: 50 MB hard limit
  },
  fileFilter
});
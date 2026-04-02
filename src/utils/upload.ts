import multer from "multer";
import path from "path";
import os from "os"; // ✅ Imported OS module for cloud compatibility

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ Save to the server's native temporary folder (/tmp), guaranteed to exist on Render
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    // Keep the original extension, but make the name unique to prevent overwriting
    // Sanitize spaces to prevent pathing issues
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + "-" + safeName);
  },
});

// ✅ Security Filter
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
    fileSize: 50 * 1024 * 1024, // ✅ 50 MB hard limit
  },
  fileFilter
});
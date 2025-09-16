import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export default function fileUploader({
  upload = "upload",
  maxFileSize = 5,
  fileTypes = ["jpg", "jpeg", "png", "gif", "webp"],
} = {}) {
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        await fs.mkdir(upload, { recursive: true });
        cb(null, upload);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const fieldName = file.fieldname;
      const inputName = (req?.body?.name || "unknown")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9\-]/g, "")
        .replace(/(^-+|-+$)/g, "")
        .replace(/-+/g, "-")
        .substring(0, 50);
      const dateName = new Date().toISOString().split("T")[0];
      const idName = uuidv4().split("-").pop();
      const extName = path.extname(file.originalname).toLowerCase();
      const fullName = `${fieldName}-${inputName}-${dateName}-${idName}${extName}`;
      cb(null, fullName);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().substring(1);
      const mimeType = file.mimetype.split("/")[1];

      // Check both extension and mimetype
      const isValidExtension = fileTypes.includes(ext);
      const isValidMimeType = fileTypes.includes(mimeType);

      if (!isValidExtension && !isValidMimeType) {
        return cb(new Error(`Only ${fileTypes.join(", ")} types are allowed`));
      }

      cb(null, true);
    },
  });
}

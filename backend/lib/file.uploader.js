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
      await fs.mkdir(upload, { recursive: true });
      cb(null, upload);
    },
    filename: (req, file, cb) => {
      const fieldName = file.fieldname;
      const inputName = (req?.body?.name || "unknown")
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9\-]/g, "")
        .replace(/(^-+|-+$)/g, "")
        .replace(/-+/g, "-");
      const dateName = new Date().toISOString().split("T")[0];
      const idName = uuidv4().split("-").pop();
      const extName = path.extname(file.originalname).toLowerCase();
      const fullName = `${fieldName}-${inputName}-${dateName}-${idName}${extName}`;
      cb(null, fullName);
    },
  });
  const fileTypeRegx = new RegExp(`\\.(${fileTypes?.join("|")})$`, "i");
  return multer({
    storage,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (
        !fileTypeRegx.test(path.extname(file.originalname).toLowerCase()) ||
        !fileTypes.includes(file.mimetype.split("/")[1])
      ) {
        return cb(new Error(`Only ${fileTypes.join(", ")} types are allowed`));
      }
      cb(null, true);
    },
  });
}

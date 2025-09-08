import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

export default function createUploaderTwo({
  folder = "./folder",
  maxFileSize = 5,
  fileTypes = ["jpg", "jpeg", "png", "gif", "webp"],
} = {}) {
  // create diskStorage for multer()
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        await fs.mkdir(folder, { recursive: true });
        cb(null, folder);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const fieldName = file.fieldname;
      const extName = path.extname(file.originalname).toLowerCase();
      const inputName = (req.body.name || "Unknown")
        .toLowerCase()
        .replace(/s+/g, "")
        .replace(/[^a-zA-Z0-9\-]/g, "")
        .replace(/-+/g, "-")
        .replace(/(^-+|-+$)/g, "");
      const idName = uuidv4().split("-").pop();
      const timeName = new Date().toISOString().split("T")[0];
      const fullName = `${inputName}-${fieldName}-${timeName}-${idName}${extName}`;
      cb(null, fullName);
    },
  });
  const testFileTypes = new RegExp(`\\.${fileTypes.join("|")}$`, "i");
  return multer({
    storage,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const fileExt = path.extname(file.originalname).toLowerCase();
      if (
        !testFileTypes.test(fileExt) ||
        !fileTypes.includes(file.mimetype.split("/")[1].toLowerCase())
      ) {
        return cb(new Error("Unexpected file types"));
      }
      cb(null, true);
    },
  });
}

import multer from "multer";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export default function mkUploader({
  uploadDIR = "./folder",
  maxFileSizeMB = 5,
  fileTypes = ["jpg", "jpeg", "png", "webp"],
} = {}) {
  /* const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        await fs.mkdir(uploadDIR, { recursive: true });
      } catch (error) {
        throw error;
      }
      cb(null, uploadDIR);
    },
    filename: (req, file, cb) => {
      const inputName = (req.body.name || "Unknown")
        .toString()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9]/g, "");
      const fieldName = file.fieldname;
      const dateName = new Date().toISOString().split("T")[0];
      const uniqueName = uuidv4().split("-").pop();
      const extName = path.extname(file.originalname).toLowerCase();
      const fullName = `${inputName}-${fieldName}-${dateName}-${uniqueName}${extName}`;
      cb(null, fullName);
    },
  }); */
  const allowedFileTypes = new RegExp(`\\.(${fileTypes.join("|")})$`, "i");
  return multer({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          await fs.mkdir(uploadDIR, { recursive: true });
        } catch (error) {
          throw error;
        }
        cb(null, uploadDIR);
      },
      filename: (req, file, cb) => {
        const inputName = (req.body.name || "Unknown")
          .toString()
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9]/g, "");
        const fieldName = file.fieldname;
        const dateName = new Date().toISOString().split("T")[0];
        const uniqueName = uuidv4().split("-").pop();
        const extName = path.extname(file.originalname).toLowerCase();
        const fullName = `${inputName}-${fieldName}-${dateName}-${uniqueName}${extName}`;
        cb(null, fullName);
      },
    }),
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      isExtType = allowedFileTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      isExt = fileTypes.some(
        (ext) =>
          `.${ext.toLowerCase()}` ===
          path.extname(file.originalname).toLowerCase()
      );
      isMimeType = fileTypes.includes(file.mimetype.split("/")[1]);
    },
  });
}

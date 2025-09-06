import multer from "multer";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export default function fileUploadTwo({
  folder = "./upload",
  fileSizeMB = 5,
  fileTypes = ["jpg", "png", "jpeg", "gif", "webp"],
} = {}) {
  async function readDirectory() {
    try {
      await fs.mkdir(folder, { recursive: true });
    } catch (error) {
      throw error;
    }
  }
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        await readDirectory();
        cb(null, folder);
      } catch (error) {
        cb(error, null);
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const fieldName = file.fieldname;
      const mainName = (req.body.name || "unknown")
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/, "");
      const dateName = new Date().toISOString().split("T")[0];
      const nameId = uuidv4().split("-").pop();
      const fullName = `${mainName}-${fieldName}-${dateName}-${nameId}${ext}`;
      cb(null, fullName);
    },
  });
  const allowedRegx = new RegExp(`\\.(${fileTypes.join("|")})$`, "i");
  return multer({
    storage,
    limits: { fileSize: fileSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (
        !allowedRegx.test(file.originalname.toLowerCase()) ||
        !fileTypes.includes(file.mimetype.split("/")[1])
      ) {
        return cb(
          new Error(`Only these types are allowed ${fileTypes.join(", ")}`)
        );
      }
      cb(null, true);
    },
  });
}

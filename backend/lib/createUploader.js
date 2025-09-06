import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";

/**
 * Create a multer instance with custom parameters
 * @param {Object} options
 * @param {string} options.folder - Destination folder
 * @param {number} options.maxSizeMB - Max file size in MB
 * @param {string[]} options.allowedTypes - Array of allowed file extensions (without dot)
 * @returns {multer.Instance}
 */
const createUploader = ({
  folder = "./uploads",
  maxSizeMB = 5,
  allowedTypes = ["jpg", "jpeg", "png", "gif", "webp"],
} = {}) => {
  // Ensure folder exists
  async function readDestination() {
    try {
      await fs.mkdir(folder, { recursive: true });
    } catch (err) {
      throw err;
    }
  }
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        await readDestination();
        cb(null, folder);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const mainName = (req.body.name || "unknown")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      const fullName = `${mainName}-${file.fieldname}-${
        new Date().toISOString().split("T")[0]
      }-${uuidv4().split("-").pop()}${ext}`;
      cb(null, fullName);
    },
  });

  const allowedRegex = new RegExp(`\\.(${allowedTypes.join("|")})$`, "i");
  // in "\\." "." flag mean any character. So "." is scaped by \ and \ by \
  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (
        !allowedRegex.test(file.originalname) ||
        !allowedTypes.includes(file.mimetype.split("/")[1]) // mimetypes = "image/jpeg", "image/png"
      ) {
        return cb(
          new Error(`Only these types are allowed: ${allowedTypes.join(", ")}`)
        );
      }
      cb(null, true);
    },
  });
};

export default createUploader;

/* 

import createUploader from "./upload.js";

// Upload avatar
const uploadAvatar = createUploader({ folder: "./avatars", maxSizeMB: 2, allowedTypes: ["jpg","png"] });

app.post("/upload-avatar", uploadAvatar.single("avatar"), (req, res) => {
  res.send({ file: req.file });
});

// Upload multiple images
const uploadImages = createUploader({ folder: "./images", maxSizeMB: 10, allowedTypes: ["jpg","png","gif"] });
app.post("/upload-images", uploadImages.array("photos", 5), (req, res) => {
  res.send({ files: req.files });
});

app.listen(3000, () => console.log("Server running on port 3000"));

*/

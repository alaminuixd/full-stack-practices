import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs/promises";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3005;

// DIRECTORIES setup
const __filename = fileURLToPath(import.meta.url);
console.log(__filename);
const __dirname = path.dirname(__filename);
console.log(`Dirname: ${__dirname}`);
// Necessary directories
const UPLOAD_DIR = path.join(__dirname, "public", "upload");
const DATA_DIR = path.join(__dirname, "public", "data");
// Create directories if missing
(async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(DATA_DIR, { recursive: true });
})();

// Necessary PATHS
const IMG_DIR = path.join(UPLOAD_DIR, "images");
const DATA_PATH = path.join(DATA_DIR, "drivers.json");

// 🧩 GLOBAL MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use("/drivers", express.static(IMG_DIR));

// MULTER SETUP Starts
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMG_DIR);
  },
  filename: (req, file, cb) => {
    const inputName = (req.body.name || "Unknown")
      .toString()
      .replace(/s+/g, "-")
      .replace(/[^a-zA-Z-0-9\-]/g, "")
      .replace(/(^-+|-+$)/g, "")
      .replace(/-+/g, "-");
    const extName = path.extname(file.originalname);
    const dateName = new Date().toISOString().split("T")[0];
    const idName = uuidv4().split("-").pop();
    const fullName = `${inputName}-${dateName}-${idName}${extName}`;
    cb(null, fullName);
  },
});
const allowedFileTypes = ["jpg", "jpeg", "png", "gif", "webp"];
const fileTypeRegx = new RegExp(`\\.(${allowedFileTypes.join("|")})$`, "i");
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log(file.mimetype);
    if (
      !fileTypeRegx.test(path.extname(file.originalname).toLowerCase()) ||
      !allowedFileTypes.includes(file.mimetype.split("/")[1])
    ) {
      const errorMessage =
        allowedFileTypes.length < 2
          ? `Only ${allowedFileTypes.join("")} is allowed`
          : `Only ${allowedFileTypes
              .slice(0, -1)
              .join(", ")} and ${allowedFileTypes
              .slice(-1)
              .join("")} are allowed`;
      return cb(new Error(errorMessage));
    }
    cb(null, true);
  },
});
// MULTER SETUP Ends

app.post(
  "/api/drivers",
  (req, res, next) => {
    upload.fields([{ name: "avatar", maxCount: 1 }])(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    const { name, spouse, imgURL } = req.body;
    console.log(req.files);
    try {
      let drivers = [];
      try {
        const data = await fs.readFile(DATA_PATH, "utf8");
        const parsed = data.trim() ? JSON.parse(data) : [];
        drivers = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        if (error.code === "ENOENT") {
          await fs.writeFile(DATA_PATH, "[]");
          drivers = [];
        } else {
          throw error;
        }
      }
      const driver = {
        id: uuidv4(),
        name,
        spouse,
        imgURL: req.files.avatar[0].filename || "",
      };
      drivers.push(driver);
      await fs.writeFile(DATA_PATH, JSON.stringify(drivers, null, 2));
      res.status(201).json({ message: "New Driver Created", driver });
    } catch (error) {
      res.status(500).json({ message: `Server Error: ${error}` });
    }
  }
);

app.listen(PORT, () => console.log(`Server is on: http://localhost:${PORT}`));

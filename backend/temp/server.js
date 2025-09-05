// third-party modules
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

// core modules
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

dotenv.config(); // ✅ Load env first

// directories configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Necessary directories
const DATA_DIR = path.join(__dirname, "public", "data");
const UPLOAD_DIR = path.join(__dirname, "public", "upload");
const SINGERS_DIR = path.join(__dirname, "public", "upload", "singers");

// create directories if missing
for (const dirPath of [DATA_DIR, UPLOAD_DIR, SINGERS_DIR]) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// necessary file paths
const DATA_PATH = path.join(__dirname, "public", "data", "singers.json");

// app configuration
const app = express();
const PORT = process.env.PORT || 3004;

// Middlewares (fixed order)
app.use(cors());
app.use(express.json());
app.use("/singers", express.static(SINGERS_DIR));

/* ************************** MULTER starts *************************** */
const storage = multer.diskStorage({
  destination: (req, singersFile, cb) => {
    cb(null, SINGERS_DIR);
  },
  filename: (req, file, cb) => {
    console.log(req.body.name);
    const ext = path.extname(file.originalname).toLowerCase();
    const fieldName = file.fieldname;
    const date = new Date().toISOString().split("T")[0];
    const randomID = uuidv4().split("-").pop();
    console.log("Body Name: " + req.body.name);
    const rawMainName = req.body.name || "unknown";
    const mainName = rawMainName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
    const fullName = `${mainName}-${fieldName}-${date}-${randomID}${ext}`;
    cb(null, fullName);
  },
});
const MB = 5;
const upload = multer({
  storage,
  limits: { fileSize: MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const types = /jpg|jpeg|png|gif|webp/;
    const testExe = types.test(path.extname(file.originalname).toLowerCase());
    const testMime = types.test(file.mimetype);
    if (!testExe || !testMime) {
      return cb(new Error("Only images are allowed")); // ✅ added return
    }
    cb(null, true);
  },
});
/* ************************** MULTER ends *************************** */

// main routes start
app.post(
  "/api/singers",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { name, spouse } = req.body;
      console.log(req.files);
      console.log(req.files.avatar[0]);
      console.log(req.body);
      const avatarFile =
        req.files && req.files.avatar ? req.files.avatar[0] : null;
      const isMissingValues = Object.values(req.body).some(
        (val) => !val.trim()
      );
      if (isMissingValues) {
        return res.status(400).json({ message: "Server: Bad request" });
      }
      let singers = [];
      try {
        const data = await fs.readFile(DATA_PATH, "utf8");
        singers = data.trim() ? JSON.parse(data) : [];
      } catch (error) {
        if (error.code === "ENOENT") {
          await fs.writeFile(DATA_PATH, "[]");
          singers = [];
        } else {
          throw error;
        }
      }
      const singer = {
        id: uuidv4(),
        avatar: avatarFile ? avatarFile.filename : null,
        name,
        spouse,
      };
      singers.push(singer);
      await fs.writeFile(DATA_PATH, JSON.stringify(singers, null, 2));
      res.status(201).json({ message: "Server: New Singer Added" });
    } catch (error) {
      res.status(500).json({ message: "Server: Bad Request" + error });
    }
  }
);

app.listen(PORT, () => console.log(`Listening to the PORT: ${PORT}`));

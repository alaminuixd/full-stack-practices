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

// 🧩 GLOBAL MIDDLEWARES
app.use(cors());
app.use(express.json());
console.log(cors());

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

// ROUTES
app.get("/", (req, res) => {
  try {
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
});

// MULTER SETUP Starts
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMG_DIR);
  },
  filename: (req, file, cb) => {
    const inputName = req.body.name;
    const extName = path.extname(file.originalname);
    const dateName = new Date().toISOString().split("T")[0];
    const idName = uuidv4().split("-").pop();
    const fullName = `${inputName}-${dateName}-${idName}${extName}`;
    console.log(`inputName: ${inputName}`);
    console.log(file);
    cb(null, fullName);
  },
});
const allowedFileTypes = ["jpg", "jpeg", "png", "gif", "webp"];
const fileTypeRegx = new RegExp(`\\.(${allowedFileTypes.join("|")})$`, "i");
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
// MULTER SETUP Ends

app.post(
  "/api/drivers",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  async (req, res) => {
    const { name, spouse, imgURL } = req.body;
    console.log(upload);
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
        imgURL: "",
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

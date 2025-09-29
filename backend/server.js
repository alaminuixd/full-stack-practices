import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs/promises";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { __root } from "./config/paths.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3005;

// create necessary directories
const UPLOAD_DIR = path.join(__root, "public", "uploads");
const DATA_DIR = path.join(__root, "public", "data");
// actor image folder
const ACTOR_FILES = path.join(UPLOAD_DIR, "singers");
await fs.mkdir(ACTOR_FILES, { recursive: true });
await fs.mkdir(DATA_DIR, { recursive: true });
// data file
const ACTOR_DATA_PATH = path.join(DATA_DIR, "actors.json");

// Middlewares
app.use(express.json());
app.use(cors());
app.use("/actors", express.static(ACTOR_FILES));

// MULTER starts
const maxFileSizeMB = 5;
const allowedFileTypes = ["jpg", "png", "jpeg", "gif", "webp"];
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(ACTOR_FILES, { recursive: true });
    cb(null, ACTOR_FILES);
  },
  filename: (req, file, cb) => {
    const extName = path.extname(file.originalname).toLowerCase();
    const dateName = new Date().toISOString().split("T")[0];
    const idName = uuidv4().split("-").pop();
    const fullName = `${dateName}-${idName}${extName}`;
    cb(null, fullName);
  },
});
const fileTypesRegx = new RegExp(`\\.${allowedFileTypes.join("|")}`, "i");
const upload = multer({
  storage,
  limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      !fileTypesRegx.test(path.extname(file.originalname).toLowerCase()) ||
      !allowedFileTypes.includes(file.mimetype.split("/")[1])
    ) {
      cb(new Error(`Only ${allowedFileTypes.split(", ")} are allowed.`));
    }
    cb(null, true);
  },
});
// MULTER ends

app.post(
  "/api/actors",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  async (req, res) => {
    const { name, spouse, imgURL } = req.body;
    try {
      let actors = [];
      try {
        const data = await fs.readFile(ACTOR_DATA_PATH, "utf8");
        const parsed = data?.trim() ? JSON.parse(data) : [];
        actors = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        if (error.code === "ENOENT") {
          await fs.writeFile(ACTOR_DATA_PATH, "[]");
          actors = [];
        } else {
          throw error;
        }
      }
      const actor = {
        id: uuidv4(),
        name,
        spouse,
        imgURL: req.files.avatar[0].filename,
      };
      actors.push(actor);
      await fs.writeFile(ACTOR_DATA_PATH, JSON.stringify(actors, null, 2));
      res.status(201).json({ message: "New actor created", actor });
    } catch (error) {
      res.status(500).json({ message: "Server error!" });
    }
  }
);

app.listen(PORT, () => console.log(`Listening to the PORT: ${PORT}`));

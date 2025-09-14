// third-party modules
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
// custom modules
import createMissingFolders from "./lib/createMissingFolders.js";
// core modules
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

dotenv.config();
// directories configaratin
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// necesseary folders
const UPLOAD_DIR = path.join(__dirname, "public", "upload");
const DATA_DIR = path.join(__dirname, "public", "data");
const PLAYER_UPLOAD_DIR = path.join(UPLOAD_DIR, "players");
// create missing directories
[PLAYER_UPLOAD_DIR, DATA_DIR].forEach(
  async (DIR) => await fs.mkdir(DIR, { recursive: true })
);

const PLAYERS_DATA_PATH = path.join(DATA_DIR, "players.json");

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(cors());
app.use("/players", express.static(PLAYER_UPLOAD_DIR));
/* -------------------------- MULTER SETUP START------------------------------- */
const maxFileSize = 5;
const fileTypes = ["jpg", "jpeg", "png", "gif", "webp"];
const fileTypesRegx = new RegExp(`\\.(${fileTypes.join("|")})`, "i");
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(PLAYER_UPLOAD_DIR, { recursive: true });
    cb(null, PLAYER_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const fieldName = file.fieldname;
    const inputName = (req.body.name || "unknown")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\-]/g, "")
      .replace(/(^-+|-+$)/g, "")
      .replace(/(^-+||-+$)/g, "-");
    const dateName = new Date().toISOString().split("T")[1];
    const idName = uuidv4().split("-").pop();
    const extName = path.extname(file.originalname).toLowerCase();
    const fullName = `${fieldName}-${inputName}-${dateName}-${idName}${extName}`;
    cb(null, fullName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: maxFileSize * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      !fileTypesRegx.test(fs.extname(file.originalname).toLowerCase()) ||
      !fileTypes.includes(file.mimetype.split("/")[1])
    ) {
      cb(new Error({ message: `Only ${fileTypes.join(", ")} are allowed.` }));
    }
    cb(null, true);
  },
});

app.post(
  "/api/players",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  async (req, res) => {}
);

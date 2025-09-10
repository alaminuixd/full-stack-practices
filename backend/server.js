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
console.log(PLAYER_UPLOAD_DIR);
const PLAYERS_DATA_PATH = path.join(DATA_DIR, "players.json");

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(cors());

/* -------------------------- MULTER SETUP START------------------------------- */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(PLAYER_UPLOAD_DIR, { recursive: true });
    console.log(file);
    cb(null, PLAYER_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const fieldName = file.fieldname;
    const dateName = new Date().toISOString().split("T")[0];
    const idName = uuidv4().split("-").pop();
    const extName = path.extname(file.originalname).toLowerCase();
    const fullName = `${fieldName}-${dateName}-${idName}${extName}`;
    console.log(fullName);
    cb(null, fullName);
  },
});
const upload = multer({ storage });
/* -------------------------- MULTER SETUP END ------------------------------- */

app.post(
  "/api/players",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  (req, res) => {
    try {
      console.log("---------------------------------------------");
      console.log(req.files);
      res.status(201).json({ message: "Server: New player created" });
    } catch (error) {
      res.status(500).json({ message: "Server Error" + error });
    }
  }
);

app.get("/api/players", (req, res) => {
  try {
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error });
  }
});

app.listen(PORT, () => console.log(`Listening to the PORT: ${PORT}`));

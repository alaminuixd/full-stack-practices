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

app.use(express.json());

// create necessary directories
const UPLOAD_DIR = path.join(__root, "public", "uploads");
const DATA_DIR = path.join(__root, "public", "data");
// actor image folder
const ACTOR_FILES = path.join(UPLOAD_DIR, "singers");
await fs.mkdir(ACTOR_FILES, { recursive: true });
await fs.mkdir(DATA_DIR, { recursive: true });

// MULTER starts
const storage = multer.diskStorage({
  destination: (req) => {},
});
// MULTER ends

app.listen(PORT, () => console.log(`Listening to the PORT: ${PORT}`));

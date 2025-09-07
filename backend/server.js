import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs/promises";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// upload file directory
const SINGERS_UPLOAD = path.join(__dirname, "public", "upload", "singers");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3005;
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, SINGERS_UPLOAD);
  },
  filename: (req, file, cb) => {
    const baseName = "basename";
    const ids = uuidv4().split("-").pop();
    const dates = new Date().toISOString().split("T")[0];
    const extName = path.extname(file.originalname).toLowerCase();
    console.log(extName);
    const fullName = `${baseName}-${dates}-${ids}${extName}`;
    cb(null, fullName);
  },
});

const upload = multer({ storage });

app.post("/api/singers", upload.single("avatar"), async (req, res, next) => {
  try {
    res.status(201).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

app.listen(PORT, () => console.log(`Listening to the PORT: ${PORT}`));

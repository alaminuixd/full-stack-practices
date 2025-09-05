// third-party modules
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import createUploader from "./lib/createUploader.js";
import createMissingFolder from "./lib/createMissingFolder.js";
// core modules
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

dotenv.config();
// directories configaration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// necessery directory
const SINGERS_FILE_DIR = path.join(__dirname, "public", "upload", "singers");
const DATA_DIR = path.join(__dirname, "public", "data");
const SINGERS_DATA_URL = path.join(__dirname, "public", "data", "singers.json");
createMissingFolder(DATA_DIR);

const app = express();
const PORT = process.env.PORT || 3005;
app.use(express.json());
app.use(cors());
app.use("/singers", express.static(SINGERS_FILE_DIR));
// multer
const upload = createUploader({
  folder: SINGERS_FILE_DIR,
  maxSizeMB: 3,
  allowedTypes: ["jpg", "jpeg", "png", "gif", "webp"],
});
// POST route
app.post(
  "/api/singers",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  async (req, res) => {
    try {
      const avatarFile =
        req.files && req.files.avatar ? req.files.avatar[0] : null;
      let singers = [];
      try {
        const data = await fs.readFile(SINGERS_DATA_URL, "utf8");
        singers = data.trim() ? JSON.parse(data) : [];
      } catch (error) {
        if (error.code === "ENOENT") {
          await fs.writeFile(SINGERS_DATA_URL, "[]");
          singers = [];
        } else {
          throw error;
        }
      }
      const singer = {
        id: uuidv4(),
        url: avatarFile ? avatarFile.filename : null,
      };
      singers.push(singer);
      await fs.writeFile(SINGERS_DATA_URL, JSON.stringify(singers, null, 2));
      res.status(201).json({ message: "Server: Created new singer" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.get("/", (req, res) => {
  try {
    // throw new Error("Something went wrong");
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`Listening to the PORT: ${PORT}`));

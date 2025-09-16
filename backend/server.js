// third-party modules
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
// custom modules
// import createMissingFolders from "./lib/createMissingFolders.js";
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
      .replace(/(^-+|-+$)/g, "-");
    const dateName = new Date().toISOString().split("T")[0];
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
      !fileTypesRegx.test(path.extname(file.originalname).toLowerCase()) ||
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
  async (req, res) => {
    try {
      const { name, spouse } = req.body;
      if (!name?.trim() || !spouse?.trim()) {
        return res
          .status(400)
          .json({ message: "Server: All fields are required" });
      }
      let players = [];
      try {
        const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
        const parsed = data.trim() ? JSON.parse(data) : [];
        players = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        if (error.code === "ENOENT") {
          await fs.writeFile(PLAYERS_DATA_PATH, "[]");
          players = [];
        } else {
          throw error;
        }
      }
      console.log(req.files);
      const player = {
        id: uuidv4(),
        name,
        spouse,
        imgURL: req.files?.avatar[0].filename || null,
      };
      players.push(player);
      await fs.writeFile(PLAYERS_DATA_PATH, JSON.stringify(players, null, 2));
      res.status(201).json({ message: "player created " + { ...player } });
    } catch (error) {
      res.status(500).json({ message: "Server: error creating player" });
    }
  }
);

app.get("/api/players", async (req, res) => {
  try {
    let players = [];
    try {
      const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
      const parsed = data?.trim() ? JSON.parse(data) : [];
      players = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        players = [];
      } else {
        throw error;
      }
    }
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ message: "Server Error!" });
  }
});

app.get("/api/players/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let players = [];
    try {
      const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
      const parsed = data?.trim() ? JSON.parse(data) : [];
      players = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({ message: "No player found." + error });
      } else {
        throw error;
      }
    }
    const foundPlayer = players.find((p) => String(p.id) === String(id));
    res.status(200).json(foundPlayer);
  } catch (error) {
    res.status(500).json({ message: "Server Error!" });
  }
});

/* app.delete("/api/players/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: `Server: ${id} not found` });
    }
    let players = [];
    try {
      const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
      const parsed = data?.trim() ? JSON.parse(data) : [];
      players = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        return res
          .status(404)
          .json({ message: "Server: Player doesn't exist" });
      } else {
        throw error;
      }
    }
    const playerToDelete = players.find((p) => String(p.id) === String(id));
    if (!playerToDelete) {
      return res.status(404).json({ message: "Server: Player not found" });
    }
    const newPlayers = players.filter((p) => String(p.id) !== String(id));
    await fs.writeFile(PLAYERS_DATA_PATH, JSON.stringify(newPlayers, null, 2));
    // delete image
    if (playerToDelete.imgURL) {
      const deleteImgPath = path.join(PLAYER_UPLOAD_DIR, playerToDelete.imgURL);
      try {
        await fs.unlink(deleteImgPath);
        console.log(deleteImgPath.split("/").pop() + " deleted successfully");
      } catch (error) {
        if (error.code === "ENOENT") {
          console.log("No image found");
        }
      }
    }
    res
      .status(200)
      .json({ message: "Server: Player deleted.", player: playerToDelete });
  } catch (error) {
    res.status(500).json("Server error: " + error);
  }
}); */

app.delete("/api/players/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: "Player id not found!" });
    }
    let players = [];
    try {
      const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
      const parsed = data?.trim() ? JSON.parse(data) : [];
      players = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({ message: "Player not found" });
      } else {
        throw error;
      }
    }
    const playerToDelete = players.find((p) => p.id === id);
    if (!playerToDelete) {
      return res.status(404).json({ message: "Serer: Player not found" });
    }
    const newPlayers = players.filter((p) => p.id !== id);
    await fs.writeFile(PLAYERS_DATA_PATH, JSON.stringify(newPlayers, null, 2));
    if (playerToDelete.imgURL) {
      const imgLink = path.join(PLAYER_UPLOAD_DIR, playerToDelete.imgURL);
      try {
        fs.unlink(imgLink);
      } catch (error) {
        console.log("Server: Error deleting image " + error);
      }
    }
    res
      .status(200)
      .json({ messag: "Server: Player Deleted", player: playerToDelete });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

app.listen(PORT, () => console.log(`Listening to the PORT: ${PORT}`));

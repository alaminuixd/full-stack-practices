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
app.use("/players", express.static(PLAYER_UPLOAD_DIR));
/* -------------------------- MULTER SETUP START------------------------------- */
const maxFileSizeMB = 5;
const fileTypes = ["jpg", "jpeg", "png", "gif", "webp"];
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
    console.log(`Ext name: ${extName}`);
    cb(null, fullName);
  },
});
const fileTypesRegx = new RegExp(`\\.${fileTypes.join("|")}`, "i");
const upload = multer({
  storage,
  limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      !fileTypesRegx.test(path.extname(file.originalname).toLowerCase()) ||
      !fileTypes.includes(file.mimetype.split("/")[1])
    ) {
      cb(new Error("Server: Unexpected file types"));
    }
    cb(null, true);
  },
});
/* -------------------------- MULTER SETUP END ------------------------------- */
// POST Route
app.post(
  "/api/players",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { name, spouse } = req.body;
      if (!name || !spouse) {
        return res
          .status(400)
          .json({ message: "Server: all fields are required!" });
      }
      let players = [];
      try {
        const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
        const parsed = data?.trim() ? JSON.parse(data) : [];
        players = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        if (error.code === "ENOENT") {
          await fs.writeFile(PLAYERS_DATA_PATH, "[]");
          players = [];
        } else {
          throw error;
        }
      }

      const player = {
        id: uuidv4(),
        name,
        spouse,
        imgURL: req.files.avatar[0].filename,
      };
      players.push(player);
      await fs.writeFile(PLAYERS_DATA_PATH, JSON.stringify(players, null, 2));
      res.status(201).json({ message: "Server: New player created" });
    } catch (error) {
      res.status(500).json({ message: "Server Error" + error });
    }
  }
);
// GET Route
app.get("/api/players", async (req, res) => {
  try {
    let players = [];
    try {
      // try to add players data from json
      const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
      const parsed = data.trim() ? JSON.parse(data) : [];
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
    res.status(500).json({ message: "Server Error: " + error.message });
  }
});
// GET Route by id
app.get("/api/players/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let players = [];
    try {
      const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
      const parsed = data.trim() ? JSON.parse(data) : [];
      players = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({ message: "Server: No players found!" });
      } else {
        throw error;
      }
    }
    const player = players.find((p) => p.id === id);
    if (!player) {
      return res.status(404).json({ message: "Server: No player found!" });
    }
    res.status(200).json(player);
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error });
  }
});
// DELETE Route by id
app.delete("/api/players/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let players = [];
    try {
      const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
      const parsed = data?.trim() ? JSON.parse(data) : [];
      players = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({ message: "Server: No players found" });
      } else {
        throw error;
      }
    }
    const playerToDelete = players.find((p) => p.id === id);
    if (!playerToDelete) {
      return res.status(400).json({ message: "Server: No players found" });
    }
    const newPlayers = players.filter((p) => p.id !== id);
    await fs.writeFile(PLAYERS_DATA_PATH, JSON.stringify(newPlayers, null, 2));
    // delete player image from the folder
    if (playerToDelete.imgURL) {
      const imagePath = path.join(PLAYER_UPLOAD_DIR, playerToDelete.imgURL);
      try {
        await fs.unlink(imagePath);
        console.log("Server: image deleted successfully: " + imagePath);
      } catch (error) {
        if (error.code === "ENOENT") {
          console.error("Server: Error deleting file" + error);
        }
      }
    }
    res.status(201).json({ message: "Server: player deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error " + error });
  }
});
// PUT Route by id
app.put("/api/players/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, spouse, imgURL } = req.body;

    if (!name?.trim() || !spouse?.trim() || !imgURL?.trim()) {
      return res
        .status(400)
        .json({ message: "Server: All fields are required." });
    }

    let players = [];
    // File Read & Parse Safety
    try {
      const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
      players = data.trim() ? JSON.parse(data) : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        players = []; // start with an empty list if file doesn’t exist
      } else {
        throw error;
      }
    }

    const playerIndex = players.findIndex((p) => p.id === id);
    if (playerIndex === -1) {
      return res.status(404).json({ message: "Player not found!" });
    }

    players[playerIndex] = { ...players[playerIndex], name, spouse, imgURL };

    await fs.writeFile(PLAYERS_DATA_PATH, JSON.stringify(players, null, 2));

    res.status(200).json({
      message: "Server: Player updated",
      player: players[playerIndex],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server: Internal server error" });
  }
});
// PATCH Route by id
app.patch("/api/players/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, spouse, imgURL } = req.body;

    let players = [];
    try {
      const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
      players = data.trim() ? JSON.parse(data) : [];
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    const player = players.find((p) => p.id === id);

    if (!player) {
      return res.status(404).json({ message: "Server: Player not found!" });
    }

    // Update only provided fields
    if (name !== undefined) player.name = name;
    if (spouse !== undefined) player.spouse = spouse;
    if (imgURL !== undefined) player.imgURL = imgURL;

    await fs.writeFile(PLAYERS_DATA_PATH, JSON.stringify(players, null, 2));

    res.status(200).json({ message: "Server: Player updated.", player });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server: Internal server error" });
  }
});

app.listen(PORT, () => console.log(`Listening to the PORT: ${PORT}`));

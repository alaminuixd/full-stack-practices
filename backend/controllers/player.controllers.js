import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import ROOT_DIR from "../lib/__dirname.js";

// Paths
const UPLOAD_DIR = path.join(ROOT_DIR, "public", "upload");
export const PLAYER_UPLOAD_DIR = path.join(UPLOAD_DIR, "players");
const DATA_DIR = path.join(ROOT_DIR, "public", "data");
export const PLAYERS_DATA_PATH = path.join(DATA_DIR, "players.json");

// CREATE
export const createPlayer = async (req, res) => {
  try {
    const { name, spouse } = req.body;
    if (!name || !spouse)
      return res.status(400).json({ message: "All fields are required" });

    let players = [];
    try {
      const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
      players = JSON.parse(data) || [];
    } catch (err) {
      if (err.code === "ENOENT") await fs.writeFile(PLAYERS_DATA_PATH, "[]");
      else throw err;
    }

    const player = {
      id: uuidv4(),
      name: name.trim(),
      spouse: spouse.trim(),
      imgURL: req.files?.avatar?.[0]?.filename || null,
    };

    players.push(player);
    await fs.writeFile(PLAYERS_DATA_PATH, JSON.stringify(players, null, 2));
    res.status(201).json({ message: "Player created", player });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET ALL
export const getAllPlayers = async (req, res) => {
  try {
    let players = [];
    try {
      const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
      players = JSON.parse(data) || [];
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
    res.status(200).json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET SINGLE
export const getSinglePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
    const players = JSON.parse(data) || [];
    const player = players.find((p) => p.id === id);
    if (!player) return res.status(404).json({ message: "Player not found" });
    res.status(200).json(player);
  } catch (err) {
    if (err.code === "ENOENT")
      return res.status(404).json({ message: "No players found" });
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// REPLACE (PUT)
export const replacePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, spouse, imgURL } = req.body;

    if (!name?.trim() || !spouse?.trim() || !imgURL?.trim())
      return res.status(400).json({ message: "All fields are required" });

    const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
    let players = JSON.parse(data) || [];
    const index = players.findIndex((p) => p.id === id);
    if (index === -1)
      return res.status(404).json({ message: "Player not found" });

    players[index] = {
      ...players[index],
      name: name.trim(),
      spouse: spouse.trim(),
      imgURL,
    };
    await fs.writeFile(PLAYERS_DATA_PATH, JSON.stringify(players, null, 2));

    res.status(200).json({ message: "Player updated", player: players[index] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE (PATCH)
export const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
    let players = JSON.parse(data) || [];
    const player = players.find((p) => p.id === id);
    if (!player) return res.status(404).json({ message: "Player not found" });

    const { name, spouse, imgURL } = req.body;
    if (name !== undefined) player.name = name.trim();
    if (spouse !== undefined) player.spouse = spouse.trim();
    if (imgURL !== undefined) player.imgURL = imgURL;

    await fs.writeFile(PLAYERS_DATA_PATH, JSON.stringify(players, null, 2));
    res.status(200).json({ message: "Player updated", player });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
export const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(PLAYERS_DATA_PATH, "utf8");
    let players = JSON.parse(data) || [];
    const player = players.find((p) => p.id === id);
    if (!player) return res.status(404).json({ message: "Player not found" });

    players = players.filter((p) => p.id !== id);
    await fs.writeFile(PLAYERS_DATA_PATH, JSON.stringify(players, null, 2));

    // Delete image file
    if (player.imgURL) {
      const imagePath = path.join(PLAYER_UPLOAD_DIR, player.imgURL);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        /* ignore missing files */
      }
    }

    res.status(200).json({ message: "Player deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

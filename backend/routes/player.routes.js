import { Router } from "express";
import fileUploader from "../lib/file.upload.js";
import { PLAYER_UPLOAD_DIR } from "../controllers/player.controllers.js";
import {
  createPlayer,
  getAllPlayers,
  getSinglePlayer,
  replacePlayer,
  updatePlayer,
  deletePlayer,
} from "../controllers/player.controllers.js";

const playerRouter = Router();

playerRouter.post(
  "/",
  fileUploader({ upload: PLAYER_UPLOAD_DIR, maxFileSize: 5 }).fields([
    { name: "avatar", maxCount: 1 },
  ]),
  createPlayer
);

playerRouter.get("/", getAllPlayers);

playerRouter.get("/:id", getSinglePlayer);

playerRouter.put("/:id", replacePlayer);

playerRouter.patch("/:id", updatePlayer);

playerRouter.delete("/:id", deletePlayer);

export default playerRouter;

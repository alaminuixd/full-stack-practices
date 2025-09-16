import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// custom modules
import playerRouter from "./routes/player.router.js";
import ROOT_DIR from "./lib/__dirname.js";
import { PLAYER_UPLOAD_DIR } from "./controllers/player.controllers.js";
// core modules
import fs from "fs/promises";

dotenv.config();

// create missing directories
await fs.mkdir(PLAYER_UPLOAD_DIR, { recursive: true });
await fs.mkdir(`${ROOT_DIR}/public/data`, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(cors());
app.use("/players", express.static(PLAYER_UPLOAD_DIR));

// ADD router
app.use("/api/players", playerRouter);

app.listen(PORT, () => console.log(`Listening to the PORT: ${PORT}`));

/* 
--root
  --controller
    player.controllers.js
  --lib
    file.upload.js
  --node_modules
  --public
  --routes
    player.router.js
  .env
  package-lock.json
  package.json
  server.js

CODES:
server.js
lib/file.upload.js
controllers/player.controllers.js
routers/player.router.js


*/

// third-party modules
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
// core modules
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

app.listen(PORT, () => console.log(`Listening to the PORT: ${PORT}`));

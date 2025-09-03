import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs/promises";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

app.listen(PORT, () => console.log(`Listening to the PORT: ${PORT}`));

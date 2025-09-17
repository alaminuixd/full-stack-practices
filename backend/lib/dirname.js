import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up one level to the project root
const ROOT_DIR = path.resolve(__dirname, "..");

export default ROOT_DIR;

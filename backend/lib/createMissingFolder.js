import fs from "fs/promises";
export default async function createMissingFolder(dirname) {
  try {
    await fs.access(dirname);
  } catch (error) {
    await fs.mkdir(dirname, { recursive: true });
  }
}

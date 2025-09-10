import fs from "fs/promises";
export default async function createMissingFolders(URL) {
  try {
    await fs.mkdir(URL, { recursive: true });
  } catch (error) {
    throw error;
  }
}

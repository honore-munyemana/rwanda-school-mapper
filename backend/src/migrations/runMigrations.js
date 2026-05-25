import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  const files = fs
    .readdirSync(__dirname)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(__dirname, file), "utf8");
    await pool.query(sql);
    console.log(`Migration applied: ${file}`);
  }
}

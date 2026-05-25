import { runMigrations } from "../src/migrations/runMigrations.js";
import pool from "../src/config/db.js";

async function main() {
  await runMigrations();
  const result = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_name = 'verification_logs'"
  );
  console.log("verification_logs exists:", result.rows.length > 0);
  pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

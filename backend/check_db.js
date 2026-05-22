import pool from "./src/config/db.js";

async function checkSchema() {
  try {
    const verifyRes = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'verification_records' AND column_name = 'user_id'");
    console.table(verifyRes.rows);
  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
}
checkSchema();

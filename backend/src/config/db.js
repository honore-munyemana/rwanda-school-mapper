import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ssevms",
  password: "postgres123",
  port: 5432,
});

export default pool;
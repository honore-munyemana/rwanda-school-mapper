import pool from "../src/config/db.js";

const BASE = "http://localhost:5000";

async function main() {
  const schoolRes = await pool.query(
    `SELECT id, ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
     FROM schools ORDER BY id DESC LIMIT 1`
  );
  if (schoolRes.rows.length === 0) {
    console.log("No schools in DB");
    pool.end();
    return;
  }

  const { id, lat, lng } = schoolRes.rows[0];
  const validatorEmail = `audit_test_validator_${Date.now()}@ssevms.com`;
  const password = "123456";

  await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Audit Test Validator",
      email: validatorEmail,
      password,
      role: "validator",
    }),
  });

  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: validatorEmail, password }),
  });
  const { token } = await loginRes.json();

  const verifyRes = await fetch(`${BASE}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      school_id: id,
      latitude: Number(lat),
      longitude: Number(lng),
      notes: "Audit trail test",
    }),
  });
  const verifyBody = await verifyRes.json();
  console.log("POST /verify:", verifyRes.status, verifyBody);

  const logs = await pool.query(
    "SELECT * FROM verification_logs ORDER BY id DESC LIMIT 1"
  );
  console.log("Latest verification_log:", logs.rows[0] ?? "none");

  pool.end();
}

main().catch((e) => {
  console.error(e);
  pool.end();
  process.exit(1);
});

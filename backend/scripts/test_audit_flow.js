import pool from "../src/config/db.js";

const BASE = "http://localhost:5000";

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${email}: ${data.error || res.status}`);
  return data.token;
}

async function main() {
  const testAdminEmail = `audit_test_admin_${Date.now()}@ssevms.com`;
  const password = "123456";

  await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Audit Test Admin",
      email: testAdminEmail,
      password,
      role: "admin",
    }),
  });

  const adminToken = await login(testAdminEmail, password);
  const mapperToken = await login("mapper@ssevms.com", password);

  const auditAdmin = await fetch(`${BASE}/audit`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("GET /audit admin:", auditAdmin.status);

  const auditMapper = await fetch(`${BASE}/audit`, {
    headers: { Authorization: `Bearer ${mapperToken}` },
  });
  console.log("GET /audit mapper:", auditMapper.status);

  const logCount = await pool.query("SELECT COUNT(*)::int AS count FROM verification_logs");
  console.log("verification_logs rows:", logCount.rows[0].count);

  pool.end();
}

main().catch((e) => {
  console.error(e.message);
  pool.end();
  process.exit(1);
});

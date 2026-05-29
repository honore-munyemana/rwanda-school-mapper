import pool from "../src/config/db.js";

const BASE = "http://localhost:5000";

async function main() {
  console.log("Logging in as mapper...");
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "mapper@ssevms.com", password: "123456" }),
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    throw new Error(loginData.error || "Login failed");
  }
  const token = loginData.token;
  console.log("Login successful. Token acquired.");

  console.log("Fetching /analytics/overview...");
  const overviewRes = await fetch(`${BASE}/analytics/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const overviewData = await overviewRes.json();
  if (!overviewRes.ok) {
    throw new Error(overviewData.error || "Overview fetch failed");
  }
  console.log("Overview data response:", overviewData);

  console.log("Fetching /analytics/districts...");
  const districtsRes = await fetch(`${BASE}/analytics/districts`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const districtsData = await districtsRes.json();
  if (!districtsRes.ok) {
    throw new Error(districtsData.error || "Districts fetch failed");
  }
  console.log("Districts data response:", districtsData);

  console.log("Querying database directly for verification...");
  
  // Total query
  const totalDb = await pool.query("SELECT COUNT(*)::int AS count FROM schools");
  const expectedTotal = totalDb.rows[0].count;

  // Internet query
  const internetDb = await pool.query("SELECT COUNT(*)::int AS count FROM schools WHERE has_internet = true");
  const expectedInternet = internetDb.rows[0].count;

  // Avg smart score
  const avgDb = await pool.query("SELECT COALESCE(ROUND(AVG(smart_score), 2), 0)::float AS avg_score FROM schools");
  const expectedAvg = avgDb.rows[0].avg_score;

  console.log("Comparing values:");
  console.log(`- totalSchools: API=${overviewData.totalSchools}, DB=${expectedTotal}`);
  console.log(`- schoolsWithInternet: API=${overviewData.schoolsWithInternet}, DB=${expectedInternet}`);
  console.log(`- averageSmartScore: API=${overviewData.averageSmartScore}, DB=${expectedAvg}`);

  if (
    overviewData.totalSchools !== expectedTotal ||
    overviewData.schoolsWithInternet !== expectedInternet ||
    overviewData.averageSmartScore !== expectedAvg
  ) {
    throw new Error("Verification failed! Mismatch between database and API output.");
  }

  console.log("SUCCESS! API results match database aggregation query perfectly.");
  pool.end();
}

main().catch((err) => {
  console.error("Test failed:", err);
  pool.end();
  process.exit(1);
});

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

  const uniqueName = `Smart Test School ${Date.now()}`;
  console.log(`Submitting new school: ${uniqueName}...`);
  const submitRes = await fetch(`${BASE}/schools`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: uniqueName,
      district: "Gasabo",
      latitude: -1.944,
      longitude: 30.061,
      has_internet: true,
      has_smart_classroom: true,
      has_playground: false,
      has_electricity: true,
    }),
  });

  const submitData = await submitRes.json();
  if (!submitRes.ok) {
    throw new Error(submitData.error || "School submission failed");
  }
  console.log("Submission response:", submitData);

  console.log("Verifying DB record...");
  const dbRes = await pool.query(
    "SELECT name, district, has_internet, has_smart_classroom, has_playground, has_electricity, smart_score FROM schools WHERE name = $1",
    [uniqueName]
  );

  if (dbRes.rows.length === 0) {
    throw new Error("School not found in database!");
  }

  const school = dbRes.rows[0];
  console.log("DB Record found:", school);

  const expectedScore = 3;
  if (
    school.has_internet !== true ||
    school.has_smart_classroom !== true ||
    school.has_playground !== false ||
    school.has_electricity !== true ||
    school.smart_score !== expectedScore
  ) {
    throw new Error(`Verification failed! Expected: has_internet=true, has_smart_classroom=true, has_playground=false, has_electricity=true, smart_score=${expectedScore}`);
  }

  console.log("SUCCESS! All values persisted and verified correctly.");
  pool.end();
}

main().catch((err) => {
  console.error("Test failed:", err);
  pool.end();
  process.exit(1);
});

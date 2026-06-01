import pool from "../src/config/db.js";

const BASE = "http://localhost:5000";

async function main() {
  console.log("=== STARTING REPORT MODULE BACKEND INTEGRATION TESTS ===");

  // 1. Authenticate to get a token
  console.log("\n1. Logging in as mapper...");
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "mapper@ssevms.com", password: "123456" }),
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginData.error || loginRes.status}`);
  }
  const token = loginData.token;
  console.log("Login successful. Token acquired.");

  const headers = { Authorization: `Bearer ${token}` };

  // Helper function to test endpoint and print results
  const testEndpoint = async (name, url, expectedStatus = 200) => {
    console.log(`\n--- Testing: ${name} (${url}) ---`);
    const res = await fetch(`${BASE}${url}`, { headers });
    const status = res.status;
    const body = await res.json();
    console.log(`Status code: ${status} (expected: ${expectedStatus})`);
    console.log("Response body:", JSON.stringify(body, null, 2));
    
    if (status !== expectedStatus) {
      throw new Error(`Endpoint ${url} failed with status ${status}`);
    }
    return body;
  };

  // 2. Test GET /reports/summary
  const summary = await testEndpoint("GET /reports/summary", "/reports/summary");
  
  // Verify required fields in summary
  const requiredSummaryFields = [
    "totalSchools", "verifiedSchools", "unverifiedSchools", 
    "averageSmartScore", "schoolsWithInternet", "schoolsWithElectricity",
    "schoolsWithPlayground", "schoolsWithSmartClassroom",
    "internetPercentage", "electricityPercentage", "playgroundPercentage",
    "smartClassroomPercentage", "scoreDistribution"
  ];
  for (const field of requiredSummaryFields) {
    if (summary[field] === undefined) {
      throw new Error(`Missing required field '${field}' in summary response`);
    }
  }
  console.log("✓ GET /reports/summary schema verified successfully.");

  // 3. Test GET /reports/districts
  const districts = await testEndpoint("GET /reports/districts", "/reports/districts");
  if (!Array.isArray(districts)) {
    throw new Error("GET /reports/districts did not return an array");
  }
  console.log("✓ GET /reports/districts returned an array of size:", districts.length);

  // 4. Test GET /reports/audit
  const audit = await testEndpoint("GET /reports/audit", "/reports/audit");
  if (!Array.isArray(audit)) {
    throw new Error("GET /reports/audit did not return an array");
  }
  console.log("✓ GET /reports/audit returned logs array of size:", audit.length);

  // 5. Test GET /reports/schools/:id
  // First, query a valid school ID from the DB
  const schoolDb = await pool.query("SELECT id, name FROM schools LIMIT 1");
  if (schoolDb.rows.length > 0) {
    const validId = schoolDb.rows[0].id;
    const schoolName = schoolDb.rows[0].name;
    const schoolDetails = await testEndpoint(
      `GET /reports/schools/${validId} (Valid School: ${schoolName})`,
      `/reports/schools/${validId}`
    );
    
    const requiredSchoolFields = [
      "id", "name", "district", "status", "has_internet", 
      "has_smart_classroom", "has_playground", "has_electricity", 
      "smart_score", "latitude", "longitude"
    ];
    for (const field of requiredSchoolFields) {
      if (schoolDetails[field] === undefined) {
        throw new Error(`Missing required field '${field}' in school details response`);
      }
    }
    console.log(`✓ GET /reports/schools/${validId} details schema verified successfully.`);
  } else {
    console.log("No schools in database, skipping valid school detail check.");
  }

  // Test with an invalid / non-existent ID
  await testEndpoint("GET /reports/schools/99999 (Non-existent)", "/reports/schools/99999", 404);
  console.log("✓ GET /reports/schools/99999 returned 404 as expected.");

  console.log("\n=== ALL REPORT MODULE TESTS PASSED SUCCESSFULLY ===");
  pool.end();
}

main().catch((err) => {
  console.error("\n❌ Test Suite Failed:", err.message);
  pool.end();
  process.exit(1);
});

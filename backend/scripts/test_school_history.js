const BASE = "http://localhost:5000";

async function main() {
  const noAuth = await fetch(`${BASE}/schools/1/history`);
  console.log("GET /schools/1/history (no auth):", noAuth.status);

  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "mapper@ssevms.com", password: "123456" }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    throw new Error(loginData.error || "Login failed");
  }

  const withAuth = await fetch(`${BASE}/schools/1/history`, {
    headers: { Authorization: `Bearer ${loginData.token}` },
  });
  const body = await withAuth.json();
  console.log("GET /schools/1/history (with auth):", withAuth.status);
  console.log("Response:", JSON.stringify(body));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

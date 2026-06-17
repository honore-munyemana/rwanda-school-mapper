import pool from "../src/config/db.js";
import bcrypt from "bcrypt";

const BASE = "http://localhost:5000";

async function main() {
  console.log("=== STARTING SECURITY & ACTIVATION INTEGRATION TEST ===");

  const adminEmail = `admin_inviter_${Date.now()}@ssevms.com`;
  const mapperEmail = `invited_mapper_${Date.now()}@ssevms.com`;

  // 1. Register admin user
  console.log("\n1. Registering Admin user...");
  const regAdminRes = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Admin Inviter",
      email: adminEmail,
      password: "AdminPassword123",
      role: "admin",
    }),
  });
  console.log("Register Admin Status:", regAdminRes.status);

  // 2. Login as admin
  console.log("\n2. Logging in as Admin...");
  const loginAdminRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: "AdminPassword123" }),
  });
  const adminData = await loginAdminRes.json();
  const adminToken = adminData.token;
  console.log("Login Admin Status:", loginAdminRes.status, adminToken ? "Token obtained" : "No token");

  // 3. Invite a user (POST /users)
  console.log(`\n3. Admin inviting user ${mapperEmail}...`);
  const inviteRes = await fetch(`${BASE}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: "Invited Mapper",
      email: mapperEmail,
      role: "mapper",
    }),
  });
  const inviteBody = await inviteRes.json();
  console.log("Invite User Status:", inviteRes.status, inviteBody);

  // 4. Try to invite duplicate user
  console.log("\n4. Trying to invite the same user again...");
  const dupInviteRes = await fetch(`${BASE}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: "Invited Mapper",
      email: mapperEmail,
      role: "mapper",
    }),
  });
  const dupInviteBody = await dupInviteRes.json();
  console.log("Duplicate Invite Status (Expected 400):", dupInviteRes.status, dupInviteBody);

  // 5. Try login before activation
  console.log("\n5. Attempting to login as unactivated user...");
  const unactLoginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: mapperEmail, password: "SomeRandomPassword" }),
  });
  const unactLoginBody = await unactLoginRes.json();
  console.log("Unactivated Login Status (Expected 403):", unactLoginRes.status, unactLoginBody);

  // 6. Get activation token from DB
  const userRowRes = await pool.query("SELECT * FROM users WHERE email = $1", [mapperEmail]);
  const user = userRowRes.rows[0];
  console.log("\n6. Retrieved unactivated user row from DB.");
  console.log("Is Verified:", user.is_verified);
  console.log("Activation Token:", user.activation_token ? "Exists" : "Null");
  console.log("OTP Code Exists:", user.otp_code ? "Yes" : "No");

  // Update OTP in database to a known value ("111111")
  const testOtp = "111111";
  const hashedTestOtp = await bcrypt.hash(testOtp, 10);
  await pool.query("UPDATE users SET otp_code = $1, otp_attempts = 0 WHERE id = $2", [hashedTestOtp, user.id]);
  console.log("Updated OTP code in DB to hashed '111111' for testing.");

  // 7. Verify attempt limiting
  console.log("\n7. Verifying OTP attempt limiting...");
  for (let i = 1; i <= 5; i++) {
    const actFailRes = await fetch(`${BASE}/auth/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: user.activation_token,
        otp: "wrong",
        password: "NewSecurePassword123",
      }),
    });
    const actFailBody = await actFailRes.json();
    console.log(`Attempt ${i} Status:`, actFailRes.status, actFailBody);
  }

  // 8. Resend Activation
  console.log("\n8. Requesting resend of activation...");
  const resendRes = await fetch(`${BASE}/auth/resend-activation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: mapperEmail }),
  });
  const resendBody = await resendRes.json();
  console.log("Resend Activation Status (Expected 200):", resendRes.status, resendBody);

  // Get new token
  const updatedUserRes = await pool.query("SELECT * FROM users WHERE email = $1", [mapperEmail]);
  const updatedUser = updatedUserRes.rows[0];
  console.log("New Activation Token:", updatedUser.activation_token ? "Exists & Changed" : "Null");

  // Update new OTP to "222222"
  const newTestOtp = "222222";
  const hashedNewOtp = await bcrypt.hash(newTestOtp, 10);
  await pool.query("UPDATE users SET otp_code = $1, otp_attempts = 0 WHERE id = $2", [hashedNewOtp, updatedUser.id]);
  console.log("Updated new OTP code in DB to hashed '222222' for testing.");

  // 9. Password strength test
  console.log("\n9. Testing password strength validation...");
  const weakPasswordRes = await fetch(`${BASE}/auth/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: updatedUser.activation_token,
      otp: newTestOtp,
      password: "weak", // fails min 8 chars
    }),
  });
  const weakPasswordBody = await weakPasswordRes.json();
  console.log("Weak Password Status (Expected 400):", weakPasswordRes.status, weakPasswordBody);

  const missingTypesRes = await fetch(`${BASE}/auth/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: updatedUser.activation_token,
      otp: newTestOtp,
      password: "lowercaseanduppercase", // fails number requirement
    }),
  });
  const missingTypesBody = await missingTypesRes.json();
  console.log("No Number Password Status (Expected 400):", missingTypesRes.status, missingTypesBody);

  // 10. Successful activation
  console.log("\n10. Activating account with strong password...");
  const activateSuccessRes = await fetch(`${BASE}/auth/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: updatedUser.activation_token,
      otp: newTestOtp,
      password: "SecurePassword123",
    }),
  });
  const activateSuccessBody = await activateSuccessRes.json();
  console.log("Activation Success Status (Expected 200):", activateSuccessRes.status, activateSuccessBody);

  // Verify DB cleanup
  const finalUserRes = await pool.query("SELECT * FROM users WHERE email = $1", [mapperEmail]);
  const finalUser = finalUserRes.rows[0];
  console.log("\n11. Verifying DB state after activation...");
  console.log("Is Verified:", finalUser.is_verified);
  console.log("Activation Token:", finalUser.activation_token);
  console.log("OTP Code:", finalUser.otp_code);
  console.log("OTP Attempts:", finalUser.otp_attempts);

  // 12. Login normally
  console.log("\n12. Attempting normal login as newly activated user...");
  const finalLoginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: mapperEmail, password: "SecurePassword123" }),
  });
  const finalLoginBody = await finalLoginRes.json();
  console.log("Final Login Status (Expected 200):", finalLoginRes.status, finalLoginBody.token ? "Success! Token returned" : "Failed");

  pool.end();
  console.log("\n=== INTEGRATION TEST COMPLETED ===");
}

main().catch((e) => {
  console.error("Test error:", e);
  pool.end();
  process.exit(1);
});

import { sendActivationEmail } from "../src/utils/mailer.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFilePath = path.join(__dirname, "../logs/email-logs.txt");

async function main() {
  console.log("=== STARTING SMTP FALLBACK VERIFICATION TEST ===");

  // 1. Set intentionally invalid SMTP credentials in the environment
  process.env.SMTP_HOST = "invalid.smtp.host.local.ssevms";
  process.env.SMTP_PORT = "25";
  process.env.SMTP_USER = "baduser";
  process.env.SMTP_PASS = "badpassword";
  process.env.SMTP_FROM = "no-reply@ssevms.com";
  process.env.NODE_ENV = "development"; // Ensure we print details for development

  console.log("Set SMTP_HOST to:", process.env.SMTP_HOST);

  // Remove existing log file if it exists, to verify it gets recreated
  if (fs.existsSync(logFilePath)) {
    console.log("Clearing existing email-logs.txt to ensure clean verification...");
    fs.unlinkSync(logFilePath);
  }

  // 2. Call sendActivationEmail
  const testEmail = "test_fallback_user@example.com";
  const testName = "Fallback Tester";
  const testRole = "validator";
  const testToken = "abc123fallbacktoken";
  const testOtp = "999888";

  console.log(`\nTriggering sendActivationEmail for ${testEmail} (SMTP should fail)...`);
  
  // This must complete without throwing any exception
  await sendActivationEmail(testEmail, testName, testRole, testToken, testOtp);

  // 3. Verify directory and log file creation
  console.log("\nVerifying email-logs.txt was created and has content...");
  if (!fs.existsSync(logFilePath)) {
    throw new Error("Log file was not created at backend/logs/email-logs.txt!");
  }

  const logsContent = fs.readFileSync(logFilePath, "utf8");
  console.log("Found log file content:\n------------------------------------------------");
  console.log(logsContent);
  console.log("------------------------------------------------");

  if (!logsContent.includes(testEmail) || !logsContent.includes(testOtp)) {
    throw new Error("Log file content does not match the test email or OTP!");
  }

  // 4. Test production masking
  console.log("\nSwitching NODE_ENV to production to verify credential masking...");
  process.env.NODE_ENV = "production";
  
  const prodEmail = "prod_masked_user@example.com";
  const prodOtp = "111222";
  
  await sendActivationEmail(prodEmail, testName, testRole, testToken, prodOtp);
  
  const updatedLogsContent = fs.readFileSync(logFilePath, "utf8");
  console.log("\nFound log file content (after production run):\n------------------------------------------------");
  console.log(updatedLogsContent);
  console.log("------------------------------------------------");
  
  if (updatedLogsContent.includes(prodOtp)) {
    throw new Error("Security Violation: OTP was written to logs in production mode!");
  }
  
  if (updatedLogsContent.includes("Details masked in production")) {
    console.log("✓ Correctly masked sensitive details in production mode!");
  }

  console.log("\n=== SMTP FALLBACK VERIFICATION TEST COMPLETED SUCCESSFULLY ===");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

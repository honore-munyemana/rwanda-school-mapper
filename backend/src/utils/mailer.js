import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, "../../logs");
const logFilePath = path.join(logsDir, "email-logs.txt");

/**
 * Logs the development email to the console and to backend/logs/email-logs.txt.
 * Exposes OTP and activation links only in development/test environments.
 * Masked in production.
 */
export function logDevelopmentEmail(email, name, role, activationToken, otpCode) {
  try {
    // 1. Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const activationLink = `${frontendUrl}/activate?token=${activationToken}`;

    const roleLabels = {
      admin: "Administrator",
      validator: "Validator",
      mapper: "Mapper",
    };
    const roleLabel = roleLabels[role] || role;

    const env = process.env.NODE_ENV || "development";
    const dateStr = new Date().toISOString();

    const isProd = env === "production";

    if (isProd) {
      // Production fallback output (MASKED)
      console.log("\n==========================================================");
      console.log("SSEVMS DEVELOPMENT EMAIL (FALLBACK MODE)");
      console.log("==========================================================");
      console.log("STATUS: SMTP Transmission Failed (Fallback Mode Activated)");
      console.log(`ENVIRONMENT: ${env}`);
      console.log(`DATE/TIME: ${dateStr}`);
      console.log(`TO: ${email}`);
      console.log(`ROLE: ${roleLabel}`);
      console.log("\nSECURITY NOTE:");
      console.log("Sensitive data (OTP and Activation Link) is hidden in production mode.");
      console.log("==========================================================\n");

      // Append entry to log file (MASKED)
      const logEntry = `Date: ${dateStr}
Environment: ${env}
To: ${email}
Role: ${roleLabel}
Status: Fallback Activated (Details masked in production)
------------------------------------------------\n`;
      fs.appendFileSync(logFilePath, logEntry, "utf8");
    } else {
      // Development fallback output (VERBOSE)
      console.log("\n==========================================================");
      console.log("SSEVMS DEVELOPMENT EMAIL");
      console.log("==========================================================");
      console.log(`TO: ${email}`);
      console.log(`ROLE: ${roleLabel}`);
      console.log(`ENVIRONMENT: ${env}`);
      console.log(`DATE/TIME: ${dateStr}`);
      console.log("\nACTIVATION LINK:");
      console.log(activationLink);
      console.log("\nOTP:");
      console.log(otpCode);
      console.log("\nOTP expires in: 15 minutes");
      console.log("Activation link expires in: 24 hours");
      console.log("==========================================================\n");

      // Append entry to log file (VERBOSE)
      const logEntry = `Date: ${dateStr}
Environment: ${env}
To: ${email}
Role: ${roleLabel}
Activation Link: ${activationLink}
OTP: ${otpCode}
------------------------------------------------\n`;
      fs.appendFileSync(logFilePath, logEntry, "utf8");
    }
  } catch (err) {
    console.error("Failed to execute logDevelopmentEmail helper:", err);
  }
}

/**
 * Sends an activation email with the OTP and activation link.
 * Falls back to logDevelopmentEmail if SMTP settings are not configured or if sending fails.
 */
export async function sendActivationEmail(email, name, role, activationToken, otpCode) {
  try {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || `"SSEVMS Control System" <no-reply@ssevms.com>`;

    const roleLabels = {
      admin: "Administrator",
      validator: "Validator",
      mapper: "Mapper",
    };
    const roleLabel = roleLabels[role] || role;

    // Check if SMTP configuration is missing
    if (!host || !user) {
      console.warn("SMTP settings are missing from environmental variables. Falling back to development mode.");
      logDevelopmentEmail(email, name, role, activationToken, otpCode);
      return;
    }

    // Attempt SMTP mail delivery
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const activationLink = `${frontendUrl}/activate?token=${activationToken}`;

    const subject = "Activate Your SSEVMS Account";
    
    const textContent = `
Hello ${name},

You have been invited to join the SSEVMS School Mapping Portal as a ${roleLabel}.

To activate your account, please click the link below or copy and paste it into your browser:
${activationLink}

Use the following one-time password (OTP) code to verify your identity:
OTP Code: ${otpCode}

Please note:
- This OTP code is valid for 15 minutes.
- The activation link will expire in 24 hours.

After entering the OTP, you will be prompted to set your own password.

If you did not request this invitation, please ignore this email.

Best regards,
SSEVMS System Administration
`;

    const htmlContent = `
      <div style="font-family: sans-serif; background-color: #070C11; color: #EEE8DC; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #1f2d3d;">
        <div style="text-align: center; border-bottom: 2px solid #C4622D; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: white; font-size: 24px; margin: 0; font-style: italic; text-transform: uppercase;">SSEVMS <span style="color: #D4A847;">Activation</span></h1>
          <p style="color: #8A9BAD; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">Ministry of Education • School Mapping Portal</p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        
        <p style="font-size: 14px; line-height: 1.6;">
          You have been invited to join the SSEVMS System as a <strong>${roleLabel}</strong>. 
          Please activate your account and set your secure password.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationLink}" style="display: inline-block; background-color: #C4622D; color: white; text-decoration: none; padding: 12px 24px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; border-radius: 4px; transition: background-color 0.2s;">
            Activate Account
          </a>
        </div>
        
        <p style="font-size: 12px; color: #8A9BAD; margin-bottom: 5px;">Alternatively, copy and paste this link in your browser:</p>
        <p style="font-size: 11px; font-family: monospace; background-color: rgba(0,0,0,0.4); padding: 10px; border: 1px solid rgba(255,255,255,0.05); color: #D4A847; word-break: break-all;">
          ${activationLink}
        </p>

        <div style="background-color: rgba(196,98,45,0.1); border-left: 4px solid #C4622D; padding: 15px; margin: 30px 0; border-radius: 0 4px 4px 0;">
          <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8A9BAD; font-weight: bold;">One-Time Password (OTP)</p>
          <p style="margin: 0; font-size: 28px; font-family: monospace; font-weight: bold; color: white; letter-spacing: 2px;">${otpCode}</p>
        </div>

        <div style="font-size: 11px; color: #8A9BAD; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; margin-top: 30px; line-height: 1.5;">
          <p style="margin: 0 0 5px 0;">⏰ <strong>Security Timers:</strong></p>
          <ul style="margin: 0; padding-left: 15px;">
            <li>One-Time Password (OTP) expires in <strong>15 minutes</strong>.</li>
            <li>Activation link expires in <strong>24 hours</strong>.</li>
          </ul>
          <p style="margin: 15px 0 0 0; font-style: italic;">If you did not request this invitation, please ignore this email.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    });
    console.log(`Activation email sent successfully to ${email}`);
  } catch (error) {
    console.error(`SMTP transmission failed for ${email}:`, error);
    console.warn("Initiating development fallback output...");
    try {
      logDevelopmentEmail(email, name, role, activationToken, otpCode);
    } catch (fallbackError) {
      console.error("Failed to execute logDevelopmentEmail fallback:", fallbackError);
    }
  }
}

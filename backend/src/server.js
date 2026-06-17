import "dotenv/config";
import schoolRoutes from "./routes/schoolRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import schoolHistoryRoutes from "./routes/schoolHistoryRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import pool from "./config/db.js";
import { runMigrations } from "./migrations/runMigrations.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SSEVMS Backend Running 🚀");
});

const PORT = 5000;

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/schools", schoolRoutes);
app.use("/verify", verifyRoutes);
app.use("/auth", authRoutes);
app.use("/audit", auditRoutes);
app.use("/schools", schoolHistoryRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/reports", reportRoutes);
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);
app.use("/search", searchRoutes);
app.use("/notifications", notificationRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
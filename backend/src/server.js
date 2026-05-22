import "dotenv/config";
import schoolRoutes from "./routes/schoolRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import pool from "./config/db.js";
import express from "express";
import cors from "cors";

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
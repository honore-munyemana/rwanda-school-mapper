import express from "express";
import { register, login, getMe, activate, resendActivation } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/activate", activate);
router.post("/resend-activation", resendActivation);
router.get("/me", authMiddleware, getMe);

router.get("/admin-test", authMiddleware, roleMiddleware("admin"), (req, res) => {
  res.json({ message: "Admin access granted" });
});

export default router;

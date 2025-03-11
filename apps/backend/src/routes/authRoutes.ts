// Code Generated by Sidekick is for learning and experimentation purposes only.
import { Router } from "express";
import { register, login, logout } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);

export default router;

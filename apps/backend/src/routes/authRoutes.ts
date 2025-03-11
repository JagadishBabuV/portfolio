import { Router } from "express";
import {
  register,
  login,
  logout,
  verifyAuth,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { checkExistingSession } from "../middleware/checkExistingSession";

const router = Router();

router.post("/register", checkExistingSession, register);
router.post("/login", checkExistingSession, login);
router.get("/verify", verifyAuth);
router.post("/logout", protect, logout);

export default router;

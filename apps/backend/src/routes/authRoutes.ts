import { Router } from "express";
import {
  register,
  login,
  logout,
  verifyAuth,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", verifyAuth);
router.post("/logout", protect, logout);

export default router;

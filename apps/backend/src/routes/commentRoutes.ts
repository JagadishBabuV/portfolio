import { Router } from "express";
import {
  createComment,
  getCommentsByTaskId,
  getCommentById,
  updateComment,
  deleteComment,
} from "../controllers/commentController";

const router = Router();

router.post("/", createComment);
router.get("/task/:taskId", getCommentsByTaskId);
router.get("/:id", getCommentById);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;

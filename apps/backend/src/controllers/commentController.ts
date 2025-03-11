import { Request, Response } from "express";
import Comment from "../models/comment";

export const createComment = async (req: Request, res: Response) => {
  try {
    const { taskId, content } = req.body;
    const comment = await Comment.create({ taskId, content });
    res.status(201).json(comment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCommentsByTaskId = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.findAll({
      where: { taskId: req.params.taskId },
    });
    res.status(200).json(comments);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCommentById = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (comment) {
      res.status(200).json(comment);
    } else {
      res.status(404).json({ error: "Comment not found" });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const [updated] = await Comment.update(
      { content },
      {
        where: { id: req.params.id },
      }
    );
    if (updated) {
      const updatedComment = await Comment.findByPk(req.params.id);
      res.status(200).json(updatedComment);
    } else {
      res.status(404).json({ error: "Comment not found" });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const deleted = await Comment.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Comment not found" });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

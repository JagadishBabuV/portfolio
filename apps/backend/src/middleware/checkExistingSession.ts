import { Request, Response, NextFunction } from "express";
import { pgPool } from "../app";
import { User } from "../models";

// Middleware to check if user is already logged in
export const checkExistingSession = async (
  req: Request,
  res: Response,
  next: Function
) => {
  const { username } = req.body;
  const user = await User.findOne({ where: { username } });
  if (user) {
    const query = "SELECT sid FROM session WHERE sess::json->>'userId' = $1";
    const result = await pgPool.query(query, [user.get("id")]);
    if (result.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "User already logged in" });
    }
  }
  next();
};

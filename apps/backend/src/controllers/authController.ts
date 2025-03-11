import session from "express-session";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { pgPool } from "../app";

// Extend the session type to include userId
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const generateToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};




export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  try {
    const user = await User.create({ username, password });
    // req.session.userId = user.id; // Store user ID in session
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        token: generateToken(user.id),
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }
    req.session.userId = user.id; // Store user ID in session
    res.cookie("token", generateToken(user.id), { httpOnly: true });
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        token: generateToken(user.id),
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false, error: "Failed to logout" });
      return;
    }
    res.cookie("token", "", { expires: new Date(0) });
    res.clearCookie("connect.sid");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
};

export const verifyAuth = (req: Request, res: Response) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    res.status(200).json({ message: "Authenticated", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

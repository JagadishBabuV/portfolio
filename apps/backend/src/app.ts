import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { connectDB } from "./config/db";
import { initModels } from "./models";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import commentRoutes from "./routes/commentRoutes";
import dotenv from "dotenv";
import { protect } from "./middleware/authMiddleware";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { Pool } from "pg";

dotenv.config();

const app = express();
const PgSession = connectPgSimple(session);

export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // You might need this for Supabase
  },
});

// Connect to database
connectDB();
initModels();

// Disable 'X-Powered-By' header
app.disable("x-powered-by");

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set secure: true in production
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", protect, taskRoutes);
app.use("/api/comments", protect, commentRoutes);
app.get("/status", (req, res) => {
  res.json({ status: "ok" });
});

// Middleware to generate nonce and set CSP header
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = nonce;
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; img-src 'self' data:; font-src 'self'; connect-src 'self'`
  );
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../../client/dist")));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get("*", (req, res) => {
  const nonce = res.locals.nonce;
  const indexPath = path.join(__dirname, "../../client/dist", "index.html");
  let indexHtml = fs.readFileSync(indexPath, "utf8");
  indexHtml = indexHtml.replace(/{{nonce}}/g, nonce);
  res.send(indexHtml);
});

export default app;

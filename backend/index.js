import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.js";
import postRoute from "./routes/post.js";
import messageRoute from "./routes/message.js";
import bodyParser from "body-parser";
import { app, server } from "./socket/socket.js";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const port = process.env.PORT || 3000;

// -------------------- MIDDLEWARES --------------------
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// -------------------- CORS (FINAL & SAFE) --------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://conne-xion-7n7ewcmur-free-lucis-projects.vercel.app", // frontend render URL
].filter(Boolean); // 🔥 removes undefined safely

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ❌ REMOVE THIS (very important)
app.options("*", cors());

// -------------------- ROUTES --------------------
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// -------------------- HEALTH CHECK --------------------
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Backend running" });
});

// -------------------- SERVER --------------------
server.listen(port, () => {
  connectDB();
  console.log(`🚀 Server listening on port ${port}`);
});

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";

dotenv.config();

async function startServer() {
  const app = express();

  await connectDB();

  const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
  ];

  console.log("CLIENT_URL:", process.env.CLIENT_URL);

  app.use((req, res, next) => {
    console.log("Origin:", req.headers.origin);
    next();
  });

  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json({ limit: "5mb" }));

  app.use("/api/users", userRoutes);
  app.use("/api/interviews", interviewRoutes);
  app.use("/api/questions", questionRoutes);
  app.use("/api/results", resultRoutes);

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);

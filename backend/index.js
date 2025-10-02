import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import interviewRoutes from "./routes/interview.routes.js";
import authRoutes from "./routes/authRoutes.js";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-interview-chat-app.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

app.use("/api", interviewRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Interview Backend API",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      uploadResume: "POST /api/upload-resume",
      generateQuestions: "POST /api/generate-questions",
      evaluateAnswers: "POST /api/evaluate-answers",
      auth: "POST /auth/register, POST /auth/login, etc.",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

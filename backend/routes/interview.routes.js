import express from "express";
import multer from "multer";
import { InterviewController } from "../controllers/interview.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX files are allowed."));
    }
  },
});

router.get("/health", InterviewController.healthCheck);
router.post(
  "/upload-resume",
  upload.single("resume"),
  InterviewController.uploadResume
);
router.post("/generate-questions", InterviewController.generateQuestions);
router.post("/evaluate-answers", InterviewController.evaluateAnswers);
router.post("/get-all-interview", InterviewController.getAllInterview);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large. Maximum size is 10MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Too many files. Please upload only one file.",
      });
    }
  }

  if (error.message && error.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  res.status(500).json({
    success: false,
    error: "File upload failed. Please try again.",
  });
});

export default router;

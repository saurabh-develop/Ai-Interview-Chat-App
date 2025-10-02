import { ResumeParser } from "../services/resumeParser.js";
import { GeminiService } from "../services/geminiService.js";
import { v4 as uuidv4 } from "uuid";
import Interview from "../models/Interview.js";
import path from "path";
import fs from "fs";
import Resume from "../models/Resume.js";
import User from "../models/User.js";

export class InterviewController {
  static async uploadResume(req, res) {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded. Please select a PDF or DOCX file.",
        });
      }

      const username = req.body.username;
      if (!username) {
        return res
          .status(400)
          .json({ success: false, error: "Username required" });
      }

      const userDoc = await User.findOne({ username });
      if (!userDoc) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      const { buffer, mimetype, originalname, size } = req.file;

      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(mimetype)) {
        return res.status(400).json({
          success: false,
          error: "Invalid file type. Please upload a PDF or DOCX file.",
        });
      }

      const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760;
      if (size > maxSize) {
        return res.status(400).json({
          success: false,
          error: `File too large. Maximum size is ${Math.round(
            maxSize / 1024 / 1024
          )}MB.`,
        });
      }

      const parseResult = await ResumeParser.parseResume(buffer, mimetype);

      // --- Delete previous resume if exists ---
      const existingResume = await Resume.findOne({ user: userDoc._id });
      if (existingResume) {
        const oldFilePath = path.join(
          process.cwd(),
          "uploads",
          path.basename(existingResume.fileUrl)
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
        await Resume.deleteOne({ _id: existingResume._id });
      }

      // Save new file to uploads
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

      const uniqueFileName = `${uuidv4()}-${originalname}`;

      const filePath = path.join(uploadDir, uniqueFileName);
      fs.writeFileSync(filePath, buffer);
      // Generate download link
      const fileUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/${uniqueFileName}`;

      const resumeDoc = new Resume({
        user: userDoc._id,
        fileUrl,
        extracted: {
          name: parseResult.name,
          email: parseResult.email,
          phone: parseResult.phone,
        },
      });

      await resumeDoc.save();

      const uniqueResumeId = uuidv4();
      res.json({
        success: true,
        data: {
          name: parseResult.name,
          email: parseResult.email,
          phone: parseResult.phone,
          resumeId: resumeDoc._id,
          originalFilename: originalname,
          text: parseResult.text,
          fileSize: size,
          fileType: mimetype,
        },
      });
    } catch (error) {
      console.error("Resume upload error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to process resume. Please try again.",
      });
    }
  }

  static async generateQuestions(req, res) {
    try {
      const { topic, difficulties } = req.body;
      if (!difficulties || !Array.isArray(difficulties)) {
        return res.status(400).json({
          success: false,
          error: "Difficulties array is required",
        });
      }

      const validDifficulties = ["easy", "medium", "hard"];
      const invalidDifficulties = difficulties.filter(
        (d) => !validDifficulties.includes(d)
      );

      if (invalidDifficulties.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid difficulties: ${invalidDifficulties.join(
            ", "
          )}. Use: easy, medium, hard`,
        });
      }

      const questions = await GeminiService.generateQuestions(
        topic || "Full Stack (React/Node)",
        difficulties
      );
      res.json({
        success: true,
        data: {
          questions,
          topic: topic || "Full Stack (React/Node)",
          totalQuestions: questions.length,
        },
      });
    } catch (error) {
      console.error("Question generation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate questions. Please try again.",
      });
    }
  }

  static async evaluateAnswers(req, res) {
    try {
      const { questions, userDetail } = req.body.questions;

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Questions array with at least one item is required",
        });
      }

      const requiredFields = [
        "id",
        "text",
        "difficulty",
        "modelAnswer",
        "candidateAnswer",
      ];

      for (const question of questions) {
        const missingFields = requiredFields.filter(
          (field) => !question[field]
        );
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            error: `Question missing required fields: ${missingFields.join(
              ", "
            )}`,
          });
        }
      }

      const evaluation = await GeminiService.evaluateAnswers(questions);

      const evaluationMap = new Map(
        evaluation.questionEvaluations.map((evalItem) => [
          evalItem.questionId,
          { score: evalItem.score, feedback: evalItem.feedback },
        ])
      );

      const mergedQuestions = questions.map((q) => {
        const evalData = evaluationMap.get(q.id);
        return {
          ...q,
          aiScore: evalData ? evalData.score : null,
          aiFeedback: evalData ? evalData.feedback : "No feedback generated.",
        };
      });

      const username = userDetail.username;
      const userDoc = await User.findOne({ username });

      if (!userDoc) {
        return res.status(404).json({ error: "User not found" });
      }

      const interview = new Interview({
        user: userDoc._id,
        candidateEmail: userDetail.email,
        phone: userDetail.phone,
        score: evaluation.totalScore,
        feedback: evaluation.summary,
        questions: mergedQuestions,
      });

      await interview.save();

      res.json({
        success: true,
        data: {
          totalScore: evaluation.totalScore,
          summary: evaluation.summary,
          questions: mergedQuestions,
          evaluatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Answer evaluation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to evaluate answers. Please try again.",
      });
    }
  }

  static async getAllInterview(req, res) {
    try {
      const { username } = req.body;
      const userDoc = await User.findOne({ username }).lean();

      if (!userDoc) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      // Fetch the logged-in user's resume
      const resumeDoc = await Resume.findOne({ user: userDoc._id }).lean();

      let interviews;

      if (userDoc.role === "candidate") {
        // Candidate sees only their own interviews
        interviews = await Interview.find({ user: userDoc._id })
          .sort({ createdAt: -1 })
          .lean();
      } else {
        // Interviewer sees all interviews
        interviews = await Interview.find().sort({ createdAt: -1 }).lean();

        const userIds = interviews.map((i) => i.user);

        // Fetch all candidates' basic info
        const candidates = await User.find({ _id: { $in: userIds } })
          .select("username email phone")
          .lean();

        // Fetch all candidates' resumes
        const resumes = await Resume.find({ user: { $in: userIds } }).lean();

        // Map candidateId -> candidate info + resume
        const candidateMap = {};
        candidates.forEach((c) => {
          const resume = resumes.find(
            (r) => r.user.toString() === c._id.toString()
          );
          candidateMap[c._id] = {
            ...c,
            resume: resume
              ? { fileUrl: resume.fileUrl, extracted: resume.extracted }
              : null,
          };
        });

        // Attach candidate info (with resume) to each interview
        interviews = interviews.map((i) => ({
          ...i,
          candidateInfo: candidateMap[i.user] || {},
        }));
      }

      return res.json({
        success: true,
        user: {
          username: userDoc.username,
          email: userDoc.email,
          phone: userDoc.phone,
          role: userDoc.role,
          resume: resumeDoc
            ? {
                fileUrl: resumeDoc.fileUrl,
                extracted: resumeDoc.extracted,
                createdAt: resumeDoc.createdAt,
              }
            : null,
        },
        data: interviews,
      });
    } catch (error) {
      console.error("Interview error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch interviews",
      });
    }
  }

  static async healthCheck(req, res) {
    try {
      res.json({
        success: true,
        message: "AI Interview Backend is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Health check failed",
      });
    }
  }
}

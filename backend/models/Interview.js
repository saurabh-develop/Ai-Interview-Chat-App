import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  id: String,
  text: String,
  difficulty: String,
  modelAnswer: String,
  candidateAnswer: String,
  aiScore: Number,
  aiFeedback: String,
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    candidateEmail: {
      type: String,
    },
    phone: {
      type: String,
    },
    score: {
      type: Number,
    },
    feedback: {
      type: String,
    },
    questions: [QuestionSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);

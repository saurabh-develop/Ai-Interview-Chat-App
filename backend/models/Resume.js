import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: { type: String, required: true },
    extracted: {
      name: String,
      email: String,
      phone: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);

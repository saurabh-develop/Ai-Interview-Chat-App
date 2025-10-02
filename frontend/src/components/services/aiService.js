import { apiService } from "./api.js";

export async function generateQuestions() {
  try {
    const difficulties = ["easy", "easy", "medium", "medium", "hard", "hard"];
    const response = await apiService.generateQuestions(
      "Full Stack (React/Node)",
      difficulties
    );

    if (!response.success) {
      throw new Error(response.error || "Failed to generate questions");
    }

    return response.data?.questions || [];
  } catch (err) {
    console.error("Error in generateQuestions:", err);
    throw err;
  }
}

export async function evaluateAnswers(questionsArray, userDetail) {
  try {
    const response = await apiService.evaluateAnswers(
      questionsArray,
      userDetail
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to evaluate answers");
    }
    return response.data;
  } catch (err) {
    console.error("Error in evaluateAnswers:", err);
    throw err;
  }
}

export async function getAllInterviews(username) {
  try {
    const response = await apiService.getAllInterviews(username);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch interviews");
    }
    return response;
  } catch (err) {
    console.error("Error in getAllInterviews:", err);
    throw err;
  }
}

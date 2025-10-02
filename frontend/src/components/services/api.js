const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

class ApiService {
  async request(endpoint, options = {}) {
    try {
      const { headers = {}, body, ...rest } = options;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...headers },
        body: body && typeof body === "object" ? JSON.stringify(body) : body,
        ...rest,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Network error occurred",
      };
    }
  }

  async uploadResume(file, username) {
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("username", username);

      const response = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Resume upload failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  async generateQuestions(
    topic = "Full Stack (React/Node)",
    difficulties = ["easy", "easy", "medium", "medium", "hard", "hard"]
  ) {
    return this.request("/generate-questions", {
      method: "POST",
      body: { topic, difficulties },
    });
  }

  async evaluateAnswers(questionsArray, userDetail) {
    return this.request("/evaluate-answers", {
      method: "POST",
      body: { questions: questionsArray, userDetail },
    });
  }

  async getAllInterviews(username) {
    return this.request("/get-all-interview", {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: { "Content-Type": "application/json" },
    });
  }

  async healthCheck() {
    return this.request("/health");
  }
}

export const apiService = new ApiService();

import { generateContent } from "../config/gemini.js";

export class GeminiService {
  static async generateQuestions(
    topic = "Full Stack (React/Node)",
    difficulties = ["easy", "easy", "medium", "medium", "hard", "hard"]
  ) {
    try {
      const prompt = `
Generate ${
        difficulties.length
      } technical interview questions for a ${topic} developer role.
Requirements:
- Return ONLY a valid JSON array. Each question must have: id, text, difficulty, modelAnswer.
- Difficulties: ${difficulties.join(", ")}.
- Questions should cover key topics for the role. Model answers should be concise but comprehensive.
Generate exactly ${
        difficulties.length
      } questions with difficulties: ${difficulties.join(", ")}
`;
      const response = await generateContent(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch)
        throw new Error("No valid JSON array found in AI response");

      const safeJsonString = jsonMatch[0].replace(/[\u0000-\u001F]+/g, " ");

      const questionsRaw = JSON.parse(safeJsonString);

      return questionsRaw.map((q, index) => ({
        id: q.id || `q${index + 1}`,
        text: q.text || "Question text missing",
        difficulty: difficulties[index] || "medium",
        modelAnswer: q.modelAnswer || "Model answer not provided",
      }));
    } catch (error) {
      console.error("Question generation error:", error);
      return this.getFallbackQuestions(difficulties);
    }
  }

  static async evaluateAnswers(questions) {
    try {
      const questionsAndAnswersString = questions
        .map(
          (q, index) => `
---
Question ${index + 1} (ID: ${q.id}, Difficulty: ${q.difficulty.toUpperCase()})
Text: ${q.text}
Model Answer: ${q.modelAnswer}
Candidate's Answer: ${q.candidateAnswer || "No answer provided"}
---
`
        )
        .join("\n");

      const prompt = `
Act as an expert technical interviewer. Evaluate the candidate's answers for the following questions.

${questionsAndAnswersString}

**Your Task:**
1.  For each question, provide a score from 0 to 10 and brief, constructive feedback (1-2 sentences). Consider accuracy, depth, and clarity relative to the question's difficulty.
2.  After evaluating all questions, provide a concise, professional summary (2-3 sentences) of the candidate's overall performance, highlighting strengths and areas for improvement.

**Output Format:**
Return ONLY a single, valid JSON object. Do not include any other text or formatting. The JSON object must have this exact structure:
{
  "summary": "The overall summary of the candidate's performance...",
  "evaluations": [
    {
      "questionId": "The ID of the first question",
      "score": 10,
      "feedback": "Feedback for the first question..."
    },
    {
      "questionId": "The ID of the second question",
      "score": 8,
      "feedback": "Feedback for the second question..."
    }
  ]
}
`;

      const response = await generateContent(prompt);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON object found in AI response");
      }
      const evaluationResult = JSON.parse(jsonMatch[0]);

      const totalScore = Math.round(
        evaluationResult.evaluations.reduce(
          (sum, evalObj) => sum + evalObj.score,
          0
        ) / evaluationResult.evaluations.length
      );

      return {
        totalScore,
        summary: evaluationResult.summary,
        questionEvaluations: evaluationResult.evaluations,
      };
    } catch (error) {
      console.error("Answer evaluation error:", error);
      return this.getFallbackEvaluation(questions);
    }
  }

  static getFallbackQuestions(difficulties) {
    const questionBank = {
      easy: [
        {
          text: "What is the difference between let, const, and var in JavaScript?",
          modelAnswer:
            "var is function-scoped and can be redeclared, let is block-scoped and can be reassigned, const is block-scoped and cannot be reassigned.",
        },
      ],
      medium: [
        {
          text: "What are React hooks and why were they introduced?",
          modelAnswer:
            "React hooks allow functional components to use state and lifecycle methods, providing a simpler alternative to class components and enabling better code reuse.",
        },
      ],
      hard: [
        {
          text: "Design a scalable architecture for a real-time chat application.",
          modelAnswer:
            "Use WebSockets for real-time communication, Redis for caching and pub/sub, load balancers for distribution, and microservices for scalability.",
        },
      ],
    };
    return difficulties.map((difficulty, index) => {
      const questions = questionBank[difficulty] || questionBank.medium;
      const question = questions[index % questions.length];
      return { id: `q${index + 1}`, ...question, difficulty };
    });
  }

  static getFallbackEvaluation(questions) {
    const questionEvaluations = questions.map((q) => {
      const ans = q.candidateAnswer || "";
      let score = Math.min(
        10,
        Math.floor(ans.length / 20) + Math.floor(ans.split(" ").length / 5)
      );
      return {
        questionId: q.id,
        score,
        feedback:
          score > 7
            ? "Good understanding."
            : score > 4
            ? "Basic understanding."
            : "Needs improvement.",
      };
    });
    const totalScore = Math.round(
      questionEvaluations.reduce((sum, e) => sum + e.score, 0) /
        questionEvaluations.length
    );
    return {
      totalScore,
      summary: `The candidate demonstrated a ${
        totalScore > 7 ? "strong" : totalScore > 4 ? "foundational" : "basic"
      } understanding of the topics.`,
      questionEvaluations,
    };
  }
}

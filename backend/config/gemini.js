import { VertexAI } from "@google-cloud/vertexai";
import dotenv from "dotenv";

dotenv.config();

const credentialsJson = JSON.parse(
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
);

export const client = new VertexAI({
  credentials: credentialsJson,
  projectId: credentialsJson.project_id, 
});

/**
 * Generates content using the Google Vertex AI Gemini model.
 * This function is the central point for all AI interactions in the application.
 * @param {string} prompt The text prompt to send to the model.
 * @param {string} [modelName="gemini-1.5-pro-latest"] The name of the model to use.
 * @returns {Promise<string>} The text response from the AI model.
 */
export const generateContent = async (
  prompt,
  modelName = "gemini-2.5-flash"
) => {
  try {
    const generativeModel = client.getGenerativeModel({ model: modelName });

    const request = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    const result = await generativeModel.generateContent(request);

    if (
      !result.response.candidates ||
      result.response.candidates.length === 0
    ) {
      throw new Error("No valid response candidates found from the AI.");
    }

    const responseText = result.response.candidates[0].content.parts[0].text;
    return responseText;
  } catch (error) {
    console.error("Vertex AI Error:", error);
    throw new Error("Failed to generate content with Vertex AI");
  }
};

import { VertexAI } from "@google-cloud/vertexai";
import dotenv from "dotenv";

dotenv.config();

async function runVertexTest() {
  console.log("--- Starting Vertex AI Test ---");

  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = "us-central1";

  if (!projectId) {
    console.error(
      "ERROR: GOOGLE_CLOUD_PROJECT_ID must be set in your .env file."
    );
    return;
  }

  console.log(`Using Project ID: ${projectId}, Location: ${location}`);

  try {
    const vertex_ai = new VertexAI({ project: projectId, location: location });
    const model = "gemini-2.5-flash";

    const generativeModel = vertex_ai.getGenerativeModel({ model: model });

    console.log(`Requesting content from model: ${model}...`);

    const request = {
      contents: [
        { role: "user", parts: [{ text: "What is the capital of India?" }] },
      ],
    };

    const result = await generativeModel.generateContent(request);
    const responseText = result.response.candidates[0].content.parts[0].text;

    console.log("\n--- VERTEX AI SUCCESS! ---");
    console.log("Response received:", responseText);
  } catch (error) {
    console.error("\n--- VERTEX AI TEST FAILED ---");
    console.error(error);
  }
}

runVertexTest();

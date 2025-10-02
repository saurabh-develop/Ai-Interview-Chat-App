import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { generateContent } from "../config/gemini.js";

export class ResumeParser {
  static async parseFile(buffer, mimetype) {
    try {
      if (!buffer || buffer.length === 0) {
        throw new Error(
          "No file buffer found. Make sure file was uploaded correctly."
        );
      }

      let text = "";

      if (mimetype === "application/pdf") {
        const data = await pdfParse(buffer);
        text = data.text;
      } else if (
        mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } else {
        throw new Error(
          "Unsupported file format. Please upload PDF or DOCX files only."
        );
      }

      if (!text || text.trim().length === 0) {
        throw new Error("No text content found in the uploaded file.");
      }

      return text;
    } catch (error) {
      console.error("File parsing error:", error);
      throw new Error(`Failed to parse file: ${error.message}`);
    }
  }

  static extractContactInfoRegex(text) {
    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
    const phoneRegex = /\+?[0-9\s().-]{7,}/g;

    const emails = text.match(emailRegex);
    const phones = text.match(phoneRegex);

    const lines = text.split("\n").filter((line) => line.trim().length > 0);
    const possibleName = lines[0]?.trim();

    const nameRegex = /^[A-Z][\w.]+(\s+[A-Z][\w.]+)+$/;
    const name =
      possibleName && nameRegex.test(possibleName) ? possibleName : null;

    return {
      name,
      email: emails?.[0] || null,
      phone: phones?.[0] || null,
    };
  }

  // AI-assisted contact extraction with fallback
  static async extractContactInfoAI(text) {
    try {
      const prompt = `
Extract the following information from this resume text and return ONLY a valid JSON object:

{
  "name": "Full Name" or null,
  "email": "email@domain.com" or null,
  "phone": "phone number" or null
}

Rules:
- Return ONLY the JSON object, no extra text
- Use null for missing information
- Clean and format phone numbers consistently
- Extract the primary/first occurrence of each field

Resume text:
${text.substring(0, 4000)}
`;

      const response = await generateContent(prompt);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }

      const extractedData = JSON.parse(jsonMatch[0]);

      return {
        name: extractedData.name || null,
        email: extractedData.email || null,
        phone: extractedData.phone || null,
      };
    } catch (error) {
      console.error("AI extraction error:", error);

      return this.extractContactInfoRegex(text);
    }
  }

  static async parseResume(buffer, mimetype) {
    try {
      const text = await this.parseFile(buffer, mimetype);

      const contactInfo = await this.extractContactInfoAI(text);

      return {
        text,
        ...contactInfo,
        success: true,
      };
    } catch (error) {
      console.error("Resume parsing error:", error);
      throw error;
    }
  }
}

import { apiService } from "./api";

export async function parseResume(file, username) {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Unsupported file format. Please upload a PDF or DOCX file."
    );
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 10MB.");
  }

  const response = await apiService.uploadResume(file, username);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to parse resume");
  }

  return response.data;
}

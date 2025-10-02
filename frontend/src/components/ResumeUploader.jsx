import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { parseResume } from "../components/services/resumeParser.js";
import { useDispatch } from "react-redux";
import { updateProfile } from "../components/store/slices/userSlice.js";

export default function ResumeUploader({ onUploadComplete }) {
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const storedUser = localStorage.getItem("user");
  const user = JSON.parse(storedUser);
  const username = user.username;

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setError(null);
      setUploadedFile(file);

      try {
        const parsedData = await parseResume(file, username);

        dispatch(
          updateProfile({
            name: parsedData.name,
            email: parsedData.email,
            phone: parsedData.phone,
            resumeText: parsedData.text,
            resumeId: file.name,
          })
        );

        onUploadComplete(parsedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse resume");
        setUploadedFile(null);
      } finally {
        setIsUploading(false);
      }
    },
    [dispatch, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
          backdrop-blur-md bg-gray-900/40 border-gray-700 hover:border-blue-400 hover:bg-gray-800/50
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin mx-auto w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-300">Processing resume...</p>
          </div>
        ) : uploadedFile ? (
          <div className="space-y-4">
            <CheckCircle className="w-14 h-14 text-green-400 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-white">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-gray-400">
                Resume uploaded successfully
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-14 h-14 text-gray-400 mx-auto" />
            <div>
              <p className="text-base font-semibold text-white">
                {isDragActive ? "Drop your resume here" : "Upload your resume"}
              </p>
              <p className="text-sm text-gray-400">
                PDF or DOCX files up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-600 rounded-xl flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 flex items-center justify-center space-x-1">
        <FileText className="w-4 h-4 inline" />
        <span>Supported formats: PDF, DOCX</span>
      </div>
    </div>
  );
}

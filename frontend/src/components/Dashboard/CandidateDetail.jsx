import React from "react";
import { X, User, Star, Clock, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ChatWindow from "../ChatWindow/ChatWindow.jsx";
import MessageBubble from "../ChatWindow/MessageBubble.jsx";

export default function CandidateDetail({
  name,
  email,
  phone,
  resumeLink,
  candidate,
  onClose,
  onSubmitAnswer,
  showChat = true,
}) {
  if (!candidate) return null;

  const questions = candidate.questions || [];
  const chatHistory = candidate.chatHistory || [];
  const currentQuestionIndex = candidate.currentQuestionIndex || 0;
  const status = candidate.status || "collecting_info";
  const isLoading = candidate.isLoading || false;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-800/30 text-green-400";
      case "medium":
        return "bg-yellow-800/30 text-yellow-400";
      case "hard":
        return "bg-red-800/30 text-red-400";
      default:
        return "bg-gray-800/30 text-gray-400";
    }
  };

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return "text-gray-400";
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const formatTimeSpent = (ms) => (!ms ? "N/A" : `${Math.round(ms / 1000)}s`);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {name || "Unknown Candidate"}
              </h2>
              {candidate.startTime && (
                <p className="text-sm text-gray-400">
                  Interview started{" "}
                  {formatDistanceToNow(new Date(candidate.startTime), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Profile Info */}
          <div className="w-1/3 border-r border-gray-700 bg-gray-800/30 p-6 overflow-y-auto backdrop-blur-md">
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-white">
                Profile Information
              </h3>
              {name && <p className="text-gray-300">Name: {name}</p>}
              {email && <p className="text-gray-300">Email: {email}</p>}
              {phone && <p className="text-gray-300">Phone: {phone}</p>}
              {resumeLink && (
                <a
                  href={resumeLink}
                  download
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                >
                  Download Resume
                </a>
              )}
            </div>

            {(candidate.totalScore || candidate.totalScore === 0) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Overall Score
                </h3>
                <div className="bg-gray-800/40 rounded-xl p-4 flex items-center justify-center space-x-2 backdrop-blur-sm border border-gray-700">
                  <Star
                    className={`w-8 h-8 ${getScoreColor(candidate.totalScore)}`}
                  />
                  <span
                    className={`text-3xl font-bold ${getScoreColor(
                      candidate.totalScore
                    )}`}
                  >
                    {candidate.totalScore}/10
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interview Details */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                Interview Details
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {questions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-white flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span>Questions & Answers</span>
                  </h4>

                  {questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="bg-gray-800/30 rounded-xl p-4 space-y-2 backdrop-blur-md border border-gray-700"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm font-medium text-white">
                          Question {idx + 1}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(
                            q.difficulty
                          )}`}
                        >
                          {q.difficulty}
                        </span>
                        {q.aiScore !== undefined && (
                          <div className="flex items-center space-x-1">
                            <Star
                              className={`w-4 h-4 ${getScoreColor(q.aiScore)}`}
                            />
                            <span
                              className={`text-sm font-medium ${getScoreColor(
                                q.aiScore
                              )}`}
                            >
                              {q.aiScore}/10
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-200">
                        Q: {q.text}
                      </p>
                      <p className="text-sm text-gray-400">
                        A: {q.candidateAnswer || "No answer provided"}
                      </p>
                      {q.modelAnswer && (
                        <div className="bg-gray-900/30 border border-gray-700 rounded p-2 mt-1 text-gray-300 text-xs">
                          <p className="font-medium">Model Answer:</p>
                          <p>{q.modelAnswer}</p>
                        </div>
                      )}
                      {q.aiFeedback && (
                        <div className="bg-blue-900/30 border border-blue-700 rounded p-2 text-blue-300 text-xs">
                          <p className="font-medium">AI Feedback:</p>
                          <p>{q.aiFeedback}</p>
                        </div>
                      )}
                      {q.timeSpent && (
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            Answered in {formatTimeSpent(q.timeSpent)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {showChat && questions.length > 0 && (
                <ChatWindow
                  questions={questions}
                  currentQuestionIndex={currentQuestionIndex}
                  chatMessages={chatHistory}
                  status={status}
                  isLoading={isLoading}
                  onSubmitAnswer={(answer, questionIndex) =>
                    onSubmitAnswer?.(candidate.id, answer, questionIndex)
                  }
                />
              )}

              {showChat && chatHistory.length > 0 && (
                <div className="space-y-2 mt-4 bg-gray-900/30 rounded-xl p-4 max-h-64 overflow-y-auto backdrop-blur-md border border-gray-700">
                  {chatHistory.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

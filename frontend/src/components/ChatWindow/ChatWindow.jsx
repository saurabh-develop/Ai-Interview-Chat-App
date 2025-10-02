import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble.jsx";
import TimerBar from "./TimeBar.jsx";

export default function ChatWindow({
  questions = [],
  currentQuestionIndex = 0,
  chatMessages = [],
  status = "collecting_info",
  isLoading = false,
  onSubmitAnswer,
}) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswering =
    status === "in_progress" && currentQuestion && !currentQuestion.submittedAt;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (textareaRef.current && (status === "collecting_info" || isAnswering)) {
      textareaRef.current.focus();
    }
  }, [status, isAnswering, currentQuestionIndex]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!inputValue.trim() || isLoading) return;
      onSubmitAnswer?.(inputValue.trim(), currentQuestionIndex);
      setInputValue("");
    },
    [inputValue, currentQuestionIndex, isLoading, onSubmitAnswer]
  );

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-900 backdrop-blur-xl">
      {currentQuestion && (
        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
          <h2 className="text-lg font-semibold text-gray-100">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="mt-1 text-gray-300">{currentQuestion.text}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length > 0 ? (
          chatMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} dark />
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm">No messages yet.</p>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {isAnswering && currentQuestion?.deadline && (
        <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <TimerBar
            deadline={new Date(currentQuestion.deadline)}
            onTimeUp={() => onSubmitAnswer?.("", currentQuestionIndex)}
            isActive
            dark
          />
        </div>
      )}

      <div className="p-4 border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex space-x-3 items-end">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              status === "collecting_info"
                ? "Type your response..."
                : isAnswering
                ? "Type your answer..."
                : "Chat is not active"
            }
            disabled={!status || status === "completed" || isLoading}
            rows={2}
            className="flex-1 p-3 rounded-xl resize-none bg-gray-900/60 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
          />
          <button
            type="submit"
            disabled={
              !inputValue.trim() ||
              isLoading ||
              (!isAnswering && status !== "collecting_info")
            }
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-3 rounded-xl transition-colors duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        {isAnswering && questions.length > 0 && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Question {currentQuestionIndex + 1} of {questions.length} • Press
            Enter to submit
          </p>
        )}
      </div>
    </div>
  );
}

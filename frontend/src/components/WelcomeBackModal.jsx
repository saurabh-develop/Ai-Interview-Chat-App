import React from "react";
import { Clock, RotateCcw, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function WelcomeBackModal({
  isOpen,
  lastActivity,
  candidateName,
  onResume,
  onRestart,
}) {
  if (!isOpen) return null;

  const timeAgo = formatDistanceToNow(lastActivity, { addSuffix: true });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100/20 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-blue-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
            <p className="text-sm text-gray-300 mt-2">
              {candidateName && `Hi ${candidateName}, `}
              you have an unfinished interview from {timeAgo}.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onResume}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <Play className="w-5 h-5" />
              <span>Resume Interview</span>
            </button>

            <button
              onClick={onRestart}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 px-5 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg border border-gray-600"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Start Over</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

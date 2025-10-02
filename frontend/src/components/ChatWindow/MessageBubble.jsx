import React from "react";
import { Bot, User, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MessageBubble({ message, dark = false }) {
  const isUser = message.type === "user";
  const isSystem = message.type === "system";

  const bubbleBg = dark
    ? isUser
      ? "bg-blue-600 text-white"
      : isSystem
      ? "bg-gray-700 text-gray-200"
      : "bg-gray-800 text-gray-100 border border-gray-600"
    : isUser
    ? "bg-blue-600 text-white"
    : isSystem
    ? "bg-gray-200 text-gray-800"
    : "bg-white border border-gray-200 text-gray-900";

  const containerClasses = `flex items-start mb-3 ${
    isUser ? "flex-row-reverse" : "flex-row"
  }`;

  const iconBg = dark
    ? isUser
      ? "bg-blue-500/30"
      : isSystem
      ? "bg-gray-600/30"
      : "bg-gray-700/30"
    : isUser
    ? "bg-blue-100"
    : isSystem
    ? "bg-gray-100"
    : "bg-green-100";

  const iconColor = dark
    ? isUser
      ? "text-blue-200"
      : isSystem
      ? "text-gray-300"
      : "text-gray-200"
    : isUser
    ? "text-blue-600"
    : isSystem
    ? "text-gray-600"
    : "text-green-600";

  return (
    <div className={containerClasses}>
      {/* Avatar/Icon */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconBg} bg-white/10  border border-white/20`}
      >
        {isUser ? (
          <User className={`w-5 h-5 ${iconColor}`} />
        ) : isSystem ? (
          <Info className={`w-5 h-5 ${iconColor}`} />
        ) : (
          <Bot className={`w-5 h-5 ${iconColor}`} />
        )}
      </div>

      <div
        className={`ml-2 ${
          isUser ? "mr-2 ml-0 text-right" : ""
        } max-w-[80%] lg:max-w-md`}
      >
        <div
          className={`rounded-2xl px-4 py-2 break-words ${bubbleBg} backdrop-blur-sm bg-opacity-80 bg-white/10`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div
          className={`text-xs mt-1 ${
            dark ? "text-gray-400" : "text-gray-500"
          } ${isUser ? "text-right" : "text-left"}`}
        >
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}

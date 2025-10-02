import React, { useState, useEffect, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";

export default function TimerBar({ deadline, onTimeUp, isActive }) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const totalTimeRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const now = Date.now();
    const initialTime = Math.max(0, deadline - now);

    if (totalTimeRef.current === 0) totalTimeRef.current = initialTime;
    setTimeRemaining(initialTime);

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, deadline - Date.now());
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        onTimeUp();
      }
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [deadline, isActive, onTimeUp]);

  if (!isActive || timeRemaining <= 0) return null;

  const seconds = Math.ceil(timeRemaining / 1000);
  const progress =
    totalTimeRef.current > 0 ? (timeRemaining / totalTimeRef.current) * 100 : 0;
  const isLowTime = seconds <= 10;

  return (
    <div
      className={`p-3 rounded-2xl border border-gray-700 backdrop-blur-md bg-gray-900/70 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {isLowTime ? (
            <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
          ) : (
            <Clock className="w-5 h-5 text-blue-400" />
          )}
          <span
            className={`text-sm font-medium ${
              isLowTime ? "text-red-400" : "text-blue-400"
            }`}
          >
            {seconds}s remaining
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-800/40 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-100 ${
            isLowTime ? "bg-red-500" : "bg-blue-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {isLowTime && (
        <p className="text-xs text-red-400 mt-1 font-medium animate-pulse text-center">
          ⚠️ Time is running out! Your answer will be auto-submitted.
        </p>
      )}
    </div>
  );
}

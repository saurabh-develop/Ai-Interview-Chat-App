import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ResumeUploader from "../ResumeUploader.jsx";
import ChatWindow from "../ChatWindow/ChatWindow.jsx";
import WelcomeBackModal from "../WelcomeBackModal.jsx";
import { v4 as uuidv4 } from "uuid";

import {
  setProfile,
  updateProfile,
  setSessionId,
  updateActivity,
} from "../store/slices/userSlice";

import {
  setStatus,
  addMessage,
  setQuestions,
  setCurrentQuestion,
  startQuestion,
  setCollectingInfo,
  setFinalResults,
  updateQuestionScore,
  submitAnswer,
  resetInterview,
} from "../store/slices/interviewSlice";

import { updateCandidateStatus } from "../store/slices/candidatesSlice";
import { generateQuestions, evaluateAnswers } from "../services/aiService";

const QUESTION_DURATIONS = { easy: 20, medium: 60, hard: 120 };

export default function InterviewPage() {
  const dispatch = useDispatch();
  const storedUser = localStorage.getItem("user");
  const user = JSON.parse(storedUser);
  const username = user.username;

  const { profile, lastActivity } = useSelector((state) => state.user);
  const {
    status,
    questions,
    currentQuestionIndex,
    missingFields,
    chatHistory,
  } = useSelector((state) => state.interview);

  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    if (
      lastActivity &&
      profile &&
      status !== "not_started" &&
      status !== "completed"
    ) {
      const timeSinceActivity = Date.now() - lastActivity;
      if (timeSinceActivity > 5 * 60 * 1000) setShowWelcomeBack(true);
    }
  }, [lastActivity, profile, status]);

  useEffect(() => {
    if (status === "in_progress" && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion.submittedAt && !currentQuestion.startTimestamp) {
        const duration = QUESTION_DURATIONS[currentQuestion.difficulty];
        dispatch(startQuestion({ index: currentQuestionIndex, duration }));

        dispatch(
          addMessage({
            id: uuidv4(),
            type: "bot",
            content: `**Question ${currentQuestionIndex + 1} of ${
              questions.length
            }** (${currentQuestion.difficulty.toUpperCase()})\n\n${
              currentQuestion.text
            }`,
            timestamp: Date.now(),
          })
        );
      }
    }
  }, [status, currentQuestionIndex, questions, dispatch]);

  const handleResumeUpload = (parsedData) => {
    const userId = uuidv4();
    const newProfile = {
      id: userId,
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phone,
      resumeText: parsedData.text,
      resumeId: userId,
    };

    dispatch(setProfile(newProfile));
    dispatch(setSessionId(uuidv4()));

    const missing = [];
    if (!parsedData.name) missing.push("name");
    if (!parsedData.email) missing.push("email");
    if (!parsedData.phone) missing.push("phone");

    if (missing.length > 0) {
      dispatch(setCollectingInfo({ collecting: true, missingFields: missing }));
      dispatch(setStatus("collecting_info"));
      dispatch(
        addMessage({
          id: uuidv4(),
          type: "bot",
          content: `Hello! I've processed your resume. I need some additional information before we begin the interview.\n\nPlease provide your ${missing.join(
            ", "
          )}.`,
          timestamp: Date.now(),
        })
      );
    } else startInterview();
  };

  const startInterview = async () => {
    dispatch(setStatus("in_progress"));
    setIsGeneratingQuestions(true);

    try {
      const generatedQuestions = await generateQuestions();
      dispatch(setQuestions(generatedQuestions));
      dispatch(setCurrentQuestion(0));
      dispatch(
        addMessage({
          id: uuidv4(),
          type: "system",
          content:
            "Interview started! You will answer 6 questions: 2 Easy → 2 Medium → 2 Hard. Good luck!",
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("Failed to generate questions:", err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSubmitAnswer = async (answer) => {
    dispatch(updateActivity());

    if (status === "collecting_info") {
      const field = missingFields[0];
      dispatch(updateProfile({ [field]: answer }));

      const remainingFields = missingFields.slice(1);
      if (remainingFields.length > 0) {
        dispatch(
          setCollectingInfo({
            collecting: true,
            missingFields: remainingFields,
          })
        );
        dispatch(
          addMessage({
            id: uuidv4(),
            type: "bot",
            content: `Thank you! Now please provide your ${remainingFields[0]}.`,
            timestamp: Date.now(),
          })
        );
      } else {
        dispatch(setCollectingInfo({ collecting: false, missingFields: [] }));
        dispatch(
          addMessage({
            id: uuidv4(),
            type: "bot",
            content:
              "Perfect! All information collected. Let's begin your interview.",
            timestamp: Date.now(),
          })
        );
        setTimeout(startInterview, 1500);
      }
      return;
    }

    dispatch(submitAnswer({ index: currentQuestionIndex, answer }));

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      dispatch(setCurrentQuestion(nextIndex));
    } else {
      const finalQuestions = questions.map((q, idx) =>
        idx === currentQuestionIndex ? { ...q, candidateAnswer: answer } : q
      );
      await evaluateInterview(finalQuestions);
    }
  };

  const evaluateInterview = async (questionsToSend = questions) => {
    setIsEvaluating(true);
    try {
      const formatted = questionsToSend.map((q) => ({
        id: q.id.toString(),
        text: q.text || "Not provided",
        difficulty: q.difficulty || "easy",
        modelAnswer: q.modelAnswer || "Not provided",
        candidateAnswer: q.candidateAnswer?.trim() || "Not answered",
      }));

      const userDetail = {
        username: username,
        email: profile.email,
        phone: profile.phone,
      };

      const response = await evaluateAnswers({
        questions: formatted,
        userDetail,
      });
      const { questions: evaluatedQuestions, totalScore, summary } = response;

      evaluatedQuestions.forEach((evalResult) => {
        const index = questions.findIndex((q) => q.id === evalResult.id);
        if (index >= 0) {
          dispatch(
            updateQuestionScore({
              index,
              score: evalResult.aiScore,
              feedback: evalResult.aiFeedback,
            })
          );
        }
      });

      dispatch(
        setFinalResults({
          email: profile.email,
          totalScore,
          summary,
          questions: evaluatedQuestions,
        })
      );
      dispatch(
        updateCandidateStatus({
          email: profile.email,
          profile,
          status: "completed",
          totalScore,
          feedback: summary,
          questions: evaluatedQuestions,
        })
      );
      dispatch(setStatus("completed"));

      dispatch(
        addMessage({
          id: uuidv4(),
          type: "system",
          content: `🎉 Interview completed! Your final score is ${totalScore}/10.\n\n${summary}`,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("Failed to evaluate interview:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleWelcomeBackResume = () => {
    setShowWelcomeBack(false);
    dispatch(updateActivity());
  };

  const handleWelcomeBackRestart = () => {
    setShowWelcomeBack(false);
    dispatch(resetInterview());
    dispatch(setProfile(null));
    dispatch(setSessionId(null));
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <ResumeUploader onUploadComplete={handleResumeUpload} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 p-6 space-y-4">
      <WelcomeBackModal
        isOpen={showWelcomeBack}
        lastActivity={lastActivity || Date.now()}
        candidateName={profile.name}
        onResume={handleWelcomeBackResume}
        onRestart={handleWelcomeBackRestart}
      />

      <div className="flex-1 flex flex-col bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Interview Panel</h2>
          <button
            onClick={handleWelcomeBackRestart}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <span>Restart</span>
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatWindow
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            chatMessages={chatHistory}
            status={status}
            isLoading={isGeneratingQuestions || isEvaluating}
            onSubmitAnswer={handleSubmitAnswer}
          />
        </div>
      </div>
    </div>
  );
}

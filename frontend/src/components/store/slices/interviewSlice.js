import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: "not_started",
  questions: [],
  currentQuestionIndex: 0,
  isCollectingInfo: false,
  missingFields: [],
  finalResults: null,
  chatHistory: [],
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setQuestions: (state, action) => {
      state.questions = action.payload;
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    startQuestion: (state, action) => {
      const { index, duration } = action.payload;
      if (state.questions[index]) {
        state.questions[index].startTimestamp = Date.now();
        state.questions[index].duration = duration;
        state.questions[index].deadline = Date.now() + duration * 1000;
      }
    },

    setCollectingInfo: (state, action) => {
      state.isCollectingInfo = action.payload.collecting;
      state.missingFields = action.payload.missingFields || [];
    },
    addMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    updateQuestionScore: (state, action) => {
      const { index, score, feedback } = action.payload;
      if (state.questions[index]) {
        state.questions[index].score = score;
        state.questions[index].feedback = feedback;
      }
    },
    setFinalResults: (state, action) => {
      state.finalResults = action.payload;
    },
    submitAnswer: (state, action) => {
      const { index, answer } = action.payload;
      if (state.questions[index]) {
        state.questions[index].candidateAnswer = answer;
        state.questions[index].submittedAt = Date.now();
      }
    },
    resetInterview: (state) => {
      state.status = "not_started";
      state.questions = [];
      state.currentQuestionIndex = 0;
      state.isCollectingInfo = false;
      state.missingFields = [];
      state.finalResults = null;
      state.chatHistory = [];
    },
  },
});

export const {
  setStatus,
  setQuestions,
  setCurrentQuestion,
  startQuestion,
  setCollectingInfo,
  addMessage,
  updateQuestionScore,
  setFinalResults,
  submitAnswer,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;

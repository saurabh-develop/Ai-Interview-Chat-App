import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  candidates: [],
  searchQuery: "",
  sortBy: "date",
  sortOrder: "desc",
  statusFilter: "all",
};

const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      const existingIndex = state.candidates.findIndex(
        (c) => c.profile?.email === action.payload.profile?.email
      );
      if (existingIndex >= 0) {
        state.candidates[existingIndex] = {
          ...state.candidates[existingIndex],
          ...action.payload,
        };
      } else {
        state.candidates.push({
          ...action.payload,
          lastUpdated: Date.now(),
        });
      }
    },

    updateCandidate: (state, action) => {
      const { email, updates } = action.payload;
      const index = state.candidates.findIndex(
        (c) => c.profile?.email === email
      );
      if (index >= 0) {
        state.candidates[index] = {
          ...state.candidates[index],
          ...updates,
          lastUpdated: Date.now(),
        };
      }
    },

    updateCandidateStatus: (state, action) => {
      const { email, status, totalScore, feedback } = action.payload;
      const candidate = state.candidates.find(
        (c) => c.profile?.email === email
      );
      if (candidate) {
        candidate.status = status;
        candidate.totalScore = totalScore;
        candidate.feedback = feedback;
        candidate.lastUpdated = Date.now();
      }
    },

    updateCandidateAnswer: (state, action) => {
      const { email, questionIndex, answer, timeSpent } = action.payload;
      const candidate = state.candidates.find(
        (c) => c.profile?.email === email
      );

      if (candidate?.questions?.[questionIndex]) {
        candidate.questions[questionIndex].candidateAnswer = answer;
        candidate.questions[questionIndex].timeSpent = timeSpent || 0;
        candidate.lastUpdated = Date.now();
      }
    },

    setFinalResults: (state, action) => {
      const { email, totalScore, summary, questions } = action.payload;
      const candidate = state.candidates.find(
        (c) => c.profile?.email === email
      );
      if (candidate) {
        candidate.totalScore = totalScore;
        candidate.summary = summary;
        candidate.questions = questions;
        candidate.status = "completed";
        candidate.lastUpdated = Date.now();
      }
    },

    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
  },
});

export const {
  addCandidate,
  updateCandidate,
  updateCandidateStatus,
  updateCandidateAnswer,
  setFinalResults,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  setStatusFilter,
} = candidatesSlice.actions;

export default candidatesSlice.reducer;

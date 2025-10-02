import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  sessionId: null,
  lastActivity: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.lastActivity = Date.now();
    },
    updateProfile: (state, action) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
      state.lastActivity = Date.now();
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
      state.lastActivity = Date.now();
    },
    updateActivity: (state) => {
      state.lastActivity = Date.now();
    },
    clearUser: (state) => {
      state.profile = null;
      state.sessionId = null;
      state.lastActivity = null;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  setSessionId,
  updateActivity,
  clearUser,
} = userSlice.actions;
export default userSlice.reducer;

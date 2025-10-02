import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import localforage from "localforage";
import userSlice from "./slices/userSlice.js";
import interviewSlice from "./slices/interviewSlice.js";
import candidatesSlice from "./slices/candidatesSlice.js";

const persistConfig = {
  key: "ai-interview-app",
  storage: localforage,
  whitelist: ["user", "interview", "candidates"],
};

const rootReducer = combineReducers({
  user: userSlice,
  interview: interviewSlice,
  candidates: candidatesSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

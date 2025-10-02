import React, { useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./components/store";
import { Route, Routes, Navigate } from "react-router-dom";
import Registration from "./components/auth/Register.jsx";
import Login from "./components/auth/Login.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import InterviewPage from "./components/pages/InterviewPage.jsx";
import DashboardPage from "./components/pages/DashboardPage.jsx";
import { MessageSquare, BarChart3, Loader2 } from "lucide-react";
import "./App.css";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          Loading AI Interview Assistant...
        </p>
      </div>
    </div>
  );
}

function HomeContent({ username, setUsername }) {
  const storedTab = localStorage.getItem("activeTab") || "interviewee";
  const [activeTab, setActiveTab] = useState(storedTab);

  const tabs = [
    {
      id: "interviewee",
      name: "Interviewee",
      icon: MessageSquare,
      description: "Take the interview",
    },
    {
      id: "interviewer",
      name: "Interviewer",
      icon: BarChart3,
      description: "Dashboard & analytics",
    },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem("activeTab", tabId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`group flex flex-col items-center py-4 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300"
                }`}
              >
                <tab.icon
                  className={`w-5 h-5 mb-1 transition-transform duration-300 group-hover:scale-110 ${
                    activeTab === tab.id
                      ? "text-blue-600 dark:text-blue-400"
                      : ""
                  }`}
                />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "interviewee" ? (
          <div className="h-full flex flex-col">
            <InterviewPage username={username} />
          </div>
        ) : (
          <DashboardPage username={username} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [username, setUsername] = useState("");
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route
            path="/register"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Registration username={username} setUsername={setUsername} />
              </div>
            }
          />
          <Route
            path="/login"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Login username={username} setUsername={setUsername} />
              </div>
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomeContent username={username} setUsername={setUsername} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </PersistGate>
    </Provider>
  );
}

import React, { useEffect, useState } from "react";
import { Users, Award, Clock, TrendingUp } from "lucide-react";
import { getAllInterviews } from "../services/aiService";
import CandidateDetail from "../Dashboard/CandidateDetail.jsx";
import WelcomeBackModal from "../WelcomeBackModal.jsx";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const storedUser = localStorage.getItem("user");
  const user = JSON.parse(storedUser);
  const username = user.username;
  const role = user.role;
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    resumeLink: null,
  });

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await getAllInterviews(username);
        const { user: fetchedUser, data } = response;

        if (role === "candidate") {
          setProfile({
            name: fetchedUser.username || "",
            email: fetchedUser.resume?.extracted?.email || "",
            phone: fetchedUser.resume?.extracted?.phone || "",
            resumeLink: fetchedUser.resume?.fileUrl || null,
          });
        }
        setInterviews(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error("Failed to get interviews: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [username]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-300 text-lg animate-pulse">
        Loading interviews...
      </p>
    );

  const completed = interviews.filter((i) => i.score != null);
  const inProgress = interviews.filter((i) => i.score == null);
  const averageScore =
    completed.length > 0
      ? completed.reduce((sum, i) => sum + (i.score || 0), 0) / completed.length
      : 0;

  const stats = [
    {
      name: "Total Interviews",
      value: interviews.length,
      icon: Users,
      color: "bg-blue-400",
    },
    {
      name: "Completed",
      value: completed.length,
      icon: Award,
      color: "bg-green-400",
    },
    {
      name: "In Progress",
      value: inProgress.length,
      icon: Clock,
      color: "bg-yellow-400",
    },
    {
      name: "Average Score",
      value: averageScore.toFixed(1),
      icon: TrendingUp,
      color: "bg-purple-400",
    },
  ];

  const computeStatus = (interview) =>
    interview.score != null ? "completed" : "in_progress";

  const getCandidateInfo = (interview) => ({
    name:
      interview.candidateInfo?.username ||
      interview.candidateEmail ||
      "Unknown",
    email: interview.candidateInfo?.email || interview.candidateEmail || "-",
    phone: interview.candidateInfo?.phone || interview.phone || "-",
    resumeLink: interview.candidateInfo?.resume?.fileUrl || null,
  });

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-200">
      {selectedInterview && (
        <CandidateDetail
          {...getCandidateInfo(selectedInterview)}
          candidate={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          showChat={false}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-6 text-white">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <div
            key={s.name}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex items-center hover:scale-105 transition-transform duration-300"
          >
            <div
              className={`${s.color} p-4 rounded-full flex items-center justify-center mr-4`}
            >
              <s.icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-300">{s.name}</p>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Card */}
      {role === "candidate" && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {profile.name || "Unknown User"}
            </h2>
            <p className="text-gray-300">{profile.email || "-"}</p>
            <p className="text-gray-300">{profile.phone || "-"}</p>
          </div>
          <div className="text-gray-400">👤 Profile</div>
        </div>
      )}

      {/* Interviews Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800/50">
            <tr>
              {["Candidate Email", "Phone", "Status", "Score", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-gray-900/50 divide-y divide-gray-700">
            {interviews.map((i) => (
              <tr
                key={i._id}
                className="hover:bg-gray-800/30 transition duration-150"
              >
                <td className="px-6 py-4">{i.candidateEmail || "-"}</td>
                <td className="px-6 py-4">{i.phone || "-"}</td>
                <td className="px-6 py-4">
                  {computeStatus(i) === "completed" ? (
                    <span className="text-green-400 font-semibold rounded-full bg-green-900/30 px-2 py-1 text-xs">
                      Completed
                    </span>
                  ) : (
                    <span className="text-yellow-400 font-semibold rounded-full bg-yellow-900/30 px-2 py-1 text-xs">
                      In Progress
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-medium">
                  {i.score != null ? i.score : "-"}
                </td>
                <td className="px-6 py-4">
                  <button
                    className="text-blue-400 hover:text-blue-200 font-medium transition duration-200"
                    onClick={() => setSelectedInterview(i)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {interviews.length === 1 &&
        computeStatus(interviews[0]) !== "completed" && (
          <WelcomeBackModal
            isOpen={true}
            lastActivity={interviews[0].createdAt || Date.now()}
            candidateName={username}
            onResume={() => setSelectedInterview(interviews[0])}
            onRestart={() => alert("Restart interview logic")}
          />
        )}
    </div>
  );
};

export default DashboardPage;

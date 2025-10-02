import React, { useMemo } from "react";
import {
  Search,
  Eye,
  Download,
  Calendar,
  Star,
  ChevronUp,
  ChevronDown,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSelector, useDispatch } from "react-redux";
import {
  setSearchQuery,
  setSortBy,
  setSortOrder,
  setStatusFilter,
} from "../store/slices/candidatesSlice.js";

export default function CandidatesTable({ onViewCandidate }) {
  const dispatch = useDispatch();
  const { candidates, searchQuery, sortBy, sortOrder, statusFilter } =
    useSelector((state) => state.candidates);

  // Functions for coloring
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-800/30 text-green-400";
      case "in_progress":
        return "bg-blue-800/30 text-blue-400";
      case "paused":
        return "bg-yellow-800/30 text-yellow-400";
      default:
        return "bg-gray-800/30 text-gray-400";
    }
  };

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return "text-gray-400";
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        const matchesSearch =
          !searchQuery ||
          c.profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.profile.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "name":
            comparison = (a.profile.name || "").localeCompare(
              b.profile.name || ""
            );
            break;
          case "score":
            comparison = (a.totalScore || 0) - (b.totalScore || 0);
            break;
          case "date":
            comparison =
              new Date(a.lastUpdated || 0) - new Date(b.lastUpdated || 0);
            break;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [candidates, searchQuery, sortBy, sortOrder, statusFilter]);

  const handleSort = (field) => {
    if (sortBy === field) {
      dispatch(setSortOrder(sortOrder === "asc" ? "desc" : "asc"));
    } else {
      dispatch(setSortBy(field));
      dispatch(setSortOrder("desc"));
    }
  };

  return (
    <div className="space-y-6 text-gray-200">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/40 border border-gray-700 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm placeholder-gray-400"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
            className="pl-10 pr-4 py-2 rounded-lg bg-gray-800/40 border border-gray-700 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
          >
            <option value="all">All Status</option>
            <option value="in_progress">In Progress</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        Showing {filteredCandidates.length} of {candidates.length} candidates
      </div>

      <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/50">
              <tr>
                {[
                  "Name",
                  "Contact",
                  "Status",
                  "Score",
                  "Last Updated",
                  "Actions",
                ].map((col, idx) => (
                  <th
                    key={idx}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {filteredCandidates.map((candidate) => (
                <React.Fragment key={candidate.id}>
                  <tr className="hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">
                        {candidate.profile.name || "Unknown"}
                      </div>
                      {candidate.profile.resumeUrl && (
                        <a
                          href={candidate.profile.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex items-center space-x-1 text-blue-400 hover:text-blue-500"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {candidate.profile.email}
                      <div className="text-xs text-gray-500">
                        {candidate.profile.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          candidate.status
                        )}`}
                      >
                        {candidate.status
                          ? candidate.status.replace("_", " ")
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Star
                          className={`w-4 h-4 ${getScoreColor(
                            candidate.totalScore
                          )}`}
                        />
                        <span
                          className={`text-sm font-medium ${getScoreColor(
                            candidate.totalScore
                          )}`}
                        >
                          {candidate.totalScore !== null &&
                          candidate.totalScore !== undefined
                            ? `${candidate.totalScore}/10`
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {candidate.lastUpdated
                        ? formatDistanceToNow(new Date(candidate.lastUpdated), {
                            addSuffix: true,
                          })
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onViewCandidate(candidate)}
                        className="flex items-center space-x-1 text-blue-400 hover:text-blue-500"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>

                  {candidate.questions?.length > 0 && (
                    <tr className="bg-gray-800/30 backdrop-blur-md rounded-xl m-2">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {candidate.questions.map((q, idx) => (
                            <div
                              key={q.id || idx}
                              className="bg-gray-900/40 border border-gray-700 rounded-xl p-3 backdrop-blur-sm hover:shadow-lg transition"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-gray-200">
                                  Q{idx + 1} Score:
                                </span>
                                {q.aiScore !== undefined && (
                                  <span
                                    className={`text-xs font-bold ${getScoreColor(
                                      q.aiScore
                                    )}`}
                                  >
                                    {q.aiScore}/10
                                  </span>
                                )}
                              </div>
                              {q.aiFeedback && (
                                <p className="text-xs text-blue-400 mt-1 italic">
                                  {q.aiFeedback}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4" />
            <p>No candidates found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

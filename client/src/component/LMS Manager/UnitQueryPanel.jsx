import React, { useEffect, useState } from "react";
import { FiMessageCircle, FiUser, FiSend, FiChevronDown } from "react-icons/fi";
import ApiContext from "../../context/ApiContext";
import { useContext } from "react";
import Swal from "sweetalert2";

const UnitQueryPanel = ({ moduleId, subModuleId, unitId, fileId }) => {
  useEffect(() => {
    console.log("📝 UnitQueryPanel received:");
    console.log("Module ID:", moduleId);
    console.log("SubModule ID:", subModuleId);
    console.log("Unit ID:", unitId);
    console.log("File ID:", fileId);
  }, [moduleId, subModuleId, unitId, fileId]);

  const MAX_CHARS = 1000;
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);
  const { fetchData, userToken, user } = useContext(ApiContext);
  const [queries, setQueries] = useState([]);
  const [expandedQueryId, setExpandedQueryId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [replyLoading, setReplyLoading] = useState(null);

  const handleSubmitReply = async (queryId) => {
    if (!replyText[queryId]?.trim()) return;

    setReplyLoading(queryId);

    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    const body = {
      QueryID: queryId,
      ReplyText: replyText[queryId].trim(),
    };

    try {
      const data = await fetchData("lms/reply-query", "POST", body, headers);

      setReplyLoading(null);

      if (data.success) {
        setQueries((prev) =>
          prev.map((q) =>
            q.queryId === queryId
              ? {
                  ...q,
                  replyText: replyText[queryId],
                  repliedAt: new Date().toISOString(),
                  repliedBy: user.Name,
                }
              : q,
          ),
        );

        setReplyText((prev) => ({ ...prev, [queryId]: "" }));

        Swal.fire("Success", "Reply submitted successfully!", "success");
      } else {
        Swal.fire("Error", data.message || "Reply failed", "error");
      }
    } catch (error) {
      console.error("Reply submission error:", error);
      setReplyLoading(null);
      Swal.fire("Error", "Something went wrong.", "error");
    }
  };

  const fetchQueries = async () => {
    try {
      const headers = {
        "auth-token": userToken,
      };

      const data = await fetchData(`lms/query-list`, "GET", {}, headers);
      console.log("Query API response:", data);

      if (data.success) {
        const flattened = data.data.flat(); // 👈 IMPORTANT
        setQueries(flattened);
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    }
  };

  useEffect(() => {
    if (moduleId && subModuleId && unitId && fileId) {
      fetchQueries();
    }
  }, [moduleId, subModuleId, unitId, fileId]);

  const handleSubmitQuery = async () => {
    if (!queryText.trim()) return;

    setLoading(true);

    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken, // 👈 REQUIRED (fetchUser middleware)
    };

    const body = {
      ModuleID: moduleId,
      SubModuleID: subModuleId,
      UnitID: unitId,
      FileID: fileId,
      QueryText: queryText.trim(),
    };

    console.log("📤 Submitting Query:", body);

    try {
      const data = await fetchData("lms/user-query", "POST", body, headers);

      setLoading(false);

      if (data.success) {
        const newQuery = {
          queryId: data.data.queryId,
          moduleId,
          subModuleId,
          unitId,
          fileId,
          queryText: queryText.trim(),
          status: "Pending",
          createdAt: new Date().toISOString(),
          userName: user.Name,
        };

        // 🔥 Instantly update UI
        setQueries((prev) => [newQuery, ...prev]);

        setQueryText("");

        Swal.fire("Success", "Query submitted successfully!", "success");
      } else {
        Swal.fire("Error", data.message || "Submission failed", "error");
      }
    } catch (error) {
      console.error("Query submission error:", error);
      setLoading(false);
      Swal.fire("Error", "Something went wrong, please try again.", "error");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiMessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Query & Response
            </h3>
            <p className="text-xs text-gray-500">
              Unit: {unitId || "Current Unit"}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="p-4 space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <textarea
            placeholder="Ask a question about this unit..."
            value={queryText}
            maxLength={MAX_CHARS}
            onChange={(e) => setQueryText(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="2"
          />

          <div className="flex justify-between items-center mt-1 text-xs">
            <span
              className={`${
                queryText.length >= MAX_CHARS ? "text-red-500" : "text-gray-500"
              }`}
            >
              {queryText.length}/{MAX_CHARS} characters
            </span>
          </div>

          <button
            onClick={handleSubmitQuery}
            disabled={!queryText.trim() || loading}
            className={`mt-2 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors
    ${
      queryText.trim() && !loading
        ? "bg-blue-600 text-DGXblack hover:bg-blue-700"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`}
          >
            <FiSend className="w-4 h-4" />
            <span>{loading ? "Posting..." : "Post Question"}</span>
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {queries.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              No questions yet. Be the first to ask!
            </p>
          ) : (
            queries.map((data) => {
              const isExpanded = expandedQueryId === data.queryId;
              const previewText =
                data.queryText.length > 150
                  ? data.queryText.substring(0, 150) + "..."
                  : data.queryText;

              return (
                <div
                  key={data.queryId}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start space-x-4">
                    {/* User Avatar */}
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                      <FiUser className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      {/* User Name */}
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800 text-sm">
                          {data.userName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(data.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      </div>

                      {/* Question */}
                      <p className="text-gray-700 text-sm mt-2 leading-relaxed">
                        {isExpanded ? data.queryText : previewText}
                      </p>

                      {data.queryText.length > 150 && (
                        <button
                          onClick={() =>
                            setExpandedQueryId(isExpanded ? null : data.queryId)
                          }
                          className="text-blue-600 text-xs mt-1 hover:underline"
                        >
                          {isExpanded ? "Show less" : "View more"}
                        </button>
                      )}

                      {data.replyText && (
                        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-green-600">
                              Reply by {data.repliedBy}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(data.repliedAt).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )}
                            </p>
                          </div>

                          <p className="text-sm text-gray-700 mt-1">
                            {data.replyText}
                          </p>
                        </div>
                      )}

                      {/* Show Reply Box if No Reply */}
                      {!data.replyText && (
                        <div className="mt-4">
                          <textarea
                            placeholder="Write your reply..."
                            value={replyText[data.queryId] || ""}
                            onChange={(e) =>
                              setReplyText((prev) => ({
                                ...prev,
                                [data.queryId]: e.target.value,
                              }))
                            }
                            className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                            rows="2"
                          />

                          <button
                            onClick={() => handleSubmitReply(data.queryId)}
                            disabled={
                              !replyText[data.queryId]?.trim() ||
                              replyLoading === data.queryId
                            }
                            className={`mt-2 px-3 py-1 text-xs rounded-lg
        ${
          replyText[data.queryId]?.trim() && replyLoading !== data.queryId
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
                          >
                            {replyLoading === data.queryId
                              ? "Replying..."
                              : "Submit Reply"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitQueryPanel;

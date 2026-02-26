import React, { useEffect, useState } from "react";
import { FiMessageCircle, FiUser, FiSend, FiChevronDown } from "react-icons/fi";
import ApiContext from "../../context/ApiContext";
import { useContext } from "react";
import Swal from "sweetalert2";
import QueryReplies from "./QueryReplies";

const UnitQueryPanel = ({
  moduleId,
  subModuleId,
  unitId,
  fileId,
  creatorId,
}) => {
  useEffect(() => {
    console.log("📝 UnitQueryPanel received:");
    console.log("Module ID:", moduleId);
    console.log("SubModule ID:", subModuleId);
    console.log("Unit ID:", unitId);
    console.log("File ID:", fileId);
    console.log("creator id is ", creatorId);
  }, [moduleId, subModuleId, unitId, fileId]);

  const MAX_CHARS = 1000;
  const [queryText, setQueryText] = useState("");
  const [useAIReply, setUseAIReply] = useState(false);
  const [aiReplies, setAiReplies] = useState({});
  const [aiLoadingId, setAiLoadingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { fetchData, userToken, user } = useContext(ApiContext);
  const [queries, setQueries] = useState([]);
  const [expandedQueryId, setExpandedQueryId] = useState(null);
  const [replyLoading, setReplyLoading] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const fetchQueries = async () => {
    try {
      const headers = {
        "auth-token": userToken,
      };

      const data = await fetchData(`lms/query-list`, "GET", {}, headers);
      console.log("Query API response:", data);

      if (data.success) {
        const flattened = data.data.flat();
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
      "auth-token": userToken,
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

        setQueries((prev) => [newQuery, ...prev]);
        if (useAIReply && fileId) {
          setAiLoadingId(newQuery.queryId);

          const body = {
            question: queryText.trim(),
            pdf_ids: [fileId.toString()],
            chat_history: chatHistory || [],
            user_id:
              user?.UserID?.toString() || user?.uniqueId?.toString() || "0",
            organization_id: "GI",
            platform: "DGX_Community_LMS",
          };

          try {
            const CHATBOT_API = import.meta.env.VITE_CHATBOT_API_URL;

            const res = await fetch(`${CHATBOT_API}/ask`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });

            const aiData = await res.json();

            if (aiData?.chat_history) {
              setChatHistory(aiData.chat_history);
            }

            const aiAnswer =
              aiData?.answer || "❌ Sorry, I couldn't generate a response.";

            setAiReplies((prev) => ({
              ...prev,
              [newQuery.queryId]: aiAnswer,
            }));
          } catch (error) {
            console.error("AI error:", error);

            setAiReplies((prev) => ({
              ...prev,
              [newQuery.queryId]:
                "⚠️ AI is currently unavailable. Please try again later.",
            }));
          }

          setAiLoadingId(null);
        }

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
          <div className="flex items-center justify-between mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-800">
                Get Instant AI Reply
              </span>
            </div>

            <button
              onClick={() => setUseAIReply(!useAIReply)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                useAIReply ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  useAIReply ? "translate-x-6" : ""
                }`}
              />
            </button>
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

                      <QueryReplies
                        queryId={data.queryId}
                        creatorId={creatorId} // Pass creatorId down
                      />
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
                      {aiLoadingId === data.queryId && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 animate-pulse">
                          <p className="text-xs font-semibold text-blue-600 mb-2">
                            AI Assistant is typing...
                          </p>
                          <div className="space-y-2">
                            <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                            <div className="h-2 bg-blue-200 rounded w-1/2"></div>
                          </div>
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

import React, { useEffect, useState, useContext } from "react";
import ApiContext from "../../context/ApiContext";
import Swal from "sweetalert2";

const QueryReplies = ({ queryId, creatorId }) => { // Add creatorId prop
  const { fetchData, userToken, user } = useContext(ApiContext); // Get user from context

  const [reply, setReply] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    "auth-token": userToken,
  };

  const fetchReply = async () => {
    try {
      const data = await fetchData(
        `lms/query-reply/${queryId}`, 
        "GET",
        {},
        headers,
      );

      if (data.success) {
        setReply(data.data); // null OR object
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReply();
  }, [queryId]);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    setLoading(true);

    try {
      const body = {
        QueryID: queryId,
        ReplyText: replyText.trim(),
      };

      const data = await fetchData("lms/query-answer", "POST", body, headers);

      if (data.success) {
        setReply(data.data); 
        setReplyText("");
        Swal.fire("Success", "Reply added!", "success");
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  // Check if current user is the creator
  const isCreator = user?.UserID?.toString() === creatorId?.toString();

  return (
    <div className="mt-4">
      {reply ? (
        <div className="bg-gray-50 border rounded-lg p-3">
          <p className="text-sm text-gray-700">{reply.ReplyText}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(reply.AddOnDt).toLocaleString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}{" "}
          </p>
        </div>
      ) : (
        // Only show reply input if user is creator AND no reply exists yet
        isCreator && (
          <>
            <textarea
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm"
              rows="2"
            />

            <button
              onClick={handleSubmitReply}
              disabled={!replyText.trim() || loading}
              className={`mt-2 px-3 py-1 text-xs rounded-lg ${
                replyText.trim() && !loading
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? "Replying..." : "Submit Reply"}
            </button>
          </>
        )
      )}

      {/* Optional: Show a message if user is not creator and no reply exists */}
      {!reply && !isCreator && (
        <p className="text-xs text-gray-400 italic mt-2">
          Waiting for instructor's response...
        </p>
      )}
    </div>
  );
};

export default QueryReplies;
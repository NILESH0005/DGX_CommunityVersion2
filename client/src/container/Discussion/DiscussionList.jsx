import React from "react";
import DiscussionCard from "./DiscussionCard.jsx";
import { FiEye } from "react-icons/fi";

const DiscussionList = ({
  discussions = [],
  openModal,
  userToken,
  navigate,
  fetchData,
  user,
  updateLikeCount, // <--- accept prop
  updateCommentCount, // <--- accept prop
}) => {
  if (!discussions.length) {
    return (
      <div className="text-center text-gray-500 mt-8">
        No discussions available.
      </div>
    );
  }

  // Handles recording a view whenever a discussion is opened
  const recordDiscussionView = async (discussionID) => {
    if (!userToken) return;
    const endpoint = "progressTrack/recordView";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = {
      ProcessName: "Discussion",
      reference: discussionID,
    };
    try {
      await fetchData(endpoint, method, body, headers);
    } catch (err) {
      console.error("Error recording discussion view:", err);
    }
  };

  return (
    <div className="space-y-6">
      {discussions.map((discussion) => (
        <div
          key={discussion.DiscussionID}
          onClick={async (e) => {
            if (
              !e.target.closest("button") &&
              !e.target.closest("a") &&
              !e.target.classList.contains("prevent-modal")
            ) {
              const viewedKey = `viewed_${user?.UserID}_${discussion.DiscussionID}`;

              // Prevent double counting views per user
              if (!localStorage.getItem(viewedKey)) {
                localStorage.setItem(viewedKey, "true");

                // Optimistically update count
                discussion.viewCount = (discussion.viewCount || 0) + 1;

                // Send view record to backend
                await recordDiscussionView(discussion.DiscussionID);
              }

              // Always open modal
              openModal(discussion);
            }
          }}
        >
          <DiscussionCard
            discussion={discussion}
            openModal={() => {
              openModal(discussion);
              recordDiscussionView(discussion.DiscussionID);
            }}
            userToken={userToken}
            navigate={navigate}
            fetchData={fetchData}
            user={user}
            updateLikeCount={updateLikeCount} // <--- forward
            updateCommentCount={updateCommentCount} // <--- forward
          />
        </div>
      ))}
    </div>
  );
};

export default DiscussionList;

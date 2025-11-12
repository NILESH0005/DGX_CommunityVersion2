import React, { useState, useEffect } from "react";
import DiscussionCard from "./DiscussionCard.jsx";

const DiscussionList = ({
  discussions = [],
  openModal,
  userToken,
  navigate,
  fetchData,
  user,
  updateLikeCount,
  updateCommentCount,
}) => {
  // Local state copy to allow updates
  const [discussionList, setDiscussionList] = useState(discussions);

  // If parent provides new discussions, sync them
  useEffect(() => {
    setDiscussionList(discussions);
  }, [discussions]);

  // ✅ Update repost list locally
  const updateRepostList = (discussionId, newRepost) => {
    setDiscussionList((prevList) =>
      prevList.map((d) =>
        d.DiscussionID === discussionId
          ? {
              ...d,
              reposts: d.reposts
                ? [...d.reposts, newRepost]
                : [newRepost],
            }
          : d
      )
    );
  };

  // ---------------------------
  // Record discussion view
  // ---------------------------
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

  // ---------------------------
  // Render Section
  // ---------------------------
  if (!discussionList.length) {
    return (
      <div className="text-center text-gray-500 mt-8">
        No discussions available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {discussionList.map((discussion) => (
        <div
          key={discussion.DiscussionID}
          onClick={async (e) => {
            if (
              !e.target.closest("button") &&
              !e.target.closest("a") &&
              !e.target.classList.contains("prevent-modal")
            ) {
              const viewedKey = `viewed_${user?.UserID}_${discussion.DiscussionID}`;

              if (!localStorage.getItem(viewedKey)) {
                localStorage.setItem(viewedKey, "true");
                discussion.viewCount = (discussion.viewCount || 0) + 1;
                await recordDiscussionView(discussion.DiscussionID);
              }

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
            updateLikeCount={updateLikeCount}
            updateCommentCount={updateCommentCount}
            updateRepostList={updateRepostList} // ✅ pass new prop
          />
        </div>
      ))}
    </div>
  );
};

export default DiscussionList;

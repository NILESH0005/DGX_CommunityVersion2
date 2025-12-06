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

  // Update repost list locally
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

  // Record discussion view - let backend handle duplicates
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
      const response = await fetchData(endpoint, method, body, headers);
      
      // Only increment local count if it's a new view
      if (response.success && !response.data.alreadyViewed) {
        setDiscussionList(prevList =>
          prevList.map(d =>
            d.DiscussionID === discussionID
              ? { ...d, viewCount: (d.viewCount || 0) + 1 }
              : d
          )
        );
      }
      
      console.log("View response:", response);
    } catch (err) {
      console.error("Error recording discussion view:", err);
    }
  };

  // Handle card click to open modal
  const handleCardClick = async (discussion, e) => {
    // Check if click is on interactive elements
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.classList.contains("prevent-modal")
    ) {
      return;
    }

    // Record view (backend will handle duplicates)
    await recordDiscussionView(discussion.DiscussionID);

    // Open modal
    openModal(discussion);
  };

  // Render Section
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
          onClick={(e) => handleCardClick(discussion, e)}
          className="cursor-pointer"
        >
          <DiscussionCard
            discussion={discussion}
            openModal={() => {
              // For "Continue reading" link
              handleCardClick(discussion, { target: { classList: [] } });
            }}
            userToken={userToken}
            navigate={navigate}
            fetchData={fetchData}
            user={user}
            updateLikeCount={updateLikeCount}
            updateCommentCount={updateCommentCount}
            updateRepostList={updateRepostList}
          />
        </div>
      ))}
    </div>
  );
};

export default DiscussionList;
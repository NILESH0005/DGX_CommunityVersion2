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
  const [discussionList, setDiscussionList] = useState(discussions);
  useEffect(() => {
    setDiscussionList(discussions);
  }, [discussions]);

  const updateRepostList = (discussionId, newRepost) => {
    setDiscussionList((prevList) =>
      prevList.map((d) =>
        d.DiscussionID === discussionId
          ? {
              ...d,
              reposts: d.reposts ? [...d.reposts, newRepost] : [newRepost],
            }
          : d
      )
    );
  };

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

      if (response.success && !response.data.alreadyViewed) {
        setDiscussionList((prevList) =>
          prevList.map((d) =>
            d.DiscussionID === discussionID
              ? {
                  ...d,
                  viewCount: (d.viewCount || 0) + 1,
                  hasUserViewed: true, 
                }
              : d
          )
        );
      }

      console.log("View response:", response);
    } catch (err) {
      console.error("Error recording discussion view:", err);
    }
  };

  const handleCardClick = async (discussion, e) => {
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.classList.contains("prevent-modal")
    ) {
      return;
    }

    await recordDiscussionView(discussion.DiscussionID);

    openModal(discussion);
  };

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

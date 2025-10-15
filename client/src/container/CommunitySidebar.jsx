import React, { useEffect, useState } from "react";
import { AiOutlineComment, AiOutlineLike } from "react-icons/ai";
import { FaTrophy, FaComment } from "react-icons/fa";
import { FiRepeat } from "react-icons/fi";
import DOMPurify from "dompurify";

const CommunitySidebar = ({
  isLoading = false,
  communityHighlights = [],
  topUsers = [],
  openModal = () => { },
  discussions = [],
  updateDiscussionLikeCount,
  updateDiscussionCommentCount,
  discussionStats = {},
  statsLoading = false,
  refreshStats = () => { },
}) => {
  const [localHighlights, setLocalHighlights] = useState(communityHighlights);

  useEffect(() => {
    if (discussions.length > 0) {
      // Recalculate highlights from the latest discussions data
      const sortedDiscussions = [...discussions].sort(
        (a, b) => (b.commentCount || 0) - (a.commentCount || 0)
      );
      const newHighlights = sortedDiscussions.slice(0, 5);
      setLocalHighlights(newHighlights);
    } else {
      setLocalHighlights(communityHighlights);
    }
  }, [discussions, communityHighlights]);

  // Add this function - it was missing
  const getUpdatedDiscussion = (discussionId) => {
    return discussions.find(d => d.DiscussionID === discussionId) || 
           localHighlights.find(d => d.DiscussionID === discussionId);
  };

  const handleSidebarLike = async (discussionId, currentUserLike) => {
    if (updateDiscussionLikeCount) {
      const discussion = discussions.find(d => d.DiscussionID === discussionId);
      const currentLikes = Number(discussion?.likeCount) || 0;
      const newLikeState = currentUserLike === 1 ? 0 : 1;
      const newLikeCount = newLikeState === 1 ? currentLikes + 1 : Math.max(0, currentLikes - 1);

      // Update locally first
      setLocalHighlights(prev =>
        prev.map(item =>
          item.DiscussionID === discussionId
            ? {
              ...item,
              userLike: newLikeState,
              likeCount: newLikeCount
            }
            : item
        )
      );

      // Call parent's update function
      await updateDiscussionLikeCount(discussionId, newLikeCount, newLikeState);

      // Refresh stats after like action
      refreshStats();
    }
  };

  const getDiscussionWithStats = (discussion) => {
    const stats = discussionStats[discussion.DiscussionID];
    return {
      ...discussion,
      likeCount: stats?.TotalLikes || discussion.likeCount || 0,
      commentCount: stats?.TotalComments || discussion.commentCount || 0,
    };
  };

  return (
    <aside className="hidden lg:block lg:w-1/4 px-4 space-y-8">
      {/* Community Highlights Section */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-DGXblue to-DGXgreen p-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <AiOutlineComment className="text-white text-xl" />
            </div>
            Community Highlights
          </h2>
          <p className="text-white/80 text-sm mt-1">
            Most engaging discussions this week
          </p>
        </div>

        <div className="p-4 space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
          {localHighlights.length > 0 ? (
            localHighlights.map((topic, index) => {
              // Get the most recent data for this discussion
              const updatedTopic = getDiscussionWithStats(getUpdatedDiscussion(topic.DiscussionID) || topic);

              return (
                <div
                  key={updatedTopic.DiscussionID || index}
                  className="group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                  onClick={() => openModal(updatedTopic)}
                >
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                    #{index + 1}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      {updatedTopic.User?.ProfilePicture ? (
                        <img
                          src={updatedTopic.User.ProfilePicture}
                          alt={updatedTopic.UserName}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                          {updatedTopic.UserName?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {updatedTopic.UserName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {statsLoading ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                              Loading...
                            </div>
                          ) : (
                            `${updatedTopic.likeCount || 0} likes • ${updatedTopic.commentCount || 0} comments`
                          )}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-300">
                      {updatedTopic.Title}
                    </h3>

                    <div className="text-gray-600 text-sm leading-relaxed">
                      {updatedTopic.Content.length > 120 ? (
                        <>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(
                                updatedTopic.Content.substring(0, 117) + "..."
                              ),
                            }}
                          />
                          <span
                            className="text-blue-600 cursor-pointer font-semibold hover:underline inline-flex items-center gap-1 mt-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(updatedTopic);
                            }}
                          >
                            Continue reading
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </span>
                        </>
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(updatedTopic.Content),
                          }}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        {/* Like Button with real-time functionality */}
                        <button
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSidebarLike(updatedTopic.DiscussionID, updatedTopic.userLike);
                          }}
                        >
                          <AiOutlineLike
                            className={`w-3 h-3 ${updatedTopic.userLike === 1 ? 'text-blue-600 fill-blue-600' : ''}`}
                          />
                          <span>
                            {statsLoading ? (
                              <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                            ) : (
                              updatedTopic.likeCount || 0
                            )}
                          </span>
                        </button>

                        <div className="flex items-center gap-1">
                          <FaComment className="w-3 h-3" />
                          <span>
                            {statsLoading ? (
                              <div className="w-3 h-3 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                            ) : (
                              updatedTopic.commentCount || 0
                            )}
                          </span>
                        </div>

                        {updatedTopic.RepostID && (
                          <div className="flex items-center gap-1">
                            <FiRepeat className="w-3 h-3" />
                            <span>{updatedTopic.repostCount || 0}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {updatedTopic.CreatedAt || updatedTopic.AddOnDt
                          ? new Date(updatedTopic.CreatedAt || updatedTopic.AddOnDt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                          : "Recent"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                <AiOutlineComment className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-500 text-sm mb-2">No highlights yet</p>
              <p className="text-gray-400 text-xs">
                Engage with discussions to see them here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Top Contributors Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-DGXblue to-DGXgreen p-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <FaTrophy className="text-white text-xl" />
            </div>
            Top Contributors
          </h2>
          <p className="text-white/80 text-sm mt-1">
            Most active community members
          </p>
        </div>

        <div className="p-4 space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
          {topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <div
                key={user.userID || index}
                className="group flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer relative overflow-hidden"
              >
                {index < 3 && (
                  <div
                    className={`absolute -left-2 -top-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${index === 0
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                      : index === 1
                        ? "bg-gradient-to-r from-gray-400 to-gray-500"
                        : "bg-gradient-to-r from-orange-400 to-orange-500"
                      }`}
                  >
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

                <div className="flex items-center gap-3 flex-1 relative z-10">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {user.userName?.charAt(0) || "U"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors duration-300">
                      {user.userName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600">
                      {user.count}
                    </div>
                    <div className="text-xs text-gray-500">posts</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaTrophy className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-500 text-sm mb-2">No contributors yet</p>
              <p className="text-gray-400 text-xs">
                Be the first to start contributing!
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CommunitySidebar;
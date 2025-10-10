import React from "react";
import { AiOutlineComment, AiOutlineLike } from "react-icons/ai";
import { FaTrophy, FaComment } from "react-icons/fa";
import { FiRepeat } from "react-icons/fi";
import DOMPurify from "dompurify";

const getProgressColor = (index) => {
  if (index === 0) return "#F59E0B"; // yellow-500
  if (index === 1) return "#9CA3AF"; // gray-400
  if (index === 2) return "#F97316"; // orange-500
  return "#3B82F6"; // blue-500 default
};

const CommunitySidebar = ({
  isLoading = false,
  communityHighlights = [],
  topUsers = [],
  openModal = () => {},
}) => {
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
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-4 animate-pulse border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-5 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6 mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-4/6"></div>
              </div>
            ))
          ) : communityHighlights.length > 0 ? (
            communityHighlights.map((topic, index) => (
              <div
                key={topic.DiscussionID || index}
                className="group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                onClick={() => openModal(topic)}
              >
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                  #{index + 1}
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    {topic.User?.ProfilePicture ? (
                      <img
                        src={topic.User.ProfilePicture}
                        alt={topic.UserName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {topic.UserName?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {topic.UserName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {topic.likeCount || 0} likes • {topic.commentCount || 0}{" "}
                        comments
                      </p>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-300">
                    {topic.Title}
                  </h3>

                  <div className="text-gray-600 text-sm leading-relaxed">
                    {topic.Content.length > 120 ? (
                      <>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              topic.Content.substring(0, 117) + "..."
                            ),
                          }}
                        />
                        <span
                          className="text-blue-600 cursor-pointer font-semibold hover:underline inline-flex items-center gap-1 mt-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(topic);
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
                          __html: DOMPurify.sanitize(topic.Content),
                        }}
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <AiOutlineLike className="w-3 h-3" />
                        <span>{topic.likeCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaComment className="w-3 h-3" />
                        <span>{topic.commentCount || 0}</span>
                      </div>
                      {topic.RepostID && (
                        <div className="flex items-center gap-1">
                          <FiRepeat className="w-3 h-3" />
                          <span>{topic.repostCount || 0}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {topic.CreatedAt
                        ? new Date(topic.CreatedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "Recent"}
                    </div>
                  </div>
                </div>
              </div>
            ))
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
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl animate-pulse border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
              </div>
            ))
          ) : topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <div
                key={user.userID || index}
                className="group flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer relative overflow-hidden"
              >
                {index < 3 && (
                  <div
                    className={`absolute -left-2 -top-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                      index === 0
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
                    {/* <p className="text-xs text-gray-500">
                      Level {Math.floor(user.count / 5) + 1} • {user.count}{" "}
                      contributions
                    </p> */}
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

                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                  <button className="text-white text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    View Profile
                  </button>
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

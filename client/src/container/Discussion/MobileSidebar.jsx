import React, { useState } from "react";
import { FiRepeat } from "react-icons/fi";

/**
 * MobileSidebar Component
 * Shown on small screens as a collapsible sidebar for community info
 */
const MobileSidebar = ({
  communityHighlights = [],
  topUsers = [],
  openModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden mt-8 mb-6">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full py-3 bg-gradient-to-r from-DGXblue to-DGXgreen text-white rounded-lg font-semibold shadow-md hover:opacity-90 transition-all duration-300"
      >
        {isOpen ? "Hide" : "Show"} Community Highlights & Contributors
      </button>

      {/* Sidebar Content */}
      {isOpen && (
        <aside className="mt-4 px-3 sm:px-4 transition-all duration-300">
          {/* Community Highlights */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              🌟 Community Highlights
            </h2>

            {communityHighlights.length > 0 ? (
              <div className="space-y-3">
                {communityHighlights.map((topic) => {
                  const formattedDate = new Date(
                    topic.Date || topic.AddOnDt
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div
                      key={topic.DiscussionID}
                      onClick={() => openModal(topic)}
                      className="cursor-pointer border border-gray-200 rounded-lg shadow-sm p-4 bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-transform transform hover:scale-105 hover:shadow-lg"
                    >
                      <h3 className="text-base font-semibold text-gray-800 line-clamp-2 mb-1">
                        {topic.Title}
                      </h3>

                      <div className="text-xs text-gray-500 mb-1">
                        {formattedDate}
                      </div>

                      <div className="text-sm text-gray-600 leading-snug">
                        {topic.Content?.length > 120 ? (
                          <>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: topic.Content.substring(0, 117),
                              }}
                            />
                            <span className="text-DGXblue font-medium">
                              ...see more
                            </span>
                          </>
                        ) : (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: topic.Content,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                No recent highlights yet.
              </p>
            )}
          </div>

          {/* Top Contributors */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              🏆 Top Contributors
            </h2>

            {topUsers.length > 0 ? (
              <div className="space-y-2">
                {topUsers.map((user, index) => (
                  <div
                    key={user.userID || index}
                    className="flex items-center justify-between bg-gradient-to-r from-DGXgreen to-DGXblue text-white rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <span className="font-medium truncate max-w-[60%]">
                      {user.userName || "Anonymous"}
                    </span>
                    <span className="text-sm opacity-90">
                      {user.count} {user.count === 1 ? "Post" : "Posts"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                No top contributors yet.
              </p>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};

export default MobileSidebar;

import React from "react";
import { FaTrophy } from "react-icons/fa";

const TopContributors = ({ topUsers = [] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-DGXblue to-DGXgreen p-4 sm:p-5">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <FaTrophy className="text-white text-lg sm:text-xl" />
          </div>
          Top Contributors
        </h2>
        <p className="text-white/80 text-xs sm:text-sm mt-1">
          Most active community members
        </p>
      </div>

      {/* Scrollable List */}
      <div
        className="p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto scrollbar-thin 
        max-h-[60vh] md:max-h-[calc(100vh-250px)]"
      >
        {topUsers.length > 0 ? (
          topUsers.map((user, index) => (
            <div
              key={user.userID || index}
              className={`group flex items-center justify-between p-3 sm:p-4 
                ${
                  index === 0
                    ? "bg-gradient-to-r from-[#ffe8a3] to-[#ffcf5d]" // Gold (1st)
                    : index === 1
                    ? "bg-gradient-to-r from-[#e5e7eb] to-[#d1d5db]" // Silver (2nd)
                    : index === 2
                    ? "bg-gradient-to-r from-[#f8d4b4] to-[#f1b68a]" // Bronze (3rd)
                    : "bg-gradient-to-br from-[#f5f7fa] to-[#e6ebef]" // Others
                }
                border border-gray-200 rounded-xl shadow-sm 
                hover:shadow-xl transition-all duration-300 
                transform hover:scale-[1.02] cursor-pointer 
                relative overflow-hidden touch-manipulation`}
            >
              {/* Badge for Top 3 */}
              {index < 3 && (
                <div
                  className={`absolute -left-2 -top-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full 
                    flex items-center justify-center text-white text-[10px] sm:text-xs 
                    font-bold shadow-lg 
                    ${
                      index === 0
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                        : index === 1
                        ? "bg-gradient-to-r from-gray-400 to-silver-500"
                        : "bg-gradient-to-r from-orange-400 to-orange-500"
                    }`}
                >
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </div>
              )}

              {/* Hover Glow */}
              <div
                className="absolute inset-0 bg-gradient-to-r 
                from-blue-100 to-purple-200 opacity-0 
                group-hover:opacity-100 transition-opacity duration-300 
                rounded-xl"
              ></div>

              {/* User Info */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 relative z-10 min-w-0">
                <div className="relative shrink-0">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full 
                    bg-gradient-to-r from-blue-600 to-purple-700 
                    flex items-center justify-center text-white 
                    font-semibold text-sm shadow-md"
                  >
                    {user.userName?.charAt(0) || "U"}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm sm:text-base font-semibold text-gray-800 truncate 
                    group-hover:text-blue-600 transition-colors duration-300"
                  >
                    {user.userName}
                  </p>
                </div>
              </div>

              {/* Count */}
              <div className="flex items-center gap-2 relative z-10 shrink-0">
                <div className="text-right">
                  <div className="text-sm sm:text-base font-bold text-blue-600">
                    {user.count}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    posts
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-gray-200 to-gray-300 
              rounded-full flex items-center justify-center mx-auto mb-3"
            >
              <FaTrophy className="text-gray-400 text-xl sm:text-2xl" />
            </div>
            <p className="text-gray-500 text-sm sm:text-base mb-1">
              No contributors yet
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              Be the first to start contributing!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopContributors;

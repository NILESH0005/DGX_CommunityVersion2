import React from "react";
import { FaTrophy } from "react-icons/fa";

const TopContributors = ({ topUsers = [] }) => {
  console.log("toopppp", topUsers)
  return (
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

      <div className="p-4 space-y-4 overflow-y-auto scrollbar-thin max-h-[calc(100vh-200px)]">
        {topUsers.length > 0 ? (
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
  );
};

export default TopContributors;

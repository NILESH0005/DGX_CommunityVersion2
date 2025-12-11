// Leaderboard.jsx
import React from "react";

const QuizLeaderboard = ({ leaderboard }) => {
  return (
    <div className="sticky top-6">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-gray-200">
        
        {/* Title */}
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
          🏆 Top Performers
        </h2>

        {/* Leaderboard List */}
        <div className="space-y-4">
          {leaderboard.length > 0 ? (
            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-2">
              {leaderboard.map((user, index) => (
                <div
                  key={user.Name}
                  className="
                    flex items-center justify-between
                    bg-gradient-to-r from-white to-gray-50
                    p-4 rounded-xl border border-gray-200
                    shadow-sm hover:shadow-lg hover:scale-[1.02]
                    transition-all duration-300 ease-out
                  "
                >
                  {/* Left side: Avatar + Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.Name}
                        className="w-12 h-12 rounded-full object-cover shadow-md"
                      />

                      {/* Rank Badge */}
                      <span
                        className="
                          absolute -top-1 -right-1 text-xs font-bold
                          bg-gradient-to-r from-indigo-500 to-blue-500
                          text-white px-2 py-[2px] rounded-full shadow
                        "
                      >
                        #{index + 1}
                      </span>
                    </div>

                    <div>
                      <p className="text-lg font-semibold text-gray-900 leading-tight">
                        {user.Name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {user.totalPoints} Points
                      </p>
                    </div>
                  </div>

                  {/* Medal Value */}
                  <span
                    className="
                      text-xl font-black 
                      bg-gradient-to-r from-lime-500 to-green-500 
                      bg-clip-text text-transparent
                    "
                  >
                    {user.medal}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No leaderboard data available
            </p>
          )}

          {/* Footer Note */}
          <p className="mt-6 text-sm text-gray-600 text-center italic">
            Top performers will be rewarded with exclusive gifts! 🎁
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizLeaderboard;

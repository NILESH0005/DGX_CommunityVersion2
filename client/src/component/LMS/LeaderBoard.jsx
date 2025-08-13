import React, { useState, useEffect, useContext } from "react";
import { Trophy, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApiContext from '../../context/ApiContext';

export const LeaderBoard = () => {
  const [expandedUser, setExpandedUser] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userToken, fetchData } = useContext(ApiContext);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userToken) {
        throw new Error("Authentication token is missing");
      }

      const endpoint = "quiz/getLeaderboardRanking";
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const data = await fetchData(endpoint, method, {}, headers);
      console.log("Leaderboard data:", data);

      if (!data) {
        throw new Error("No data received from server");
      }

      if (data.success) {
        // Transform API data to match our component's expected format
        const transformedData = data.data.quizzes.map((user, index) => ({
          id: user.UserID || index + 1,
          name: user.Name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.Name)}&background=random`,
          points: user.totalPoints || 0,
          progress: Math.min(100, Math.floor((user.totalPoints || 0) / 50)), // Example progress calculation
          badges: user.badges || 0,
          streak: user.streak || 0,
          completedModules: user.completedModules || 0,
          rank: index + 1,
          recentActivity: [
            { module: "Recent Quiz", points: user.recentPoints || 0, date: "recently" },
            { module: "Previous Quiz", points: user.previousPoints || 0, date: "earlier" }
          ]
        }));

        // Separate top 3 users for special treatment
        setTopUsers(transformedData.slice(0, 3));
        setOtherUsers(transformedData.slice(3).map((user, index) => ({
          ...user,
          // Ensure ranks continue correctly from 4 onwards
          rank: index + 4
        })));
      } else {
        throw new Error(data.message || "Failed to fetch leaderboard");
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError(err.message || "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchLeaderboard();
    } else {
      setLoading(false);
      setError("Please login to view leaderboard");
    }
  }, [userToken]);

  const toggleExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const rankColors = {
    1: { bg: "bg-gradient-to-r from-yellow-400 to-yellow-200", text: "text-yellow-800" },
    2: { bg: "bg-gradient-to-r from-gray-300 to-gray-100", text: "text-gray-700" },
    3: { bg: "bg-gradient-to-r from-amber-400 to-amber-200", text: "text-amber-800" }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DGXblue mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="text-center p-6">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-4 bg-DGXblue text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-DGXblue to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-bold">Leaderboard</h2>
          </div>
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </div>
        <p className="mt-2 opacity-90">Top performers this week</p>
      </div>

      {/* Top 3 Podium */}
      {topUsers.length > 0 && (
        <div className="px-6 py-4 bg-white">
          <div className="grid grid-cols-3 gap-4 h-48">
            {topUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: user.rank * 0.1 }}
                className={`flex flex-col items-center justify-end rounded-t-xl p-4 ${
                  rankColors[user.rank].bg
                } ${user.rank === 1 ? "h-full" : user.rank === 2 ? "h-4/5" : "h-3/5"}`}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative -top-10 flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-lg mb-2">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center">
                    <h3 className={`font-bold ${rankColors[user.rank].text}`}>{user.name}</h3>
                    <p className="text-sm font-semibold text-white">{user.points} pts</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Other Users List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {otherUsers.length > 0 ? (
          otherUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden"
            >
              <div 
                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleExpand(user.id)}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-gray-200">
                  <span className="text-sm font-bold text-gray-600">
                    {user.rank}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-DGXblue to-blue-400 h-2 rounded-full" 
                        style={{ width: `${user.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 ml-2">{user.points} pts</span>
                  </div>
                </div>

                <div className="ml-2">
                  {expandedUser === user.id ? (
                    <ChevronUp className="text-gray-400" />
                  ) : (
                    <ChevronDown className="text-gray-400" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {expandedUser === user.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Badges</p>
                        <p className="font-bold text-DGXblue">{user.badges}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Streak</p>
                        <p className="font-bold text-DGXblue">{user.streak} days</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Modules</p>
                        <p className="font-bold text-DGXblue">{user.completedModules}</p>
                      </div>
                    </div>
                    
                    <div className="pb-3">
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">RECENT ACTIVITY</h4>
                      <div className="space-y-2">
                        {user.recentActivity.map((activity, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="font-medium">{activity.module}</span>
                            <div className="flex items-center">
                              <span className="text-DGXblue font-semibold mr-2">+{activity.points}</span>
                              <span className="text-gray-400 text-xs">{activity.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No leaderboard data available</p>
          </div>
        )}
      </div>

      {/* Current User */}
      <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-DGXblue">
            <img 
              src="https://ui-avatars.com/api/?name=You&background=random" 
              alt="You" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">You</h3>
            <div className="flex items-center mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-DGXblue to-blue-400 h-2 rounded-full" 
                  style={{ width: '65%' }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-500 ml-2">Loading...</span>
            </div>
          </div>
          <div className="ml-2">
            <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">#--</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;
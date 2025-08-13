import React, { useState, useEffect, useContext } from "react";
import { Trophy, ChevronDown, ChevronUp, Sparkles, Crown, Award, Medal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApiContext from '../../context/ApiContext';
import { useNavigate } from "react-router-dom";

export const LeaderBoard = () => {
  const [expandedUser, setExpandedUser] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userToken, fetchData } = useContext(ApiContext);
  const navigate = useNavigate();

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userToken) {
        throw new Error("Login to continue");
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
        const transformedData = data.data.quizzes.map((user, index) => ({
          id: user.UserID || index + 1,
          name: user.Name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.Name)}&background=random`,
          points: user.totalPoints || 0,
          progress: Math.min(100, Math.floor((user.totalPoints || 0) / 50)),
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
    1: { 
      bg: "bg-gradient-to-b from-yellow-400 to-yellow-200",
      text: "text-yellow-800",
      icon: <Crown className="w-5 h-5 fill-yellow-500 text-yellow-500" />
    },
    2: { 
      bg: "bg-gradient-to-b from-gray-300 to-gray-100",
      text: "text-gray-700",
      icon: <Award className="w-5 h-5 fill-gray-400 text-gray-400" />
    },
    3: { 
      bg: "bg-gradient-to-b from-orange-300 to-yellow-600",
      text: "text-amber-800",
      icon: <Medal className="w-5 h-5 fill-amber-500 text-amber-500" />
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-white rounded-xl">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-DGXblue border-t-transparent rounded-full mx-auto"
          ></motion.div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-white rounded-xl">
        <div className="text-center p-6 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-red-400" />
          </div>
          <p className="text-gray-700 text-lg font-medium mb-4">{error}</p>
          <button
            onClick={() => navigate("/SignInn")}
            className="mt-4 bg-gradient-to-r from-DGXblue to-blue-600 text-white py-3 px-6 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-DGXblue to-blue-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'white'
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="bg-white bg-opacity-20 p-2 rounded-lg mr-3"
            >
              <Trophy className="w-8 h-8" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Leaderboard</h2>
              <p className="mt-1 opacity-90 text-sm">Top performers this week</p>
            </div>
          </div>
          <motion.div 
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {topUsers.length > 0 && (
  <div className="px-4 md:px-6 py-4 bg-white">
    <div className="flex justify-center items-end h-48 md:h-56 gap-1 md:gap-3 relative">
      {/* 2nd Place */}
      {topUsers[1] && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 max-w-[120px] md:max-w-[150px] relative"
        >
          <div className={`h-32 md:h-36 rounded-t-lg ${rankColors[2].bg} flex flex-col items-center justify-end pb-2 relative`}>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow-md">
              <Award className="w-5 h-5 fill-gray-500 text-gray-500" />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-gray-600">2ND</span>
            </div>
          </div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
            onClick={() => toggleExpand(topUsers[1].id)}
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-white overflow-hidden shadow-lg mb-2">
              <img src={topUsers[1].avatar} alt={topUsers[1].name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-sm text-gray-700">{topUsers[1].name.split(' ')[0]}</h3>
              <p className="text-xs font-semibold text-gray-600">{topUsers[1].points} pts</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 1st Place */}
      {topUsers[0] && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 max-w-[150px] md:max-w-[180px] relative"
        >
          <div className={`h-40 md:h-44 rounded-t-lg ${rankColors[1].bg} flex flex-col items-center justify-end pb-3 relative`}>
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-md">
              <Crown className="w-6 h-6 fill-yellow-600 text-yellow-600" />
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-yellow-800">1ST</span>
            </div>
          </div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
            onClick={() => toggleExpand(topUsers[0].id)}
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-yellow-200 overflow-hidden shadow-lg mb-2">
              <img src={topUsers[0].avatar} alt={topUsers[0].name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-sm md:text-base text-yellow-800">{topUsers[0].name.split(' ')[0]}</h3>
              <p className="text-xs md:text-sm font-semibold text-yellow-700">{topUsers[0].points} pts</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 3rd Place */}
      {topUsers[2] && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex-1 max-w-[120px] md:max-w-[150px] relative"
        >
          <div className={`h-28 md:h-32 rounded-t-lg ${rankColors[3].bg} flex flex-col items-center justify-end pb-2 relative`}>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
              <Medal className="w-5 h-5 fill-amber-600 text-amber-600" />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-amber-800">3RD</span>
            </div>
          </div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
            onClick={() => toggleExpand(topUsers[2].id)}
          >
            <div className="w-12 h-12 rounded-full border-4 border-white overflow-hidden shadow-lg mb-2">
              <img src={topUsers[2].avatar} alt={topUsers[2].name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-sm text-amber-800">{topUsers[2].name.split(' ')[0]}</h3>
              <p className="text-xs font-semibold text-amber-700">{topUsers[2].points} pts</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Podium base */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-200 rounded-b-lg"></div>
    </div>
  </div>
)}

      {/* Other Users List */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 pb-4">
        {otherUsers.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            {otherUsers.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ scale: 1.005 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div 
                  className="flex items-center p-3 md:p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => toggleExpand(user.id)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold ${
                    user.rank <= 10 ? 
                    "bg-gradient-to-br from-DGXblue to-blue-500 text-white" : 
                    "bg-gray-100 text-gray-600"
                  }`}>
                    <span className="text-sm">{user.rank}</span>
                  </div>

                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-gray-100">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">
                        {user.name.split(' ')[0]}
                      </h3>
                      <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full ml-2">
                        {user.points} pts
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-DGXblue to-blue-400 h-full rounded-full" 
                          style={{ width: `${user.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* <motion.div
                    animate={{ rotate: expandedUser === user.id ? 180 : 0 }}
                    className="ml-2 text-gray-400"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div> */}
                </div>

                {/* <AnimatePresence>
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
                            <motion.div 
                              key={index} 
                              className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg"
                              whileHover={{ x: 5 }}
                            >
                              <span className="font-medium text-gray-700">{activity.module}</span>
                              <div className="flex items-center">
                                <span className="text-DGXblue font-semibold mr-2">+{activity.points}</span>
                                <span className="text-gray-400 text-xs">{activity.date}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence> */}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No leaderboard data available</p>
          </div>
        )}
      </div>

      {/* Current User */}
      <motion.div 
        className="p-4 bg-white border-t border-gray-200 sticky bottom-0 shadow-lg"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-DGXblue relative">
            <img 
              src="https://ui-avatars.com/api/?name=You&background=random" 
              alt="You" 
              className="w-full h-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-DGXblue rounded-full w-4 h-4 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">Your Progress</h3>
            <div className="flex items-center mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-DGXblue to-blue-400 h-2 rounded-full relative overflow-hidden"
                  style={{ width: '65%' }}
                >
                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-500 ml-2">65%</span>
            </div>
          </div>
          <div className="ml-2">
            <span className="text-sm font-medium bg-DGXblue text-white px-3 py-1 rounded-full">
              #{otherUsers.length + 4 || '--'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LeaderBoard;
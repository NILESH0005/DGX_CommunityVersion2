import React, { useState, useEffect, useContext } from "react";
import { Trophy, Sparkles, Crown, Award, Medal, TrendingUp, Users, Target, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
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

      if (!data) {
        throw new Error("No data received from server");
      }

      if (data.success) {
        // Transform API data without adding dummy data
        const transformedData = data.data.quizzes.map((user, index) => ({
          id: user.UserID || `user-${index}`,
          name: user.Name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.Name)}&background=random`,
          points: user.totalPoints || 0,
          // Use actual progress if available from API, otherwise use points as percentage indicator
          progress: user.progress || Math.min(100, Math.floor((user.totalPoints || 0) / 100)),
          badges: user.badges || 0,
          streak: user.streak || 0,
          completedModules: user.completedModules || 0,
          rank: index + 1,
          isCurrentUser: user.isCurrentUser || false
        }));

        // If current user exists in data, mark them
        const usersWithCurrentUser = transformedData.map((user, index) => ({
          ...user,
          displayRank: index + 1
        }));

        // Separate top 3 users for special treatment
        setTopUsers(usersWithCurrentUser.slice(0, 3));
        
        // Get remaining users starting from position 4
        const remainingUsers = usersWithCurrentUser.slice(3);
        setOtherUsers(remainingUsers);
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
      bg: "bg-gradient-to-b from-yellow-300 via-yellow-200 to-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-300",
      glow: "shadow-[0_0_40px_rgba(250,204,21,0.3)]",
      icon: <Crown className="w-6 h-6 fill-yellow-500 text-yellow-500" />
    },
    2: { 
      bg: "bg-gradient-to-b from-gray-200 via-gray-100 to-white",
      text: "text-gray-700",
      border: "border-gray-300",
      glow: "shadow-[0_0_30px_rgba(156,163,175,0.2)]",
      icon: <Award className="w-5 h-5 fill-gray-400 text-gray-400" />
    },
    3: { 
      bg: "bg-gradient-to-b from-orange-200 via-orange-100 to-white",
      text: "text-orange-800",
      border: "border-orange-300",
      glow: "shadow-[0_0_30px_rgba(251,146,60,0.2)]",
      icon: <Medal className="w-5 h-5 fill-orange-500 text-orange-500" />
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 2, ease: "linear" },
              scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
            }}
            className="w-20 h-20 border-4 border-DGXblue border-t-transparent border-r-transparent rounded-full mx-auto relative"
          >
            <Trophy className="absolute inset-0 m-auto w-8 h-8 text-DGXblue opacity-75" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-6 text-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent"
          >
            Loading leaderboard...
          </motion.p>
          <p className="mt-2 text-sm text-gray-500">Preparing the competition</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 rounded-2xl shadow-lg border border-gray-100">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8 max-w-md"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-pink-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-red-200 to-pink-200 rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-red-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Oops!
          </h3>
          <p className="text-gray-700 text-lg font-medium mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/SignInn")}
            className="mt-4 bg-gradient-to-r from-DGXblue to-blue-600 text-white py-3 px-8 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold shadow-lg"
          >
            Go to Login
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Empty state - when no users in the leaderboard
  if (topUsers.length === 0 && otherUsers.length === 0) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
        {/* Enhanced Header with 3D effect */}
        <div className="relative p-8 bg-gradient-to-br from-DGXblue via-blue-600 to-indigo-700 text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-white/5 to-transparent transform rotate-12"></div>
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-white/5 to-transparent transform -rotate-12"></div>
            
            {/* Floating particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 6 + 2 + 'px',
                  height: Math.random() * 6 + 2 + 'px',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3 + Math.random() * 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          {/* Header content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div 
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30"
                >
                  <Trophy className="w-10 h-10" />
                </motion.div>
                <div>
                  <motion.h2 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-3xl font-bold tracking-tight"
                  >
                    Leaderboard
                  </motion.h2>
                  <p className="mt-1.5 opacity-90 text-sm font-medium">Where champions rise</p>
                </div>
              </div>
              <motion.div 
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                  scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Immersive Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-100/30 to-purple-100/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-indigo-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
          </div>

          {/* Main empty state content */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center max-w-md"
          >
            {/* Animated trophy container */}
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotateY: [0, 180, 360]
              }}
              transition={{ 
                y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                rotateY: { repeat: Infinity, duration: 8, ease: "linear" }
              }}
              className="relative w-32 h-32 mx-auto mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-inner"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-16 h-16 text-gray-400" />
              </div>
              
              {/* Floating rings */}
              <motion.div 
                className="absolute inset-0 border-2 border-gray-300 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="absolute inset-4 border-2 border-gray-400/30 rounded-full"
                animate={{ scale: [1.2, 1, 1.2] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>

            {/* Text content */}
            <motion.h3 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3"
            >
              Leaderboard Awaits
            </motion.h3>
            
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              The stage is set but no champions have claimed their spots yet. 
              Be the first to make your mark and climb to the top!
            </p>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: <Users className="w-5 h-5" />, label: "Players", value: "0" },
                { icon: <Target className="w-5 h-5" />, label: "Points", value: "0" },
                { icon: <TrendingUp className="w-5 h-5" />, label: "Active", value: "0" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className="text-DGXblue">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchLeaderboard()}
                className="flex-1 bg-gradient-to-r from-DGXblue to-blue-600 text-white py-3.5 px-6 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold shadow-lg flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Leaderboard
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-white text-DGXblue py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold border-2 border-DGXblue shadow-sm"
              >
                Go to Dashboard
              </motion.button>
            </div>

            {/* Hint text */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-sm text-gray-500 italic"
            >
              Complete quizzes to earn points and appear on the leaderboard
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
      {/* Enhanced Header */}
      <div className="relative p-8 bg-gradient-to-br from-DGXblue via-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-white/5 to-transparent transform rotate-12"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-white/5 to-transparent transform -rotate-12"></div>
          
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 6 + 2 + 'px',
                height: Math.random() * 6 + 2 + 'px',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30"
              >
                <Trophy className="w-10 h-10" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
                <p className="mt-1.5 opacity-90 text-sm font-medium">Top performers this week</p>
              </div>
            </div>
            <motion.div 
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
              }}
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Top 3 Podium */}
      {topUsers.length > 0 && (
        <div className="px-4 md:px-6 py-6 bg-gradient-to-b from-white via-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-700 mb-6 text-center">Top Performers</h3>
          <div className="flex justify-center items-end h-56 md:h-64 gap-2 md:gap-4 relative">
            {/* 2nd Place */}
            {topUsers[1] && (
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 max-w-[140px] md:max-w-[160px] relative"
              >
                <div className={`h-36 md:h-40 rounded-t-2xl ${rankColors[2].bg} ${rankColors[2].glow} ${rankColors[2].border} border-b-0 flex flex-col items-center justify-end pb-4 relative overflow-hidden`}>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-xs font-bold text-gray-700">2</span>
                  </div>
                  <div className="text-center mt-4">
                    <span className="text-xs font-bold text-gray-600 tracking-wider">SILVER</span>
                  </div>
                </div>
                <motion.div 
                  whileHover={{ y: -8 }}
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
                  onClick={() => toggleExpand(topUsers[1].id)}
                >
                  <div className="w-16 h-16 md:w-18 md:h-18 rounded-full border-4 border-white overflow-hidden shadow-2xl mb-3">
                    <img src={topUsers[1].avatar} alt={topUsers[1].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg min-w-[120px]">
                    <h3 className="font-bold text-sm text-gray-800 truncate">{topUsers[1].name.split(' ')[0]}</h3>
                    <p className="text-xs font-semibold text-gray-600 mt-1">{topUsers[1].points} points</p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 1st Place */}
            {topUsers[0] && (
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="flex-1 max-w-[160px] md:max-w-[180px] relative"
              >
                <div className={`h-44 md:h-48 rounded-t-2xl ${rankColors[1].bg} ${rankColors[1].glow} ${rankColors[1].border} border-b-0 flex flex-col items-center justify-end pb-6 relative overflow-hidden`}>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-300 flex items-center justify-center shadow-lg border-2 border-yellow-200">
                    <Crown className="w-6 h-6 fill-yellow-600 text-yellow-600" />
                  </div>
                  <div className="text-center mt-6">
                    <span className="text-sm font-bold text-yellow-800 tracking-wider">GOLD</span>
                  </div>
                </div>
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
                  onClick={() => toggleExpand(topUsers[0].id)}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-50"></div>
                    <div className="w-20 h-20 rounded-full border-4 border-yellow-200 overflow-hidden shadow-2xl relative">
                      <img src={topUsers[0].avatar} alt={topUsers[0].name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="text-center bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg px-4 py-2 shadow-lg mt-3 min-w-[140px] border border-yellow-200">
                    <h3 className="font-bold text-base text-yellow-900 truncate">{topUsers[0].name.split(' ')[0]}</h3>
                    <p className="text-sm font-bold text-yellow-700 mt-1">{topUsers[0].points} points</p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {topUsers[2] && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex-1 max-w-[140px] md:max-w-[160px] relative"
              >
                <div className={`h-32 md:h-36 rounded-t-2xl ${rankColors[3].bg} ${rankColors[3].glow} ${rankColors[3].border} border-b-0 flex flex-col items-center justify-end pb-3 relative overflow-hidden`}>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-amber-300 flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-xs font-bold text-orange-800">3</span>
                  </div>
                  <div className="text-center mt-4">
                    <span className="text-xs font-bold text-orange-800 tracking-wider">BRONZE</span>
                  </div>
                </div>
                <motion.div 
                  whileHover={{ y: -6 }}
                  className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
                  onClick={() => toggleExpand(topUsers[2].id)}
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-white overflow-hidden shadow-2xl mb-2">
                    <img src={topUsers[2].avatar} alt={topUsers[2].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg min-w-[120px]">
                    <h3 className="font-bold text-sm text-gray-800 truncate">{topUsers[2].name.split(' ')[0]}</h3>
                    <p className="text-xs font-semibold text-gray-600 mt-1">{topUsers[2].points} points</p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Podium base */}
            <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-b-xl"></div>
          </div>
        </div>
      )}

      {/* Enhanced Other Users List */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700">All Participants</h3>
          <p className="text-sm text-gray-500 mt-1">Sorted by ranking</p>
        </div>

        {otherUsers.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            {otherUsers.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                className={`relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ${
                  user.isCurrentUser 
                    ? 'bg-gradient-to-r from-blue-50/80 via-white to-blue-50/80 border-2 border-DGXblue' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                {/* Current user gradient border effect */}
                {user.isCurrentUser && (
                  <div className="absolute inset-0 bg-gradient-to-r from-DGXblue/10 to-blue-500/10 rounded-2xl"></div>
                )}
                
                <div 
                  className="relative flex items-center p-4 cursor-pointer"
                  onClick={() => toggleExpand(user.id)}
                >
                  {/* Rank badge */}
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className={`relative w-12 h-12 rounded-2xl flex items-center justify-center mr-4 font-bold shadow-lg ${
                      user.displayRank <= 10 || user.isCurrentUser ? 
                      "bg-gradient-to-br from-DGXblue to-blue-600 text-white" : 
                      "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
                    }`}
                  >
                    <span className="text-base">{user.displayRank}</span>
                    {user.displayRank <= 3 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      </div>
                    )}
                  </motion.div>

                  {/* Avatar with status */}
                  <div className="relative mr-4">
                    <div className={`w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 ${
                      user.isCurrentUser ? 'border-DGXblue' : 'border-white'
                    }`}>
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    {user.streak > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                        <span className="text-xs font-bold text-white">🔥</span>
                      </div>
                    )}
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className={`font-bold truncate text-lg ${
                          user.isCurrentUser ? 'text-DGXblue' : 'text-gray-900'
                        }`}>
                          {user.name.split(' ')[0]}
                          {user.isCurrentUser && (
                            <span className="ml-2 text-sm font-normal px-2 py-0.5 bg-DGXblue/10 text-DGXblue rounded-full">You</span>
                          )}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {user.badges > 0 && (
                            <span className="flex items-center text-xs text-gray-600">
                              <Award className="w-3 h-3 mr-1" />
                              {user.badges} badges
                            </span>
                          )}
                          {user.streak > 0 && (
                            <span className="flex items-center text-xs text-orange-600">
                              🔥 {user.streak}d
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className={`px-4 py-2 rounded-xl font-bold shadow-sm ${
                          user.isCurrentUser 
                            ? 'bg-gradient-to-r from-DGXblue to-blue-600 text-white' 
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                        }`}
                      >
                        {user.points} pts
                      </motion.div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-gray-600">Progress</span>
                        <span className="text-xs font-bold text-gray-700">{user.progress}%</span>
                      </div>
                      <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-2.5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${user.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            user.isCurrentUser
                              ? 'bg-gradient-to-r from-DGXblue to-blue-500'
                              : 'bg-gradient-to-r from-DGXblue to-blue-400'
                          } shadow-inner`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Trophy className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">No other participants yet</p>
            <p className="text-gray-500 mt-2">Be the first to join the competition!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderBoard;
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const UserInsightsSection = () => {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [timeRange, setTimeRange] = useState("weekly");

  /* -------------------------------------
      DUMMY DATA
  -------------------------------------- */
  const userLeaderboard = [
    { id: 1, name: "Rohit Rawat", score: 98, attempts: 24, avatar: "👨‍💻", trend: "up" },
    { id: 2, name: "Ananya Sharma", score: 95, attempts: 28, avatar: "👩‍🎓", trend: "up" },
    { id: 3, name: "Nilesh", score: 92, attempts: 19, avatar: "👨‍💼", trend: "down" },
    { id: 4, name: "Nisha", score: 89, attempts: 22, avatar: "👩‍🔬", trend: "up" },
    { id: 5, name: "keshav", score: 87, attempts: 16, avatar: "👨‍🎨", trend: "stable" }
  ];

  const quizPerformance = [
    { name: "React Basics", score: 85, participants: 150 },
    { name: "JavaScript Advanced", score: 78, participants: 120 },
    { name: "Node.js Fundamentals", score: 92, participants: 95 },
    { name: "CSS Mastery", score: 88, participants: 110 },
    { name: "Database Design", score: 81, participants: 85 }
  ];

  const activityData = {
    weekly: [65, 78, 82, 79, 85, 90, 88],
    monthly: [45, 52, 61, 65, 72, 78, 82, 79, 85, 88, 90, 92],
    labels: {
      weekly: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      monthly: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    }
  };

  const topContent = [
    { id: 1, title: "Microservices Guide", author: "Ananya Sharma", likes: 520, comments: 89, type: "blog" },
    { id: 2, title: "React Hooks Deep Dive", author: "Rohit Rawat", likes: 487, comments: 76, type: "blog" },
    { id: 3, title: "Database Optimization", author: "David Kim", likes: 432, comments: 64, type: "discussion" }
  ];

  /* -------------------------------------
      CHART COMPONENTS
  -------------------------------------- */
  const BarChart = ({ data, height = 200, color = "#3B82F6" }) => {
    const maxValue = Math.max(...data.map(item => item.score || item.participants));
    
    return (
      <div className="flex items-end justify-between h-48 gap-2 mt-4">
        {data.map((item, index) => {
          const barHeight = ((item.score || item.participants) / maxValue) * (height - 40);
          return (
            <motion.div
              key={index}
              className="flex flex-col items-center flex-1"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <motion.div
                className="w-full rounded-t-lg hover:opacity-80 cursor-pointer transition-all"
                style={{ 
                  height: `${barHeight}px`, 
                  backgroundColor: color,
                  minHeight: '4px'
                }}
                whileHover={{ scale: 1.05 }}
                onClick={() => console.log(`View ${item.name} details`)}
              />
              <div className="text-xs text-gray-600 mt-2 text-center leading-tight">
                {item.name.split(' ')[0]}
              </div>
              <div className="text-xs font-semibold text-gray-800 mt-1">
                {item.score || item.participants}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const HorizontalBarChart = ({ users, metric = "score" }) => {
    const maxValue = Math.max(...users.map(user => user[metric]));
    
    return (
      <div className="space-y-3">
        {users.map((user, index) => {
          const width = (user[metric] / maxValue) * 100;
          return (
            <motion.div
              key={user.id}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
              whileHover={{ x: 4 }}
              onClick={() => console.log(`View ${user.name} profile`)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="text-xl">{user.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.attempts} attempts
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                  />
                </div>
                <div className="text-sm font-semibold text-gray-700 w-8 text-right">
                  {user[metric]}
                </div>
                <div className={`w-4 h-4 ${
                  user.trend === 'up' ? 'text-green-500' : 
                  user.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {user.trend === 'up' ? '↗' : user.trend === 'down' ? '↘' : '→'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 font-inter w-full h-full flex flex-col shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded"></span>
          User Insights
        </h2>
        
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["leaderboard", "quizzes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Leaderboard */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    🏆 Top Performers
                  </h3>
                  <HorizontalBarChart users={userLeaderboard} metric="score" />
                </div>

                {/* Most Active Users */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    📊 Most Active Users
                  </h3>
                  <HorizontalBarChart users={userLeaderboard} metric="attempts" />
                </div>
              </div>

              {/* Top Content */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📝 Top Content
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topContent.map((content, index) => (
                    <motion.div
                      key={content.id}
                      whileHover={{ y: -2 }}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition"
                      onClick={() => console.log(`View ${content.title}`)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          content.type === 'blog' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {content.type}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                        {content.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-3">by {content.author}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>👍 {content.likes}</span>
                        <span>💬 {content.comments}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📚 Quiz Performance
                </h3>
                <BarChart data={quizPerformance} color="#8B5CF6" />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Average Score</span>
                  <span>Participants</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 text-sm mb-2">Highest Average</h4>
                  <div className="text-2xl font-bold text-blue-600">92%</div>
                  <div className="text-sm text-blue-700">Node.js Fundamentals</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 text-sm mb-2">Most Popular</h4>
                  <div className="text-2xl font-bold text-green-600">150</div>
                  <div className="text-sm text-green-700">React Basics</div>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Quick Stats Footer */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Updated in real-time
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
          onClick={() => console.log("View detailed analytics")}
        >
          View Full Report
        </motion.button>
      </div>
    </motion.div>
  );
};

export default UserInsightsSection;
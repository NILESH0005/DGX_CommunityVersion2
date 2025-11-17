import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const UserInsightsDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("weekly");

  /* -------------------------------------
      DUMMY DATA
  -------------------------------------- */
  const userMetrics = {
    dailyActive: 1245,
    weeklyActive: 8456,
    monthlyActive: 32456,
    newUsers: 234,
    returningUsers: 1011,
    avgSessionTime: "4m 23s",
    bounceRate: "32%",
    conversionRate: "8.4%",
  };

  const userLeaderboard = [
    {
      id: 1,
      name: "Rohit Rawat",
      score: 98,
      avatar: "👨‍💻",
      trend: "up",
      activity: 142,
      attempts: 45,
    },
    {
      id: 2,
      name: "Ananya Sharma",
      score: 95,
      avatar: "👩‍🎓",
      trend: "up",
      activity: 138,
      attempts: 42,
    },
    {
      id: 3,
      name: "Nilesh Kumar",
      score: 92,
      avatar: "👨‍💼",
      trend: "down",
      activity: 125,
      attempts: 38,
    },
  ];

  const topBlogs = [
    {
      id: 1,
      title: "Microservices Architecture Guide",
      author: "Ananya Sharma",
      rating: 4.8,
      claps: 520,
      reposts: 89,
      reads: 12500,
      date: "2024-01-15",
      tags: ["Architecture", "Backend"],
      type: "blog",
    },
    {
      id: 2,
      title: "React Hooks Deep Dive",
      author: "Rohit Rawat",
      rating: 4.9,
      claps: 487,
      reposts: 76,
      reads: 9800,
      date: "2024-01-12",
      tags: ["React", "Frontend"],
      type: "blog",
    },
    {
      id: 3,
      title: "Advanced CSS Grid Techniques",
      author: "Nisha Patel",
      rating: 4.7,
      claps: 432,
      reposts: 64,
      reads: 7600,
      date: "2024-01-10",
      tags: ["CSS", "Design"],
      type: "blog",
    },
  ];

  const topDiscussions = [
    {
      id: 1,
      title: "Database Optimization Strategies",
      author: "David Kim",
      likes: 342,
      comments: 89,
      reposts: 23,
      views: 4500,
      date: "2024-01-14",
      tags: ["Database", "Performance"],
      type: "discussion",
    },
    {
      id: 2,
      title: "State Management in Large Apps",
      author: "Priya Mehta",
      likes: 298,
      comments: 67,
      reposts: 18,
      views: 3800,
      date: "2024-01-13",
      tags: ["React", "State Management"],
      type: "discussion",
    },
    {
      id: 3,
      title: "API Security Best Practices",
      author: "Arjun Reddy",
      likes: 276,
      comments: 54,
      reposts: 15,
      views: 3200,
      date: "2024-01-11",
      tags: ["Security", "Backend"],
      type: "discussion",
    },
  ];

  const funnelData = [
    { stage: "Visitors", count: 10000 },
    { stage: "Signups", count: 2500 },
    { stage: "Active Users", count: 1500 },
  ];

  const retentionData = {
    weekly: [100, 85, 72, 68, 65, 62, 60],
    monthly: [100, 78, 65, 58, 52, 48, 45, 43, 41, 40, 39, 38],
    labels: {
      weekly: [
        "Week 1",
        "Week 2",
        "Week 3",
        "Week 4",
        "Week 5",
        "Week 6",
        "Week 7",
      ],
      monthly: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
  };

  const deviceData = [
    { id: 1, device: "Mobile", percentage: 58, users: 5843 },
    { id: 2, device: "Desktop", percentage: 35, users: 3521 },
    { id: 3, device: "Tablet", percentage: 7, users: 705 },
  ];

  const featureAdoption = [
    { id: 1, feature: "Blog Creation", adoption: 85, trend: "up" },
    { id: 2, feature: "Discussion Forums", adoption: 72, trend: "up" },
    { id: 3, feature: "Quiz System", adoption: 68, trend: "stable" },
    { id: 4, feature: "Analytics Dashboard", adoption: 45, trend: "up" },
    { id: 5, feature: "Collaborative Editing", adoption: 32, trend: "down" },
  ];

  /* -------------------------------------
      CHART COMPONENTS
  -------------------------------------- */
  const MetricCard = ({ title, value, change, icon, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
    };

    return (
      <motion.div
        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
        whileHover={{ y: -2, shadow: "md" }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <p
                className={`text-xs ${
                  change.startsWith("+") ? "text-green-600" : "text-red-600"
                } mt-1`}
              >
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <span className="text-xl">{icon}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const FunnelChart = ({ data }) => (
    <div className="space-y-2">
      {data.map((item, index) => (
        <motion.div
          key={item.stage}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <span className="font-medium text-gray-700 w-24">{item.stage}</span>
          <div className="flex-1 mx-4">
            <div className="bg-gray-200 rounded-full h-4">
              <motion.div
                className="h-4 rounded-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
              />
            </div>
          </div>
          <div className="text-right w-20">
            <div className="font-semibold text-gray-900">
              {item.count.toLocaleString()}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const HorizontalBarChart = ({
    data = [],
    metric = "score",
    color = "#3B82F6",
    showPercentage = false,
  }) => {
    // Add safety checks for data
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500">
          No data available
        </div>
      );
    }

    const maxValue = Math.max(...data.map((item) => item[metric] || 0));

    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const value = item[metric] || 0;
          const width = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <motion.div
              key={item.id || index}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
              whileHover={{ x: 4 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {item.avatar && <div className="text-xl">{item.avatar}</div>}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {item.name ||
                      item.country ||
                      item.feature ||
                      `Item ${index + 1}`}
                  </div>
                  {item.role && (
                    <div className="text-xs text-gray-500">{item.role}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                  />
                </div>
                <div className="text-sm font-semibold text-gray-700 w-12 text-right">
                  {value}
                  {showPercentage && "%"}
                </div>
                {item.trend && (
                  <div
                    className={`w-4 h-4 ${
                      item.trend === "up"
                        ? "text-green-500"
                        : item.trend === "down"
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {item.trend === "up"
                      ? "↗"
                      : item.trend === "down"
                      ? "↘"
                      : "→"}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const BlogCard = ({ blog }) => (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
          Blog
        </span>
        <span className="text-xs text-gray-500">{blog.date}</span>
      </div>

      <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
        {blog.title}
      </h4>
      <p className="text-xs text-gray-600 mb-3">by {blog.author}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {blog.tags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{blog.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👏</span>
            <span>{blog.claps}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔄</span>
            <span>{blog.reposts}</span>
          </div>
        </div>
        <div className="text-gray-500">{blog.reads.toLocaleString()} reads</div>
      </div>
    </motion.div>
  );

  const DiscussionCard = ({ discussion }) => (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
          Discussion
        </span>
        <span className="text-xs text-gray-500">{discussion.date}</span>
      </div>

      <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
        {discussion.title}
      </h4>
      <p className="text-xs text-gray-600 mb-3">by {discussion.author}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {discussion.tags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span>👍</span>
            <span>{discussion.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💬</span>
            <span>{discussion.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔄</span>
            <span>{discussion.reposts}</span>
          </div>
        </div>
        <div className="text-gray-500">
          {discussion.views.toLocaleString()} views
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-inter">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Insights Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive analytics and user behavior metrics
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["overview", "engagement", "content"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition capitalize ${
                  activeTab === tab
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Daily Active Users"
                    value={userMetrics.dailyActive.toLocaleString()}
                    change="+12.4%"
                    icon="👥"
                    color="blue"
                  />
                  {/* <MetricCard
                    title="Avg Session Time"
                    value={userMetrics.avgSessionTime}
                    change="+2.3%"
                    icon="⏱️"
                    color="green"
                  /> */}
                  <MetricCard
                    title="New Users"
                    value={userMetrics.newUsers.toLocaleString()}
                    change="+8.7%"
                    icon="🆕"
                    color="purple"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Funnel */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      📊 Conversion Funnel
                    </h3>
                    <FunnelChart data={funnelData} />
                  </div>

                  {/* Top Performers */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      🏆 Top Performers
                    </h3>
                    <HorizontalBarChart
                      data={userLeaderboard.slice(0, 5)}
                      metric="score"
                      color="#8B5CF6"
                    />
                  </div>
                </div>

                {/* Top Content Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    📝 Top Content
                  </h3>

                  {/* Blogs */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">
                      Popular Blogs
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {topBlogs.map((blog) => (
                        <BlogCard key={blog.id} blog={blog} />
                      ))}
                    </div>
                  </div>

                  {/* Discussions */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">
                      Active Discussions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {topDiscussions.map((discussion) => (
                        <DiscussionCard
                          key={discussion.id}
                          discussion={discussion}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ENGAGEMENT TAB */}
            {activeTab === "engagement" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"></div>

                {/* Device Distribution */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    📱 Device Distribution
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {deviceData.map((device, index) => (
                      <motion.div
                        key={device.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {device.device}
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {device.percentage}%
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {device.users.toLocaleString()} users
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONTENT TAB */}
            {activeTab === "content" && (
              <div className="space-y-6">
                {/* Content Performance */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-6">
                    🎯 Content Performance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Blogs */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Top Blogs
                      </h4>
                      <div className="space-y-4">
                        {topBlogs.map((blog) => (
                          <BlogCard key={blog.id} blog={blog} />
                        ))}
                      </div>
                    </div>

                    {/* Top Discussions */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Top Discussions
                      </h4>
                      <div className="space-y-4">
                        {topDiscussions.map((discussion) => (
                          <DiscussionCard
                            key={discussion.id}
                            discussion={discussion}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default UserInsightsDashboard;

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const UserInsightsDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("weekly");
  const [selectedSegment, setSelectedSegment] = useState(null);

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
      role: "Power User",
    },
    {
      id: 2,
      name: "Ananya Sharma",
      score: 95,
      avatar: "👩‍🎓",
      trend: "up",
      activity: 138,
      role: "Content Creator",
    },
    {
      id: 3,
      name: "Nilesh Kumar",
      score: 92,
      avatar: "👨‍💼",
      trend: "down",
      activity: 125,
      role: "Moderator",
    },
    {
      id: 4,
      name: "Nisha Patel",
      score: 89,
      avatar: "👩‍🔬",
      trend: "up",
      activity: 118,
      role: "Contributor",
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

  const deviceData = [
    {
      id: 1,
      device: "Mobile",
      percentage: 58,
      users: 5843,
      color: "#3B82F6",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      id: 2,
      device: "Desktop",
      percentage: 35,
      users: 3521,
      color: "#10B981",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      id: 3,
      device: "Tablet",
      percentage: 7,
      users: 705,
      color: "#F59E0B",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
  ];

  const engagementData = [
    {
      label: "Blog Views",
      value: 12450,
      percentage: 42,
      color: "#3B82F6",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Comments",
      value: 3245,
      percentage: 28,
      color: "#10B981",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      label: "Shares",
      value: 1876,
      percentage: 18,
      color: "#F59E0B",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
    {
      label: "Reactions",
      value: 8923,
      percentage: 12,
      color: "#EF4444",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
  ];

  const totalEngagement = engagementData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  /* -------------------------------------
      CHART COMPONENTS
  -------------------------------------- */
  const PieChart = ({ data, size = 160, total }) => {
    const radius = size / 2;
    const circumference = 2 * Math.PI * radius;

    let currentAngle = 0;

    const segments = data.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 360;
      const strokeDasharray = `${circumference * percentage} ${
        circumference * (1 - percentage)
      }`;
      const rotation = currentAngle;

      currentAngle += angle;

      return {
        ...item,
        strokeDasharray,
        rotation: rotation - 90, // Start from top
        angle,
      };
    });

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={radius}
              cy={radius}
              r={radius - 4}
              fill="none"
              stroke={segment.color}
              strokeWidth="8"
              strokeDasharray={segment.strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer hover:opacity-80"
              style={{
                transform: `rotate(${segment.rotation}deg)`,
                transformOrigin: `${radius}px ${radius}px`,
              }}
              onMouseEnter={() => setSelectedSegment(segment)}
              onMouseLeave={() => setSelectedSegment(null)}
              onClick={() => console.log(`View ${segment.label} analytics`)}
            />
          ))}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="text-2xl font-bold text-gray-800">
            {total.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Total</div>
        </div>

        {/* Tooltip */}
        {selectedSegment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10"
          >
            <div className="font-semibold">{selectedSegment.label}</div>
            <div>
              {selectedSegment.value.toLocaleString()} (
              {selectedSegment.percentage}%)
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </motion.div>
        )}
      </div>
    );
  };

  const MetricCard = ({
    title,
    value,
    change,
    icon,
    color = "blue",
    onClick,
  }) => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-600 border-blue-200",
      green: "bg-green-100 text-green-600 border-green-200",
      purple: "bg-purple-100 text-purple-600 border-purple-200",
      orange: "bg-orange-100 text-orange-600 border-orange-200",
      red: "bg-red-100 text-red-600 border-red-200",
    };

    return (
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`p-4 rounded-xl border-2 ${colorClasses[color]} text-left shadow-sm hover:shadow-md transition-all duration-200 group w-full`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl">{icon}</div>
          <motion.div
            className={`text-lg font-bold ${colorClasses[color].split(" ")[1]}`}
            whileHover={{ scale: 1.1 }}
          >
            {value}
          </motion.div>
        </div>

        <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-gray-900 transition">
          {title}
        </h3>

        {change && (
          <p
            className={`text-xs ${
              change.startsWith("+") ? "text-green-600" : "text-red-600"
            } font-medium`}
          >
            {change} from last period
          </p>
        )}

        {/* Hover action indicator */}
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-gray-400">Click for details</span>
          <span className="text-xs">→</span>
        </div>
      </motion.button>
    );
  };

  const HorizontalBarChart = ({
    data = [],
    metric = "score",
    color = "#3B82F6",
    showPercentage = false,
  }) => {
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
              onClick={() => console.log(`View ${item.name} details`)}
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
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-xl p-4 border-2 border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={() => console.log(`View blog: ${blog.title}`)}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
          Blog
        </span>
        <span className="text-xs text-gray-500">{blog.date}</span>
      </div>

      <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-gray-700 transition">
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
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-xl p-4 border-2 border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={() => console.log(`View discussion: ${discussion.title}`)}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
          Discussion
        </span>
        <span className="text-xs text-gray-500">{discussion.date}</span>
      </div>

      <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-gray-700 transition">
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

  const statsCards = [
    {
      id: 1,
      label: "Daily Active Users",
      value: userMetrics.dailyActive.toLocaleString(),
      change: "+12.4%",
      icon: "👥",
      color: "blue",
      onClick: () => console.log("View DAU analytics"),
    },
    {
      id: 2,
      label: "New Users",
      value: userMetrics.newUsers.toLocaleString(),
      change: "+8.7%",
      icon: "🆕",
      color: "purple",
      onClick: () => console.log("View new user analytics"),
    },
    {
      id: 3,
      label: "Avg Session Time",
      value: userMetrics.avgSessionTime,
      change: "+2.3%",
      icon: "⏱️",
      color: "green",
      onClick: () => console.log("View session analytics"),
    },
    {
      id: 4,
      label: "Conversion Rate",
      value: userMetrics.conversionRate,
      change: "+1.2%",
      icon: "📈",
      color: "orange",
      onClick: () => console.log("View conversion analytics"),
    },
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 font-inter w-full h-full flex flex-col "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-green-500 rounded"></span>
          User Insights Dashboard
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Last 7 days
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        {["overview", "engagement", "content"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition capitalize flex-1 ${
              activeTab === tab
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((card) => (
                  <MetricCard key={card.id} {...card} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performers */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    🏆 Top Performers
                  </h3>
                  <HorizontalBarChart
                    data={userLeaderboard}
                    metric="score"
                    color="#8B5CF6"
                  />
                </div>

                {/* Engagement Breakdown */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    📊 Engagement Breakdown
                  </h3>
                  <div className="flex flex-col items-center space-y-6">
                    <PieChart
                      data={engagementData}
                      size={160}
                      total={totalEngagement}
                    />

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                      {engagementData.map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer transition"
                          whileHover={{ scale: 1.05 }}
                          onMouseEnter={() => setSelectedSegment(item)}
                          onMouseLeave={() => setSelectedSegment(null)}
                          onClick={() => console.log(`Filter by ${item.label}`)}
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-700 truncate">
                              {item.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.percentage}%
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Content Section */}
              <div className="bg-gray-50 rounded-xl p-4">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Distribution */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    📱 Device Distribution
                  </h3>
                  <div className="space-y-4">
                    {deviceData.map((device, index) => (
                      <motion.div
                        key={device.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() =>
                          console.log(`View ${device.device} analytics`)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: device.color }}
                          ></div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {device.device}
                            </div>
                            <div className="text-sm text-gray-500">
                              {device.users.toLocaleString()} users
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">
                            {device.percentage}%
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Most Active Users */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    ⭐ Most Active Users
                  </h3>
                  <HorizontalBarChart
                    data={userLeaderboard}
                    metric="activity"
                    color="#10B981"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CONTENT TAB */}
          {activeTab === "content" && (
            <div className="space-y-6">
              {/* Content Performance */}
              <div className="bg-gray-50 rounded-xl p-4">
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
  );
};

export default UserInsightsDashboard;

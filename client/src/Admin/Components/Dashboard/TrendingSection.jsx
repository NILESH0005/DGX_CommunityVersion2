import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------------------
   DUMMY DATA (Blogs + Discussions)
-------------------------------- */
const trendingBlogs = [
  {
    id: 1,
    title: "The Future of AI in Web Development",
    author: "Sarah Chen",
    rating: 4.8,
    reposts: 142,
    claps: 1250,
    views: 15420,
    rank: 1,
    category: "Technology",
    createdDate: "2024-01-15",
    engagement: 1892,
    trendData: [45, 52, 48, 65, 72, 68, 85, 92, 88, 95, 110, 125],
    readTime: "8 min read",
    tags: ["AI", "Web Dev", "Future"],
  },
  {
    id: 2,
    title: "Mastering React Hooks in 2024",
    author: "Mike Rodriguez",
    rating: 4.6,
    reposts: 98,
    claps: 890,
    views: 11200,
    rank: 2,
    category: "Programming",
    createdDate: "2024-01-12",
    engagement: 1052,
    trendData: [30, 35, 42, 38, 45, 52, 58, 65, 72, 78, 85, 89],
    readTime: "12 min read",
    tags: ["React", "Hooks", "JavaScript"],
  },
  {
    id: 3,
    title: "Sustainable Web Design Practices",
    author: "Emma Wilson",
    rating: 4.9,
    reposts: 76,
    claps: 1100,
    views: 9800,
    rank: 3,
    category: "Design",
    createdDate: "2024-01-10",
    engagement: 1216,
    trendData: [25, 28, 32, 45, 52, 48, 55, 62, 68, 72, 78, 110],
    readTime: "6 min read",
    tags: ["Design", "Sustainability", "UI/UX"],
  },
];

const trendingDiscussions = [
  {
    id: 1,
    title: "Best practices for microservices architecture",
    creator: "Alex Thompson",
    likes: 324,
    reposts: 87,
    comments: 156,
    isHot: true,
    rank: 1,
    views: 8900,
    category: "Architecture",
    createdDate: "2024-01-14",
    engagement: 567,
    trendData: [20, 25, 32, 45, 38, 42, 55, 62, 58, 65, 72, 87],
    tags: ["Microservices", "Architecture", "Best Practices"],
  },
  {
    id: 2,
    title: "How do you handle state management in large React apps?",
    creator: "Jessica Lee",
    likes: 287,
    reposts: 64,
    comments: 203,
    isHot: true,
    rank: 2,
    views: 11200,
    category: "Frontend",
    createdDate: "2024-01-13",
    engagement: 554,
    trendData: [15, 22, 35, 42, 38, 45, 52, 58, 65, 72, 68, 64],
    tags: ["React", "State Management", "Frontend"],
  },
  {
    id: 3,
    title: "Database optimization techniques for high-traffic apps",
    creator: "David Kim",
    likes: 198,
    reposts: 45,
    comments: 89,
    isHot: false,
    rank: 3,
    views: 6700,
    category: "Backend",
    createdDate: "2024-01-11",
    engagement: 332,
    trendData: [10, 15, 22, 28, 32, 38, 35, 42, 45, 38, 42, 45],
    tags: ["Database", "Optimization", "Backend"],
  },
];

/* -------------------------------
   SPARKLINE COMPONENT
-------------------------------- */
const Sparkline = ({ data, width = 60, height = 20, color = "#3B82F6" }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / (max - min)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* -------------------------------
   RANK BADGE COMPONENT
-------------------------------- */
const RankBadge = ({ rank, size = "sm" }) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-br from-gray-400 to-gray-600 text-white";
      case 3:
        return "bg-gradient-to-br from-orange-400 to-orange-600 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${getRankColor(
        rank
      )} rounded-full flex items-center justify-center font-bold shadow-lg`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {rank}
    </motion.div>
  );
};

/* -------------------------------
   TOOLTIP COMPONENT
-------------------------------- */
const Tooltip = ({ children, analytics, position = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${positionClasses[position]} bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl`}
          >
            {analytics}
            <div
              className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                position === "top"
                  ? "top-full left-1/2 -translate-x-1/2 -mt-1"
                  : position === "bottom"
                  ? "bottom-full left-1/2 -translate-x-1/2 -mb-1"
                  : position === "left"
                  ? "left-full top-1/2 -translate-y-1/2 -ml-1"
                  : "right-full top-1/2 -translate-y-1/2 -mr-1"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* -------------------------------
   DETAIL MODAL COMPONENT
-------------------------------- */
const DetailModal = ({ item, type, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <RankBadge rank={item.rank} size="md" />
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  by {type === "blog" ? item.author : item.creator}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-600">Engagement</div>
                <div className="font-bold text-lg">{item.engagement}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-600">Views</div>
                <div className="font-bold text-lg">
                  {item.views?.toLocaleString()}
                </div>
              </div>
            </div>

            {type === "blog" ? (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-blue-600 font-bold">{item.rating}</div>
                  <div className="text-xs text-blue-500">Rating</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-green-600 font-bold">{item.claps}</div>
                  <div className="text-xs text-green-500">Claps</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="text-purple-600 font-bold">
                    {item.reposts}
                  </div>
                  <div className="text-xs text-purple-500">Reposts</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-blue-600 font-bold">{item.likes}</div>
                  <div className="text-xs text-blue-500">Likes</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-green-600 font-bold">
                    {item.comments}
                  </div>
                  <div className="text-xs text-green-500">Comments</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="text-purple-600 font-bold">
                    {item.reposts}
                  </div>
                  <div className="text-xs text-purple-500">Reposts</div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Trend Analytics</h4>
              <div className="flex justify-center">
                <Sparkline data={item.trendData} width={200} height={40} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {item.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* -------------------------------
   CARD SUB-COMPONENT
-------------------------------- */
const Card = ({ item, type }) => {
  const [showModal, setShowModal] = useState(false);

  const getEngagementStats = () => {
    if (type === "blog") {
      return [
        {
          label: "Rating",
          value: item.rating,
          icon: "⭐",
          color: "text-yellow-600",
        },
        {
          label: "Claps",
          value: item.claps,
          icon: "👏",
          color: "text-green-600",
        },
        {
          label: "Reposts",
          value: item.reposts,
          icon: "🔁",
          color: "text-purple-600",
        },
        {
          label: "Views",
          value: item.views,
          icon: "👀",
          color: "text-blue-600",
        },
      ];
    } else {
      return [
        {
          label: "Likes",
          value: item.likes,
          icon: "👍",
          color: "text-blue-600",
        },
        {
          label: "Comments",
          value: item.comments,
          icon: "💬",
          color: "text-green-600",
        },
        {
          label: "Reposts",
          value: item.reposts,
          icon: "🔁",
          color: "text-purple-600",
        },
        {
          label: "Views",
          value: item.views,
          icon: "👀",
          color: "text-gray-600",
        },
      ];
    }
  };

  const engagementStats = getEngagementStats();

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300"
        onClick={() => setShowModal(true)}
      >
        <div className="flex gap-3">
          {/* Rank Badge */}
          <RankBadge rank={item.rank} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-inter font-semibold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition flex-1">
                {item.title}
              </h4>

              {/* Sparkline */}
              <Tooltip
                analytics={`Trend over last ${item.trendData.length} days`}
                position="left"
              >
                <Sparkline
                  data={item.trendData}
                  color={type === "blog" ? "#3B82F6" : "#10B981"}
                />
              </Tooltip>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>by {type === "blog" ? item.author : item.creator}</span>
              <div className="flex items-center gap-2">
                <span className="bg-gray-100 px-2 py-1 rounded-full">
                  {item.category}
                </span>
                {type === "blog" && item.readTime && (
                  <span className="text-gray-400">{item.readTime}</span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
              {engagementStats.map((stat, index) => (
                <Tooltip
                  key={index}
                  analytics={`${stat.label}: ${stat.value}`}
                  position="top"
                >
                  <div className="text-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className={`text-xs font-semibold ${stat.color}`}>
                      {stat.icon}{" "}
                      {stat.value > 1000
                        ? `${(stat.value / 1000).toFixed(1)}k`
                        : stat.value}
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>

            {/* Engagement & Hot Badge */}
            <div className="flex items-center justify-between mt-3">
              <Tooltip
                analytics={`Total Engagement Score: ${item.engagement}`}
                position="top"
              >
            
              </Tooltip>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <DetailModal
        item={item}
        type={type}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

/* -------------------------------
   MAIN TRENDING SECTION
-------------------------------- */
const TrendingSection = () => {
  const [activeTab, setActiveTab] = useState("blogs");
  const [sortBy, setSortBy] = useState("engagement");

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 mb-6 font-inter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* ---------- MOBILE TABS ONLY ---------- */}
      <div className="md:hidden flex space-x-2 bg-gray-100 p-1 rounded-xl mb-6">
        <motion.button
          onClick={() => setActiveTab("blogs")}
          className={`w-1/2 py-2 rounded-lg text-sm font-medium ${
            activeTab === "blogs"
              ? "bg-white text-blue-600 shadow"
              : "text-gray-600"
          }`}
          whileTap={{ scale: 0.98 }}
        >
          Blogs
        </motion.button>

        <motion.button
          onClick={() => setActiveTab("discussions")}
          className={`w-1/2 py-2 rounded-lg text-sm font-medium ${
            activeTab === "discussions"
              ? "bg-white text-blue-600 shadow"
              : "text-gray-600"
          }`}
          whileTap={{ scale: 0.98 }}
        >
          Discussions
        </motion.button>
      </div>

      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          🔥 Trending Now
        </h3>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="rating">Rating</option>
          <option value="claps">Claps</option>
          <option value="reposts">Reposts</option>
          <option value="likes">Likes</option>
          <option value="comments">Comments</option>
        </select>
      </div>

      {/* ---------- DESKTOP SIDE BY SIDE ---------- */}
      <div className="hidden md:grid grid-cols-2 gap-6">
        {/* BLOGS */}
        <div>
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-500 rounded"></span>
            Trending Blogs
          </h3>

          <div className="space-y-4">
            {trendingBlogs.map((blog) => (
              <Card key={blog.id} item={blog} type="blog" />
            ))}
          </div>
        </div>

        {/* DISCUSSIONS */}
        <div>
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-4 bg-green-500 rounded"></span>
            Trending Discussions
          </h3>

          <div className="space-y-4">
            {trendingDiscussions.map((disc) => (
              <Card key={disc.id} item={disc} type="discussion" />
            ))}
          </div>
        </div>
      </div>

      {/* ---------- MOBILE SWITCH VIEW ---------- */}
      <div className="md:hidden">
        {activeTab === "blogs" ? (
          <div className="space-y-4">
            {trendingBlogs.map((blog) => (
              <Card key={blog.id} item={blog} type="blog" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {trendingDiscussions.map((disc) => (
              <Card key={disc.id} item={disc} type="discussion" />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TrendingSection;

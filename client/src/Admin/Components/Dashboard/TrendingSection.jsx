import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------------------
   DUMMY DATA (Blogs + Discussions)
-------------------------------- */
const trendingBlogs = [
  {
    id: 1,
    title:
      "The Future of AI in Web Development: A Comprehensive Guide to Modern AI Tools and Frameworks",
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
    fullDescription:
      "Explore the cutting-edge advancements in AI and how they're revolutionizing web development. From automated code generation to intelligent user interfaces, discover the tools and frameworks shaping the future of web applications.",
  },
  {
    id: 2,
    title:
      "Mastering React Hooks in 2024: Advanced Patterns and Best Practices for Modern React Development",
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
    fullDescription:
      "Dive deep into React Hooks with advanced patterns, custom hooks, and performance optimization techniques. Learn how to build scalable and maintainable React applications using modern hook-based architecture.",
  },
  {
    id: 3,
    title:
      "Sustainable Web Design Practices: Building Eco-Friendly Digital Experiences for the Modern Web",
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
    fullDescription:
      "Discover sustainable web design principles that reduce environmental impact while improving user experience. Learn about performance optimization, green hosting, and eco-conscious design patterns.",
  },
];

const trendingDiscussions = [
  {
    id: 1,
    title:
      "Best practices for microservices architecture in large-scale enterprise applications and distributed systems",
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
    fullDescription:
      "Join the discussion on microservices best practices, including service decomposition, communication patterns, and deployment strategies for enterprise-scale applications.",
  },
  {
    id: 2,
    title:
      "How do you handle state management in large React applications with complex data flow and multiple teams?",
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
    fullDescription:
      "Share your experiences and solutions for managing complex state in large React applications. Discuss Redux, Context API, Zustand, and other state management libraries.",
  },
  {
    id: 3,
    title:
      "Database optimization techniques for high-traffic applications: Scaling strategies and performance tuning",
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
    fullDescription:
      "Explore database optimization techniques for high-traffic applications. Discuss indexing strategies, query optimization, caching, and scaling approaches for different database systems.",
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
   DETAIL MODAL COMPONENT
-------------------------------- */
const DetailModal = ({ item, type, isOpen, onClose }) => {
  if (!isOpen) return null;

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
          className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <RankBadge rank={item.rank} size="lg" />
              <div>
                <h3 className="font-bold text-2xl text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600 mt-1">
                  by {type === "blog" ? item.author : item.creator}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl p-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
              <p className="text-gray-700 leading-relaxed">
                {item.fullDescription}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {engagementStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 text-center"
                >
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                    {stat.value > 1000
                      ? `${(stat.value / 1000).toFixed(1)}k`
                      : stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{item.createdDate}</span>
                  </div>

                  {type === "blog" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Read Time:</span>
                      <span className="font-medium">{item.readTime}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Trend Analytics
                </h4>
                <div className="flex justify-center">
                  <Sparkline
                    data={item.trendData}
                    width={200}
                    height={60}
                    color={type === "blog" ? "#3B82F6" : "#10B981"}
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {item.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
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
  const shadowColor =
    type === "blog" ? "hover:shadow-blue-500/20" : "hover:shadow-green-500/20";

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className={`bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-xl transition-all duration-300 ${shadowColor}`}
      >
        <div className="flex gap-3">
          {/* Rank Badge */}
          <RankBadge rank={item.rank} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with single line title */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <h4 className="font-inter font-semibold text-gray-900 text-sm line-clamp-1 hover:text-blue-600 transition flex-1 pr-2">
                {item.title}
              </h4>

              {/* Sparkline */}
              <Sparkline
                data={item.trendData}
                color={type === "blog" ? "#3B82F6" : "#10B981"}
              />
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>by {type === "blog" ? item.author : item.creator}</span>
              <div className="flex items-center gap-2">
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                  {item.category}
                </span>
                {type === "blog" && item.readTime && (
                  <span className="text-gray-400">{item.readTime}</span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {engagementStats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-2 bg-gray-50 rounded-lg"
                >
                  <div className={`text-xs font-semibold ${stat.color}`}>
                    {stat.icon}{" "}
                    {stat.value > 1000
                      ? `${(stat.value / 1000).toFixed(1)}k`
                      : stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* See More Button */}
            <div className="flex items-center justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className={`text-xs font-medium px-3 py-1 rounded-lg ${
                  type === "blog"
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                } transition`}
              >
                See More →
              </motion.button>
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
  const [blogSortBy, setBlogSortBy] = useState("engagement");
  const [discussionSortBy, setDiscussionSortBy] = useState("engagement");

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 mb-6 font-inter sh"
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
              ? "bg-white text-green-600 shadow"
              : "text-gray-600"
          }`}
          whileTap={{ scale: 0.98 }}
        >
          Discussions
        </motion.button>
      </div>

      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center mb-6"></div>

      {/* ---------- DESKTOP SIDE BY SIDE WITH SEPARATE FILTERS ---------- */}
      <div className="hidden md:grid grid-cols-2 gap-6">
        {/* BLOGS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <span className="w-2 h-4 bg-blue-500 rounded"></span>
              Trending Blogs
            </h3>
            <select
              value={blogSortBy}
              onChange={(e) => setBlogSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rating">Rating</option>
              <option value="claps">Claps</option>
              <option value="reposts">Reposts</option>
              <option value="views">Views</option>
            </select>
          </div>

          <div className="space-y-4">
            {trendingBlogs.map((blog) => (
              <Card key={blog.id} item={blog} type="blog" />
            ))}
          </div>
        </div>

        {/* DISCUSSIONS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <span className="w-2 h-4 bg-green-500 rounded"></span>
              Trending Discussions
            </h3>
            <select
              value={discussionSortBy}
              onChange={(e) => setDiscussionSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="likes">Likes</option>
              <option value="comments">Comments</option>
              <option value="reposts">Reposts</option>
              <option value="views">Views</option>
            </select>
          </div>

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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold flex items-center gap-2">
                <span className="w-2 h-4 bg-blue-500 rounded"></span>
                Trending Blogs
              </h3>
              <select
                value={blogSortBy}
                onChange={(e) => setBlogSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="engagement">Engagement</option>
                <option value="rating">Rating</option>
                <option value="claps">Claps</option>
                <option value="reposts">Reposts</option>
                <option value="views">Views</option>
              </select>
            </div>
            {trendingBlogs.map((blog) => (
              <Card key={blog.id} item={blog} type="blog" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold flex items-center gap-2">
                <span className="w-2 h-4 bg-green-500 rounded"></span>
                Trending Discussions
              </h3>
              <select
                value={discussionSortBy}
                onChange={(e) => setDiscussionSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="engagement">Engagement</option>
                <option value="likes">Likes</option>
                <option value="comments">Comments</option>
                <option value="reposts">Reposts</option>
                <option value="views">Views</option>
              </select>
            </div>
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

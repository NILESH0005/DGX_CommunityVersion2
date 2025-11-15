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
  },
];

/* -------------------------------
   CARD SUB-COMPONENT
-------------------------------- */
const Card = ({ item, type }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer h-36 flex flex-col justify-between"
    >
      {/* Title + Author */}
      <div>
        <h4 className="font-inter font-semibold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition">
          {item.title}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          by {type === "blog" ? item.author : item.creator}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
        {type === "blog" ? (
          <>
            <div className="flex items-center space-x-2">
              <span>⭐ {item.rating}</span>
              <span>🔁 {item.reposts}</span>
              <span>👏 {item.claps}</span>
              <span>👀 {item.views}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <span>👍 {item.likes}</span>
              <span>💬 {item.comments}</span>
              <span>🔁 {item.reposts}</span>
              <span>👀 {item.views}</span>
            </div>

            {item.isHot && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full"
              >
                🔥 Hot
              </motion.span>
            )}
          </>
        )}
      </div>
    </motion.div>
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
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm"
        >
          <option value="engagement">Engagement</option>
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

      {/* Button */}
      <div className="flex justify-center mt-8">
        <motion.button
          className="px-8 py-3 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          View All Trending
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TrendingSection;

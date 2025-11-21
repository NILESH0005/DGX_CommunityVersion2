import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApiContext from "../../../context/ApiContext";

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
          value: item.avgRating,
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
          value: item.repostCount,
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
          value: item.commentCount,
          icon: "💬",
          color: "text-green-600",
        },
        {
          label: "Reposts",
          value: item.repostCount,
          icon: "🔁",
          color: "text-purple-600",
        },
        {
          label: "Views",
          value: item.viewCount,
          icon: "👀",
          color: "text-gray-600",
        },
      ];
    }
  };

  const stripHtmlTags = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
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
                  by {item.author || "Unknown"}
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
              <h4 className="font-semibold text-gray-800 mb-2">
                {type === "blog" ? "Content" : "Discussion"}
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {stripHtmlTags(item.content)}
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
              {/* DETAILS CARD */}
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-base">
                  {type === "blog" ? "Blog Details" : "Discussion Details"}
                </h4>

                <div className="space-y-3 text-sm">
                  {/* Category */}
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium text-gray-800">
                      {item.ProcessName || item.processName || "—"}
                    </span>
                  </div>

                  {/* Created On */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created On</span>
                    <span className="font-medium text-gray-800">
                      {new Date(item.addedOn || item.AddOnDt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* ENGAGEMENT CARD */}
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-base">
                  Engagement Analytics
                </h4>

                <div className="space-y-3 text-sm">
                  {type === "blog" ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Claps</span>
                        <span className="font-medium text-gray-800">
                          {item.claps}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Views</span>
                        <span className="font-medium text-gray-800">
                          {item.views}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Ratings</span>
                        <span className="font-medium text-gray-800">
                          {item.ratings}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Rating</span>
                        <span className="font-medium text-gray-800">
                          {item.avgRating}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Reposts</span>
                        <span className="font-medium text-gray-800">
                          {item.repostCount}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Likes</span>
                        <span className="font-medium text-gray-800">
                          {item.likes}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Views</span>
                        <span className="font-medium text-gray-800">
                          {item.viewCount}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Comments</span>
                        <span className="font-medium text-gray-800">
                          {item.commentCount}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Reposts</span>
                        <span className="font-medium text-gray-800">
                          {item.repostCount}
                        </span>
                      </div>
                    </>
                  )}
                </div>
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
          value: item.avgRating,
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
          value: item.repostCount,
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
          value: item.commentCount,
          icon: "💬",
          color: "text-green-600",
        },
        {
          label: "Reposts",
          value: item.repostCount,
          icon: "🔁",
          color: "text-purple-600",
        },
        {
          label: "Views",
          value: item.viewCount,
          icon: "👀",
          color: "text-gray-600",
        },
      ];
    }
  };

  const engagementStats = getEngagementStats();
  const shadowColor =
    type === "blog" ? "hover:shadow-blue-500/20" : "hover:shadow-green-500/20";

  // Strip HTML tags from content for preview
  const stripHtmlTags = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

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
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>by {item.author || "Unknown"}</span>
              <div className="flex items-center gap-2">
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                  {item.ProcessName || item.processName || (type === "blog" ? "Blog" : "Discussion")}
                </span>
                <span className="text-gray-400">
                  {new Date(item.addedOn || item.AddOnDt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Content Preview */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 line-clamp-2">
                {stripHtmlTags(item.content)}
              </p>
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
  const { fetchData } = useContext(ApiContext);
  const [activeTab, setActiveTab] = useState("blogs");
  const [blogSortBy, setBlogSortBy] = useState("claps");
  const [discussionSortBy, setDiscussionSortBy] = useState("likes");
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [trendingDiscussions, setTrendingDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trending blogs from API
  const fetchTrendingBlogs = async () => {
    try {
      const response = await fetchData("dashboard/getTrendingBlogs", "GET");

      if (response.success && response.data) {
        // Add rank based on claps (or your preferred metric)
        const blogsWithRank = response.data
          .sort((a, b) => b.claps - a.claps)
          .slice(0, 3) // Take only top 3
          .map((blog, index) => ({
            ...blog,
            rank: index + 1,
          }));

        setTrendingBlogs(blogsWithRank);
      } else {
        throw new Error("Failed to fetch trending blogs");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching trending blogs:", err);
    }
  };

  // Fetch trending discussions from API
  const fetchTrendingDiscussions = async () => {
    try {
      const response = await fetchData("dashboard/getTrendingDiscussion", "GET");

      if (response.success && response.data) {
        // Add rank based on likes (or your preferred metric)
        const discussionsWithRank = response.data
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 3) // Take only top 3
          .map((discussion, index) => ({
            ...discussion,
            rank: index + 1,
          }));

        setTrendingDiscussions(discussionsWithRank);
      } else {
        throw new Error("Failed to fetch trending discussions");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching trending discussions:", err);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchTrendingBlogs(), fetchTrendingDiscussions()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Sort blogs based on selected filter
  const sortedBlogs = React.useMemo(() => {
    const blogs = [...trendingBlogs];

    switch (blogSortBy) {
      case "claps":
        return blogs.sort((a, b) => b.claps - a.claps);
      case "reposts":
        return blogs.sort((a, b) => b.repostCount - a.repostCount);
      case "views":
        return blogs.sort((a, b) => b.views - a.views);
      case "rating":
        return blogs.sort(
          (a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating)
        );
      default:
        return blogs;
    }
  }, [trendingBlogs, blogSortBy]);

  // Sort discussions based on selected filter
  const sortedDiscussions = React.useMemo(() => {
    const discussions = [...trendingDiscussions];

    switch (discussionSortBy) {
      case "likes":
        return discussions.sort((a, b) => b.likes - a.likes);
      case "comments":
        return discussions.sort((a, b) => b.commentCount - a.commentCount);
      case "reposts":
        return discussions.sort((a, b) => b.repostCount - a.repostCount);
      case "views":
        return discussions.sort((a, b) => b.viewCount - a.viewCount);
      default:
        return discussions;
    }
  }, [trendingDiscussions, discussionSortBy]);

  // Update ranks after sorting
  const blogsWithUpdatedRanks = sortedBlogs.map((blog, index) => ({
    ...blog,
    rank: index + 1,
  }));

  const discussionsWithUpdatedRanks = sortedDiscussions.map((discussion, index) => ({
    ...discussion,
    rank: index + 1,
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 font-inter">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 font-inter">
        <div className="text-center text-red-500">
          Error loading trending content: {error}
        </div>
      </div>
    );
  }

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
              <option value="claps">Claps</option>
              <option value="reposts">Repost</option>
              <option value="views">Views</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className="space-y-4">
            {blogsWithUpdatedRanks.map((blog) => (
              <Card key={blog.reference} item={blog} type="blog" />
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
            {discussionsWithUpdatedRanks.length > 0 ? (
              discussionsWithUpdatedRanks.map((discussion) => (
                <Card key={discussion.reference} item={discussion} type="discussion" />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No trending discussions found
              </div>
            )}
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
                <option value="claps">Claps</option>
                <option value="reposts">Repost</option>
                <option value="views">Views</option>
                <option value="rating">Rating</option>
              </select>
            </div>
            {blogsWithUpdatedRanks.map((blog) => (
              <Card key={blog.reference} item={blog} type="blog" />
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
                <option value="likes">Likes</option>
                <option value="comments">Comments</option>
                <option value="reposts">Reposts</option>
                <option value="views">Views</option>
              </select>
            </div>
            {discussionsWithUpdatedRanks.length > 0 ? (
              discussionsWithUpdatedRanks.map((discussion) => (
                <Card key={discussion.reference} item={discussion} type="discussion" />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No trending discussions found
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TrendingSection;
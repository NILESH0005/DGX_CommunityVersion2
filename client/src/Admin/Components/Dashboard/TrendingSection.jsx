import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApiContext from "../../../context/ApiContext";
import moment from "moment";

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
   DETAIL MODAL COMPONENT - Mobile Optimized
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
          value: item.LikeCount,
          icon: "👍",
          color: "text-blue-600",
        },
        {
          label: "Comments",
          value: item.CommentCount,
          icon: "💬",
          color: "text-green-600",
        },
        {
          label: "Reposts",
          value: item.RepostCount,
          icon: "🔁",
          color: "text-purple-600",
        },
        {
          label: "Views",
          value: item.ViewCount,
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
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-3 md:p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 w-full max-w-4xl mx-auto max-h-[95vh] md:max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "calc(100vw - 1rem)" }}
        >
          {/* Header Section */}
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <RankBadge rank={item.rank} size="lg" />

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg md:text-2xl text-gray-900 line-clamp-2">
                  {item.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-gray-600 text-sm md:text-base">
                    by {item.author || "Unknown"}
                  </p>
                  <span className="hidden md:inline text-gray-400">•</span>
                  <span className="font-medium text-gray-800 text-xs md:text-sm">
                    {new Date(item.addedOn || item.AddOnDt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl p-1 md:p-2 -mt-1 -mr-1 transition active:scale-95"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Stats Grid - Mobile Compact */}
          <div className="mb-4 md:mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {engagementStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg md:rounded-xl p-2 md:p-3 text-center border border-gray-100"
                >
                  <div
                    className={`text-sm md:text-base font-semibold ${stat.color}`}
                  >
                    {stat.icon}{" "}
                    {stat.value > 1000
                      ? `${(stat.value / 1000).toFixed(1)}k`
                      : stat.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4 md:space-y-6 p-4 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl shadow-inner border border-gray-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-300">
              <h4 className="text-lg md:text-xl font-semibold text-gray-900">
                {type === "blog" ? "Content" : "Discussion"}
              </h4>
            </div>

            <div className="bg-white p-4 md:p-5 rounded-lg md:rounded-xl leading-relaxed text-gray-700 shadow-sm border border-gray-100">
              <p className="whitespace-pre-line text-sm md:text-[15px]">
                {stripHtmlTags(item.content)}
              </p>
            </div>
          </div>

          {/* Mobile Bottom Close Button */}
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium active:scale-[0.98] transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* -------------------------------
   CARD SUB-COMPONENT - Mobile Optimized
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
          value: item.likes || item.LikeCount,
          icon: "👍",
          color: "text-blue-600",
        },
        {
          label: "Comments",
          value: item.commentCount || item.CommentCount,
          icon: "💬",
          color: "text-green-600",
        },
        {
          label: "Reposts",
          value: item.repostCount || item.RepostCount,
          icon: "🔁",
          color: "text-purple-600",
        },
        {
          label: "Views",
          value: item.viewCount || item.ViewCount,
          icon: "👀",
          color: "text-gray-600",
        },
      ];
    }
  };

  const engagementStats = getEngagementStats();
  const shadowColor =
    type === "blog" ? "hover:shadow-blue-500/20" : "hover:shadow-green-500/20";

  const stripHtmlTags = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className={`bg-white border border-gray-200 rounded-xl p-3 md:p-4 cursor-pointer hover:shadow-xl transition-all duration-300 ${shadowColor} active:shadow-lg`}
      >
        <div className="flex gap-3">
          {/* Rank Badge */}
          <div className="flex-shrink-0">
            <RankBadge rank={item.rank} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with single line title */}
            <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
              <h4 className="font-inter font-semibold text-gray-900 text-sm line-clamp-1 hover:text-blue-600 transition flex-1 pr-2">
                {item.title}
              </h4>
            </div>

            {/* Meta Info - Stacked on mobile */}
            <div className="flex flex-col md:flex-row md:items-center justify-between text-xs text-gray-500 mb-2 md:mb-3 space-y-1 md:space-y-0">
              <span className="truncate">by {item.author || "Unknown"}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">
                  {moment(item.addedOn || item.AddOnDt).format("MMM D, YYYY")}
                </span>
              </div>
            </div>

            {/* Content Preview */}
            <div className="mb-2 md:mb-3">
              <p className="text-xs text-gray-600 line-clamp-2 md:line-clamp-2">
                {stripHtmlTags(item.content)}
              </p>
            </div>

            {/* Stats Grid - Compact on mobile */}
            <div className="grid grid-cols-4 gap-1 md:gap-2 mb-2 md:mb-3">
              {engagementStats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-1 md:p-2 bg-gray-50 rounded-lg"
                >
                  <div className={`text-xs font-semibold ${stat.color}`}>
                    {stat.icon}{" "}
                    {stat.value > 1000
                      ? `${(stat.value / 1000).toFixed(1)}k`
                      : stat.value}
                  </div>
                  <div className="hidden md:block text-[10px] text-gray-500 mt-0.5">
                    {stat.label}
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
                className={`text-xs font-medium px-3 py-1.5 md:py-1 rounded-lg ${
                  type === "blog"
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200"
                    : "bg-green-50 text-green-600 hover:bg-green-100 active:bg-green-200"
                } transition active:scale-95`}
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
   MAIN TRENDING SECTION - Mobile Responsive
-------------------------------- */
const TrendingSection = ({ dateFilter }) => {
  const { fetchData } = useContext(ApiContext);
  const [activeTab, setActiveTab] = useState("blogs");
  const [blogSortBy, setBlogSortBy] = useState("claps");
  const [discussionSortBy, setDiscussionSortBy] = useState("likes");
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [trendingDiscussions, setTrendingDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch trending blogs with date range
  const fetchTrendingBlogs = async (fromDate, toDate) => {
    try {
      const response = await fetchData(
        `dashboard/getTrendingBlogs?startDate=${fromDate}&endDate=${toDate}`,
        "GET"
      );

      if (response.success && response.data) {
        setTrendingBlogs(response.data);
      } else {
        throw new Error("Failed to fetch trending blogs");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching trending blogs:", err);
    }
  };

  // Function to fetch trending discussions with date range
  const fetchTrendingDiscussions = async (fromDate, toDate) => {
    try {
      const response = await fetchData(
        `dashboard/getTrendingDiscussion?startDate=${fromDate}&endDate=${toDate}`,
        "GET"
      );

      if (response.success && response.data) {
        setTrendingDiscussions(response.data);
      } else {
        throw new Error("Failed to fetch trending discussions");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching trending discussions:", err);
    }
  };

  // Fetch all data with current date range
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only fetch if dateFilter has valid dates
      if (
        dateFilter &&
        dateFilter.isValid &&
        dateFilter.from &&
        dateFilter.to
      ) {
        await Promise.all([
          fetchTrendingBlogs(dateFilter.from, dateFilter.to),
          fetchTrendingDiscussions(dateFilter.from, dateFilter.to),
        ]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or dateFilter changes
  useEffect(() => {
    if (dateFilter && dateFilter.isValid && dateFilter.from && dateFilter.to) {
      fetchAllData();
    }
  }, [dateFilter]); // Re-fetch only when dateFilter changes

  const getSortedBlogs = React.useMemo(() => {
    if (!trendingBlogs.length) return [];

    const blogs = [...trendingBlogs];

    switch (blogSortBy) {
      case "claps":
        return blogs.sort(
          (a, b) => parseInt(b.claps || 0) - parseInt(a.claps || 0)
        );
      case "reposts":
        return blogs.sort(
          (a, b) => parseInt(b.repostCount || 0) - parseInt(a.repostCount || 0)
        );
      case "views":
        return blogs.sort(
          (a, b) => parseInt(b.views || 0) - parseInt(a.views || 0)
        );
      case "rating":
        return blogs.sort(
          (a, b) => parseFloat(b.avgRating || 0) - parseFloat(a.avgRating || 0)
        );
      default:
        return blogs.sort(
          (a, b) => parseInt(b.claps || 0) - parseInt(a.claps || 0)
        );
    }
  }, [trendingBlogs, blogSortBy]);

  // Function to sort discussions based on selected criteria
  const getSortedDiscussions = React.useMemo(() => {
    if (!trendingDiscussions.length) return [];

    const discussions = [...trendingDiscussions];

    switch (discussionSortBy) {
      case "likes":
        return discussions.sort(
          (a, b) => parseInt(b.LikeCount || 0) - parseInt(a.LikeCount || 0)
        );
      case "comments":
        return discussions.sort(
          (a, b) =>
            parseInt(b.CommentCount || 0) - parseInt(a.CommentCount || 0)
        );
      case "reposts":
        return discussions.sort(
          (a, b) => parseInt(b.RepostCount || 0) - parseInt(a.RepostCount || 0)
        );
      case "views":
        return discussions.sort(
          (a, b) => parseInt(b.ViewCount || 0) - parseInt(a.ViewCount || 0)
        );
      default:
        return discussions.sort(
          (a, b) => parseInt(b.LikeCount || 0) - parseInt(a.LikeCount || 0)
        );
    }
  }, [trendingDiscussions, discussionSortBy]);

  // Add ranks to sorted blogs (limit to top 3)
  const blogsWithRank = React.useMemo(() => {
    return getSortedBlogs
      .slice(0, 3) // Take only top 3
      .map((blog, index) => ({
        ...blog,
        rank: index + 1,
      }));
  }, [getSortedBlogs]);

  // Add ranks to sorted discussions (limit to top 3)
  const discussionsWithRank = React.useMemo(() => {
    return getSortedDiscussions
      .slice(0, 3) // Take only top 3
      .map((discussion, index) => ({
        ...discussion,
        rank: index + 1,
      }));
  }, [getSortedDiscussions]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 font-inter min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading trending content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 font-inter">
        <div className="text-center text-red-500 p-4">
          <div className="text-xl mb-2">⚠️</div>
          <p className="font-medium">Error loading trending content</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchAllData}
            className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Display message if no valid date range
  if (
    !dateFilter ||
    !dateFilter.isValid ||
    !dateFilter.from ||
    !dateFilter.to
  ) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 font-inter">
        <div className="text-center text-yellow-600 p-4">
          <div className="text-xl mb-2">📅</div>
          <p className="font-medium">Select Date Range</p>
          <p className="text-sm mt-1">
            Please select a valid date range to view trending content
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 font-inter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Date Range Display - Mobile Optimized */}
      <div className="mb-4 md:mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg md:rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-600">📅</span>
              <span className="text-sm md:text-base text-blue-700 font-medium">
                {dateFilter.displayText}
              </span>
            </div>
            <div className="text-xs md:text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">
              Sorted by:{" "}
              <span className="font-semibold">
                {activeTab === "blogs"
                  ? blogSortBy.charAt(0).toUpperCase() + blogSortBy.slice(1)
                  : discussionSortBy.charAt(0).toUpperCase() +
                    discussionSortBy.slice(1)}
              </span>
            </div>
          </div>
          <button
            onClick={fetchAllData}
            className="mt-2 md:mt-0 text-xs md:text-sm bg-white hover:bg-blue-50 text-blue-700 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition shadow-sm hover:shadow active:scale-95 border border-blue-200"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex gap-1 bg-gray-100 p-1.5 rounded-2xl mb-4">
        {/* Blogs Tab */}
        <motion.button
          onClick={() => setActiveTab("blogs")}
          whileTap={{ scale: 0.96 }}
          className={`
      flex-1 min-h-[44px]
      flex items-center justify-center gap-1.5
      rounded-xl text-sm font-semibold transition-all
      ${
        activeTab === "blogs"
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
          : "text-gray-600 hover:text-gray-900"
      }
    `}
        >
          <span className="text-base sm:text-lg">📝</span>
          <span className="truncate">Blogs</span>
        </motion.button>

        {/* Discussions Tab */}
        <motion.button
          onClick={() => setActiveTab("discussions")}
          whileTap={{ scale: 0.96 }}
          className={`
      flex-1 min-h-[44px]
      flex items-center justify-center gap-1.5
      rounded-xl text-sm font-semibold transition-all
      ${
        activeTab === "discussions"
          ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
          : "text-gray-600 hover:text-gray-900"
      }
    `}
        >
          <span className="text-base sm:text-lg">💬</span>
          <span className="truncate">Discussions</span>
        </motion.button>
      </div>

      {/* ---------- DESKTOP SIDE BY SIDE WITH SEPARATE FILTERS ---------- */}
      <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* BLOGS SECTION */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 md:p-5 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Trending Blogs
                </h3>
                <p className="text-xs text-gray-500">
                  Top {blogsWithRank.length} • Sorted by {blogSortBy}
                </p>
              </div>
            </div>
            <select
              value={blogSortBy}
              onChange={(e) => setBlogSortBy(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value="claps">👏 Claps</option>
              <option value="reposts">🔁 Reposts</option>
              <option value="views">👀 Views</option>
              <option value="rating">⭐ Rating</option>
            </select>
          </div>

          <div className="space-y-3">
            {blogsWithRank.length > 0 ? (
              blogsWithRank.map((blog) => (
                <Card key={blog.reference} item={blog} type="blog" />
              ))
            ) : (
              <div className="text-center p-8">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-gray-500 font-medium">No trending blogs</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try a different date range
                </p>
              </div>
            )}
          </div>
        </div>

        {/* DISCUSSIONS SECTION */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-4 md:p-5 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Trending Discussions
                </h3>
                <p className="text-xs text-gray-500">
                  Top {discussionsWithRank.length} • Sorted by{" "}
                  {discussionSortBy}
                </p>
              </div>
            </div>
            <select
              value={discussionSortBy}
              onChange={(e) => setDiscussionSortBy(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value="likes">👍 Likes</option>
              <option value="comments">💬 Comments</option>
              <option value="reposts">🔁 Reposts</option>
              <option value="views">👀 Views</option>
            </select>
          </div>

          <div className="space-y-3">
            {discussionsWithRank.length > 0 ? (
              discussionsWithRank.map((discussion) => (
                <Card
                  key={discussion.reference}
                  item={discussion}
                  type="discussion"
                />
              ))
            ) : (
              <div className="text-center p-8">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-gray-500 font-medium">
                  No trending discussions
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try a different date range
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- MOBILE SWITCH VIEW ---------- */}
      <div className="md:hidden">
        {activeTab === "blogs" ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 bg-blue-50 rounded-xl p-3">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-blue-500 rounded-full"></div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Trending Blogs
                  </h3>
                  <p className="text-xs text-gray-500">
                    Top {blogsWithRank.length} posts
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <select
                value={blogSortBy}
                onChange={(e) => setBlogSortBy(e.target.value)}
                className="
      w-full sm:w-32
      border border-gray-300 rounded-lg
      px-3 py-2 sm:py-1.5
      text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500
      bg-white shadow-sm
    "
              >
                <option value="claps">👏 Claps</option>
                <option value="reposts">🔁 Reposts</option>
                <option value="views">👀 Views</option>
                <option value="rating">⭐ Rating</option>
              </select>
            </div>

            <div className="space-y-3">
              {blogsWithRank.length > 0 ? (
                blogsWithRank.map((blog) => (
                  <Card key={blog.reference} item={blog} type="blog" />
                ))
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="text-3xl mb-2">📝</div>
                  <p className="text-gray-500 font-medium">No trending blogs</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try a different date range
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 bg-green-50 rounded-xl p-3">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-green-500 rounded-full"></div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Trending Discussions
                  </h3>
                  <p className="text-xs text-gray-500">
                    Top {discussionsWithRank.length} posts
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <select
                value={discussionSortBy}
                onChange={(e) => setDiscussionSortBy(e.target.value)}
                className="
      w-full sm:w-32
      border border-gray-300 rounded-lg
      px-3 py-2 sm:py-1.5
      text-sm
      focus:outline-none focus:ring-2 focus:ring-green-500
      bg-white shadow-sm
    "
              >
                <option value="likes">👍 Likes</option>
                <option value="comments">💬 Comments</option>
                <option value="reposts">🔁 Reposts</option>
                <option value="views">👀 Views</option>
              </select>
            </div>

            <div className="space-y-3">
              {discussionsWithRank.length > 0 ? (
                discussionsWithRank.map((discussion) => (
                  <Card
                    key={discussion.reference}
                    item={discussion}
                    type="discussion"
                  />
                ))
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-gray-500 font-medium">
                    No trending discussions
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try a different date range
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TrendingSection;

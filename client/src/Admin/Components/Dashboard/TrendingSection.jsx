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
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section */}
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

                <span className="font-medium text-gray-800 text-sm">
                  {new Date(item.addedOn || item.AddOnDt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                    }
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl p-1 transition"
            >
              ✕
            </button>
          </div>

          {/* Content Section */}
          <div className="space-y-6 p-6 bg-gray-50 rounded-2xl shadow-inner border border-gray-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-300">
              <h4 className="text-xl font-semibold text-gray-900">
                {type === "blog" ? "Content" : "Discussion"}
              </h4>
            </div>

            <div className="bg-white p-5 rounded-xl leading-relaxed text-gray-700 shadow-sm border border-gray-100">
              <p className="whitespace-pre-line text-[15px]">
                {stripHtmlTags(item.content)}
              </p>
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
                <span className="text-gray-400">
                  {moment(item.addedOn || item.AddOnDt).format("MMMM D, YYYY")}
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

  // Display message if no valid date range
  if (
    !dateFilter ||
    !dateFilter.isValid ||
    !dateFilter.from ||
    !dateFilter.to
  ) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 font-inter">
        <div className="text-center text-yellow-600">
          Please select a valid date range to view trending content.
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
      {/* Date Range Display */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-700 font-medium">
            📅 Showing data for: {dateFilter.displayText}
            <span className="ml-3 text-xs bg-blue-100 px-2 py-1 rounded">
              Sorted by:{" "}
              {activeTab === "blogs"
                ? blogSortBy.charAt(0).toUpperCase() + blogSortBy.slice(1)
                : discussionSortBy.charAt(0).toUpperCase() +
                  discussionSortBy.slice(1)}
            </span>
          </span>
          <button
            onClick={fetchAllData}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg transition"
          >
            Refresh
          </button>
        </div>
      </div>

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
              <span className="text-xs font-normal text-gray-500 ml-2">
                (Top {blogsWithRank.length})
              </span>
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
            {blogsWithRank.length > 0 ? (
              blogsWithRank.map((blog) => (
                <Card key={blog.reference} item={blog} type="blog" />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No trending blogs found for the selected date range
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <span className="w-2 h-4 bg-green-500 rounded"></span>
              Trending Discussions
              <span className="text-xs font-normal text-gray-500 ml-2">
                (Top {discussionsWithRank.length})
              </span>
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
            {discussionsWithRank.length > 0 ? (
              discussionsWithRank.map((discussion) => (
                <Card
                  key={discussion.reference}
                  item={discussion}
                  type="discussion"
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No trending discussions found for the selected date range
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
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (Top {blogsWithRank.length})
                </span>
              </h3>
              <select
                value={blogSortBy}
                onChange={(e) => setBlogSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="claps">Sort by Claps</option>
                <option value="reposts">Sort by Repost</option>
                <option value="views">Sort by Views</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
            {blogsWithRank.length > 0 ? (
              blogsWithRank.map((blog) => (
                <Card key={blog.reference} item={blog} type="blog" />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No trending blogs found for the selected date range
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold flex items-center gap-2">
                <span className="w-2 h-4 bg-green-500 rounded"></span>
                Trending Discussions
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (Top {discussionsWithRank.length})
                </span>
              </h3>
              <select
                value={discussionSortBy}
                onChange={(e) => setDiscussionSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="likes">Sort by Likes</option>
                <option value="comments">Sort by Comments</option>
                <option value="reposts">Sort by Reposts</option>
                <option value="views">Sort by Views</option>
              </select>
            </div>
            {discussionsWithRank.length > 0 ? (
              discussionsWithRank.map((discussion) => (
                <Card
                  key={discussion.reference}
                  item={discussion}
                  type="discussion"
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No trending discussions found for the selected date range
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TrendingSection;

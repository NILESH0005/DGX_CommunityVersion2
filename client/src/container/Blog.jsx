import React, { useContext, useEffect, useState } from "react";
import { TbUserSquareRounded, TbClock, TbSearch } from "react-icons/tb";
import BlogImage from "../component/BlogImage";
import ApiContext from "../context/ApiContext";
import PublicBlogModal from "./PublicBlogModal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { PiHandsClappingLight, PiHandsClappingFill, PiRepeat } from "react-icons/pi";

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { ChevronDown, ArrowRight, CalendarDays, Heart, Repeat2 } from "lucide-react";

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-DGXblue/20 rounded-full"
          initial={{
            x:
              Math.random() *
              (typeof window !== "undefined" ? window.innerWidth : 0),
            y:
              Math.random() *
              (typeof window !== "undefined" ? window.innerHeight : 0),
          }}
          animate={{
            x:
              Math.random() *
              (typeof window !== "undefined" ? window.innerWidth : 0),
            y:
              Math.random() *
              (typeof window !== "undefined" ? window.innerHeight : 0),
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};

// RepostCard Component - Updated to show multiple users
const RepostCard = ({ repost, className }) => {
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // If repost has multiple users, show them in a compact way
  const hasMultipleUsers = repost.users && repost.users.length > 1;

  return (
    <div
      className={`w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}
      role="group"
      aria-label={`Reposted by ${repost.users?.length || 0} users`}
    >
      {/* Header with repost count */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PiRepeat className="text-DGXgreen" size={16} />
          <span className="text-sm font-semibold text-gray-900">
            Reposted ({repost.users?.length || 0} times)
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {repost.latestDate ? formatDate(repost.latestDate) : "Recently"}
        </span>
      </div>

      {/* User Avatars Grid */}
      <div className="flex flex-wrap gap-2">
        {repost.users?.slice(0, 8).map((user, index) => (
          <div key={user.id || index} className="relative group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-DGXblue to-DGXgreen flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
              {getInitials(user.name)}
            </div>
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {user.name}
              {user.date && (
                <div className="text-gray-300">
                  {formatDate(user.date)}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Show +X for additional users beyond 8 */}
        {repost.users && repost.users.length > 8 && (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white shadow-sm">
            +{repost.users.length - 8}
          </div>
        )}
      </div>

      {/* User List for accessibility */}
      <div className="sr-only">
        Reposted by: {repost.users?.map(user => user.name).join(', ')}
      </div>
    </div>
  );
};

// StarRating Component
const StarRating = ({ value }) => {
  const stars = [];
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={i} className="text-yellow-400">★</span>);
  }

  if (hasHalfStar) {
    stars.push(<span key="half" className="text-yellow-400">★</span>);
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
  }

  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${value} out of 5 stars`}>
      {stars}
    </div>
  );
};

const BlogPage = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const { scrollYProgress } = useScroll();
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const [mounted, setMounted] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pageSize, setPageSize] = useState(6);
  const [showAll, setShowAll] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAccordions, setExpandedAccordions] = useState({});
  const [repostsData, setRepostsData] = useState({});
  const [loadingReposts, setLoadingReposts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCategories = async () => {
    try {
      const endpoint = "dropdown/getDropdownValues?category=blogCategory";
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const data = await fetchData(endpoint, method, headers);
      if (data.success) {
        const sortedCategories = data.data.sort((a, b) =>
          a.ddValue.localeCompare(b.ddValue)
        );
        setCategories(sortedCategories);
      } else {
        Swal.fire("Error", "Failed to fetch categories.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error fetching categories.", "error");
    }
  };

  // Fetch reposts for a specific blog and aggregate users
  const fetchRepostsForBlog = async (blogId) => {
    try {
      setLoadingReposts(prev => ({ ...prev, [blogId]: true }));
      
      // Try different possible endpoints for reposts
      const endpoints = [
        `blog/getReposts/${blogId}`,
        `blog/reposts/${blogId}`,
        `blog/${blogId}/reposts`,
        `blog/getBlogReposts/${blogId}`
      ];

      let reposts = [];
      
      for (const endpoint of endpoints) {
        try {
          const method = "GET";
          const headers = { "Content-Type": "application/json" };

          const result = await fetchData(endpoint, method, {}, headers);
          console.log(`Reposts response from ${endpoint}:`, result);
          
          if (result && (result.data || result.reposts)) {
            reposts = result.data || result.reposts || [];
            break;
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed, trying next...`);
          continue;
        }
      }

      // If no reposts found from API, check if the blog itself is a repost
      if (reposts.length === 0) {
        const blog = blogs.find(b => b.BlogID === blogId);
        if (blog && blog.RepostUser) {
          // If this blog is a repost, create a repost entry for the original author
          reposts = [{
            id: `repost-${blogId}`,
            user: { 
              name: blog.AuthAdd || "Unknown User",
              avatar: ""
            },
            date: blog.AddOnDt || blog.publishedDate
          }];
        }
      }

      // Transform and aggregate repost data
      const transformedReposts = transformRepostData(reposts);
      
      // Create a single aggregated repost object with all users
      const aggregatedRepost = {
        id: `aggregated-${blogId}`,
        users: transformedReposts,
        latestDate: transformedReposts.length > 0 
          ? transformedReposts.reduce((latest, user) => 
              new Date(user.date) > new Date(latest) ? user.date : latest, 
              transformedReposts[0].date
            )
          : null,
        totalCount: transformedReposts.length
      };

      setRepostsData(prev => ({
        ...prev,
        [blogId]: aggregatedRepost.totalCount > 0 ? [aggregatedRepost] : []
      }));

      return aggregatedRepost;
    } catch (error) {
      console.error(`Error fetching reposts for blog ${blogId}:`, error);
      setRepostsData(prev => ({
        ...prev,
        [blogId]: []
      }));
      return { users: [], totalCount: 0 };
    } finally {
      setLoadingReposts(prev => ({ ...prev, [blogId]: false }));
    }
  };

  // Transform API repost data to the format expected by RepostCard
  const transformRepostData = (reposts) => {
    if (!reposts || !Array.isArray(reposts)) return [];
    
    return reposts.map(repost => ({
      id: repost.repostId || repost.userId || repost.id || `repost-${Math.random()}`,
      name: repost.userName || repost.name || repost.user?.name || repost.AuthAdd || "Unknown User",
      avatar: repost.avatar || repost.user?.avatar || "",
      date: repost.repostDate || repost.createdAt || repost.date || repost.AddOnDt || new Date().toISOString()
    }));
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);

        let endpoint = "blog/getPublicBlogs";
        let method = "GET";
        let headers = { "Content-Type": "application/json" };

        const result = await fetchData(endpoint, method, {}, headers);
        console.log("Fetched blogs:", result);
        if (result && result.data) {
          setBlogs(result.data);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
    fetchCategories();
  }, [fetchData, userToken]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setPageSize(6);
    setShowAll(false);
  };

  const refreshBlogs = async () => {
    try {
      setLoading(true);
      let endpoint = "blog/getPublicBlogs";
      let method = "GET";
      let headers = { "Content-Type": "application/json" };

      const result = await fetchData(endpoint, method, {}, headers);
      if (result && result.data) {
        setBlogs(result.data);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (blog) => {
    if (!userToken) {
      Swal.fire({
        title: "Login Required",
        text: "You need to login to view this blog",
        icon: "info",
        confirmButtonText: "Go to Login",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/SignInn");
        }
      });
      return;
    }

    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  const toggleAccordion = async (blogId) => {
    // If opening the accordion and we don't have repost data yet, fetch it
    if (!expandedAccordions[blogId] && !repostsData[blogId]) {
      await fetchRepostsForBlog(blogId);
    }
    
    setExpandedAccordions(prev => ({
      ...prev,
      [blogId]: !prev[blogId]
    }));
  };

  const BlogCard = ({ blog, index }) => {
    if (!blog) return null;

    const {
      title,
      image,
      AuthAdd,
      AddOnDt,
      publishedDate,
      category,
      readTime,
      RepostUser,
      BlogID,
    } = blog;

    const fallbackImage =
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";

    const [blogStats, setBlogStats] = useState({
      totalLikes: 0,
      averageRating: 0,
      totalRatings: 0,
    });

    // Get reposts for this blog - now it's a single aggregated object
    const blogReposts = repostsData[BlogID] || [];
    const aggregatedRepost = blogReposts[0]; // Only one aggregated repost card now
    const isRepostLoading = loadingReposts[BlogID];
    const hasReposts = aggregatedRepost?.totalCount > 0 || blog.RepostUser;
    const isAccordionOpen = expandedAccordions[BlogID];
    const displayRepostCount = aggregatedRepost?.totalCount || (blog.RepostUser ? 1 : 0);

    useEffect(() => {
      const fetchBlogStats = async () => {
        try {
          const endpoint = `blog/stats/${BlogID}`;
          const method = "GET";

          const result = await fetchData(endpoint, method);

          if (result.success) {
            setBlogStats(result.data);
          }
        } catch (error) {
          console.error("Error fetching blog stats:", error);
        }
      };

      fetchBlogStats();
    }, [BlogID]);

    const getAuthorInitials = (name) => {
      if (!name) return "U";
      return name
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U";
    };

    const getAuthorDisplay = () => {
      // If this is a repost, show who reposted it
      if (RepostUser && RepostUser.Name) {
        return `Reposted by ${AuthAdd || "Unknown"}`;
      }
      return AuthAdd || "Unknown author";
    };

    const getOriginalAuthor = () => {
      // If this is a repost, show original author
      if (RepostUser && RepostUser.Name) {
        return RepostUser.Name;
      }
      return null;
    };

    return (
      <motion.div
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col"
        onClick={() => openModal(blog)}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Cover Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <motion.img
            className="w-full h-full object-cover transition-transform duration-500"
            src={image || fallbackImage}
            alt={title}
            onError={(e) => (e.target.src = fallbackImage)}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Category Badge */}
          {category && (
            <motion.span
              className="absolute top-3 left-3 bg-white text-DGXblue px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {category}
            </motion.span>
          )}

          {/* Reposts Badge - Show if there are reposts */}
          {hasReposts && displayRepostCount > 0 && (
            <motion.span
              className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <PiRepeat className="text-DGXgreen" size={14} />
              <span className="text-gray-700">
                Reposts {displayRepostCount}
              </span>
            </motion.span>
          )}

          {/* Repost Indicator - Show if this specific blog is a repost */}
          {RepostUser && RepostUser.Name && (
            <motion.span
              className="absolute bottom-3 left-3 bg-DGXgreen text-black px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              Repost
            </motion.span>
          )}

          {/* Rating Badge */}
          {blogStats.averageRating > 0 && (
            <motion.div
              className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-yellow-500">⭐</span>
              <span className="text-gray-700">
                {blogStats.averageRating.toFixed(1)}
              </span>
            </motion.div>
          )}
        </div>

        {/* Main Content */}
        <div className="p-5 flex-grow flex flex-col">
          {/* Date and Read Time */}
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <span className="flex items-center">
              <CalendarDays className="mr-1" size={14} />
              {new Date(AddOnDt || publishedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            {readTime && (
              <>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <TbClock className="mr-1" size={14} />
                  {readTime} min read
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
            {title}
          </h3>

          {/* Rating and Claps */}
          <div className="flex items-center gap-4 mb-4">
            {blogStats.averageRating > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={blogStats.averageRating} />
                <span className="text-sm text-gray-600">({blogStats.totalRatings})</span>
              </div>
            )}
            
            {blogStats.totalLikes > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600 ml-auto">
                <Heart className="text-red-500" size={16} />
                <span>{blogStats.totalLikes} claps</span>
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="mt-auto flex items-center gap-3 mb-4">
            <motion.div
              className="w-8 h-8 rounded-full bg-gradient-to-r from-DGXblue to-DGXgreen flex items-center justify-center text-white text-xs font-bold"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {getAuthorInitials(AuthAdd || "Unknown Author")}
            </motion.div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {getAuthorDisplay()}
              </span>
              {RepostUser && RepostUser.Name && (
                <span className="text-xs text-DGXgreen font-medium">
                  Originally by {RepostUser.Name}
                </span>
              )}
            </div>
          </div>

          {/* Reposts Accordion - Show if there are reposts */}
          {hasReposts && displayRepostCount > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <motion.button
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAccordion(BlogID);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isRepostLoading}
              >
                <div className="flex items-center gap-2">
                  <PiRepeat className="text-DGXgreen" size={16} />
                  <span className="text-sm font-medium text-gray-700">
                    {isRepostLoading ? "Loading..." : `View reposts (${displayRepostCount})`}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isAccordionOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={16} className="text-gray-500" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isAccordionOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3">
                      {isRepostLoading ? (
                        <div className="text-center text-gray-500 py-4">
                          Loading reposts...
                        </div>
                      ) : aggregatedRepost ? (
                        <RepostCard repost={aggregatedRepost} />
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          No reposts available
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      (!selectedCategory || blog.category === selectedCategory) &&
      (!searchQuery ||
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section */}
      <motion.section
        style={{ y: headerY }}
        className="relative bg-gradient-to-r from-DGXblue to-DGXgreen py-10 px-4 sm:px-6 lg:px-8 text-center text-DGXgreen"
      >
        <ParticleBackground />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              DGX Blog
              <span className="block text-green-300">Knowledge Hub</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Insights, stories and innovations from our community
            </p>
          </motion.div>
        </div>

        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/2 w-full h-full border border-white/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full border border-white/10 rounded-full"
          />
        </div>
      </motion.section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative max-w-2xl mx-auto mb-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <TbSearch className="text-gray-400" size={20} />
              </motion.div>
              <motion.input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-DGXblue focus:border-transparent transition-all"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              />
            </div>

            <motion.div
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? "bg-DGXgreen text-black shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleCategorySelect(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                All
              </motion.button>

              {categories.map((category) => (
                <motion.button
                  key={category.ddId || category.ddValue}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.ddValue
                      ? "bg-DGXgreen text-black shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleCategorySelect(category.ddValue)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    delay: 0.1 * categories.indexOf(category),
                  }}
                >
                  {category.ddValue}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {loading ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="inline-block rounded-full h-12 w-12 border-t-2 border-b-2 border-DGXblue"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <p className="mt-4 text-gray-600">Loading articles...</p>
            </motion.div>
          ) : filteredBlogs.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {blogs.length === 0
                  ? "No articles available yet"
                  : "No articles match your search"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {blogs.length === 0
                  ? "Check back later for new content."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
              >
                {filteredBlogs.slice(0, pageSize).map((blog, index) => (
                  <BlogCard key={blog.BlogID} blog={blog} index={index} />
                ))}
              </motion.div>

              {!showAll && filteredBlogs.length > pageSize && (
                <motion.div
                  className="mt-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    onClick={() => {
                      if (pageSize + 6 >= filteredBlogs.length) {
                        setShowAll(true);
                      }
                      setPageSize((prev) => prev + 6);
                    }}
                    className="px-8 py-3 bg-DGXblue text-white rounded-lg hover:bg-DGXgreen transition-colors shadow-md hover:shadow-lg font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Show More Blogs
                    <ArrowRight className="w-4 h-4 ml-2 inline" />
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-DGXblue to-DGXgreen text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Want to contribute your own article?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto whitespace-nowrap">
              Share your knowledge and insights with our growing community of AI
              enthusiasts.
            </p>

            <motion.button
              className="bg-white text-DGXblue hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/BlogForm")}
            >
              Write a Blog Post
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Blog Modal - Only show if user is logged in */}
      <AnimatePresence>
        {isModalOpen && selectedBlog && userToken && (
          <PublicBlogModal
            blog={selectedBlog}
            closeModal={closeModal}
            refreshBlogs={refreshBlogs}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogPage;
import React, { useContext, useEffect, useState } from "react";
import { FaStar, FaUsers } from "react-icons/fa";
import { TbUserSquareRounded, TbClock, TbSearch } from "react-icons/tb";
import BlogImage from "../component/BlogImage";
import ApiContext from "../context/ApiContext";
import PublicBlogModal from "./PublicBlogModal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  PiHandsClappingLight,
  PiHandsClappingFill,
  PiRepeat,
} from "react-icons/pi";
import Noimage from "../assets/No_Image_Available.jpg";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ChevronDown,
  ArrowRight,
  CalendarDays,
  Heart,
  Repeat2,
  User,
} from "lucide-react";
import { FiEye } from "react-icons/fi";

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

const getProfileUrl = (path) => {
  if (!path) return Noimage;

  if (path.startsWith("http") || path.startsWith("data:image/")) return path;

  const base = import.meta.env.VITE_API_UPLOADSURL;
  return `${base}/${path.replace(/^\/+/, "")}`;
};

const RepostCard = ({ reposts = [] }) => {
  console.log("Reposts data analysis:", reposts);

  if (!reposts || reposts.length === 0) return null;

  // Sort reposts by AddOnDt descending (latest first)
  const sortedReposts = [...reposts].sort(
    (a, b) => new Date(b.AddOnDt) - new Date(a.AddOnDt)
  );

  return (
    <div className="w-full bg-gray-50 rounded-lg p-4 mt-3">
      {/* Repost Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PiRepeat className="text-DGXgreen" size={18} />
          <span className="text-sm font-semibold text-gray-900">
            Reposted by {reposts.length} user{reposts.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Horizontal Scrollable Users */}
      <div className="overflow-x-auto">
        <div className="flex space-x-4 pb-2 min-w-max">
          {sortedReposts.map((repost, index) => {
            // DEBUG: Log what data we have
            console.log(`Repost ${index}:`, {
              authorField: repost.author,
              userId: repost.UserID,
              repostUserId: repost.RepostUserID,
              repostUserData: repost.RepostUser,
            });

            // Extract the correct repost author information
            // Use 'author' field first, fallback to RepostUser.Name
            let userName =
              repost.author || repost.RepostUser?.Name || "Unknown User";
            let userProfile = repost.RepostUser?.ProfilePicture || null;
            const userId = repost.UserID || repost.RepostUser?.UserID;

            // If author field has the correct name but User object has wrong one
            // Create a clean user object
            const repostUser = {
              UserID: userId,
              Name: userName,
              ProfilePicture: userProfile,
            };

            return (
              <div
                key={`${userId}-${index}`}
                className="flex flex-col items-center text-center min-w-[80px]"
              >
                {/* User Avatar with fallback */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-DGXblue to-DGXgreen flex items-center justify-center text-white text-sm font-bold mb-2 shadow-sm">
                  {userProfile ? (
                    <img
                      src={getProfileUrl(userProfile)}
                      alt={userName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        // Show initials as fallback
                        const initials = userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .substring(0, 2);
                        e.target.parentElement.textContent = initials;
                      }}
                    />
                  ) : (
                    <span>
                      {userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2)}
                    </span>
                  )}
                </div>

                {/* User Name */}
                <div className="text-xs font-medium text-gray-900 truncate max-w-[70px]">
                  {userName}
                </div>

                {/* Repost Date */}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(repost.AddOnDt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            );
          })}
        </div>
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
    stars.push(
      <span key={i} className="text-yellow-400">
        ★
      </span>
    );
  }

  if (hasHalfStar) {
    stars.push(
      <span key="half" className="text-yellow-400">
        ★
      </span>
    );
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <span key={`empty-${i}`} className="text-gray-300">
        ★
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating: ${value} out of 5 stars`}
    >
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
  const navigate = useNavigate();
  // Handle Write Blog Button Click
  const handleWriteBlog = () => {
    if (!userToken) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to write a blog post.",
        icon: "warning",
        confirmButtonText: "Go to Login",
        showCancelButton: true,
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/SignInn");
        }
      });
      return;
    }

    navigate("/BlogForm");
  };
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Debug: Check what URLs are being generated
    if (blogs.length > 0) {
      blogs.forEach((blog, index) => {
        if (blog.image) {
          const imageUrl = getImageUrl(blog.image);
          console.log(`Blog ${index} (${blog.BlogID}):`, {
            originalPath: blog.image,
            constructedUrl: imageUrl,
            type: blog.image.startsWith("data:image/")
              ? "base64"
              : blog.image.startsWith("http")
              ? "full-url"
              : "relative-path",
          });

          // Test if the image loads
          const img = new Image();
          img.onload = () =>
            console.log(`✅ Image ${blog.BlogID} loaded successfully`);
          img.onerror = () =>
            console.error(`❌ Image ${blog.BlogID} failed to load:`, imageUrl);
          img.src = imageUrl;
        }
      });
    }
  }, [blogs]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      console.log("No image path provided, using fallback");
      return Noimage;
    }

    // If it's already a base64 image, return it directly
    if (imagePath.startsWith("data:image/")) {
      console.log("Base64 image detected");
      return imagePath;
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      console.log("Full URL detected:", imagePath);
      return imagePath;
    }

    const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;

    if (!baseUploadsUrl) {
      console.error("VITE_API_UPLOADSURL environment variable is not set");
      return Noimage;
    }

    console.log("Base uploads URL:", baseUploadsUrl);
    console.log("Original image path:", imagePath);

    const cleanPath = imagePath.replace(/^\/+/, "");

    const fullUrl = `${baseUploadsUrl}/${cleanPath}`;

    console.log("Constructed image URL:", fullUrl);
    return fullUrl;
  };

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

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);

        const endpoint = "blog/getPublicBlogs";
        const method = "GET";
        const headers = { "Content-Type": "application/json" };

        const result = await fetchData(endpoint, method, {}, headers);
        console.log("Fetched blogs raw data:", result);

        if (result && result.data) {
          setBlogs(result.data);
        } else {
          console.error("Invalid data format:", result);
          setBlogs([]);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        Swal.fire("Error", "Failed to load blogs. Please try again.", "error");
        setBlogs([]);
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

  const recordBlogView = async (blogId) => {
    try {
      if (!userToken) return;

      const endpoint = "progressTrack/recordView";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const body = {
        ProcessName: "Blog",
        reference: blogId,
      };

      const result = await fetchData(endpoint, method, body, headers);
      console.log("📊 Blog view recorded:", result);
    } catch (error) {
      console.error("❌ Error recording blog view:", error);
    }
  };

  const refreshBlogs = async () => {
    try {
      setLoading(true);
      const endpoint = "blog/getPublicBlogs";
      const method = "GET";
      const headers = { "Content-Type": "application/json" };

      const result = await fetchData(endpoint, method, {}, headers);
      if (result && result.data) {
        setBlogs(result.data);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      Swal.fire("Error", "Failed to refresh blogs.", "error");
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
        if (result.isConfirmed) navigate("/SignInn");
      });
      return;
    }

    recordBlogView(blog.BlogID);
    navigate(`/blog/${blog.BlogID}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  const toggleAccordion = (blogId) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [blogId]: !prev[blogId],
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
      Category,
      readTime,
      reposts = [],
      BlogID,
      User,
    } = blog;

    const fallbackImage = Noimage;
    const [imageError, setImageError] = useState(false);
    const [currentImageSrc, setCurrentImageSrc] = useState("");

    const [blogStats, setBlogStats] = useState({
      totalLikes: 0,
      averageRating: 0,
      totalRatings: 0,
      totalViews: 0,
    });

    const isAccordionOpen = expandedAccordions[BlogID];
    const hasReposts = reposts && reposts.length > 0;
    const userName = User?.Name;
    const stripHtml = (html) => {
      if (!html) return "";
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    };

    const truncate = (text, max = 180) => {
      if (!text) return "";
      if (text.length <= max) return text;
      const truncated = text.slice(0, max);
      const lastSpace = truncated.lastIndexOf(" ");
      return (
        (lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated) + "..."
      );
    };

    useEffect(() => {
      if (blog.image) {
        const src = getImageUrl(blog.image);
        setCurrentImageSrc(src);
        setImageError(false);

        // Pre-load the image to check if it's valid
        const img = new Image();
        img.onload = () => {
          console.log(`✅ Image pre-loaded: ${src}`);
          setImageError(false);
        };
        img.onerror = () => {
          console.error(`❌ Image failed to pre-load: ${src}`);
          setImageError(true);
        };
        img.src = src;
      }
    }, [blog.image]);

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
        <div className="relative h-48 w-full overflow-hidden">
          {currentImageSrc && !imageError ? (
            <motion.img
              className="w-full h-full object-cover transition-transform duration-500"
              src={currentImageSrc}
              alt={title}
              onError={(e) => {
                console.error("Image failed to load in DOM:", currentImageSrc);
                setImageError(true);
                e.target.src = fallbackImage;
              }}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <img
                src={fallbackImage}
                alt="Fallback"
                className="max-h-20 max-w-20 opacity-50"
              />
            </div>
          )}
          {Category && (
            <motion.span
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg  text-white bg-black/60 backdrop-blur-sm border border-white/20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {Category}
            </motion.span>
          )}
        </div>

        <div className="p-5 flex-grow flex flex-col">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3 w-full">
            <div className="flex items-center gap-2">
              <span className="flex items-center">
                <CalendarDays className="mr-1" size={14} />
                {new Date(AddOnDt || publishedDate).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </span>
              {readTime && (
                <>
                  <span className="">•</span>
                  <span className="flex items-center">
                    <TbClock className="mr-1" size={14} />
                    {readTime} min read
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <FaUsers className="text-purple-400" size={14} />
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-700 text-sm">
                    {blogStats.averageRating?.toFixed(1) || "0.0"}
                  </span>

                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const rating = blogStats.averageRating || 0;
                      const fillAmount = Math.max(
                        0,
                        Math.min(1, rating - star + 1)
                      );

                      return (
                        <div key={star} className="relative">
                          <FaStar className="text-xs text-gray-300 absolute" />
                          {fillAmount > 0 && (
                            <FaStar
                              className="text-xs text-yellow-400"
                              style={{
                                clipPath: `inset(0 ${
                                  100 - fillAmount * 100
                                }% 0 0)`,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* <span className="text-xs text-gray-500">
                    ({blogStats.totalRatings || 0})
                  </span> */}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <FiEye className="text-blue-600" size={14} />
                <span className="text-gray-700 text-sm font-semibold">
                  {blogStats.totalViews || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
            {title}
          </h3>

          {/* Blog Content Preview (limited, plain text) */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
            {truncate(stripHtml(blog.content), 180)}
          </p>

          {/* Rating and Claps
          <div className="flex items-center gap-4 mb-4">
             {blogStats.averageRating > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={blogStats.averageRating} />
                <span className="text-sm text-gray-600">
                  ({blogStats.totalRatings})
                </span>
              </div>
            )} 
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 ml-auto"
            >
             //  Likes 
              {blogStats.totalLikes > 0 && (
                <motion.div
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.88 }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full 
                 bg-gradient-to-r from-red-100 to-red-200 shadow-md cursor-pointer"
                >
                  <Heart className="text-red-600" size={16} />
                  <span className="font-semibold text-gray-700">
                    {blogStats.totalLikes}
                  </span>
                </motion.div>
              )}

              // Views 
              {blogStats.totalViews > 0 && (
                <motion.div
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.88 }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full 
                 bg-gradient-to-r from-blue-100 to-blue-200 shadow-md cursor-pointer"
                >
                  <FiEye className="text-blue-600" size={16} />
                  <span className="font-semibold text-gray-700">
                    {blogStats.totalViews}
                  </span>
                </motion.div>
              )}
            </motion.div>
          </div> */}

          {/* Author Info */}
          <div className="mt-auto flex items-center gap-3 mb-4">
            {/* AUTHOR PROFILE IMAGE */}
            <motion.img
              src={getProfileUrl(User?.ProfilePicture)}
              onError={(e) => (e.target.src = Noimage)}
              className="w-9 h-9 rounded-full object-cover shadow-md"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />

            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {userName || "Unknown Author"}
              </span>
            </div>
          </div>

          {/* Reposts Accordion */}
          {hasReposts && (
            <div className="border-t border-gray-100 pt-4">
              <motion.button
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAccordion(BlogID);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <PiRepeat className="text-DGXgreen" size={16} />
                  <span className="text-sm font-medium text-gray-700">
                    View Reposts ({reposts.length})
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
                    <RepostCard reposts={reposts} />
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
      (!selectedCategory || blog.Category === selectedCategory) &&
      (!searchQuery ||
        (blog.title || "").toLowerCase().includes(searchQuery.toLowerCase()))
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
          {/* Search bar & category filters */}
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

          {/* Loader */}
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
            // No blogs message
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
              {/* Blog Grid */}
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
              onClick={handleWriteBlog}
            >
              Write a Blog Post
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Blog Modal */}
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

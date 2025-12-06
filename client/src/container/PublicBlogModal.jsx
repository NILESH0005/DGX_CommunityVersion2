import React, { useContext, useEffect, useState } from "react";
import {
  faXmark,
  faExpand,
  faCompress,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TbUserSquareRounded } from "react-icons/tb";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import ApiContext from "../context/ApiContext";
import { FiRepeat, FiShare2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PiHandsClappingLight, PiHandsClappingFill } from "react-icons/pi";
import { IoStar, IoStarOutline, IoStarHalf } from "react-icons/io5";
import RatingStars from "./RatingStars";
import Noimage from "../assets/No_Image_Available.jpg";

const PublicBlogModal = ({
  blog,
  closeModal,
  updateBlogState,
  refreshBlogs,
}) => {
  const {
    title,
    image,
    author,
    AuthAdd,
    published_date,
    content,
    Status,
    BlogID,
    RepostUser,
  } = blog || {};
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(blog?.likesCount || 0);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(blog?.averageRating || 0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { fetchData, userToken, user } = useContext(ApiContext);
  const navigate = useNavigate();

  const [currentImageSrc, setCurrentImageSrc] = useState("");
  const [imageError, setImageError] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isFullScreen]);

  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullScreen]);

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

    // If it's already a full URL, use it directly
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      console.log("Full URL detected:", imagePath);
      return imagePath;
    }

    // If it's a relative path, construct the full URL
    const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;

    if (!baseUploadsUrl) {
      console.error("VITE_API_UPLOADSURL environment variable is not set");
      return Noimage;
    }

    console.log("Base uploads URL:", baseUploadsUrl);
    console.log("Original image path:", imagePath);

    // Remove any leading slashes from the path
    const cleanPath = imagePath.replace(/^\/+/, "");

    // Construct the full URL
    const fullUrl = `${baseUploadsUrl}/${cleanPath}`;

    console.log("Constructed image URL:", fullUrl);
    return fullUrl;
  };

  useEffect(() => {
    if (image) {
      const src = getImageUrl(image);
      setCurrentImageSrc(src);
      setImageError(false);
      const img = new Image();
      img.onload = () => {
        console.log(`✅ Modal Image pre-loaded: ${src}`);
        setImageError(false);
      };
      img.onerror = () => {
        console.error(`❌ Modal Image failed to pre-load: ${src}`);
        setImageError(true);
      };
      img.src = src;
    }
  }, [image]);

  const getBaseUrl = () => {
    return import.meta.env.VITE_CLIENT_BASE_URL || window.location.origin;
  };

  const getBlogUrl = () => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/blog/${BlogID}`;
  };

  const safeCopyToClipboard = async (
    text,
    successMessage = "Blog link copied to clipboard!"
  ) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        Swal.fire({
          title: "Copied!",
          text: successMessage,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        return true;
      } catch (error) {
        console.error("Clipboard API failed:", error);
      }
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        Swal.fire({
          title: "Copied!",
          text: successMessage,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        return true;
      }

      Swal.fire({
        title: "Copy Manually",
        html: `Please copy this URL:<br>
          <div class="bg-gray-100 p-2 rounded border break-all text-sm mt-2 font-mono">${text}</div>`,
        icon: "info",
        confirmButtonText: "OK",
        width: "500px",
      });
      return false;
    } catch (err) {
      console.error("Fallback copy failed:", err);
      Swal.fire({
        title: "Copy Manually",
        html: `Please copy this URL:<br>
          <div class="bg-gray-100 p-2 rounded border break-all text-sm mt-2 font-mono">${text}</div>`,
        icon: "info",
        confirmButtonText: "OK",
        width: "500px",
      });
      return false;
    }
  };

  const [blogStats, setBlogStats] = useState({
    totalLikes: 0,
    averageRating: 0,
    totalRatings: 0,
  });

  useEffect(() => {
    if (userToken && blog?.BlogID) {
      fetchUserInteraction();
    }
    if (blog?.BlogID) {
      fetchBlogStats();
    }
  }, [userToken, blog?.BlogID]);

  const fetchUserInteraction = async () => {
    try {
      const endpoint = `blog/user-interaction/${blog.BlogID}`;
      const method = "GET";
      const headers = {
        "auth-token": userToken,
      };

      const result = await fetchData(endpoint, method, {}, headers);
      if (result.success) {
        const hasLiked = result.data.hasLiked || result.data.liked || false;
        const userRating = result.data.userRating || 0;
        setIsLiked(hasLiked);
        setUserRating(userRating);
      }
    } catch (error) {
      console.error("Error fetching user interaction:", error);
    }
  };

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

  const handleLike = async () => {
    if (!userToken) {
      Swal.fire({
        title: "Login Required",
        text: "You need to login to like this blog",
        icon: "info",
        confirmButtonText: "Go to Login",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/SignInn");
        }
      });
      return;
    }

    const newLikeState = !isLiked;
    const newLikeCount = newLikeState
      ? likeCount + 1
      : Math.max(0, likeCount - 1);

    setIsLiked(newLikeState);
    setLikeCount(newLikeCount);

    try {
      const endpoint = "blog/likeBlogController";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const body = {
        reference: BlogID,
        likes: isLiked ? 0 : 1,
      };

      const result = await fetchData(endpoint, method, body, headers);

      if (result.success) {
        const serverLiked = result.data.liked || result.data.hasLiked || false;
        const serverLikeCount = result.data.likesCount || likeCount;

        setIsLiked(serverLiked);
        setLikeCount(serverLikeCount);

        // Refresh stats
        fetchBlogStats();

        if (refreshBlogs) {
          refreshBlogs();
        }
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error updating like", "error");
    }
  };

  useEffect(() => {
    if (blogStats) {
      setLikeCount(blogStats.totalLikes || 0);
      setAverageRating(blogStats.averageRating || 0);
    }
  }, [blogStats]);

  const handleRate = async (rating) => {
    if (!userToken) {
      Swal.fire({
        title: "Login Required",
        text: "You need to login to rate this blog",
        icon: "info",
        confirmButtonText: "Go to Login",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/SignInn");
        }
      });
      return;
    }

    // Ask for confirmation
    Swal.fire({
      title: "Confirm Rating",
      text: `Are you sure you want to rate this blog ${rating} stars? You can only rate once.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, rate it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const endpoint = `blog/rate/${BlogID}`;
          const method = "POST";
          const headers = {
            "Content-Type": "application/json",
            "auth-token": userToken,
          };

          const body = { rating, reference: BlogID };

          const result = await fetchData(endpoint, method, body, headers);

          if (result.success) {
            setUserRating(rating);
            fetchUserInteraction();
            fetchBlogStats();

            Swal.fire({
              title: "Success!",
              text: `You rated this blog ${rating} stars!`,
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });

            if (refreshBlogs) {
              refreshBlogs();
            }
          } else {
            Swal.fire("Error", result.message, "error");
          }
        } catch (error) {
          // Handle duplicate rating error
          if (error.message?.includes("already rated")) {
            Swal.fire({
              title: "Already Rated",
              text: "You have already rated this blog. You can only rate once.",
              icon: "info",
              confirmButtonText: "OK",
            });
          } else {
            Swal.fire("Error", "Error submitting rating", "error");
          }
        }
      }
    });
  };

  useEffect(() => {
    if (blog?.userLiked) {
      setIsLiked(true);
    }
    if (blog?.likesCount) {
      setLikeCount(blog.likesCount);
    }
    if (blog?.userRating) {
      setUserRating(blog.userRating);
    }
    if (blog?.averageRating) {
      setAverageRating(blog.averageRating);
    }
  }, [blog]);

  const updateBlogStatus = async (blogId, Status, remark = "") => {
    const endpoint = `blog/updateBlog/${blogId}`;
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    const body = { Status, remark };

    try {
      const result = await fetchData(endpoint, method, body, headers);
      console.log("hgdsjhgfjhsdgfhjksghjkdgkjh", result);
      if (result.success) {
        Swal.fire({
          title: "Success!",
          text: `Blog ${Status}ed successfully!`,
          icon: "success",
          confirmButtonText: "OK",
        });

        if (typeof updateBlogState === "function") {
          updateBlogState(blogId, Status);
        }
        closeModal();
      } else {
        Swal.fire({
          title: "Error!",
          text: `Failed to ${Status} blog: ${result.message}`,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Error ${Status}ing blog: ${error.message}`,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleAction = (status) => {
    if (status === "reject") {
      Swal.fire({
        title: "Reject Blog",
        input: "text",
        inputLabel: "Enter reason for rejection",
        inputPlaceholder: "Provide a reason for rejection...",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Reject",
        inputValidator: (value) => {
          if (!value) {
            return "You need to provide a reason!";
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          updateBlogStatus(BlogID, "reject", result.value);
        }
      });
    } else if (status === "delete") {
      Swal.fire({
        title: `Are you sure?`,
        text: `You are about to delete this blog.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: `OK `,
      }).then((result) => {
        if (result.isConfirmed) {
          updateBlogStatus(BlogID, "delete");
        }
      });
    } else {
      Swal.fire({
        title: `Are you sure?`,
        text: `You are about to ${status} this blog.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: status === "approve" ? "#28a745" : "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: `Yes, ${status}!`,
      }).then((result) => {
        if (result.isConfirmed) {
          updateBlogStatus(BlogID, status);
        }
      });
    }
  };

  const handleRepost = async () => {
    const endpoint = "blog/blogpost";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    const body = {
      title,
      author: user.Name,
      content,
      image,
      category: blog.Category,
      publishedDate: new Date(),
      repostId: BlogID,
    };

    try {
      const result = await fetchData(endpoint, method, body, headers);
      if (result.success) {
        Swal.fire({
          title: "Success!",
          text: "Blog reposted successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
        if (refreshBlogs) {
          refreshBlogs();
        }
        closeModal();
      } else {
        Swal.fire("Error!", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    }
  };

  const isMyBlog = blog?.UserID === user?.UserID;
  const alreadyReposted = blog?.RepostUserID === user?.UserID;
  const canRepost = blog?.allowRepost && !isMyBlog && !alreadyReposted;

  const EnhancedRatingStars = ({
    value,
    onChange,
    readOnly = false,
    size = 20,
  }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const ratingValue = hoverRating || value;
          const filled = star <= ratingValue;

          return (
            <motion.button
              key={star}
              whileHover={!readOnly ? { scale: 1.2 } : {}}
              whileTap={!readOnly ? { scale: 0.9 } : {}}
              className={`${
                readOnly ? "cursor-default" : "cursor-pointer"
              } transition-colors duration-200 ${
                filled ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => !readOnly && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              disabled={readOnly}
            >
              {filled ? <IoStar size={size} /> : <IoStarOutline size={size} />}
            </motion.button>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`bg-white shadow-2xl border border-gray-100 flex flex-col ${
            isFullScreen
              ? "fixed inset-0 w-screen h-screen overflow-y-auto overflow-x-hidden rounded-none"
              : "rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
          }`}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 bg-white sticky top-0 z-40 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={closeModal}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 font-medium text-sm"
            >
              ← Back
            </motion.button>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullScreen}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200 bg-white border border-gray-200 shadow-sm"
                title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
              </motion.button>

              {/* Close Button */}
              {/* <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }}
                whileTap={{ scale: 0.9 }}
                onClick={closeModal}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200 bg-white border border-gray-200 shadow-sm"
              >
                <FontAwesomeIcon icon={faXmark} />
              </motion.button> */}
            </div>
          </div>

          {/* Scrollable Content - Fixed height calculation */}
          <div
            className="flex-1 min-h-[400px]"
            style={
              isFullScreen
                ? {
                    height: "100vh",
                    overflowY: "auto",
                  }
                : { overflowY: "auto" }
            }
          >
            <div className="w-full flex flex-col lg:flex-row items-start gap-6 p-4 lg:p-8">
              <div className="flex-1">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight"
                >
                  {title}
                </motion.h1>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <TbUserSquareRounded className="text-white text-lg lg:text-xl" />
                  </div>

                  <div className="text-left">
                    <p className="text-gray-900 font-semibold text-sm lg:text-base">
                      {blog?.User?.Name || author || "Unknown author"}
                    </p>
                    <p className="text-gray-500 text-xs lg:text-sm">
                      {published_date}
                    </p>
                  </div>
                </div>

                {RepostUser && RepostUser.Name && (
                  <div className="flex items-center gap-2 text-xs lg:text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full mt-3">
                    <FiRepeat className="text-xs" />
                    <span>Originally by {RepostUser.Name}</span>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-1/2 h-48 lg:h-60 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {currentImageSrc && !imageError ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    src={currentImageSrc}
                    className="w-full h-full object-contain"
                    alt={title}
                    onError={(e) => {
                      setImageError(true);
                      e.target.src = Noimage;
                    }}
                  />
                ) : (
                  <img src={Noimage} className="max-h-32 max-w-32 opacity-30" />
                )}
              </div>
            </div>

            {/* Engagement Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="border-t border-b border-gray-200 pt-2 lg:pt-4 pb-6 lg:pb-2 mb-6 lg:mb-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                {/* Left: Engagement Buttons */}
                <div className="flex flex-wrap items-center px-4 gap-2 lg:gap-3 justify-start w-full mb-4">
                  {/* Clap Button */}
                  <motion.button
                    variants={{
                      initial: { scale: 1 },
                      animate: {
                        scale: [1, 1.4, 1],
                        transition: { duration: 0.4 },
                      },
                    }}
                    initial="initial"
                    animate={isLiked ? "animate" : "initial"}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLike}
                    className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-6 py-2 lg:py-3 rounded-full transition-all duration-300 font-medium shadow-lg ${
                      isLiked
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <motion.div
                      animate={isLiked ? { rotate: [0, -15, 15, 0] } : {}}
                      transition={{ duration: 0.6 }}
                    >
                      {isLiked ? (
                        <PiHandsClappingFill className="text-lg lg:text-xl" />
                      ) : (
                        <PiHandsClappingLight className="text-lg lg:text-xl" />
                      )}
                    </motion.div>
                    <span className="font-semibold text-sm lg:text-base">
                      {isLiked ? "Clapped" : "Clap"}
                    </span>
                    {likeCount > 0 && (
                      <span
                        className={`px-1 lg:px-2 py-0.5 lg:py-1 rounded-full text-xs font-medium ${
                          isLiked ? "bg-white/20" : "bg-gray-100"
                        }`}
                      >
                        {likeCount}
                      </span>
                    )}
                  </motion.button>

                  {/* Rating Section */}
                  <div className="flex items-center gap-2 lg:gap-3 bg-gray-50 px-2 lg:px-4 py-1 lg:py-3 rounded-full border border-gray-200">
                    <span className="text-xs lg:text-sm font-medium text-gray-700">
                      Rate:
                    </span>
                    <EnhancedRatingStars
                      value={userRating}
                      onChange={handleRate}
                      size={16}
                    />
                  </div>

                  {/* Share Button */}
                  {/* <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      const blogUrl = getBlogUrl();
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: title || "Check out this blog!",
                            text: content
                              ? content
                                  .replace(/<[^>]+>/g, "")
                                  .substring(0, 100) + "..."
                              : "Interesting blog post",
                            url: blogUrl,
                          });
                        } catch (error) {
                          if (error.name !== "AbortError") {
                            await safeCopyToClipboard(blogUrl);
                          }
                        }
                      } else {
                        await safeCopyToClipboard(blogUrl);
                      }
                    }}
                    className="flex items-center gap-1 lg:gap-3 px-3 lg:px-6 py-2 lg:py-3 rounded-full bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-lg transition-all duration-200 font-medium text-sm lg:text-base"
                  >
                    <FiShare2 className="text-base lg:text-lg" />
                    <span className="hidden sm:inline">Share</span>
                  </motion.button> */}

                  {/* Repost Button */}
                  {canRepost && Status === "Approved" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRepost}
                      className="flex items-center gap-1 lg:gap-3 px-3 lg:px-6 py-2 lg:py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 font-medium text-sm lg:text-base"
                    >
                      <FiRepeat className="text-base lg:text-lg" />
                      <span className="hidden sm:inline">Repost</span>
                    </motion.button>
                  )}
                </div>

                {/* Right: Admin Controls */}
                {user?.isAdmin == "1" && Status === "Pending" && (
                  <div className="flex items-center gap-2 lg:gap-3 justify-center lg:justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 lg:px-6 py-2 lg:py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25 transition-all duration-200 font-medium text-sm lg:text-base"
                      onClick={() => handleAction("approve")}
                    >
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 lg:px-6 py-2 lg:py-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25 transition-all duration-200 font-medium text-sm lg:text-base"
                      onClick={() => handleAction("reject")}
                    >
                      Reject
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="px-4 lg:px-8 pb-6 lg:pb-8">
              {/* Blog Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="prose prose-sm lg:prose-lg max-w-none mb-6 lg:mb-8"
              >
                <div
                  className="blog-content text-gray-700 leading-relaxed space-y-4 lg:space-y-6"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center pt-4 lg:pt-6 border-t border-gray-200"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                  className="px-4 lg:px-8 py-2 lg:py-3 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg transition-all duration-200 font-medium hover:shadow-xl text-sm lg:text-base"
                >
                  Close Article
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PublicBlogModal;

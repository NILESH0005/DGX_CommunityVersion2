import React, { useContext, useEffect, useState } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TbUserSquareRounded } from "react-icons/tb";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import ApiContext from "../context/ApiContext";
import { FiRepeat } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PiHandsClappingLight, PiHandsClappingFill } from "react-icons/pi";
import RatingStars from "./RatingStars"; // Adjust the import path as needed
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
  const { fetchData, userToken, user } = useContext(ApiContext);
  const navigate = useNavigate();

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
        const { hasLiked, userRating } = result.data;
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

  // Handle Like function
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

    try {
      const endpoint = "blog/likeBlogController"; // your like API
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const body = {
        reference: BlogID,
        likes: isLiked ? 0 : 1, // if already liked, we want to unlike
      };

      const result = await fetchData(endpoint, method, body, headers);

      if (result.success) {
        setIsLiked(!isLiked);
        fetchUserInteraction();
        fetchBlogStats();

        // update UI based on server response
        setIsLiked(result.data.liked);
        setLikeCount((prev) => (result.data.liked ? prev + 1 : prev - 1));

        if (refreshBlogs) {
          refreshBlogs(); // optional: refresh list if needed
        }
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error updating like", "error");
    }
  };

  // Handle Rating function
  // Handle Rating function - UPDATED
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

    try {
      const endpoint = `blog/rate/${BlogID}`; // Changed endpoint
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const body = { rating };

      const result = await fetchData(endpoint, method, body, headers);

      if (result.success) {
        setUserRating(rating);
        fetchUserInteraction();
        fetchBlogStats();

        // Optional: If you want to show success message
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
      Swal.fire("Error", "Error submitting rating", "error");
    }
  };

  // Initialize states from blog data
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

  // Your existing functions
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

  const processBlogs = (blogs) => {
    const blogMap = {};

    blogs.forEach((b) => {
      const originalId = b.repostId || b.BlogID; // use original BlogID if not a repost
      const existing = blogMap[originalId];

      if (!existing) {
        blogMap[originalId] = b;
      } else {
        // if there’s already one, compare by date and keep latest repost
        const existingDate = new Date(existing.published_date);
        const newDate = new Date(b.published_date);
        if (newDate > existingDate) {
          blogMap[originalId] = b;
        }
      }
    });

    return Object.values(blogMap);
  };

  const [blogs, setBlogs] = useState([]);

  const fetchBlogs = async () => {
    const result = await fetchData("blog/allBlogs", "GET");
    if (result.success) {
      const uniqueBlogs = processBlogs(result.data);
      setBlogs(uniqueBlogs);
    }
  };

  const fallbackCopyToClipboardBlog = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        Swal.fire({
          title: "Copied!",
          text: "Blog link copied to clipboard",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Copy Manually",
          html: `Please copy this URL:<br><code class="bg-gray-100 p-1 rounded">${text}</code>`,
          icon: "info",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      Swal.fire({
        title: "Copy Manually",
        html: `Please copy this URL:<br><code class="bg-gray-100 p-1 rounded">${text}</code>`,
        icon: "info",
        confirmButtonText: "OK",
      });
    }

    document.body.removeChild(textArea);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-white p-6 rounded-xl w-full max-w-4xl max-h-[90vh] relative overflow-y-auto shadow-2xl"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-500 hover:text-gray-700 text-2xl absolute top-4 right-4 transition-colors duration-200 z-10"
            onClick={closeModal}
          >
            <FontAwesomeIcon icon={faXmark} />
          </motion.button>

          <div className="flex flex-col items-center h-full">
            <div className="w-full mb-8 relative">
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full h-[600px] object-cover rounded-none"
                src={image || Noimage}
                alt={title}
              />

              {/* Rating display badge */}
              <motion.div
                className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-semibold shadow-md flex items-center gap-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <RatingStars
                  value={blogStats.averageRating}
                  readOnly
                  size={16}
                />
                <span className="text-gray-700 ml-1">
                  {blogStats.averageRating}
                </span>
                {blogStats.totalRatings > 0 && (
                  <span className="text-gray-500 text-xs">
                    ({blogStats.totalRatings})
                  </span>
                )}
              </motion.div>

              {RepostUser && RepostUser.Name && (
                <motion.span
                  className="absolute top-4 right-4 bg-DGXgreen text-black px-3 py-1 rounded-full text-sm font-semibold shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Repost
                </motion.span>
              )}
            </div>

            <div className="w-full px-4">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-800"
              >
                {title}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6 flex flex-col items-center"
              >
                <div className="flex items-center gap-3 mb-2">
                  <TbUserSquareRounded className="text-indigo-600 text-3xl" />
                  <span className="text-gray-600 font-medium">
                    {AuthAdd || author || "Unknown author"}
                  </span>
                </div>
                {RepostUser && RepostUser.Name && (
                  <div className="flex items-center gap-2 text-sm text-DGXgreen font-medium">
                    <FiRepeat className="text-DGXgreen" />
                    <span>Reposted from {RepostUser.Name}</span>
                  </div>
                )}
                <p className="text-gray-500 text-sm">{published_date}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-justify text-gray-700 leading-relaxed space-y-4 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* Rating Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Your rating
                  </span>
                  <span className="text-xs text-gray-500">
                    Use arrows to adjust
                  </span>
                </div>
                <RatingStars
                  value={userRating}
                  onChange={handleRate}
                  aria-label="Your rating"
                />
                {userRating > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-gray-600 mt-2"
                  >
                    You rated this {userRating} star{userRating > 1 ? "s" : ""}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-4 mt-8 pb-4"
              >
                <motion.button
                  variants={{
                    initial: { scale: 1 },
                    animate: {
                      scale: [1, 1.3, 1],
                      transition: { duration: 0.3 },
                    },
                  }}
                  initial="initial"
                  animate={isLiked ? "animate" : "initial"}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 font-medium ${
                    isLiked
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                  }`}
                >
                  <motion.div
                    animate={isLiked ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {isLiked ? (
                      <PiHandsClappingFill className="text-xl" />
                    ) : (
                      <PiHandsClappingLight className="text-xl" />
                    )}
                  </motion.div>
                  <span className="font-semibold">
                    {isLiked ? "Clapped!" : "Clap"}{" "}
                    {likeCount > 0 && `• ${likeCount}`}
                  </span>
                </motion.button>

                {user?.isAdmin == "1" && Status === "Pending" && (
                  <>
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                      onClick={() => handleAction("approve")}
                    >
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                      onClick={() => handleAction("reject")}
                    >
                      Reject
                    </motion.button>
                  </>
                )}

                {canRepost && Status === "Approved" && (
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRepost}
                    className="bg-DGXgreen hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                  >
                    <FiRepeat className="inline mr-2" />
                    Repost
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    const blogUrl = getBlogUrl();

                    // Check if Web Share API is supported
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
                        // Only log if it's not an abort error (user cancelled)
                        if (error.name !== "AbortError") {
                          console.error("Share failed:", error);
                          // Fallback to clipboard
                          await safeCopyToClipboard(blogUrl);
                        }
                      }
                    } else {
                      // Use clipboard directly
                      await safeCopyToClipboard(blogUrl);
                    }
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share
                </motion.button>
                
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                  className="bg-DGXblue hover:bg-DGXgreen text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                >
                  Close
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

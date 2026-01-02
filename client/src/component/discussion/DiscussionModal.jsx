import React, { useState, useContext, useEffect } from "react";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { FaTrashAlt } from "react-icons/fa";
import ApiContext from "../../context/ApiContext.jsx";
import images from "../../../public/images.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaReply } from "react-icons/fa";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import {
  ProfileImage,
  ProfileLink,
  handleProfileRedirect,
} from "../../utils/handleProfileRedirect.jsx";
import { checkToxicityWithReasonAndFlag } from "../../utils/toxicityDetection.js";

const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;

const DiscussionModal = ({
  isOpen,
  comment,
  onRequestClose,
  discussion,
  setDemoDiscussion,
  updateCommentCount,
  refreshDiscussions,
}) => {
  const navigate = useNavigate();
  const { fetchData, userToken, user } = useContext(ApiContext);
  const [comments, setComments] = useState(discussion.comment || []);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingToxicity, setIsCheckingToxicity] = useState(false);
  const [activeReplyIndex, setActiveReplyIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [discussionImageUrl, setDiscussionImageUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setComments(discussion.comment || []);
    }
  }, [isOpen, discussion.comment]);

  useEffect(() => {
    if (discussion?.Image) {
      if (discussion.Image.startsWith("http")) {
        setDiscussionImageUrl(discussion.Image);
      } else {
        setDiscussionImageUrl(`${baseUploadsUrl}/${discussion.Image}`);
      }
    } else if (discussion?.DiscussionImagePath) {
      if (discussion.DiscussionImagePath.startsWith("http")) {
        setDiscussionImageUrl(discussion.DiscussionImagePath);
      } else {
        setDiscussionImageUrl(
          `${baseUploadsUrl}/${discussion.DiscussionImagePath}`
        );
      }
    } else {
      setDiscussionImageUrl("");
    }
  }, [discussion]);

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    if (
      imagePath.includes(baseUploadsUrl) ||
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://") ||
      imagePath.startsWith("//")
    ) {
      return imagePath;
    }

    return `${baseUploadsUrl}/${imagePath}`;
  };

  // Helper function to get profile image URL
  const getProfileImageUrl = (userData) => {
    if (!userData) {
      return images.defaultProfile;
    }

    const profilePic =
      userData.ProfilePicture ||
      userData.UserImage ||
      userData.profilePicture ||
      userData.userImage;

    if (!profilePic) {
      return images.defaultProfile;
    }

    if (profilePic.startsWith("http") || profilePic.startsWith("//")) {
      return profilePic;
    }

    if (profilePic.includes(baseUploadsUrl)) {
      return profilePic;
    }

    if (profilePic.includes("uploads/")) {
      return `${baseUploadsUrl}/${profilePic.replace(/^\/+/, "")}`;
    }

    return `${baseUploadsUrl}/uploads/${profilePic.replace(/^\/+/, "")}`;
  };

  // Toxicity validation function for comments and replies
  const validateCommentToxicity = async (text) => {
    setIsCheckingToxicity(true);

    try {
      const result = await checkToxicityWithReasonAndFlag(text);
      console.log("Comment toxicity result:", result);

      if (result.flag === 0 && result.reasons.length > 0) {
        await Swal.fire({
          icon: "warning",
          title: "Content Moderation Alert",
          html: `Your comment contains potentially inappropriate material:<br/><br/>
              <strong>Reasons:</strong><br/>
              ${result.reasons.join("<br/>")}<br/><br/>
              Please review and modify your comment before posting.`,
          confirmButtonText: "I understand",
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error("Toxicity validation error:", error);
      const result = await Swal.fire({
        icon: "warning",
        title: "Moderation Service Unavailable",
        text: "The content moderation service is temporarily unavailable. Please ensure your comment follows community guidelines.",
        showCancelButton: true,
        confirmButtonText: "Post Anyway",
        cancelButtonText: "Cancel",
      });
      return result.isConfirmed;
    } finally {
      setIsCheckingToxicity(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
    });

    if (result.isConfirmed) {
      try {
        const endpoint = "discussion/deleteUserComment";
        const method = "POST";
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };
        const body = { commentId };

        const response = await fetchData(endpoint, method, body, headers);

        if (response && response.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The comment has been deleted.",
          });

          const updatedComments = comments.filter(
            (comment) => comment.DiscussionID !== commentId
          );
          setComments(updatedComments);

          if (updateCommentCount) {
            updateCommentCount(
              discussion.DiscussionID,
              updatedComments.length,
              updatedComments
            );
          }
        } else {
          throw new Error(response.message || "Failed to delete the comment.");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to delete the comment: ${error.message}`,
        });
      }
    }
  };

  const handleAuthCheck = () => {
    if (!userToken) {
      Swal.fire({
        icon: "warning",
        title: "Authentication Required",
        text: "You need to login to perform this action",
        confirmButtonText: "Login",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/SignInn");
        }
      });
      return false;
    }
    return true;
  };

  const addReplyToComments = (comments, parentId, newReply) => {
    return comments.map((comment) => {
      if (comment.DiscussionID === parentId) {
        return {
          ...comment,
          comment: [newReply, ...(comment.comment || [])],
          replyCount: (comment.replyCount || 0) + 1,
        };
      }

      if (comment.comment && comment.comment.length > 0) {
        return {
          ...comment,
          comment: addReplyToComments(comment.comment, parentId, newReply),
        };
      }

      return comment;
    });
  };

  const handleAddComment = async () => {
    if (!handleAuthCheck()) return;

    if (!newComment.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Comment cannot be empty!",
      });
      return;
    }

    const isContentAppropriate = await validateCommentToxicity(newComment);
    if (!isContentAppropriate) {
      return;
    }

    const endpoint = "discussion/discussionpost";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = {
      reference: discussion.DiscussionID,
      comment: newComment,
    };

    setLoading(true);

    try {
      const data = await fetchData(endpoint, method, body, headers);

      if (!data.success) {
        throw new Error(data.message || "Failed to post comment");
      }

      // Create new comment object with user's profile image
      const newCommentObj = {
        DiscussionID: data.data?.postId || Date.now(),
        UserID: user.UserID,
        UserName: user.Name,
        ProfilePicture: user.ProfilePicture || user.UserImage,
        UserImage: user.UserImage || user.ProfilePicture,
        Comment: newComment,
        timestamp: new Date().toISOString(),
        Likes: null,
        userLike: 0,
        likeCount: 0,
        comment: [],
        replyCount: 0,
      };

      const updatedComments = [newCommentObj, ...comments];
      setComments(updatedComments);
      setNewComment("");

      const newCommentCount = updatedComments.length;
      if (updateCommentCount) {
        updateCommentCount(
          discussion.DiscussionID,
          newCommentCount,
          updatedComments
        );
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Comment posted successfully!",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to post comment",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (parentId, replyText) => {
    if (!handleAuthCheck()) return;

    if (!replyText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Reply cannot be empty!",
      });
      return;
    }

    const isContentAppropriate = await validateCommentToxicity(replyText);
    if (!isContentAppropriate) {
      return;
    }

    const endpoint = "discussion/discussionpost";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = {
      reference: parentId,
      comment: replyText,
    };

    setLoading(true);
    try {
      const data = await fetchData(endpoint, method, body, headers);
      if (!data.success) {
        throw new Error(data.message || "Failed to post reply");
      }

      // Create new reply object with user's profile image
      const newReply = {
        DiscussionID: data.data?.postId || Date.now(),
        UserID: user.UserID,
        UserName: user.Name,
        ProfilePicture: user.ProfilePicture || user.UserImage,
        UserImage: user.UserImage || user.ProfilePicture,
        Comment: replyText,
        timestamp: new Date().toISOString(),
        Likes: null,
        userLike: 0,
        likeCount: 0,
        comment: [],
        replyCount: 0,
      };

      const updatedComments = addReplyToComments(comments, parentId, newReply);
      setComments(updatedComments);

      const countTotalComments = (comments) => {
        return comments.reduce((total, comment) => {
          return (
            total +
            1 +
            (comment.comment ? countTotalComments(comment.comment) : 0)
          );
        }, 0);
      };

      const newCommentCount = countTotalComments(updatedComments);
      if (updateCommentCount) {
        updateCommentCount(
          discussion.DiscussionID,
          newCommentCount,
          updatedComments
        );
      }
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Reply posted successfully!",
      });
      return updatedComments;
    } catch (error) {
      console.error("Error posting reply:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to post reply",
      });
      return null;
    } finally {
      setLoading(false);
      setActiveReplyIndex(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Recursive component to render nested comments
  const Comment = ({ comment, depth = 0 }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    const handleReply = async () => {
      if (!replyText.trim()) return;

      const isContentAppropriate = await validateCommentToxicity(replyText);
      if (!isContentAppropriate) {
        return;
      }

      await handleAddReply(comment.DiscussionID, replyText);
      setIsReplying(false);
      setReplyText("");
    };

    return (
      <div className={`mt-3 ${depth > 0 ? "ml-4 sm:ml-8" : ""}`}>
        <div className="flex space-x-3">
          {comment && (
            <ProfileImage
              userId={comment.UserID}
              src={getProfileImageUrl(comment)}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 object-cover"
              alt="User"
              onError={(e) => {
                console.log(
                  "Profile image failed to load for user:",
                  comment.UserID
                );
                e.target.src = images.defaultProfile;
              }}
            />
          )}

          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="flex justify-between items-start">
                <div>
                  <ProfileLink
                    userId={comment.UserID}
                    className="font-semibold text-sm sm:text-base text-gray-800 hover:text-DGXblue transition-colors"
                  >
                    {comment.UserName}
                  </ProfileLink>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatDate(comment.timestamp)}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-gray-500 hover:text-DGXblue transition-colors"
                    title="Reply"
                  >
                    <FaReply size={13} />
                  </button>
                  {(user?.UserID === comment.UserID || user?.isAdmin === 1) && (
                    <button
                      onClick={() => handleDeleteComment(comment.DiscussionID)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      title={
                        user?.isAdmin === 1 && user?.UserID !== comment.UserID
                          ? "Delete as Admin"
                          : "Delete"
                      }
                    >
                      <FaTrashAlt size={13} />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1 text-gray-700 text-xs sm:text-sm">
                {comment.Comment}
              </p>
            </div>

            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <div className="flex space-x-2">
                  <ProfileImage
                    userId={user?.UserID}
                    src={getProfileImageUrl(user)}
                    className="w-6 h-6 rounded-full"
                    alt="User"
                    onError={(e) => {
                      e.target.src = images.defaultProfile;
                    }}
                  />
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs sm:text-sm focus:ring-2 focus:ring-DGXblue focus:border-transparent"
                      placeholder="Write a reply..."
                    />
                    <div className="flex justify-end mt-1 space-x-2">
                      <button
                        onClick={() => setIsReplying(false)}
                        className="text-xs sm:text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReply}
                        className="bg-DGXgreen hover:bg-DGXblue text-white text-xs sm:text-sm font-medium py-1 px-2 sm:px-3 rounded-lg transition-colors"
                        disabled={loading || isCheckingToxicity}
                      >
                        {isCheckingToxicity
                          ? "Checking..."
                          : loading
                          ? "Posting..."
                          : "Reply"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {comment.comment?.length > 0 && (
              <div className="mt-2 space-y-2">
                {comment.comment.map((nestedComment, index) => (
                  <Comment
                    key={index}
                    comment={nestedComment}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center p-2 sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-start p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ProfileImage
                userId={discussion.User?.UserID}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-gray-300 bg-cover bg-center"
                src={getProfileImageUrl(discussion.User || discussion)}
                alt="User"
                onError={(e) => {
                  e.target.src = images.defaultProfile;
                }}
              />

              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 line-clamp-1">
                  {discussion.Title}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 md:space-x-4 text-xs sm:text-sm text-gray-500">
                  <ProfileLink
                    userId={discussion.UserID}
                    className="hover:text-DGXblue transition-colors"
                  >
                    {discussion.User?.Name ||
                      discussion.UserName ||
                      "Unknown author"}
                  </ProfileLink>
                  <span className="hidden sm:block">•</span>
                  <span>
                    {discussion.AddOnDt
                      ? formatDate(discussion.AddOnDt)
                      : "No date available"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onRequestClose()}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
          <div className="md:hidden flex border-b border-gray-200">
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === "content"
                  ? "text-DGXblue border-b-2 border-DGXblue"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("content")}
            >
              Discussion
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === "comments"
                  ? "text-DGXblue border-b-2 border-DGXblue"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("comments")}
            >
              Comments ({comments.length})
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Discussion Content */}
            <div
              className={`${
                activeTab === "content" ? "block" : "hidden"
              } md:block md:w-1/2 p-4 sm:p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200`}
            >
              {discussionImageUrl && (
                <div className="mb-4 sm:mb-6 rounded-lg overflow-hidden">
                  <img
                    src={discussionImageUrl}
                    alt="Post"
                    className="w-full h-auto max-h-64 sm:max-h-96 object-contain mx-auto"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
                  {discussion.Title}
                </h2>
                <div
                  className="ql-snow discussion-content text-sm sm:text-base"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(discussion.Content),
                  }}
                />
              </div>

              {discussion.Tag && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {typeof discussion.Tag === "string"
                      ? discussion.Tag.split(",")
                          .filter((tag) => tag.trim())
                          .map((tag, index) => {
                            const cleaned = tag.trim();
                            const formatted =
                              cleaned.charAt(0).toUpperCase() +
                              cleaned.slice(1);
                            return (
                              <span
                                key={index}
                                className="bg-DGXgreen text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs"
                              >
                                {formatted}
                              </span>
                            );
                          })
                      : discussion.Tag.map((tag, index) => {
                          const formatted =
                            typeof tag === "string"
                              ? tag.charAt(0).toUpperCase() + tag.slice(1)
                              : tag;
                          return (
                            <span
                              key={index}
                              className="bg-DGXgreen text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs"
                            >
                              {formatted}
                            </span>
                          );
                        })}
                  </div>
                </div>
              )}
            </div>
            <div
              className={`${
                activeTab === "comments" ? "block" : "hidden"
              } md:block md:w-1/2 flex flex-col`}
            >
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="flex space-x-2">
                  <ProfileImage
                    userId={user?.UserID}
                    src={getProfileImageUrl(user)}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 object-cover"
                    alt="User"
                    onError={(e) => {
                      e.target.src = images.defaultProfile;
                    }}
                  />

                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2 sm:p-3 text-xs sm:text-sm focus:ring-2 focus:ring-DGXblue focus:border-transparent"
                      placeholder="Add a comment..."
                    />
                    <div className="flex justify-end mt-1 sm:mt-2">
                      <button
                        onClick={handleAddComment}
                        disabled={loading || isCheckingToxicity}
                        className="bg-DGXgreen hover:bg-DGXblue text-white text-xs sm:text-sm font-medium py-1 px-2 sm:py-2 sm:px-4 rounded-lg transition-colors"
                      >
                        {isCheckingToxicity
                          ? "Checking..."
                          : loading
                          ? "Posting..."
                          : "Post Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto p-3 sm:p-4 hide-scrollbar"
                style={{
                  maxHeight: "60vh",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">
                  Comments ({comments.length})
                </h3>

                {comments.length === 0 ? (
                  <div className="text-center text-gray-500 py-4 sm:py-8 text-sm sm:text-base">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {comments.map((comment, index) => (
                      <Comment key={index} comment={comment} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DiscussionModal;

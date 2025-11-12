import React, { useState } from "react";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import {
  FiEye,
  FiRepeat,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import DOMPurify from "dompurify";
import Swal from "sweetalert2";

const DiscussionCard = ({
  discussion,
  openModal,
  userToken,
  navigate,
  fetchData,
  user,
  updateLikeCount,       // <--- add
  updateCommentCount,    // optional if you need it
}) => {
  const [likeCount, setLikeCount] = useState(discussion.likeCount || 0);
  const [userLike, setUserLike] = useState(discussion.userLike || 0);
  const [loading, setLoading] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [tooltip, setTooltip] = useState("");

  const UPLOADS_BASE_URL = import.meta.env.VITE_API_UPLOADSURL;
  const currentUserId = user?.uniqueId || user?.UserID;

  // ---------------------------
  // LIKE HANDLER
  // ---------------------------
  const handleLike = async (e) => {
  e.stopPropagation();

  if (!userToken) {
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Please log in to like this discussion.",
      confirmButtonText: "Login",
    }).then((res) => {
      if (res.isConfirmed) navigate("/SignInn");
    });
    return;
  }

  const prevLike = userLike;
  const prevCount = likeCount;

  const newLikeState = userLike === 1 ? 0 : 1;
  const newCount =
    newLikeState === 1 ? likeCount + 1 : Math.max(0, likeCount - 1);

  // 🔥 Optimistic UI update
  setUserLike(newLikeState);
  setLikeCount(newCount);

  // 🔥 Update parent immediately
  if (typeof updateLikeCount === "function") {
    updateLikeCount(discussion.DiscussionID, newCount, newLikeState);
  }

  try {
    const endpoint = "discussion/like";
    const res = await fetchData(endpoint, "POST",
      { reference: discussion.DiscussionID, likes: newLikeState },
      { "Content-Type": "application/json", "auth-token": userToken }
    );

    if (!res.success) throw new Error(res.message);
  } catch (err) {
    console.error("Like Error:", err);
    setUserLike(prevLike);
    setLikeCount(prevCount);
    Swal.fire("Error", "Failed to update like. Try again.", "error");
  }
};



  // ---------------------------
  // REPOST HANDLER
  // ---------------------------
  const handleRepost = async (e) => {
    e.stopPropagation();
    if (!userToken) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to repost this discussion.",
        confirmButtonText: "OK",
      });
      return;
    }
    if (reposted) {
      Swal.fire("Info", "You’ve already reposted this discussion.", "info");
      return;
    }
    if (discussion.UserID === currentUserId) {
      Swal.fire("Info", "You cannot repost your own discussion.", "info");
      return;
    }
    if (!discussion.allowRepost) {
      Swal.fire("Notice", "Reposting not allowed by the author.", "warning");
      return;
    }

    setLoading(true);
    try {
      const body = {
        title: discussion.Title,
        content: discussion.Content,
        tags: Array.isArray(discussion.Tag)
          ? discussion.Tag.join(",")
          : discussion.Tag,
        url: Array.isArray(discussion.ResourceUrl)
          ? discussion.ResourceUrl.join(",")
          : discussion.ResourceUrl,
        visibility: discussion.VisibilityValue || "public",
        bannerImagePath: discussion.DiscussionImagePath || null,
        allowRepost: discussion.allowRepost,
        repostId: discussion.DiscussionID,
      };

      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const res = await fetchData(
        "discussion/discussionpost",
        "POST",
        body,
        headers
      );
      if (!res.success) throw new Error(res.message);

      setReposted(true);
      Swal.fire("Success", "Discussion reposted successfully!", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Repost failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleComment = (e) => {
    e.stopPropagation();
    openModal(discussion);
  };

  const getTooltipMessage = () => {
    if (loading) return "Reposting...";
    if (reposted) return "Reposted Already";
    if (!discussion.allowRepost) return "Repost Not Allowed";
    return "Repost Allowed";
  };


  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      {/* Author Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {discussion.User?.ProfilePicture ? (
            <img
              src={discussion.User.ProfilePicture}
              alt={discussion.User.Name}
              className="w-10 h-10 rounded-full border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-DGXgreen to-DGXblue flex items-center justify-center text-white font-semibold text-sm">
              {discussion.User.Name?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800">{discussion.User.Name}</p>
            {discussion.RepostID && discussion.originalPost && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FiRepeat className="w-3 h-3" />
                Reposted from {discussion.originalPost.OriginalUserName}
              </p>
            )}
          </div>
        </div>

        {discussion.RepostID && (
          <span className="flex items-center text-xs bg-gradient-to-r from-DGXblue to-DGXgreen text-white px-3 py-1 rounded-full">
            <FiRepeat className="mr-1" size={12} />
            Repost
          </span>
        )}
      </div>

      {/* Title & Content */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-DGXgreen">
          {discussion.Title}
        </h3>

        <div className="text-gray-700 leading-relaxed">
          {discussion.Content.length > 500 ? (
            <>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    discussion.Content.slice(0, 500) + "..."
                  ),
                }}
              />
              <span
                className="text-DGXblue cursor-pointer font-semibold hover:underline inline-flex items-center gap-1 mt-2"
                onClick={openModal}
              >
                Continue reading →
              </span>
            </>
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(discussion.Content),
              }}
            />
          )}
        </div>
      </div>

      {/* Banner Image */}
      {(discussion.DiscussionImagePath || discussion.Image) && (
        <div className="mb-4 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <img
            src={
              discussion.DiscussionImagePath
                ? `${UPLOADS_BASE_URL}/${discussion.DiscussionImagePath}`
                : discussion.Image
            }
            alt="Discussion Banner"
            className="w-full object-cover max-h-[400px] hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Tags */}
      {discussion.Tag && (
        <div className="flex flex-wrap gap-2 mb-3">
          {(typeof discussion.Tag === "string"
            ? discussion.Tag.split(",").filter(Boolean)
            : discussion.Tag
          ).map((tag, index) => (
            <span
              key={index}
              className="bg-gradient-to-r from-DGXgreen to-DGXblue text-white rounded-full px-3 py-1 text-xs font-medium shadow-md"
            >
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100 gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-2 group"
          >
            <div
              className={`p-2 rounded-full transition-all ${
                userLike === 1
                  ? "bg-gradient-to-r from-DGXblue to-blue-400 text-white"
                  : "bg-gray-100 text-gray-600 group-hover:bg-blue-50"
              }`}
            >
              {userLike === 1 ? (
                <AiFillLike className="w-5 h-5" />
              ) : (
                <AiOutlineLike className="w-5 h-5" />
              )}
            </div>
            <span
              className={`font-semibold ${
                userLike === 1 ? "text-DGXblue" : "text-gray-600"
              }`}
            >
              {likeCount}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={handleComment}
            className="flex items-center gap-2 text-gray-600 hover:text-DGXgreen"
          >
            <div className="p-2 rounded-full bg-gray-100 group-hover:bg-green-50">
              <FaComment className="w-5 h-5" />
            </div>
            <span className="font-medium">{discussion.commentCount || 0}</span>
          </button>

          {/* Views */}
          <div className="flex items-center gap-2 text-gray-500">
            <div className="p-2 rounded-full bg-gray-100">
              <FiEye className="w-5 h-5" />
            </div>
            <span className="font-medium">{discussion.viewCount || 0}</span>
          </div>

          {/* Repost Icon + Tooltip */}
          <div className="relative group">
            <button
              onClick={handleRepost}
              disabled={loading || reposted}
              onMouseEnter={() => setTooltip(getTooltipMessage())}
              onMouseLeave={() => setTooltip("")}
              className={`p-2 rounded-full transition-all ${
                reposted
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-DGXblue"
              }`}
            >
              {loading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : reposted ? (
                <FiCheckCircle className="w-5 h-5 text-green-500" />
              ) : !discussion.allowRepost ? (
                <FiXCircle className="w-5 h-5 text-red-400" />
              ) : (
                <FiRepeat className="w-5 h-5" />
              )}
            </button>

            {/* Tooltip */}
            {tooltip && (
              <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-10">
                {tooltip}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          {new Date(discussion.AddOnDt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
    </div>
  );
};

export default DiscussionCard;

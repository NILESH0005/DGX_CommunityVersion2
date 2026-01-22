import React, { useState, useEffect } from "react";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import { FiEye, FiRepeat, FiLoader, FiCheckCircle } from "react-icons/fi";
import DOMPurify from "dompurify";
import Swal from "sweetalert2";

const DiscussionCard = ({
  discussion,
  openModal,
  userToken,
  navigate,
  fetchData,
  user,
  updateLikeCount,
  updateCommentCount,
}) => {
  const [likeCount, setLikeCount] = useState(discussion.likeCount || 0);
  const [userLike, setUserLike] = useState(discussion.userLike || 0);
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState("");
  const [reposted, setReposted] = useState(
    discussion.reposts?.some((r) => r.userId === user?.uniqueId) || false
  );

  const currentUserId = user?.uniqueId || user?.UserID;
  const UPLOADS_BASE_URL = import.meta.env.VITE_API_UPLOADSURL;

  const profilePic =
    discussion.ProfilePicture ||
    discussion.UserImage ||
    discussion.User?.ProfilePicture;
  const userName = discussion?.User?.Name || "Unknown User";

  useEffect(() => {
    const hasReposted =
      discussion.reposts?.some((r) => r.userId === currentUserId) || false;
    setReposted(hasReposted);
  }, [discussion.reposts, currentUserId]);

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

    setUserLike(newLikeState);
    setLikeCount(newCount);

    if (typeof updateLikeCount === "function") {
      updateLikeCount(discussion.DiscussionID, newCount, newLikeState);
    }

    try {
      const res = await fetchData(
        "discussion/like",
        "POST",
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

    if (discussion.UserID === currentUserId) {
      Swal.fire("Info", "You cannot repost your own discussion.", "info");
      return;
    }

    if (!discussion.allowRepost) {
      Swal.fire("Notice", "Reposting not allowed by the author.", "warning");
      return;
    }

    const alreadyReposted =
      discussion.reposts?.some((r) => r.userId === currentUserId) || false;

    if (alreadyReposted || reposted) {
      Swal.fire("Info", "You've already reposted this discussion.", "info");
      return;
    }

    setLoading(true);
    try {
      const body = {
        title: discussion.Title,
        content: discussion.Content,
        tags:
          Array.isArray(discussion.Tag) && discussion.Tag.length > 0
            ? discussion.Tag.join(",")
            : discussion.Tag,
        url: discussion.ResourceUrl || null,
        visibility: discussion.VisibilityValue || "public",
        bannerImagePath: discussion.DiscussionImagePath || null,
        allowRepost: discussion.allowRepost,
        repostId: discussion.DiscussionID,
      };

      const res = await fetchData("discussion/discussionpost", "POST", body, {
        "Content-Type": "application/json",
        "auth-token": userToken,
      });

      if (!res.success) throw new Error(res.message);

      discussion.reposts = [
        ...(discussion.reposts || []),
        { userId: currentUserId, name: user?.Name },
      ];

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {profilePic ? (
            <img
              src={`${UPLOADS_BASE_URL}/${profilePic}`}
              alt={userName}
              className="w-10 h-10 rounded-full border-2 border-white shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-user.png";
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-DGXgreen to-DGXblue flex items-center justify-center text-white font-semibold text-sm">
              {userName?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800">{userName}</p>
            {discussion.reposts && discussion.reposts.length > 0 && (
              <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                <FiRepeat className="w-3 h-3" />
                Reposted by{" "}
                {discussion.reposts.length > 3 ? (
                  <>
                    {discussion.reposts.slice(0, 2).map((r, i) => (
                      <span
                        key={r.userId}
                        className="font-medium text-gray-700"
                      >
                        {r.name}
                        {i < 1 ? ", " : ""}
                      </span>
                    ))}
                    and {discussion.reposts.length - 2} more
                  </>
                ) : (
                  discussion.reposts.map((r, i) => (
                    <span key={r.userId} className="font-medium text-gray-700">
                      {r.name}
                      {i < discussion.reposts.length - 1 ? ", " : ""}
                    </span>
                  ))
                )}
              </p>
            )}
          </div>
        </div>

        {discussion.reposts && discussion.reposts.length > 0 && (
          <span className="flex items-center text-xs bg-gradient-to-r from-DGXblue to-DGXgreen text-white px-3 py-1 rounded-full">
            <FiRepeat className="mr-1" size={12} />
            Repost
          </span>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-DGXgreen">
          {discussion.Title}
        </h3>

        <div className="text-gray-700 leading-relaxed ql-snow discussion-content">
          {discussion.Content?.length > 500 ? (
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
                onClick={() => openModal(discussion)}
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
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-banner.png";
            }}
          />
        </div>
      )}

      {discussion.Tag && (
        <div className="flex flex-wrap gap-2 mb-3">
          {(typeof discussion.Tag === "string"
            ? discussion.Tag.split(",").filter(Boolean)
            : Array.isArray(discussion.Tag)
            ? discussion.Tag
            : []
          ).map((tag, index) => {
            const cleaned = tag.trim();
            const formatted =
              cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

            return (
              <span
                key={index}
                className="bg-gradient-to-r from-DGXgreen to-DGXblue text-white rounded-full px-3 py-1 text-xs font-medium shadow-md"
              >
                #{formatted}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100 gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
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
          <button
            onClick={handleComment}
            className="flex items-center gap-2 text-gray-600 hover:text-DGXgreen"
          >
            <div className="p-2 rounded-full bg-gray-100 group-hover:bg-green-50">
              <FaComment className="w-5 h-5" />
            </div>
            <span className="font-medium">{discussion.commentCount || 0}</span>
          </button>
          <div className="relative flex items-center gap-2 group">
            {/* Eye icon container */}
            <div className="relative">
              <div
                className={`p-2 rounded-full transition-all ${
                  discussion.hasUserViewed
                    ? "bg-green-100 text-green-600 ring-2 ring-green-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <FiEye className="w-5 h-5" />
              </div>

              {/* Tooltip for icon */}
              {discussion.hasUserViewed && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg">
                  Viewed
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </div>

            {/* View count */}
            <div className="relative">
              <span
                className={`font-medium ${
                  discussion.hasUserViewed
                    ? "text-green-600 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {discussion.viewCount || 0}
              </span>

              {/* Tooltip for count */}
              {discussion.hasUserViewed && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg">
                  You've viewed this
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </div>
          </div>

          <div className="relative group">
            <button
              onClick={handleRepost}
              disabled={loading || reposted || !discussion.allowRepost}
              onMouseEnter={() => setTooltip(getTooltipMessage())}
              onMouseLeave={() => setTooltip("")}
              className={`p-2 rounded-full transition-all ${
                reposted
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : !discussion.allowRepost
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-DGXblue"
              }`}
            >
              {loading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : reposted ? (
                <FiCheckCircle className="w-5 h-5 text-green-500" />
              ) : !discussion.allowRepost ? (
                <img
                  src="/Nrepost.png"
                  alt="not allowed"
                  className="w-5 h-5 opacity-80 group-hover:opacity-100"
                />
              ) : (
                <FiRepeat className="w-5 h-5" />
              )}
            </button>

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

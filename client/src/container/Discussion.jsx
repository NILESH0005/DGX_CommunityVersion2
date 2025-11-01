import { useState, useEffect, useRef, useContext } from "react";
import { FaSearch, FaComment, FaWindowClose, FaTrophy } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ApiContext from "../context/ApiContext.jsx";
import DiscussionModal from "../component/discussion/DiscussionModal.jsx";
import { compressImage } from "../utils/compressImage.js";
import { AiFillLike, AiOutlineLike, AiOutlineComment } from "react-icons/ai";
import { FiEye, FiRepeat } from "react-icons/fi";
import { useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import FileUploader from "../container/FileUploader.jsx";
import { checkToxicityWithReasonAndFlag } from "../utils/toxicityDetection.js";
import CommunitySidebar from "./CommunitySidebar.jsx";
import { fetchDiscussionStats } from "../utils/discussionStats.js";

const Discussion = () => {
  const navigate = useNavigate();
  const UPLOADS_BASE_URL = import.meta.env.VITE_API_UPLOADSURL;
  const { fetchData, userToken, user } = useContext(ApiContext);
  console.log("user detailsss", user);
  const [searchScope, setSearchScope] = useState("all");
  const [demoDiscussions, setDemoDiscussions] = useState([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [discussionStats, setDiscussionStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    tags: "",
    links: "",
    privacy: "",
  });
  const [isCheckingToxicity, setIsCheckingToxicity] = useState(false); // Add this state
  const currentUserId = user?.uniqueId || user?.UserID; // Try both possible properties

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags([]);
    setLinks([]);
    setSelectedImage(null);
    setTagInput("");
    setLinkInput("");
    setPrivacy("private");
    setErrors({
      title: "",
      content: "",
      tags: "",
      links: "",
      privacy: "",
    });
  };

  const fetchAndUpdateStats = async () => {
    setStatsLoading(true);
    try {
      const stats = await fetchDiscussionStats(fetchData);
      setDiscussionStats(stats);

      // Update discussions with real-time stats
      setDemoDiscussions((prevDiscussions) =>
        prevDiscussions.map((discussion) => ({
          ...discussion,
          likeCount:
            stats[discussion.DiscussionID]?.TotalLikes ||
            discussion.likeCount ||
            0,
          commentCount:
            stats[discussion.DiscussionID]?.TotalComments ||
            discussion.commentCount ||
            0,
          viewCount:
            stats[discussion.DiscussionID]?.TotalViews ||
            discussion.viewCount ||
            0,
        }))
      );

      setFilteredDiscussions((prevDiscussions) =>
        prevDiscussions.map((discussion) => ({
          ...discussion,
          likeCount:
            stats[discussion.DiscussionID]?.TotalLikes ||
            discussion.likeCount ||
            0,
          commentCount:
            stats[discussion.DiscussionID]?.TotalComments ||
            discussion.commentCount ||
            0,
          viewCount:
            stats[discussion.DiscussionID]?.TotalViews ||
            discussion.viewCount ||
            0,
        }))
      );
    } catch (error) {
      console.error("Error updating discussion stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Discussion Stats State:", discussionStats);

    if (demoDiscussions.length > 0) {
      const highlights = getCommunityHighlights(demoDiscussions);
      const topUsersList = getTopUsersByDiscussions(demoDiscussions);

      setCommunityHighlights(highlights);
      setTopUsers(topUsersList);

      console.log("Community Highlights:", highlights);
      console.log("Top Users:", topUsersList);
      console.log("All discussions for debugging:", demoDiscussions);
    }
  }, [demoDiscussions]);

  const recordDiscussionView = async (discussionID) => {
    if (!userToken) return;

    const endpoint = "progressTrack/recordView";
    const method = "POST";
    const body = {
      ProcessName: "Discussion",
      reference: discussionID,
    };
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const result = await fetchData(endpoint, method, body, headers);
      console.log("record discussion", result);

      console.log("📊 Discussion view recorded:", result);
    } catch (error) {
      console.error("❌ Error recording discussion view:", error);
    }
  };

  const validateToxicity = async () => {
    setIsCheckingToxicity(true);

    try {
      // Clean content (strip HTML tags)
      const strippedContent = content.replace(/<[^>]*>?/gm, "").trim();

      // Check title + content together
      const combinedText = `${title} ${strippedContent}`.trim();

      const result = await checkToxicityWithReasonAndFlag(combinedText);
      console.log("Toxicity result:", result); // Debug log

      // FIX: Check if flag is 0 (toxic content) instead of 1
      // if (result.flag === 0 && result.reasons.length > 0) {
      //   await Swal.fire({
      //     icon: "warning",
      //     title: "Content Moderation Alert",
      //     html: `Your content contains potentially inappropriate material:<br/><br/>
      //       <strong>Reasons:</strong><br/>
      //       ${result.reasons.join("<br/>")}<br/><br/>
      //       Please review and modify your content before posting.`,
      //     confirmButtonText: "I understand",
      //   });
      //   return false; // Content is toxic, don't allow submission
      // }

      if (result.flag === 0 && result.reasons.length > 0) {
        // Add an extra reason string
        const reasonsWithExtra = [
          ...result.reasons,
          "Other violations may apply",
        ];

        await Swal.fire({
          icon: "warning",
          title: "Content Moderation Alert",
          html: `Your content contains potentially inappropriate material:<br/><br/>
      <strong>Reasons:</strong><br/>
      ${reasonsWithExtra.join("<br/>")}<br/><br/>
      Please review and modify your content before posting.`,
          confirmButtonText: "I understand",
        });

        return false; // Content is toxic, don't allow submission
      }
      return true; // Content is safe, allow submission
    } catch (error) {
      console.error("Toxicity validation error:", error);
      const result = await Swal.fire({
        icon: "warning",
        title: "Moderation Service Unavailable",
        text: "The content moderation service is temporarily unavailable. Please ensure your content follows community guidelines.",
        showCancelButton: true,
        confirmButtonText: "Post Anyway",
        cancelButtonText: "Cancel",
      });
      return result.isConfirmed; // Let user decide if service is down
    } finally {
      setIsCheckingToxicity(false);
    }
  };

  const handleDiscussionImageUpload = (uploadResult) => {
    const { filePath } = uploadResult;
    const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;
    const newImageUrl = `${baseUploadsUrl}/${filePath}`;

    setSelectedImage(newImageUrl);
    setBannerFilePath(filePath);
  };

  const handleAddLink = () => {
    if (linkInput.trim() === "") return;
    let formattedLink = linkInput.trim();
    if (
      !formattedLink.startsWith("http://") &&
      !formattedLink.startsWith("https://")
    ) {
      formattedLink = `https://${formattedLink}`;
    }
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (urlRegex.test(formattedLink)) {
      setLinks([...links, formattedLink]);
      setLinkInput("");
      setErrors({ ...errors, links: "" });
    } else {
      setErrors({
        ...errors,
        links: "Please enter a valid URL (e.g., https://example.com)",
      });
    }
  };

  useEffect(() => {
    console.log("me", currentUserId);

    const loadEvents = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
    };
    loadEvents();
  }, []);

  const [likeCount, setLikeCount] = useState(0);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [links, setLinks] = useState([]);
  const [allowRepost, setAllowRepost] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [privacy, setPrivacy] = useState("private");
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [communityHighlights, setCommunityHighlights] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [bannerFilePath, setBannerFilePath] = useState(""); // To save in DB
  const [userReposts, setUserReposts] = useState(new Set());

  const getCommunityHighlights = (discussions) => {
    // Use commentCount for sorting if available, otherwise fall back to comments
    const sortedDiscussions = discussions.sort(
      (a, b) =>
        (b.commentCount || b.comments || 0) -
        (a.commentCount || a.comments || 0)
    );
    return sortedDiscussions.slice(0, 5);
  };

  const BASE_URL = import.meta.env.VITE_API_UPLOADSURL;

  const getTopUsersByDiscussions = (discussions) => {
    const userMap = {};

    discussions.forEach((discussion) => {
      // Try multiple possible property names for user ID and name
      const userID =
        discussion.UserID || discussion.userId || discussion.AuthorID;
      const userName =
        discussion.UserName ||
        discussion.userName ||
        discussion.AuthorName ||
        "Anonymous";

      if (userID) {
        if (!userMap[userID]) {
          userMap[userID] = {
            userID,
            userName,
            count: 1,
          };
        } else {
          userMap[userID].count += 1;
        }
      }
    });

    const sortedUsers = Object.values(userMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    console.log("Processed top users:", sortedUsers);
    return sortedUsers;
  };

  const updateDiscussionCommentCount = (
    discussionId,
    newCommentCount,
    updatedComments = null
  ) => {
    setDemoDiscussions((prevDiscussions) =>
      prevDiscussions.map((discussion) =>
        discussion.DiscussionID === discussionId
          ? {
              ...discussion,
              commentCount: newCommentCount,
              ...(updatedComments ? { comment: updatedComments } : {}),
            }
          : discussion
      )
    );
    setFilteredDiscussions((prevDiscussions) =>
      prevDiscussions.map((discussion) =>
        discussion.DiscussionID === discussionId
          ? {
              ...discussion,
              commentCount: newCommentCount,
              ...(updatedComments ? { comment: updatedComments } : {}),
            }
          : discussion
      )
    );
  };

  const updateDiscussionLikeCount = (
    discussionId,
    newLikeCount,
    isLiked = null
  ) => {
    setDemoDiscussions((prevDiscussions) =>
      prevDiscussions.map((discussion) =>
        discussion.DiscussionID === discussionId
          ? {
              ...discussion,
              likeCount: newLikeCount,
              ...(isLiked !== null ? { userLike: isLiked } : {}),
            }
          : discussion
      )
    );

    setFilteredDiscussions((prevDiscussions) =>
      prevDiscussions.map((discussion) =>
        discussion.DiscussionID === discussionId
          ? {
              ...discussion,
              likeCount: newLikeCount,
              ...(isLiked !== null ? { userLike: isLiked } : {}),
            }
          : discussion
      )
    );
  };

  const filterDiscussions = (discussions, query, scope) => {
    if (!query.trim()) return discussions;

    const lowerCaseQuery = query.toLowerCase();

    return discussions.filter((discussion) => {
      switch (scope) {
        case "title":
          return discussion.Title.toLowerCase().includes(lowerCaseQuery);
        case "content":
          return discussion.Content.toLowerCase().includes(lowerCaseQuery);
        case "tags":
          return typeof discussion.Tag === "string"
            ? discussion.Tag.toLowerCase().includes(lowerCaseQuery)
            : discussion.Tag?.some((tag) =>
                tag.toLowerCase().includes(lowerCaseQuery)
              );
        default: // 'all'
          return (
            discussion.Title.toLowerCase().includes(lowerCaseQuery) ||
            discussion.Content.toLowerCase().includes(lowerCaseQuery) ||
            (typeof discussion.Tag === "string"
              ? discussion.Tag.toLowerCase().includes(lowerCaseQuery)
              : discussion.Tag?.some((tag) =>
                  tag.toLowerCase().includes(lowerCaseQuery)
                ))
          );
      }
    });
  };

  const handleSearchChange = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      return;
    }

    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredDiscussions(demoDiscussions);
    } else {
      const filtered = filterDiscussions(demoDiscussions, query, searchScope);
      setFilteredDiscussions(filtered);
    }
  };

  const handleScopeChange = (scope) => {
    setSearchScope(scope);
    if (searchQuery.trim()) {
      const filtered = filterDiscussions(demoDiscussions, searchQuery, scope);
      setFilteredDiscussions(filtered);
    }
  };

  const validateTitle = () => {
    if (!title.trim()) {
      setErrors((prev) => ({ ...prev, title: "Title is required" }));
      return false;
    }
    if (title.length > 100) {
      setErrors((prev) => ({
        ...prev,
        title: "Title must be less than 100 characters",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, title: "" }));
    return true;
  };

  const validateContent = () => {
    if (!content.trim() || content === "<p><br></p>") {
      setErrors((prev) => ({ ...prev, content: "Content is required" }));
      return false;
    }
    if (content.length > 5000) {
      setErrors((prev) => ({
        ...prev,
        content: "Content must be less than 5000 characters",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, content: "" }));
    return true;
  };

  const validateTags = () => {
    if (tags.length === 0) {
      setErrors((prev) => ({ ...prev, tags: "At least one tag is required" }));
      return false;
    }
    if (tags.length > 5) {
      setErrors((prev) => ({ ...prev, tags: "Maximum 5 tags allowed" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, tags: "" }));
    return true;
  };

  const validateLinks = () => {
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    const invalidLinks = links.filter((link) => !urlRegex.test(link));

    if (invalidLinks.length > 0) {
      setErrors({
        ...errors,
        links: "Please enter valid URLs (e.g., https://example.com)",
      });
      return false;
    }

    setErrors({ ...errors, links: "" });
    return true;
  };

  const validatePrivacy = () => {
    if (!privacy) {
      setErrors((prev) => ({
        ...prev,
        privacy: "Please select a privacy option",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, privacy: "" }));
    return true;
  };

  const fetchDiscussionData = async (userEmail) => {
    try {
      const body = userEmail ? { email: userEmail } : { email: null };
      const endpoint = "discussion/getdiscussion";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
      };

      setLoading(true);
      const result = await fetchData(endpoint, method, body, headers);

      if (result?.data?.updatedDiscussions) {
        const discussions = result.data.updatedDiscussions;

        // Fetch latest stats
        const latestStats = await fetchDiscussionStats(fetchData);
        setDiscussionStats(latestStats);

        // Rest of your existing code for processing discussions...
        const discussionIds = discussions.map((d) => d.DiscussionID);

        // Your existing likes fetching logic...
        // Then merge with stats
        const discussionsWithStats = discussions.map((discussion) => {
          const stats = latestStats[discussion.DiscussionID] || {};

          return {
            ...discussion,
            // Use stats data if available, otherwise fall back to existing data
            likeCount: stats.TotalLikes || discussion.likeCount || 0,
            commentCount: stats.TotalComments || discussion.commentCount || 0,
            viewCount: stats.TotalViews || discussion.viewCount || 0,

            // ... rest of your existing mapping
          };
        });

        setDemoDiscussions(discussionsWithStats);
        setFilteredDiscussions(discussionsWithStats);

        // Rest of your existing code...
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching discussions:", error);
    }
  };

  useEffect(() => {
    if (userToken && user) {
      fetchDiscussionData(user.EmailId);
    } else {
      fetchDiscussionData(null);
    }
  }, [user, userToken, fetchData]);

  const handleAddLike = async (id, currentUserLike) => {
    if (!userToken) {
      Swal.fire({
        icon: "warning",
        title: "Authentication Required",
        text: "You need to login to like posts",
        confirmButtonText: "Login",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/SignInn");
        }
      });
      return;
    }

    // Calculate new like state and count immediately for optimistic update
    const newLikeState = currentUserLike === 1 ? 0 : 1;
    const discussion = demoDiscussions.find((d) => d.DiscussionID === id);
    const currentLikes = Number(discussion?.likeCount) || 0;

    // Calculate new like count correctly
    const newLikeCount =
      newLikeState === 1 ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    // OPTIMISTIC UPDATE: Update UI immediately
    setDemoDiscussions((prevDiscussions) =>
      prevDiscussions.map((discussion) => {
        if (discussion.DiscussionID === id) {
          return {
            ...discussion,
            userLike: newLikeState,
            likeCount: newLikeCount,
          };
        }
        return discussion;
      })
    );

    setFilteredDiscussions((prevDiscussions) =>
      prevDiscussions.map((discussion) => {
        if (discussion.DiscussionID === id) {
          return {
            ...discussion,
            userLike: newLikeState,
            likeCount: newLikeCount,
          };
        }
        return discussion;
      })
    );

    const endpoint = "discussion/like";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    const body = {
      reference: id,
      likes: newLikeState,
    };

    try {
      const data = await fetchData(endpoint, method, body, headers);

      if (!data.success) {
        console.error("Error occurred while toggling like");

        // REVERT OPTIMISTIC UPDATE if API call failed
        setDemoDiscussions((prevDiscussions) =>
          prevDiscussions.map((discussion) => {
            if (discussion.DiscussionID === id) {
              return {
                ...discussion,
                userLike: currentUserLike,
                likeCount: currentLikes,
              };
            }
            return discussion;
          })
        );

        setFilteredDiscussions((prevDiscussions) =>
          prevDiscussions.map((discussion) => {
            if (discussion.DiscussionID === id) {
              return {
                ...discussion,
                userLike: currentUserLike,
                likeCount: currentLikes,
              };
            }
            return discussion;
          })
        );

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update like. Please try again.",
        });
        return;
      }

      console.log("✅ Like toggle action successful:", {
        discussionId: id,
        newLikeState,
        response: data,
      });

      // Refresh to get accurate counts from backend
      await fetchAndUpdateStats();
    } catch (error) {
      console.error("Error:", error);

      // REVERT OPTIMISTIC UPDATE on error
      setDemoDiscussions((prevDiscussions) =>
        prevDiscussions.map((discussion) => {
          if (discussion.DiscussionID === id) {
            return {
              ...discussion,
              userLike: currentUserLike,
              likeCount: currentLikes,
            };
          }
          return discussion;
        })
      );

      setFilteredDiscussions((prevDiscussions) =>
        prevDiscussions.map((discussion) => {
          if (discussion.DiscussionID === id) {
            return {
              ...discussion,
              userLike: currentUserLike,
              likeCount: currentLikes,
            };
          }
          return discussion;
        })
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update like. Please try again.",
      });
    }
  };

  const toggleNav = () => setIsNavOpen(!isNavOpen);
  const handleLike = () => setLikeCount(likeCount + 1);

  const handleComment = (discussion) => {
    openModal(discussion);
  };

  const openModal = (discussion) => {
    setSelectedDiscussion(discussion);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    resetForm();
    setModalIsOpen(false);
    setIsFormOpen(false);
  };

  const handleTagInputChange = (e) => setTagInput(e.target.value);

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      setErrors({ ...errors, tags: "" });
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    if (newTags.length === 0) {
      setErrors({ ...errors, tags: "At least one tag is required" });
    }
  };

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file) {
        const compressedFile = await compressImage(file);
        setSelectedImage(compressedFile);
      }
    }
  };

  const handleLinkInputChange = (e) => setLinkInput(e.target.value);

  const handleLinkInputKeyPress = (e) => {
    if (e.key === "Enter" && linkInput.trim() !== "") {
      e.preventDefault();
      setLinks([...links, linkInput.trim()]);
      setLinkInput("");
      setErrors({ ...errors, links: "" });
    }
  };

  const removeLink = (linkToRemove) => {
    const newLinks = links.filter((link) => link !== linkToRemove);
    setLinks(newLinks);
    if (newLinks.length === 0) {
      setErrors({ ...errors, links: "At least one link is required" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all form fields first
    const isTitleValid = validateTitle();
    const isContentValid = validateContent();
    const isTagsValid = validateTags();
    const isLinksValid = validateLinks();
    const isPrivacyValid = validatePrivacy();

    if (
      !isTitleValid ||
      !isContentValid ||
      !isTagsValid ||
      !isLinksValid ||
      !isPrivacyValid
    ) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fix all errors before submitting",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // Check for toxicity before submitting
    const isContentAppropriate = await validateToxicity();
    if (!isContentAppropriate) {
      return; // Stop submission if content is inappropriate
    }

    // If we get here, content is safe to submit
    const endpoint = "discussion/discussionpost";
    const method = "POST";
    const body = {
      title,
      content,
      tags: tags.join(","),
      url: links.join(","),
      visibility: privacy,
      bannerImagePath: bannerFilePath,
      allowRepost,
    };
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    setLoading(true);

    try {
      const data = await fetchData(endpoint, method, body, headers);

      if (!data.success) {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error in posting discussion, please try again",
          confirmButtonColor: "#3085d6",
        });
      } else if (data.success) {
        setLoading(false);

        await Swal.fire({
          title: "Success!",
          text:
            privacy === "private"
              ? "Your private discussion has been posted successfully!"
              : "Your discussion has been posted successfully!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6",
          customClass: {
            popup: "animated bounceIn",
          },
        });

        // Refresh the discussions
        if (userToken && user) {
          await fetchDiscussionData(user.EmailId);
        } else {
          await fetchDiscussionData(null);
        }

        resetForm();
        setIsFormOpen(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Submission error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong, please try again",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleRepost = async (discussion) => {
    if (!userToken) {
      Swal.fire({
        icon: "error",
        title: "Login Required",
        text: "Please login to repost this discussion",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // Add to userReposts immediately for better UX
    setUserReposts((prev) => new Set([...prev, discussion.DiscussionID]));

    const endpoint = "discussion/discussionpost";
    const method = "POST";
    const body = {
      title: discussion.Title,
      content: discussion.Content,
      tags: discussion.Tag
        ? Array.isArray(discussion.Tag)
          ? discussion.Tag.join(",")
          : discussion.Tag
        : "",
      url: discussion.ResourceUrl
        ? Array.isArray(discussion.ResourceUrl)
          ? discussion.ResourceUrl.join(",")
          : discussion.ResourceUrl
        : "",
      visibility: discussion.VisibilityValue || "public",
      bannerImagePath: discussion.DiscussionImagePath || null,
      allowRepost: discussion.allowRepost,
      repostId: discussion.DiscussionID, // This should be the original post ID
    };

    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    setLoading(true);

    try {
      const data = await fetchData(endpoint, method, body, headers);

      if (!data.success) {
        setLoading(false);
        // Remove from userReposts if repost failed
        setUserReposts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(discussion.DiscussionID);
          return newSet;
        });
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            data.message || "Error in reposting discussion, please try again",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      setLoading(false);
      await Swal.fire({
        title: "Success!",
        text: "Discussion reposted successfully!",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        customClass: { popup: "animated bounceIn" },
      });

      // Refresh discussions to get the updated data
      await fetchDiscussionData(user?.EmailId || null);
    } catch (error) {
      setLoading(false);
      // Remove from userReposts if repost failed
      setUserReposts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(discussion.DiscussionID);
        return newSet;
      });
      console.error("Repost error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong, please try again",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const canUserRepost = (discussion) => {
    console.log("Checking repost permissions:", {
      DiscussionID: discussion.DiscussionID,
      UserID: discussion.UserID,
      currentUserId: currentUserId,
      RepostID: discussion.RepostID,
      RepostUserID: discussion.RepostUserID,
      allowRepost: discussion.allowRepost,
      originalPost: discussion.originalPost,
      alreadyReposted: userReposts.has(discussion.DiscussionID),
    });

    // Case 1: If this is directly my own post (I'm the author)
    if (discussion.UserID === currentUserId) {
      console.log("Cannot repost: This is my own post");
      return false;
    }

    // Case 2: If this is a repost of my original post
    if (
      discussion.RepostUserID === currentUserId ||
      (discussion.originalPost &&
        discussion.originalPost.OriginalUserID === currentUserId)
    ) {
      console.log("Cannot repost: This is a repost of my original content");
      return false;
    }

    // Case 3: If repost is not allowed by the original author
    if (!discussion.allowRepost) {
      console.log("Cannot repost: Repost not allowed by author");
      return false;
    }

    // Case 4: If I've already reposted this discussion
    if (userReposts.has(discussion.DiscussionID)) {
      console.log("Cannot repost: Already reposted this discussion");
      return false;
    }

    console.log("Can repost: All conditions met");
    return true;
  };

  const getRepostMessage = (discussion) => {
    // If it's directly my post
    if (discussion.UserID === currentUserId) {
      return "Your Post";
    }

    // If it's a repost of my original content
    if (
      discussion.RepostUserID === currentUserId ||
      (discussion.originalPost &&
        discussion.originalPost.OriginalUserID === currentUserId)
    ) {
      return "Originally Your Post";
    }

    // If repost is not allowed
    if (!discussion.allowRepost) {
      return "Repost Not Allowed";
    }

    // If already reposted
    if (userReposts.has(discussion.DiscussionID)) {
      return "Already Reposted";
    }

    return null; // No message means repost is allowed
  };

  const handleModalClose = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <ToastContainer
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />

      {modalIsOpen && selectedDiscussion && (
        <DiscussionModal
          isOpen={modalIsOpen}
          onRequestClose={handleModalClose}
          discussion={selectedDiscussion}
          setDiscussions={setDiscussions}
          discussions={discussions}
          setDemoDiscussion={setDemoDiscussions}
          updateCommentCount={updateDiscussionCommentCount}
          updateLikeCount={updateDiscussionLikeCount} // Add this new prop
        />
      )}
      <div className="flex-1 flex flex-col lg:flex-row w-full mx-auto bg-white rounded-md border border-gray-200 shadow-md mt-4 mb-4 p-4 overflow-hidden">
        <CommunitySidebar
          isLoading={isLoading}
          communityHighlights={communityHighlights}
          topUsers={topUsers}
          openModal={openModal}
          discussions={demoDiscussions}
          updateDiscussionLikeCount={updateDiscussionLikeCount}
          updateDiscussionCommentCount={updateDiscussionCommentCount}
          discussionStats={discussionStats}
          statsLoading={statsLoading}
          refreshStats={fetchAndUpdateStats}
        />

        <section className="w-full px-4 flex flex-col overflow-y-scroll h-[80vh]">
          <div className="sticky top-0 bg-white z-20 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-DGXgreen to-DGXblue bg-clip-text text-transparent">
                {selectedSection.charAt(0).toUpperCase() +
                  selectedSection.slice(1)}{" "}
                Discussions
              </h2>

              <div className="sm:order-4 flex items-center w-full sm:w-auto mt-0 sm:mt-0 sm:ml-4">
                <div className="relative w-full sm:w-64 mb-2">
                  <input
                    type="text"
                    className="w-full py-2 pl-10 pr-4 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-800 focus:border-DGXgreen focus:ring-DGXgreen"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                    <select
                      value={searchScope}
                      onChange={(e) => handleScopeChange(e.target.value)}
                      className="text-xs border rounded p-1 bg-white"
                    >
                      <option value="all">All</option>
                      <option value="title">Title</option>
                      <option value="content">Content</option>
                      <option value="tags">Tags</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="flex items-center gap-2 bg-gradient-to-r from-DGXgreen to-DGXblue text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <span className="text-lg">+</span>
                New Discussion
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-8">
            {/* New Discussion Form */}
            {isFormOpen && (
              <div className="animate-slide-down">
                <div className="bg-white border-2 border-DGXgreen/20 rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-DGXgreen to-DGXblue p-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Start a New Discussion
                    </h3>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title Field */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <span>Discussion Title</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="title"
                          type="text"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-DGXgreen focus:border-transparent transition-all duration-300 ${
                            errors.title
                              ? "border-red-500 ring-2 ring-red-200"
                              : "border-gray-300"
                          }`}
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                            if (errors.title) validateTitle();
                          }}
                          onBlur={validateTitle}
                          required
                          maxLength={100}
                          placeholder="What would you like to discuss?"
                        />
                        <div className="absolute right-3 top-3">
                          <span
                            className={`text-xs font-medium ${
                              title.length > 80
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {title.length}/100
                          </span>
                        </div>
                      </div>
                      {errors.title && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Content Field */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <span>Discussion Content</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div
                        className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                          errors.content
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-300"
                        }`}
                      >
                        <ReactQuill
                          id="content"
                          theme="snow"
                          value={content}
                          onChange={(value) => {
                            setContent(value);
                            if (errors.content) validateContent();
                          }}
                          onBlur={validateContent}
                          className="rounded-lg"
                          modules={{
                            toolbar: [
                              [{ header: [1, 2, 3, false] }],
                              ["bold", "italic", "underline", "strike"],
                              ["blockquote", "code-block"],
                              [{ list: "ordered" }, { list: "bullet" }],
                              ["link", "formula"],
                              ["clean"],
                            ],
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        {errors.content && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors.content}
                          </p>
                        )}
                        <span
                          className={`text-xs font-medium ml-auto ${
                            content.replace(/<[^>]*>/g, "").length > 4500
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          {content.replace(/<[^>]*>/g, "").length}/5000
                          characters
                        </span>
                      </div>
                    </div>

                    {/* Tags Field */}
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <span>Tags</span>
                        <span className="text-red-500 ml-1">*</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({5 - tags.length} remaining)
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-DGXgreen focus:border-transparent transition-all duration-300 ${
                              errors.tags
                                ? "border-red-500 ring-2 ring-red-200"
                                : "border-gray-300"
                            }`}
                            value={tagInput}
                            onChange={handleTagInputChange}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && tagInput.trim() !== "") {
                                e.preventDefault();
                                if (tags.length < 5) {
                                  setTags([...tags, tagInput.trim()]);
                                  setTagInput("");
                                  setErrors({ ...errors, tags: "" });
                                } else {
                                  setErrors({
                                    ...errors,
                                    tags: "Maximum 5 tags allowed",
                                  });
                                }
                              }
                            }}
                            onBlur={validateTags}
                            placeholder="Type a tag and press Enter..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (tagInput.trim() !== "" && tags.length < 5) {
                              setTags([...tags, tagInput.trim()]);
                              setTagInput("");
                              setErrors({ ...errors, tags: "" });
                            } else if (tags.length >= 5) {
                              setErrors({
                                ...errors,
                                tags: "Maximum 5 tags allowed",
                              });
                            }
                          }}
                          className="bg-DGXblue text-white px-6 py-3 rounded-xl hover:bg-DGXgreen transition-colors duration-300 font-semibold"
                        >
                          Add
                        </button>
                      </div>

                      {errors.tags && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.tags}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gradient-to-r from-DGXgreen to-DGXblue text-white rounded-full px-4 py-2 shadow-lg transform hover:scale-105 transition-transform duration-200"
                          >
                            <span className="text-sm font-medium">#{tag}</span>
                            <button
                              type="button"
                              onClick={() => {
                                removeTag(tag);
                                validateTags();
                              }}
                              className="ml-2 text-white hover:text-red-200 transition-colors duration-200 rounded-full w-5 h-5 flex items-center justify-center hover:bg-white/20"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Links Field */}
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <span>Reference Links</span>
                        {/* <span className="text-red-500 ml-1">*</span> */}
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="url"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent transition-all duration-300 ${
                              errors.links
                                ? "border-red-500 ring-2 ring-red-200"
                                : "border-gray-300"
                            }`}
                            value={linkInput}
                            onChange={handleLinkInputChange}
                            onKeyPress={(e) => {
                              if (
                                e.key === "Enter" &&
                                linkInput.trim() !== ""
                              ) {
                                e.preventDefault();
                                const urlRegex =
                                  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                                if (urlRegex.test(linkInput.trim())) {
                                  setLinks([...links, linkInput.trim()]);
                                  setLinkInput("");
                                  setErrors({ ...errors, links: "" });
                                } else {
                                  setErrors({
                                    ...errors,
                                    links: "Please enter a valid URL",
                                  });
                                }
                              }
                            }}
                            onBlur={validateLinks}
                            placeholder="https://example.com (Press Enter to add)"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddLink}
                          className="bg-DGXblue text-white px-6 py-3 rounded-xl hover:bg-DGXgreen transition-colors duration-300 font-semibold"
                        >
                          Add
                        </button>
                      </div>

                      {errors.links && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.links}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {links.map((link, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gradient-to-r from-DGXblue to-DGXgreen text-white rounded-xl px-4 py-2 shadow-lg transform hover:scale-105 transition-transform duration-200 group"
                          >
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:underline truncate max-w-xs text-sm font-medium flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
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
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              {link.replace(/^https?:\/\//, "")}
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                removeLink(link);
                                validateLinks();
                              }}
                              className="ml-2 text-white hover:text-red-200 transition-colors duration-200 rounded-full w-5 h-5 flex items-center justify-center hover:bg-white/20"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Repost Permission */}
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <span>Allow Reposting</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              allowRepost === true
                                ? "border-DGXgreen bg-DGXgreen"
                                : "border-gray-300 group-hover:border-DGXgreen"
                            }`}
                          >
                            {allowRepost === true && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <input
                            type="radio"
                            name="allowRepost"
                            value="true"
                            checked={allowRepost === true}
                            onChange={() => setAllowRepost(true)}
                            className="hidden"
                          />
                          <span className="text-gray-700 font-medium">
                            Yes, others can repost
                          </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              allowRepost === false
                                ? "border-DGXgreen bg-DGXgreen"
                                : "border-gray-300 group-hover:border-DGXgreen"
                            }`}
                          >
                            {allowRepost === false && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <input
                            type="radio"
                            name="allowRepost"
                            value="false"
                            checked={allowRepost === false}
                            onChange={() => setAllowRepost(false)}
                            className="hidden"
                          />
                          <span className="text-gray-700 font-medium">
                            No, keep it original
                          </span>
                        </label>
                      </div>
                      {errors.allowRepost && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.allowRepost}
                        </p>
                      )}
                    </div>

                    {/* Banner Image Upload */}
                    <div className="space-y-3">
                      <FileUploader
                        moduleName="Discussion"
                        folderName="discussion-banners"
                        onUploadComplete={handleDiscussionImageUpload}
                        accept="image/*"
                        maxSize={200 * 1024}
                        label="Upload Banner Image"
                      />
                      {selectedImage && (
                        <div className="mt-4 p-4 border-2 border-dashed border-DGXgreen/30 rounded-xl bg-green-50">
                          <p className="text-sm font-semibold text-DGXgreen mb-2">
                            Banner Preview
                          </p>
                          <div className="flex items-center gap-4">
                            <img
                              src={selectedImage}
                              alt="Banner Preview"
                              className="h-20 w-32 object-cover rounded-lg shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImage(null);
                                setBannerFilePath("");
                              }}
                              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors duration-200"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Remove Image
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Privacy Setting */}
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <span>Privacy Setting</span>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        value={privacy}
                        onChange={(e) => {
                          setPrivacy(e.target.value);
                          setErrors({ ...errors, privacy: "" });
                        }}
                        onBlur={validatePrivacy}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent transition-all duration-300 ${
                          errors.privacy
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select privacy setting</option>
                        <option value="private">
                          🔒 Private - Only visible to you
                        </option>
                        <option value="public">
                          🌍 Public - Visible to everyone
                        </option>
                      </select>
                      {errors.privacy && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.privacy}
                        </p>
                      )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold transform hover:scale-105"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-DGXgreen to-DGXblue text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={
                          loading ||
                          isCheckingToxicity ||
                          Object.values(errors).some((error) => error)
                        }
                      >
                        {isCheckingToxicity ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Checking content...
                          </span>
                        ) : loading ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Creating Discussion...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            Publish Discussion
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <div className="space-y-6">
              <div className="space-y-6">
                {filteredDiscussions.map((discussion, i) => (
                  <div
                    key={i}
                    className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer focus-within:z-10 hover:z-10 relative overflow-hidden"
                    onClick={async (e) => {
                      if (
                        !e.target.closest("a") &&
                        !e.target.closest("button") &&
                        !e.target.classList.contains("text-blue-700")
                      ) {
                        openModal(discussion);
                        await recordDiscussionView(discussion.DiscussionID);
                      }
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {discussion.User?.ProfilePicture ? (
                            <img
                              src={discussion.User.ProfilePicture}
                              alt={discussion.UserName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-DGXgreen to-DGXblue flex items-center justify-center text-white font-semibold text-sm shadow-md">
                              {discussion.UserName?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {discussion.UserName}
                            </p>
                            {/* Show original creator for reposts */}
                            {discussion.RepostID && discussion.originalPost && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <FiRepeat className="w-3 h-3" />
                                Reposted from{" "}
                                {discussion.originalPost.OriginalUserName}
                              </p>
                            )}
                          </div>
                        </div>
                        {discussion.RepostID && (
                          <span className="flex items-center text-xs bg-gradient-to-r from-DGXblue to-DGXgreen text-white px-3 py-1 rounded-full shadow-md">
                            <FiRepeat className="mr-1" size={12} />
                            Repost
                          </span>
                        )}
                      </div>
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-DGXgreen transition-colors duration-300">
                          {discussion.Title}
                        </h3>
                        <div className="text-gray-700 leading-relaxed">
                          {discussion.Content.length > 500 ? (
                            <>
                              <div
                                className="ql-snow"
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    discussion.Content.slice(0, 500) + "..."
                                  ),
                                }}
                              />
                              <span
                                className="text-DGXblue cursor-pointer font-semibold hover:underline inline-flex items-center gap-1 mt-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal(discussion);
                                }}
                              >
                                Continue reading
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
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </span>
                            </>
                          ) : (
                            <div
                              className="ql-snow discussion-content"
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(discussion.Content),
                              }}
                            />
                          )}
                        </div>
                      </div>
                      {(discussion.DiscussionImagePath || discussion.Image) && (
                        <div
                          className="mb-4 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 w-full max-w-screen-lg mx-auto"
                          onClick={() => openModal(discussion)}
                          style={{ height: "auto", maxHeight: "80vh" }}
                        >
                          <img
                            src={
                              `${UPLOADS_BASE_URL}/${discussion.DiscussionImagePath}` ||
                              discussion.Image
                            }
                            alt="Discussion"
                            className="w-full h-auto max-h-[80vh] object-contain hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                            }}
                          />
                        </div>
                      )}

                      {/* Tags */}
                      {discussion.Tag && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(typeof discussion.Tag === "string"
                            ? discussion.Tag.split(",").filter((tag) => tag)
                            : Array.isArray(discussion.Tag)
                            ? discussion.Tag
                            : []
                          ).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="bg-gradient-to-r from-DGXgreen to-DGXblue text-white rounded-full px-3 py-1 text-xs font-medium shadow-md hover:shadow-lg transition-shadow duration-300"
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Resource Links */}
                      {discussion.ResourceUrl && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(typeof discussion.ResourceUrl === "string"
                            ? discussion.ResourceUrl.split(",")
                            : Array.isArray(discussion.ResourceUrl)
                            ? discussion.ResourceUrl
                            : []
                          ).map((link, linkIndex) => (
                            <a
                              key={linkIndex}
                              href={link}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 bg-blue-50 text-DGXblue rounded-lg px-3 py-1 text-xs font-medium hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              Resource {linkIndex + 1}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-6">
                          {/* Like Button */}
                          <button
                            className="flex items-center gap-2 transition-all duration-300 group relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddLike(
                                discussion.DiscussionID,
                                discussion.userLike
                              );
                            }}
                          >
                            <div
                              className={`p-2 rounded-full transition-all duration-300 transform group-hover:scale-110 ${
                                discussion.userLike === 1
                                  ? "bg-gradient-to-r from-DGXblue to-blue-400 text-white shadow-lg"
                                  : "bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-DGXblue"
                              }`}
                            >
                              {discussion.userLike === 1 ? (
                                <AiFillLike className="w-5 h-5" />
                              ) : (
                                <AiOutlineLike className="w-5 h-5" />
                              )}
                            </div>

                            <span
                              className={`font-semibold transition-all duration-300 ${
                                discussion.userLike === 1
                                  ? "text-DGXblue"
                                  : "text-gray-600 group-hover:text-DGXblue"
                              }`}
                            >
                              {statsLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-DGXblue rounded-full animate-spin"></div>
                              ) : (
                                discussion.likeCount || 0
                              )}
                            </span>
                          </button>

                          <button
                            className="flex items-center gap-2 text-gray-600 hover:text-DGXgreen transition-colors duration-200 group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComment(discussion);
                            }}
                          >
                            <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors duration-200">
                              <FaComment className="w-5 h-5" />
                            </div>
                            <span className="font-medium">
                              {statsLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-DGXgreen rounded-full animate-spin"></div>
                              ) : (
                                `${discussion.commentCount || 0} ${
                                  discussion.commentCount !== 1
                                    ? "Comments"
                                    : "Comment"
                                }`
                              )}
                            </span>
                          </button>

                          <div className="flex items-center gap-2 text-gray-500">
                            <div className="p-2 rounded-full bg-gray-100">
                              <FiEye className="w-5 h-5" />
                            </div>
                            <span className="font-medium">
                              {statsLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                              ) : (
                                `${discussion.viewCount || 0} ${
                                  discussion.viewCount !== 1 ? "Views" : "View"
                                }`
                              )}
                            </span>
                          </div>
                          {/* Repost Button */}
                          {getRepostMessage(discussion) ? (
                            <span className="flex items-center gap-2 text-gray-400">
                              <div className="p-2 rounded-full">
                                <FiRepeat className="w-5 h-5" />
                              </div>
                              <span className="font-medium">
                                {getRepostMessage(discussion)}
                              </span>
                            </span>
                          ) : (
                            <button
                              className="flex items-center gap-2 text-gray-600 hover:text-DGXblue transition-colors duration-200 group"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRepost(discussion);
                              }}
                              disabled={
                                loading &&
                                userReposts.has(discussion.DiscussionID)
                              }
                            >
                              <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors duration-200">
                                <FiRepeat className="w-5 h-5" />
                              </div>
                              <span className="font-medium">
                                {loading &&
                                userReposts.has(discussion.DiscussionID)
                                  ? "Reposting..."
                                  : "Repost"}
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="text-xs text-gray-500">
                          {new Date(discussion.AddOnDt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {!isLoading &&
                filteredDiscussions.length === 0 &&
                searchQuery && (
                  <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg mb-2">
                      No discussions found matching your search.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setFilteredDiscussions(demoDiscussions);
                      }}
                      className="text-DGXgreen hover:text-DGXblue font-semibold transition-colors duration-200 inline-flex items-center gap-1"
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Clear search and show all discussions
                    </button>
                  </div>
                )}
            </div>
          </div>
        </section>

        <div className="lg:hidden mt-8">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-DGXblue text-white py-2 px-4 rounded-lg w-full"
          >
            {isDropdownOpen ? "Hide" : "Show"} Community Highlights and Top
            Contributors
          </button>

          {isDropdownOpen && (
            <aside className="mt-4 px-4">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  Community Highlightsss
                </h2>
                <div className="space-y-4">
                  {communityHighlights.map((topic) => {
                    // Format date
                    const formattedDate = new Date(
                      topic.Date
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });

                    return (
                      <div
                        key={topic.DiscussionID}
                        className="rounded-lg shadow-lg p-4 border border-DGXblack hover:bg-DGXgreen/50 transition-transform transform hover:scale-105 hover:shadow-xl"
                        onClick={() => openModal(topic)}
                      >
                        <h3 className="text-xl font-semibold">
                          <a
                            href={topic.link}
                            className="text-DGXblack hover:underline"
                          >
                            {topic.Title}
                          </a>
                        </h3>

                        <div className="text-gray-500 text-sm mt-1">
                          {formattedDate}
                        </div>

                        <div className="text-DGXblack mt-2">
                          {topic.Content.length > 150 ? (
                            <>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: topic.Content.substring(0, 147),
                                }}
                              />
                              <span
                                className="text-blue-700 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal(topic);
                                }}
                              >
                                ...see more
                              </span>
                            </>
                          ) : (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: topic.Content,
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Top Contributors</h2>
                <div className="space-y-2">
                  {topUsers.map((user, index) => (
                    <div
                      key={user.userID}
                      className="flex justify-between items-center bg-DGXblue border border-gray-200 rounded-lg shadow-sm p-3 hover:shadow-xl hover:scale-105 transition-colors"
                    >
                      <span className="font-medium text-white">
                        {user.userName}
                      </span>
                      <span className="text-white">{user.count} Post(s)</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discussion;

import { useState, useEffect, useRef, useContext } from "react";
import { FaSearch, FaComment, FaWindowClose, FaTrophy } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ApiContext from "../context/ApiContext.jsx";
import DiscussionModal from "../component/discussion/DiscussionModal.jsx";
import { compressImage } from "../utils/compressImage.js";
import { AiFillLike, AiOutlineLike, AiOutlineComment } from "react-icons/ai";
import { useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import FileUploader from "../container/FileUploader.jsx";

const Discussion = () => {
  const navigate = useNavigate();
  const { fetchData, userToken, user } = useContext(ApiContext);
  console.log("user detailsss", user);
  const [searchScope, setSearchScope] = useState("all");
  const [demoDiscussions, setDemoDiscussions] = useState([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    tags: "",
    links: "",
    privacy: "",
  });

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
    const loadEvents = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
    };
    loadEvents();
  }, []);

  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
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
  const [linkInput, setLinkInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [privacy, setPrivacy] = useState("private");
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [communityHighlights, setCommunityHighlights] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [bannerFilePath, setBannerFilePath] = useState(""); // To save in DB

  const getCommunityHighlights = (discussions) => {
    const sortedDiscussions = discussions.sort(
      (a, b) => (b.comments || 0) - (a.comments || 0)
    );
    return sortedDiscussions.slice(0, 5);
  };

  const getTopUsersByDiscussions = (discussions) => {
    const userMap = {};

    discussions.forEach((discussion) => {
      const userID = discussion.UserID;
      const userName = discussion.UserName || "Anonymous"; // Changed from AuthAdd to UserName

      if (!userMap[userID]) {
        userMap[userID] = {
          userID,
          userName,
          count: 1,
        };
      } else {
        userMap[userID].count += 1;
      }
    });

    const sortedUsers = Object.values(userMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

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

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      title: "",
      content: "",
      tags: "",
      links: "",
      privacy: "",
    };

    if (!title.trim()) {
      newErrors.title = "Title is required";
      valid = false;
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
      valid = false;
    }

    if (!content.trim() || content === "<p><br></p>") {
      newErrors.content = "Content is required";
      valid = false;
    } else if (content.length > 5000) {
      newErrors.content = "Content must be less than 5000 characters";
      valid = false;
    }

    if (tags.length === 0) {
      newErrors.tags = "At least one tag is required";
      valid = false;
    } else if (tags.length > 5) {
      newErrors.tags = "Maximum 5 tags allowed";
      valid = false;
    }

    // if (links.length === 0) {
    //   newErrors.links = "At least one link is required";
    //   valid = false;
    // } else {
    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const invalidLinks = links.filter((link) => !urlRegex.test(link));
    if (invalidLinks.length > 0) {
      newErrors.links = "Please enter valid URLs (e.g., https://example.com)";
      valid = false;
    }
    // }

    if (!privacy) {
      newErrors.privacy = "Please select a privacy option";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
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

  useEffect(() => {
    const fetchDiscussionData = async (userEmail) => {
      try {
        const body = userEmail ? { user: userEmail } : { user: null };
        const endpoint = "discussion/getdiscussion";
        const method = "POST";
        const headers = {
          "Content-Type": "application/json",
        };

        setLoading(true);
        const result = await fetchData(endpoint, method, body, headers);

        if (result?.data?.updatedDiscussions) {
          const discussionsWithComments = result.data.updatedDiscussions.map(
            (discussion) => ({
              ...discussion,
              userLike: discussion.userLike || 0,
              likeCount: discussion.likeCount || 0,
              commentCount: discussion.commentCount || 0, // Use commentCount from backend
            })
          );

          setDemoDiscussions(discussionsWithComments);
          setFilteredDiscussions(discussionsWithComments);

          // Calculate highlights based on comment count
          const highlights = getCommunityHighlights(discussionsWithComments);
          setCommunityHighlights(highlights);

          // Calculate top users
          const topUsers = getTopUsersByDiscussions(discussionsWithComments);
          setTopUsers(topUsers);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching discussions:", error);
      }
    };

    if (userToken && user) {
      fetchDiscussionData(user.EmailId);
    } else {
      fetchDiscussionData(null);
    }
  }, [user, userToken, fetchData]);

  const searchDiscussion = useCallback(
    async (searchTerm, userId) => {
      try {
        const body = { searchTerm, userId };
        const endpoint = "discussion/searchdiscussion";
        const method = "POST";
        const headers = {
          "Content-Type": "application/json",
        };

        setLoading(true);
        const result = await fetchData(endpoint, method, body, headers);

        if (result && result.data && result.data.updatedDiscussions) {
          setDemoDiscussions(result.data.updatedDiscussions);
          setFilteredDiscussions(result.data.updatedDiscussions);
        } else {
          if (result && result.message) {
            Swal.fire({
              icon: "error",
              title: "No discussions found",
              text: result.message,
            });
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (error.message && !error.message.includes("Invalid data format")) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Something went wrong: ${error.message}`,
          });
        }
      }
    },
    [fetchData]
  );

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

    // Optimistic update - toggle like state
    const newLikeState = currentUserLike === 1 ? 0 : 1;
    const likeIncrement = newLikeState === 1 ? 1 : -1;

    // Update demoDiscussions
    setDemoDiscussions((prevDiscussions) =>
      prevDiscussions.map((discussion) => {
        if (discussion.DiscussionID === id) {
          return {
            ...discussion,
            userLike: newLikeState,
            likeCount: Math.max(0, (discussion.likeCount || 0) + likeIncrement),
          };
        }
        return discussion;
      })
    );

    // Update filteredDiscussions
    setFilteredDiscussions((prevDiscussions) =>
      prevDiscussions.map((discussion) => {
        if (discussion.DiscussionID === id) {
          return {
            ...discussion,
            userLike: newLikeState,
            likeCount: Math.max(0, (discussion.likeCount || 0) + likeIncrement),
          };
        }
        return discussion;
      })
    );

    // Update selectedDiscussion if it's the one being liked
    if (selectedDiscussion && selectedDiscussion.DiscussionID === id) {
      setSelectedDiscussion((prev) => ({
        ...prev,
        userLike: newLikeState,
        likeCount: Math.max(0, (prev.likeCount || 0) + likeIncrement),
      }));
    }

    // API call
    const endpoint = "discussion/discussionpost";
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
        // Revert if API call fails
        setDemoDiscussions((prevDiscussions) =>
          prevDiscussions.map((discussion) => {
            if (discussion.DiscussionID === id) {
              return {
                ...discussion,
                userLike: currentUserLike,
                likeCount: discussion.likeCount || 0,
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
                likeCount: discussion.likeCount || 0,
              };
            }
            return discussion;
          })
        );

        if (selectedDiscussion && selectedDiscussion.DiscussionID === id) {
          setSelectedDiscussion((prev) => ({
            ...prev,
            userLike: currentUserLike,
            likeCount: prev.likeCount || 0,
          }));
        }

        console.error("Error occurred while liking the post");
        return;
      }
    } catch (error) {
      // Revert on error
      setDemoDiscussions((prevDiscussions) =>
        prevDiscussions.map((discussion) => {
          if (discussion.DiscussionID === id) {
            return {
              ...discussion,
              userLike: currentUserLike,
              likeCount: discussion.likeCount || 0,
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
              likeCount: discussion.likeCount || 0,
            };
          }
          return discussion;
        })
      );

      if (selectedDiscussion && selectedDiscussion.DiscussionID === id) {
        setSelectedDiscussion((prev) => ({
          ...prev,
          userLike: currentUserLike,
          likeCount: prev.likeCount || 0,
        }));
      }

      console.error("Error:", error);
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
    setCommentCount((prevCount) => prevCount + 1);
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

    const endpoint = "discussion/discussionpost";
    const method = "POST";
    const body = {
      title,
      content,
      tags: tags.join(","),
      url: links.join(","),
      visibility: privacy,
      bannerImagePath: bannerFilePath, // <-- Add this
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
        await fetchDiscussionData(user?.EmailId || null);
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
        window.location.reload();

        resetForm();
        setIsFormOpen(false);

        if (privacy === "public") {
          const newDiscussion = {
            DiscussionID: data.postID,
            Title: title,
            Content: content,
            Tag: tags,
            ResourceUrl: links,
            Image: selectedImage,
            Visibility: privacy,
            comment: [],
          };
          setDemoDiscussions([newDiscussion, ...demoDiscussions]);
          setFilteredDiscussions([newDiscussion, ...filteredDiscussions]);
        }
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

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await searchDiscussion(searchQuery, user?.EmailId || null);
    }
  };

  const handleModalClose = () => {
    setModalIsOpen(false);
  };

  return (
    <div>
      <ToastContainer
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />

      <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-DGXblue text-sm py-4">
        <nav
          className="max-w-[85rem] w-full mx-auto px-4 flex flex-wrap basis-full items-center justify-between "
          aria-label="Global"
        >
          <div className="sm:order-4 flex items-center w-full sm:w-auto mt-0 sm:mt-0 sm:ml-4 ">
            {isLoading ? (
              <Skeleton
                height="2.16rem"
                width={250}
                className="w-full sm:w-1/2 bg-gray-500 rounded-lg mb-1"
              />
            ) : (
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
            )}
          </div>

          <div
            id="navbar-alignment"
            className={`${
              isNavOpen ? "block" : "hidden"
            } hs-collapse overflow-hidden transition-all duration-300 basis-full grow sm:grow-0 sm:basis-auto sm:block sm:order-2`}
          ></div>
          {isLoading ? (
            <Skeleton
              height={35}
              width={150}
              className="w-full xs:w-full sm:w-64 bg-lime-500 rounded-lg mb-1 sm:mt-4"
            />
          ) : (
            <button
              type="button"
              className="py-2 xs:w-full px-3 gap-x-2 text-sm font-bold rounded-lg bg-DGXgreen text-DGXwhite shadow-sm hover:bg-DGXblue hover:border-DGXgreen border border-DGXblue disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => {
                if (!userToken) {
                  Swal.fire({
                    icon: "warning",
                    title: "Authentication Required",
                    text: "You need to login to start a discussion",
                    confirmButtonText: "Login",
                    showCancelButton: true,
                    cancelButtonText: "Cancel",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      navigate("/SignInn");
                    }
                  });
                } else {
                  resetForm();
                  setIsFormOpen(true);
                }
              }}
            >
              Start a New Topic +
            </button>
          )}
        </nav>
      </header>
      {modalIsOpen && selectedDiscussion && (
        <DiscussionModal
          isOpen={modalIsOpen}
          onRequestClose={handleModalClose}
          discussion={selectedDiscussion}
          setDiscussions={setDiscussions}
          discussions={discussions}
          setDemoDiscussion={setDemoDiscussions}
          updateCommentCount={updateDiscussionCommentCount} // Add this line
        />
      )}
      <div className="flex flex-col lg:flex-row w-full mx-auto bg-white rounded-md border border-gray-200 shadow-md mt-4 mb-4 p-4">
        <aside className="hidden lg:block lg:w-1/4 px-4">
          <div className="mb-8">
            <h2 className="sm:text-sm md:text-base lg:text-lg font-bold mb-4 py-2">
              <AiOutlineComment className="inline-block mr-2" />
              Community Highlights
            </h2>

            <div className="space-y-4">
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      height="8.5rem"
                      className="w-full bg-gray-300 rounded-lg mb-4"
                    />
                  ))
                : communityHighlights.map((topic) => (
                    <div
                      key={topic.DiscussionID}
                      className="rounded-lg shadow-lg p-4 border hover:bg-DGXgreen/50 border-DGXblack transition-transform transform hover:scale-105 hover:shadow-xl"
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
                            dangerouslySetInnerHTML={{ __html: topic.Content }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          <div>
            <h2 className="sm:text-sm md:text-base lg:text-lg font-bold mb-4">
              <FaTrophy className="inline-block mr-2" />
              Top Contributors
            </h2>
            <div className="space-y-2">
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      height="2.5rem"
                      className="w-full bg-gray-300 rounded-lg mb-4"
                    />
                  ))
                : topUsers.map((user, index) => (
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

        <section className="w-full lg:w-2/3 px-4">
          <h2 className="sm:text-sm md:text-base lg:text-lg font-bold mb-4">
            {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}{" "}
            Discussions
          </h2>
          <div className="flex flex-col space-y-4">
            {isFormOpen && (
              <form
                onSubmit={handleSubmit}
                className="border border-gray-300 rounded-lg p-4"
              >
                <h3 className="text-lg font-bold mb-4">
                  Start a New Discussion
                </h3>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 font-bold mb-2"
                    htmlFor="title"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.title ? "border-red-500" : ""
                    }`}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) validateTitle();
                    }}
                    onBlur={validateTitle}
                    required
                    maxLength={100}
                  />
                  <div className="flex justify-between">
                    {errors.title && (
                      <p className="text-red-500 text-xs italic">
                        {errors.title}
                      </p>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {title.length}/100 characters
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 font-bold mb-2"
                    htmlFor="content"
                  >
                    Content <span className="text-red-500">*</span>
                  </label>
                  <ReactQuill
                    id="content"
                    theme="snow"
                    value={content}
                    onChange={(value) => {
                      setContent(value);
                      if (errors.content) validateContent();
                    }}
                    onBlur={validateContent}
                    className={`border rounded-lg ${
                      errors.content ? "border-red-500" : ""
                    }`}
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
                  <div className="flex justify-between">
                    {errors.content && (
                      <p className="text-red-500 text-xs italic">
                        {errors.content}
                      </p>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {content.replace(/<[^>]*>/g, "").length}/5000 characters
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">
                    Tags <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.tags ? "border-red-500" : ""
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
                          });
                        }
                      }
                    }}
                    onBlur={validateTags}
                    // placeholder="Press Enter to add a tag (max 5)"
                  />
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
                    className="bg-DGXblue text-white px-4 py-2 mt-2 rounded-lg"
                  >
                    Add
                  </button>

                  <div className="flex justify-between">
                    {errors.tags && (
                      <p className="text-red-500 text-xs italic">
                        {errors.tags}
                      </p>
                    )}
                    {/* <span className="text-xs text-gray-500 ml-auto">
                      {tags.length}/5 tags
                    </span> */}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-DGXgreen text-white rounded-full px-3 py-1"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => {
                            removeTag(tag);
                            validateTags();
                          }}
                          className="ml-2 text-white hover:text-red-200"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">
                    Links <span className="text-red-500">*</span>
                  </label>
                  <input
                    // type="text"
                    type="url"
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.links ? "border-red-500" : ""
                    }`}
                    value={linkInput}
                    onChange={handleLinkInputChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && linkInput.trim() !== "") {
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
                    placeholder="Press Enter to add a valid URL (e.g., https://example.com)"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="bg-DGXblue text-white px-4 py-2 rounded-lg mt-2"
                  >
                    Add
                  </button>
                  {errors.links && (
                    <p className="text-red-500 text-xs italic">
                      {errors.links}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {links.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-DGXblue text-white rounded-full px-3 py-1"
                      >
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:underline truncate max-w-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {link}
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            removeLink(link);
                            validateLinks();
                          }}
                          className="ml-2 text-white hover:text-red-200"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {selectedImage && (
                    <div className="mt-2">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="max-h-40"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="mt-2 text-red-500 text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div> */}
                <FileUploader
                  moduleName="Discussion"
                  folderName="discussion-banners"
                  onUploadComplete={handleDiscussionImageUpload}
                  accept="image/*"
                  maxSize={200 * 1024}
                  label="Upload Banner Image"
                />
                {selectedImage && (
                  <div className="mt-2">
                    <img
                      src={selectedImage}
                      alt="Banner Preview"
                      className="max-h-40 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setBannerFilePath("");
                      }}
                      className="mt-2 text-red-500 text-sm"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">
                    Privacy <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={privacy}
                    onChange={(e) => {
                      setPrivacy(e.target.value);
                      setErrors({ ...errors, privacy: "" });
                    }}
                    onBlur={validatePrivacy}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.privacy ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select privacy</option>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                  {errors.privacy && (
                    <p className="text-red-500 text-xs italic">
                      {errors.privacy}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="bg-DGXgreen text-white py-2 px-4 rounded-lg hover:bg-DGXblue disabled:opacity-50"
                    disabled={
                      loading || Object.values(errors).some((error) => error)
                    }
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Posting...
                      </span>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            )}
            <div className="two-h-screen scrollbar scrollbar-thin  overflow-y-auto px-6">
              {isLoading
                ? demoDiscussions.map((_, index) => (
                    <div
                      key={index}
                      className="relative shadow my-4 border border-gray-300 rounded-lg p-4 w-full max-w-screen-sm sm:max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl xl:max-w-screen-2xl bg-gray-200 animate-pulse"
                    >
                      <div className="h-10 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-24 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="h-40 w-60 bg-gray-300 rounded mb-2"></div>
                      <div className="flex gap-2">
                        {Array.from({ length: 3 }).map((_, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="h-8 w-20 bg-gray-300 rounded"
                          ></span>
                        ))}
                      </div>
                      <div className="mt-4 h-5 bg-gray-300 rounded w-1/2"></div>
                      <div className="mt-4 h-8 bg-gray-300 rounded w-52"></div>
                    </div>
                  ))
                : filteredDiscussions.map((discussion, i) => (
                    <div
                      key={i}
                      className="relative shadow my-4 border border-gray-300 rounded-lg p-4 w-full max-w-screen-sm sm:max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl xl:max-w-screen-2xl transition-transform transform  hover:shadow-lg hover:bg-gray-100 cursor-pointer focus-within:z-10 hover:z-10"
                      onClick={(e) => {
                        if (
                          !e.target.closest("a") &&
                          !e.target.closest("button") &&
                          !e.target.classList.contains("text-blue-700")
                        ) {
                          openModal(discussion);
                        }
                      }}
                    >
                      <div>
                        <h3 className="text-lg font-bold md:text-lg lg:text-xl xl:text-2xl">
                          {discussion.Title}
                        </h3>
                        <div className="text-gray-600 text-sm md:text-base lg:text-lg xl:text-xl">
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
                                className="text-blue-700 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal(discussion);
                                }}
                              >
                                see more
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
                      {discussion.DiscussionImagePath ? (
                        <div
                          className="mt-2"
                          onClick={() => openModal(discussion)}
                        >
                          <img
                            src={
                              discussion.ImageUrl ||
                              `${window.location.origin}/${discussion.DiscussionImagePath}`
                            }
                            alt="Discussion"
                            className="max-h-40 w-auto object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                            }}
                          />
                        </div>
                      ) : discussion.Image ? (
                        <div
                          className="mt-2"
                          onClick={() => openModal(discussion)}
                        >
                          <img
                            src={discussion.Image}
                            alt="Discussion"
                            className="max-h-40 w-auto object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                            }}
                          />
                        </div>
                      ) : null}

                      <div
                        className="mt-2 flex flex-wrap gap-2"
                        onClick={() => openModal(discussion)}
                      >
                        {discussion.Tag && typeof discussion.Tag === "string"
                          ? discussion.Tag.split(",")
                              .filter((tag) => tag)
                              .map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="bg-DGXgreen text-white rounded-full px-3 py-1 text-xs md:text-sm lg:text-base"
                                >
                                  {tag}
                                </span>
                              ))
                          : Array.isArray(discussion.Tag)
                          ? discussion.Tag.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="bg-DGXgreen text-white rounded-full px-3 py-1 text-xs md:text-sm lg:text-base"
                              >
                                {tag}
                              </span>
                            ))
                          : null}
                      </div>
                      <div
                        className="mt-2 flex flex-wrap gap-2"
                        onClick={() => openModal(discussion)}
                      >
                        {discussion.ResourceUrl &&
                        typeof discussion.ResourceUrl === "string"
                          ? discussion.ResourceUrl.split(",").map(
                              (link, linkIndex) => (
                                <a
                                  key={linkIndex}
                                  href={link}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-DGXgreen hover:underline text-xs md:text-sm lg:text-base"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {link}
                                </a>
                              )
                            )
                          : Array.isArray(discussion.ResourceUrl)
                          ? discussion.ResourceUrl.map((link, linkIndex) => (
                              <a
                                key={linkIndex}
                                href={link}
                                onClick={(e) => e.stopPropagation()}
                                className="text-DGXgreen hover:underline text-xs md:text-sm lg:text-base"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {link}
                              </a>
                            ))
                          : null}
                      </div>
                      <div className="mt-4 flex items-center space-x-4">
                        <button
                          className="flex items-center text-sm md:text-base lg:text-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddLike(
                              discussion.DiscussionID,
                              discussion.userLike
                            );
                          }}
                        >
                          {discussion.userLike == 1 ? (
                            <AiFillLike />
                          ) : (
                            <AiOutlineLike />
                          )}
                          {discussion.likeCount} Likes
                        </button>

                        <button
                          className="flex items-center text-DGXgreen text-sm md:text-base lg:text-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComment(discussion);
                          }}
                        >
                          <FaComment className="mr-2" />
                          {discussion.commentCount} Comment
                          {discussion.commentCount !== 1 ? "s" : ""}
                        </button>
                      </div>
                    </div>
                  ))}
              {!isLoading &&
                filteredDiscussions.length === 0 &&
                searchQuery && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No discussions found matching your search.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setFilteredDiscussions(demoDiscussions);
                      }}
                      className="mt-2 text-DGXgreen hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}
            </div>
          </div>
        </section>
        {isLoading ? (
          <Skeleton
            height="2.5rem"
            className="w-full bg-gray-300 rounded-lg mb-4"
          />
        ) : (
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
                    Community Highlights
                  </h2>
                  <div className="space-y-4">
                    {communityHighlights.map((topic, index) => (
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
                    ))}
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
        )}
      </div>
    </div>
  );
};

export default Discussion;

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

const [discussions, setDiscussions] = useState([]);
const [filteredDiscussions, setFilteredDiscussions] = useState([]);
const [selectedDiscussion, setSelectedDiscussion] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [loading, setLoading] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
const [searchScope, setSearchScope] = useState("all");
const [isFormOpen, setIsFormOpen] = useState(false);
const [modalIsOpen, setModalIsOpen] = useState(false);
const [title, setTitle] = useState("");
const [content, setContent] = useState("");
const [tags, setTags] = useState([]);
const [links, setLinks] = useState([]);
const [selectedImage, setSelectedImage] = useState(null);
const [privacy, setPrivacy] = useState("private");
const [errors, setErrors] = useState({
    title: "",
    content: "",
    tags: "",
    links: "",
    privacy: "",
});
const [communityHighlights, setCommunityHighlights] = useState([]);
const [topUsers, setTopUsers] = useState([]);
const handleTagInputChange = (e) => setTagInput(e.target.value);
const handleLinkInputChange = (e) => setLinkInput(e.target.value);
const closeModal = () => {
    resetForm();
    setModalIsOpen(false);
    setIsFormOpen(false);
};

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

const DiscussionForm = ({
    title,
    setTitle,
    content,
    setContent,
    tags,
    setTags,
    links,
    setLinks,
    selectedImage,
    setSelectedImage,
    privacy,
    setPrivacy,
    errors,
    validateTitle,
    validateContent,
    validateTags,
    validateLinks,
    validatePrivacy,
    handleSubmit,
    loading,
    onClose,
    handleImageChange,
}) => {
    const [tagInput, setTagInput] = useState("");
    const [linkInput, setLinkInput] = useState("");

    const handleTagInputKeyPress = (e) => {
        if (e.key === "Enter" && tagInput.trim() !== "") {
            e.preventDefault();
            if (tags.length < 5) {
                setTags([...tags, tagInput.trim()]);
                setTagInput("");
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleLinkInputKeyPress = (e) => {
        if (e.key === "Enter" && linkInput.trim() !== "") {
            e.preventDefault();
            setLinks([...links, linkInput.trim()]);
            setLinkInput("");
        }
    };

    const removeLink = (linkToRemove) => {
        setLinks(links.filter((link) => link !== linkToRemove));
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
                    setDemoDiscussions(result.data.updatedDiscussions);
                    setFilteredDiscussions(result.data.updatedDiscussions);
                    const highlights = getCommunityHighlights(
                        result.data.updatedDiscussions
                    );
                    setCommunityHighlights(highlights);
                    const users = getTopUsersByDiscussions(result.data.updatedDiscussions);
                    setTopUsers(users);
                }
                setLoading(false);
            } catch (error) {
                setLoading(false);
                // console.error("Error fetching discussions:", error);
            }
        };

        if (userToken && user) {
            fetchDiscussionData(user.EmailId);
        } else {
            fetchDiscussionData(null);
        }
    }, [user, userToken, fetchData]);

    
    return (
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
                    className={`w-full px-3 py-2 border rounded-lg ${errors.title ? "border-red-500" : ""
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
                    className={`border rounded-lg ${errors.content ? "border-red-500" : ""
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
                    className={`w-full px-3 py-2 border rounded-lg ${errors.tags ? "border-red-500" : ""
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
                    placeholder="Press Enter to add a tag (max 5)"
                />
                <div className="flex justify-between">
                    {errors.tags && (
                        <p className="text-red-500 text-xs italic">
                            {errors.tags}
                        </p>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                        {tags.length}/5 tags
                    </span>
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
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg ${errors.links ? "border-red-500" : ""
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
                            <span className="truncate max-w-xs">{link}</span>
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

            <div className="mb-4">
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
            </div>

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
                    className={`w-full px-3 py-2 border rounded-lg ${errors.privacy ? "border-red-500" : ""
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
    );
};

export default DiscussionForm;
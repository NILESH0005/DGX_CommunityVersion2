import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import FileUploader from "../../container/FileUploader.jsx";
import { checkToxicityWithReasonAndFlag } from "../../utils/toxicityDetection.js";

const DiscussionForm = ({
  userToken,
  user,
  fetchData,
  fetchDiscussionData,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [links, setLinks] = useState([]);
  const [linkInput, setLinkInput] = useState("");
  const [privacy, setPrivacy] = useState("private");
  const [allowRepost, setAllowRepost] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [bannerFilePath, setBannerFilePath] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingToxicity, setIsCheckingToxicity] = useState(false);
  const [errors, setErrors] = useState({});

  const BASE_URL = import.meta.env.VITE_API_UPLOADSURL;

  const validateTitle = () => {
    if (!title.trim()) {
      setErrors((prev) => ({ ...prev, title: "Title is required" }));
      return false;
    }
    if (title.length > 100) {
      setErrors((prev) => ({
        ...prev,
        title: "Title must be under 100 characters",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, title: "" }));
    return true;
  };

  const validateContent = () => {
    const text = content.replace(/<[^>]*>/g, "").trim();
    if (!text) {
      setErrors((prev) => ({ ...prev, content: "Content cannot be empty" }));
      return false;
    }
    if (text.length > 5000) {
      setErrors((prev) => ({
        ...prev,
        content: "Content must be under 5000 characters",
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
    const invalidLinks = links.filter((l) => !urlRegex.test(l));
    if (invalidLinks.length > 0) {
      setErrors((prev) => ({
        ...prev,
        links: "Invalid URL detected (e.g., https://example.com)",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, links: "" }));
    return true;
  };

  const validatePrivacy = () => {
    if (!privacy) {
      setErrors((prev) => ({ ...prev, privacy: "Select privacy setting" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, privacy: "" }));
    return true;
  };

  const validateToxicity = async () => {
    setIsCheckingToxicity(true);
    try {
      const stripped = content.replace(/<[^>]*>?/gm, "").trim();
      const text = `${title} ${stripped}`;
      const result = await checkToxicityWithReasonAndFlag(text);
      if (result.flag === 0 && result.reasons.length > 0) {
        await Swal.fire({
          icon: "warning",
          title: "Content Moderation Alert",
          html: `Your content contains potentially inappropriate material:<br/><br/>
          <strong>Reasons:</strong><br/>
          ${result.reasons.join("<br/>")}`,
        });
        return false;
      }
      return true;
    } catch (err) {
      console.error("Toxicity check error", err);
      const res = await Swal.fire({
        icon: "warning",
        title: "Moderation unavailable",
        text: "Moderation service is down. Post anyway?",
        showCancelButton: true,
      });
      return res.isConfirmed;
    } finally {
      setIsCheckingToxicity(false);
    }
  };


  const handleTagAdd = () => {
    if (tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      setErrors((prev) => ({ ...prev, tags: "" }));
    }
  };

  const handleLinkAdd = () => {
    if (!linkInput.trim()) return;
    let formatted = linkInput.trim();
    if (!formatted.startsWith("http")) formatted = `https://${formatted}`;
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlRegex.test(formatted)) {
      setErrors((prev) => ({
        ...prev,
        links: "Invalid URL format (e.g., https://example.com)",
      }));
      return;
    }
    setLinks([...links, formatted]);
    setLinkInput("");
    setErrors((prev) => ({ ...prev, links: "" }));
  };

  const handleImageUpload = (result) => {
    const { filePath } = result;
    const newImage = `${BASE_URL}/${filePath}`;
    setSelectedImage(newImage);
    setBannerFilePath(filePath);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userToken || !user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "You need to login first to start a new discussion.",
        confirmButtonText: "OK",
      });
      return;
    }

    const valid =
      validateTitle() &&
      validateContent() &&
      validateTags() &&
      validateLinks() &&
      validatePrivacy();
    if (!valid) {
      Swal.fire("Validation Error", "Fix errors before submitting", "error");
      return;
    }
    const clean = await validateToxicity();
    if (!clean) return;

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
      const data = await fetchData(
        "discussion/discussionpost",
        "POST",
        body,
        headers
      );
      if (!data.success) throw new Error(data.message);

      await Swal.fire("Success", "Discussion posted successfully!", "success");
      fetchDiscussionData(user?.EmailId);
      onClose();
    } catch (err) {
      Swal.fire("Error", err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userToken || !user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login first to start a discussion.",
        confirmButtonText: "OK",
      });
      onClose && onClose(); 
    }
  }, [userToken, user]);

  return (
    <div className="animate-slide-down mb-6">
      <div className="bg-white border-2 border-DGXgreen/20 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-DGXgreen to-DGXblue p-4">
          <h3 className="text-xl font-bold text-white">
            Start a New Discussion
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="font-semibold text-gray-700">Title *</label>
            <input
              type="text"
              className={`w-full border-2 rounded-xl p-3 focus:ring-DGXgreen ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={validateTitle}
              maxLength={100}
              placeholder="Enter your discussion title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-gray-700">Content *</label>
            <ReactQuill
              value={content}
              onChange={setContent}
              onBlur={validateContent}
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ["bold", "italic", "underline"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link"],
                ],
              }}
            />
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-gray-700">Tags *</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                className="flex-1 border-2 border-gray-300 rounded-xl p-3"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleTagAdd())
                }
                placeholder="Press Enter to add tag"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="bg-DGXblue text-white px-5 rounded-xl hover:bg-DGXgreen"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gradient-to-r from-DGXgreen to-DGXblue text-white rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      className="ml-2"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.tags && (
              <p className="text-red-500 text-sm">{errors.tags}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-gray-700">
              Reference Links
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                className="flex-1 border-2 border-gray-300 rounded-xl p-3"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleLinkAdd())
                }
                placeholder="Add URL and press Enter"
              />
              <button
                type="button"
                onClick={handleLinkAdd}
                className="bg-DGXblue text-white px-5 rounded-xl hover:bg-DGXgreen"
              >
                Add
              </button>
            </div>
            {links.length > 0 && (
              <ul className="mt-2 list-disc pl-6 text-sm text-blue-600">
                {links.map((l, i) => (
                  <li key={i}>
                    <a href={l} target="_blank" rel="noopener noreferrer">
                      {l}
                    </a>{" "}
                    <button
                      type="button"
                      onClick={() => setLinks(links.filter((x) => x !== l))}
                      className="text-red-500 ml-2"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.links && (
              <p className="text-red-500 text-sm">{errors.links}</p>
            )}
          </div>

          {/* Repost */}
          <div>
            <label className="font-semibold text-gray-700">
              Allow Reposting *
            </label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={allowRepost}
                  onChange={() => setAllowRepost(true)}
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!allowRepost}
                  onChange={() => setAllowRepost(false)}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="font-semibold text-gray-700">Banner Image</label>
            <FileUploader
              moduleName="Discussion"
              folderName="discussion-banners"
              onUploadComplete={handleImageUpload}
              accept="image/*"
              maxSize={200 * 1024}
              label="Upload Image"
            />
            {selectedImage && (
              <div className="mt-2">
                <img
                  src={selectedImage}
                  alt="banner"
                  className="w-32 h-20 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setBannerFilePath("");
                  }}
                  className="text-red-500 ml-2 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Privacy */}
          <div>
            <label className="font-semibold text-gray-700">Privacy *</label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              onBlur={validatePrivacy}
              className="w-full border-2 border-gray-300 rounded-xl p-3 mt-1"
            >
              <option value="">Select privacy</option>
              <option value="private">🔒 Private</option>
              <option value="public">🌍 Public</option>
            </select>
            {errors.privacy && (
              <p className="text-red-500 text-sm">{errors.privacy}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isCheckingToxicity}
              className="px-8 py-3 bg-gradient-to-r from-DGXgreen to-DGXblue text-white rounded-xl"
            >
              {isCheckingToxicity
                ? "Checking..."
                : loading
                ? "Posting..."
                : "Publish Discussion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscussionForm;

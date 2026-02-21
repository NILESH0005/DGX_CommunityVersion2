import React, { useState, useContext, useEffect, useRef } from "react";
import JoditEditor from "jodit-react";
import ApiContext from "../../../context/ApiContext";
import Swal from "sweetalert2";
import FileUploader from "../../../container/FileUploader"; // Import FileUploader
import { checkToxicityWithReasonAndFlag } from "../../../utils/toxicityDetection.js";

const BlogForm = (props) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // New state for image preview
  const [isImageEditing, setIsImageEditing] = useState(false); // New state for image edit mode
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isCheckingToxicity, setIsCheckingToxicity] = useState(false);
  const [categories, setCategories] = useState([]);
  const [content, setContent] = useState("");
  const [allowRepost, setAllowRepost] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const editor = useRef(null);
  const { fetchData, userToken, user } = useContext(ApiContext);

  useEffect(() => {
    const fetchCategories = async () => {
      const endpoint = `dropdown/getDropdownValues?category=blogCategory`;
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      try {
        const data = await fetchData(endpoint, method, {}, headers);
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

    fetchCategories();
  }, [fetchData, userToken]);

  useEffect(() => {
    if (props.editingBlog) {
      setIsEditing(true);
      setTitle(props.editingBlog.title || "");
      setCategory(
        props.editingBlog.category || props.editingBlog.Category || ""
      );
      setContent(props.editingBlog.content || "");
      setAllowRepost(props.editingBlog.allowRepost || false);
      setIsDraft(
        props.editingBlog.isDraft || props.editingBlog.Status === "Draft"
      );

      if (props.editingBlog.image) {
        const previewUrl = getImageUrl(props.editingBlog.image);
        setImagePreview(previewUrl);
        setSelectedImage(props.editingBlog.image); 
      }
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [props.editingBlog]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }    const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;
    const cleanPath = imagePath.replace(/^\/+/, "");

    if (cleanPath.startsWith("uploads/")) {
      return `${baseUploadsUrl}/${cleanPath}`;
    }

    return `${baseUploadsUrl}/${cleanPath}`;
  };

  const handleImageUpload = (uploadResult) => {
    if (!uploadResult || typeof uploadResult !== "object") {
      console.error("Invalid upload result:", uploadResult);
      setErrors((prev) => ({ ...prev, image: "Failed to upload image" }));
      return;
    }
    const { filePath } = uploadResult;
    if (typeof filePath !== "string") {
      console.error("Invalid filePath:", filePath);
      setErrors((prev) => ({ ...prev, image: "Invalid image path" }));
      return;
    }
    const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;
    let relativePath = filePath;
    if (filePath.includes(baseUploadsUrl)) {
      relativePath = filePath.replace(baseUploadsUrl, "").replace(/^\/+/, "");
    }
    if (filePath.includes("http://") || filePath.includes("https://")) {
      const url = new URL(filePath);
      relativePath = url.pathname.replace(/^\/+/, "");

      if (relativePath.startsWith("uploads/")) {
        relativePath = relativePath.replace("uploads/", "");
      }
    }

    console.log("Original filePath:", filePath);
    console.log("Relative path to save:", relativePath);

    const previewUrl = getImageUrl(filePath) || filePath;
    setImagePreview(previewUrl);

    setSelectedImage(relativePath);
    setIsImageEditing(false);
    setErrors((prev) => ({ ...prev, image: null }));
  };

  const handleCancelImageEdit = () => {
    setIsImageEditing(false);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setIsImageEditing(false);
  };

  // Rest of your existing functions remain the same...
  const validateBlogToxicity = async () => {
    if (isDraft) return true;

    setIsCheckingToxicity(true);

    try {
      const strippedContent = content.replace(/<[^>]*>?/gm, "").trim();
      const combinedText = `${title} ${strippedContent}`.trim();

      const result = await checkToxicityWithReasonAndFlag(combinedText);
      console.log("Blog toxicity result:", result);

      if (result.flag === 0 && result.reasons.length > 0) {
        await Swal.fire({
          icon: "warning",
          title: "Content Moderation Alert",
          html: `Your blog content contains potentially inappropriate material:<br/><br/>
              <strong>Reasons:</strong><br/>
              ${result.reasons.join("<br/>")}<br/><br/>
              Please review and modify your content before posting.`,
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
        text: "The content moderation service is temporarily unavailable. Please ensure your blog follows community guidelines.",
        showCancelButton: true,
        confirmButtonText: "Post Anyway",
        cancelButtonText: "Cancel",
      });
      return result.isConfirmed;
    } finally {
      setIsCheckingToxicity(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!isDraft) {
      if (!title.trim()) errors.title = "Blog title is required.";
      if (!category) errors.category = "Please select a category.";
      if (!content.trim() || content === "<p></p>")
        errors.content = "Blog content is required.";
      if (!selectedImage) errors.image = "Please upload an image.";
    } else {
      if (!title.trim() && !content.trim() && !selectedImage) {
        errors.general = "Draft must contain at least some content.";
      }
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isDraft) {
      const isContentAppropriate = await validateBlogToxicity();
      if (!isContentAppropriate) {
        return;
      }
    }

    const actionText = isEditing
      ? isDraft
        ? "update draft"
        : "update blog"
      : isDraft
      ? "save as draft"
      : "submit";

    Swal.fire({
      title: `Confirm ${actionText}`,
      text: `Are you sure you want to ${actionText} this blog?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Confirm ${
        isEditing ? "Update" : isDraft ? "Save" : "Submit"
      }`,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        handleConfirmSubmit();
      }
    });
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);

    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    let blogStatus = "Draft";
    let approvedBy = null;
    let approvedOn = null;

    if (!isDraft) {
      blogStatus = user.isAdmin === 1 ? "Approved" : "Pending";
      if (user.isAdmin === 1) {
        approvedBy = user.Name;
        approvedOn = new Date();
      }
    }

    // ✅ FIX: Use different endpoints for create vs update
    let endpoint, method;

    if (isEditing) {
      // Use update endpoint for editing
      endpoint = `blog/updateUserProfileBlog/${props.editingBlog.BlogID}`;
      method = "POST";
    } else {
      // Use create endpoint for new blogs
      endpoint = "blog/blogpost";
      method = "POST";
    }

    const body = {
      // For both create and update
      title,
      content,
      image: selectedImage,
      category,
      Status: blogStatus,
      UserName: user.Name,
      allowRepost,
      isDraft: isDraft,
      ApprovedBy: approvedBy,
      ApprovedOn: approvedOn,
      // Only include BlogID for update if needed by your backend
      ...(isEditing && { BlogID: props.editingBlog.BlogID }),
    };

    console.log("🔄 API Call:", {
      endpoint,
      method,
      isEditing,
      blogId: props.editingBlog?.BlogID,
    });

    try {
      const data = await fetchData(endpoint, method, body, headers);
      setLoading(false);

      if (data.success) {
        Swal.fire(
          "Success",
          isEditing ? "Blog updated!" : "Blog posted!",
          "success"
        );

        if (props.onSuccess) {
          const updatedBlog = {
            BlogID: isEditing ? props.editingBlog.BlogID : data.data.postId,
            title,
            content,
            category,
            image: selectedImage,
            Status: blogStatus,
            UserID: user.UserID,
            UserName: user.Name,
            allowRepost,
            isDraft: isDraft,
            AddOnDt: new Date().toISOString(),
          };
          props.onSuccess(updatedBlog, isEditing);
        } else {
          resetForm();
        }
      } else {
        Swal.fire("Error", `Error: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Blog submission error:", error);
      setLoading(false);
      Swal.fire("Error", "Something went wrong, please try again.", "error");
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setSelectedImage(null);
    setImagePreview(null);
    setContent("");
    setErrors({});
    setAllowRepost(false);
    setIsDraft(false);
    setIsImageEditing(false);
  };

  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    } else {
      resetForm();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-4 bg-white p-6 rounded shadow border-2"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? "Edit Blog" : "Create New Blog"}
        </h2>
        {isEditing && (
          <p className="text-sm text-gray-600 mt-1">
            Editing: {props.editingBlog?.title || "Untitled"}
          </p>
        )}
      </div>
      <div className="mb-4 relative">
        <label className="block text-sm font-medium mb-2">Blog Image</label>
        <div className="text-xs text-gray-500 mb-2">
          Max size: 500KB | Formats: .jpeg, .png{" "}
          {isDraft && "| Optional for draft"}
        </div>
        {isImageEditing ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <FileUploader
              moduleName="Blog"
              folderName="blog-images"
              onUploadComplete={handleImageUpload}
              accept="image/*"
              maxSize={500 * 1024}
              label="Upload Blog Image"
            />
            <div className="flex gap-2 flex-wrap justify-center mt-2">
              <button
                type="button"
                onClick={handleCancelImageEdit}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs transition-colors duration-200 flex items-center"
              >
                Cancel Upload
              </button>
            </div>
          </div>
        ) : imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Blog preview"
              className="w-full max-w-xs h-48 object-cover rounded-lg border"
              onError={(e) => {
                console.error("Failed to load image:", imagePreview);
                e.target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%239ca3af'%3EImage not available%3C/text%3E%3C/svg%3E";
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsImageEditing(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200"
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs transition-colors duration-200"
              >
                Remove Image
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <p className="text-gray-500 mb-3">No image selected</p>
            <button
              type="button"
              onClick={() => setIsImageEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Upload Image
            </button>
          </div>
        )}

        {errors.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image}</p>
        )}
      </div>

      {/* Rest of your form fields remain the same */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Blog Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border w-full p-2 rounded"
          placeholder={
            isDraft ? "Title (optional for draft)" : "Enter blog title"
          }
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border w-full p-2 rounded"
        >
          <option value="">
            {isDraft ? "Select Category (optional)" : "Select Category"}
          </option>
          {categories.map((cat) => (
            <option key={cat.idCode} value={cat.ddValue}>
              {cat.ddValue}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Blog Content</label>
        <JoditEditor
          ref={editor}
          value={content}
          onChange={(newContent) => setContent(newContent)}
          className="border rounded min-h-[300px]"
          placeholder={
            isDraft
              ? "Start writing your blog content..."
              : "Write your blog content..."
          }
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content}</p>
        )}
      </div>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="allowRepost"
          checked={allowRepost}
          onChange={(e) => setAllowRepost(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="allowRepost" className="text-sm font-medium">
          Allow others to repost my blog
        </label>
      </div>

      {errors.general && (
        <p className="text-red-500 text-sm mb-4">{errors.general}</p>
      )}

      <div className="flex justify-between mt-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDraft"
            checked={isDraft}
            onChange={(e) => setIsDraft(e.target.checked)}
            className="mr-2"
          />
          <label
            htmlFor="isDraft"
            className="text-sm font-medium text-gray-700"
          >
            Save as draft
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-md transition ${
              isDraft
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={loading || isCheckingToxicity}
          >
            {isCheckingToxicity
              ? "Checking content..."
              : loading
              ? isEditing
                ? "Updating..."
                : isDraft
                ? "Saving..."
                : "Submitting..."
              : isEditing
              ? isDraft
                ? "Update Draft"
                : "Update Blog"
              : isDraft
              ? "Save Draft"
              : "Submit Blog"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BlogForm;

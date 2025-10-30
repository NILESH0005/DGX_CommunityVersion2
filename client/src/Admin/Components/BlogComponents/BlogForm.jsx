import React, { useState, useContext, useEffect, useRef } from "react";
import JoditEditor from "jodit-react";
import ApiContext from "../../../context/ApiContext";
import Swal from "sweetalert2";
import { compressImage } from "../../../utils/compressImage.js";
import { checkToxicityWithReasonAndFlag } from "../../../utils/toxicityDetection.js";

const BlogForm = (props) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isCheckingToxicity, setIsCheckingToxicity] = useState(false);
  const [categories, setCategories] = useState([]);
  const [content, setContent] = useState("");
  const [allowRepost, setAllowRepost] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingImage, setExistingImage] = useState(null);

  const editor = useRef(null);
  const { fetchData, userToken, user } = useContext(ApiContext);

  // Initialize form with editing blog data
  useEffect(() => {
    if (props.editingBlog) {
      setIsEditing(true);
      setTitle(props.editingBlog.title || "");
      setCategory(props.editingBlog.category || props.editingBlog.Category || "");
      setContent(props.editingBlog.content || "");
      setAllowRepost(props.editingBlog.allowRepost || false);
      setIsDraft(props.editingBlog.isDraft || props.editingBlog.Status === "Draft");
      setExistingImage(props.editingBlog.image || null);
      setSelectedImage(null); // Reset selected image for new uploads
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [props.editingBlog]);

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

  // Toxicity validation function for blog content
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const allowedFormats = ["image/jpeg", "image/png", "image/svg+xml"];
      const maxSize = 200 * 1024;

      if (!allowedFormats.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Only JPEG, PNG, and SVG files are allowed.",
        }));
        return;
      }
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 200KB.",
        }));
        return;
      }

      try {
        const compressedFile = await compressImage(file);
        setSelectedImage(compressedFile);
        setErrors((prev) => ({ ...prev, image: null }));
      } catch (error) {
        Swal.fire("Error", "Failed to compress image.", "error");
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // For published posts, validate all fields
    if (!isDraft) {
      if (!title.trim()) errors.title = "Blog title is required.";
      if (!category) errors.category = "Please select a category.";
      if (!content.trim() || content === "<p></p>") errors.content = "Blog content is required.";
      if (!selectedImage && !existingImage) errors.image = "Please upload an image.";
    } else {
      // For drafts, only validate that there's some content
      if (!title.trim() && !content.trim() && !selectedImage && !existingImage) {
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

    const actionText = isEditing ? 
      (isDraft ? "update draft" : "update blog") : 
      (isDraft ? "save as draft" : "submit");
    
    Swal.fire({
      title: `Confirm ${actionText}`,
      text: `Are you sure you want to ${actionText} this blog?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Confirm ${isEditing ? 'Update' : (isDraft ? 'Save' : 'Submit')}`,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        handleConfirmSubmit();
      }
    });
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);

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

    // Use selected image if available, otherwise use existing image
    const finalImage = selectedImage || existingImage;

    const endpoint = isEditing ? `blog/updateBlog/${props.editingBlog.BlogID}` : "blog/blogpost";
    const method = isEditing ? "PUT" : "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = {
      title,
      content,
      image: finalImage,
      category,
      Status: blogStatus,
      UserName: user.Name,
      allowRepost,
      isDraft: isDraft,
      ApprovedBy: approvedBy,
      ApprovedOn: approvedOn,
    };

    try {
      const data = await fetchData(endpoint, method, body, headers);
      setLoading(false);

      if (data.success) {
        const successMessage = isEditing ? 
          (isDraft ? "Draft updated successfully!" : "Blog updated successfully!") :
          (isDraft ? "Blog saved as draft successfully!" : "Blog posted successfully!");
          
        Swal.fire("Success", successMessage, "success");
        
        // Call success callback
        if (props.onSuccess) {
          const updatedBlog = {
            BlogID: isEditing ? props.editingBlog.BlogID : data.data.postId,
            title,
            content,
            category,
            image: finalImage,
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
      setLoading(false);
      Swal.fire("Error", "Something went wrong, please try again.", "error");
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setSelectedImage(null);
    setExistingImage(null);
    setContent("");
    setErrors({});
    setAllowRepost(false);
    setIsDraft(false);
  };

  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    } else {
      resetForm();
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setExistingImage(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-4 bg-white p-6 rounded shadow border-2"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Blog' : 'Create New Blog'}
        </h2>
        {isEditing && (
          <p className="text-sm text-gray-600 mt-1">
            Editing: {props.editingBlog?.title || 'Untitled'}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Blog Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border w-full p-2 rounded"
          placeholder={isDraft ? "Title (optional for draft)" : "Enter blog title"}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border w-full p-2 rounded"
        >
          <option value="">{isDraft ? "Select Category (optional)" : "Select Category"}</option>
          {categories.map((cat) => (
            <option key={cat.idCode} value={cat.ddValue}>
              {cat.ddValue}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Blog Content</label>
        <JoditEditor
          ref={editor}
          value={content}
          onChange={(newContent) => setContent(newContent)}
          className="border rounded min-h-[300px]"
          placeholder={isDraft ? "Start writing your blog content..." : "Write your blog content..."}
        />
        {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
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

      <div className="mb-4 relative pt-10">
        <label className="block text-sm font-medium mb-2">Upload Image</label>
        <div className="text-xs text-gray-500 mb-2">
          Max size: 200KB | Formats: .jpeg, .png {isDraft && "| Optional for draft"}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border w-full p-2 rounded"
        />
        
        {/* Show existing or selected image */}
        {(existingImage || selectedImage) && (
          <div className="mt-3">
            <p className="text-sm text-green-600 mb-2">
              {selectedImage ? "New image selected" : "Current image"}
            </p>
            <div className="flex items-center gap-3">
              <img 
                src={selectedImage || existingImage} 
                alt="Blog" 
                className="h-20 w-20 object-cover rounded border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="text-red-500 text-sm hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        )}
        
        {errors.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image}</p>
        )}
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
          <label htmlFor="isDraft" className="text-sm font-medium text-gray-700">
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
            {isCheckingToxicity ? "Checking content..." : 
             loading ? (isEditing ? "Updating..." : (isDraft ? "Saving..." : "Submitting...")) : 
             isEditing ? (isDraft ? "Update Draft" : "Update Blog") : 
             (isDraft ? "Save Draft" : "Submit Blog")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BlogForm;
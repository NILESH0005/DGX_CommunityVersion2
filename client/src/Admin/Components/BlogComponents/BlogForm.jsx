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

  const editor = useRef(null);
  const { fetchData, userToken, user } = useContext(ApiContext);

  // Check if user is authenticated
  const isAuthenticated = !!userToken;

  // Show login alert when user tries to interact without authentication
  const handleUnauthenticatedAction = () => {
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Please login to create a blog post.",
      confirmButtonText: "Login",
      showCancelButton: true,
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        // You can redirect to login page or trigger login modal here
        // Example: window.location.href = "/login";
        // Or: props.onLoginRequest(); // if you have a prop for handling login
        console.log("Redirect to login page");
      }
    });
  };

  // Override handleSubmit to check authentication first
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }

    if (!validateForm()) {
      return;
    }

    const isContentAppropriate = await validateBlogToxicity();
    if (!isContentAppropriate) {
      return;
    }

    Swal.fire({
      title: "Confirm Submission",
      text: "Are you sure you want to submit this blog post?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        handleConfirmSubmit();
      }
    });
  };

  // Override other interactive functions to check authentication
  const handleImageChange = async (e) => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      e.target.value = ""; // Clear file input
      return;
    }

    const file = e.target.files[0];
   if (file) {
  const allowedFormats = ["image/jpeg", "image/png", "image/svg+xml"];
  const maxSize = 200 * 1024; // ✅ 200KB limit

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
      image: "Image size should be less than 200KB.", // ✅ Updated message
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

  const handleContentChange = (newContent) => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }
    setContent(newContent);
  };

  const handleTitleChange = (e) => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }
    setTitle(e.target.value);
  };

  const handleCategoryChange = (e) => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }
    setCategory(e.target.value);
  };

  const handleAllowRepostChange = (e) => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }
    setAllowRepost(e.target.checked);
  };

  const handleResetForm = () => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }
    resetForm();
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // Don't fetch categories if not authenticated
      return;
    }

    const fetchCategories = async () => {
      const endpoint = `dropdown/getDropdownValues?category=blogCategory`;
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      try {
        const data = await fetchData(endpoint, method, headers);
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
  }, [fetchData, userToken, isAuthenticated]);

  const validateBlogToxicity = async () => {
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
    if (!title.trim()) errors.title = "Blog title is required.";
    if (!category) errors.category = "Please select a category.";
    if (!content.trim() || content === "<p></p>") errors.content = "Blog content is required.";
    if (!selectedImage) errors.image = "Please upload an image.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmSubmit = async () => {
  setLoading(true);

  const blogStatus = user.role === "admin" ? "approved" : "pending";
  const endpoint = "blog/blogpost";
  const method = "POST";

  // Convert the File to Base64 string
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  let base64Image = null;
  if (selectedImage) {
    base64Image = await getBase64(selectedImage);
  }

  const body = {
    title,
    content,
    image: base64Image,
    category,
    Status: blogStatus,
    UserName: user.Name,
    allowRepost,
  };

  const headers = {
    "Content-Type": "application/json",
    "auth-token": userToken,
  };

  try {
    const data = await fetchData(endpoint, method, headers, JSON.stringify(body));
    setLoading(false);

    if (data.success) {
      if (typeof props.setBlogs === "function") {
        props.setBlogs((prevBlogs) => [
          {
            BlogId: data.data.postId,
            title,
            content,
            category,
            image: base64Image,
            Status: blogStatus,
            UserID: user.UserID,
            UserName: user.Name,
            allowRepost,
          },
          ...prevBlogs,
        ]);
      }
      Swal.fire("Success", "Blog Posted Successfully", "success");
      resetForm();
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
    setContent("");
    setErrors({});
    setAllowRepost(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-4 bg-white p-6 rounded shadow border-2"
    >
      {/* Show login prompt message when not authenticated */}
      {!isAuthenticated && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-center">
            Please login to create a blog post.
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-2 font-medium">Blog Title</label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="border w-full p-2 rounded"
          disabled={!isAuthenticated}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Category</label>
        <select
          value={category}
          onChange={handleCategoryChange}
          className="border w-full p-2 rounded"
          disabled={!isAuthenticated}
        >
          <option value="">Select Category</option>
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
          onChange={handleContentChange}
          className="border rounded min-h-[300px]"
          disabled={!isAuthenticated}
        />
        {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
      </div>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="allowRepost"
          checked={allowRepost}
          onChange={handleAllowRepostChange}
          className="mr-2"
          disabled={!isAuthenticated}
        />
        <label htmlFor="allowRepost" className="text-sm font-medium">
          Allow others to repost my blog
        </label>
      </div>

      <div className="mb-4 relative pt-10">
        <label className="block text-sm font-medium mb-2">Upload Image</label>
        <div className="text-xs text-gray-500 mb-2">
          Max size: 200KB | Formats: .jpeg, .png
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border w-full p-2 rounded"
          disabled={!isAuthenticated}
        />
        {errors.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image}</p>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleResetForm}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          disabled={!isAuthenticated}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading || isCheckingToxicity || !isAuthenticated}
        >
          {isCheckingToxicity ? "Checking content..." : loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default BlogForm;
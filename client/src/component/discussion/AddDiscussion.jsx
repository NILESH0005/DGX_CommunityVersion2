import React, { useContext, useEffect, useState } from "react";
import { FaWindowClose } from "react-icons/fa";
import ReactQuill from "react-quill";
import Swal from "sweetalert2";
import ApiContext from "../../context/ApiContext";
import { compressImage } from "../../utils/compressImage";

const AddDiscussion = ({ closeModal, demoDiscussions, setDemoDiscussions }) => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState({ id: "", value: "" });
  const [dropdownValues, setDropdownValues] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [tags, setTags] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [links, setLinks] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Title validation
    if (!title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    // Content validation - check for empty or just HTML formatting
    const strippedContent = content.replace(/<[^>]*>?/gm, "").trim();
    if (!strippedContent) {
      newErrors.content = "Content is required";
      isValid = false;
    }

    if (!tags.trim()) {
      newErrors.tags = "At least one tag is required";
      isValid = false;
    }

    // if (links.trim()) {
    //   const linkArray = links.split(",");
    //   const invalidLinks = linkArray.filter(
    //     (link) => !/^https?:\/\//i.test(link.trim())
    //   );
    //   if (invalidLinks.length > 0) {
    //     newErrors.links = "All links must start with http:// or https://";
    //     isValid = false;
    //   }
    // }

    if (!privacy.id) {
      newErrors.privacy = "Privacy setting is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleTagInputChange = (e) => setTagInput(e.target.value);

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      setTags(tags ? tags + "," + tagInput.trim() : tagInput.trim());
      setTagInput("");
      setErrors((prev) => ({ ...prev, tags: null }));
    }
  };

  const removeTag = (tagToRemove) => {
    const tagArray = tags.split(",");
    const filteredTags = tagArray.filter((tag) => tag !== tagToRemove);
    const newTags = filteredTags.join(",");
    setTags(newTags);
    if (!newTags) {
      setErrors((prev) => ({ ...prev, tags: "At least one tag is required" }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const allowedFormats = ["image/jpeg", "image/png", "image/svg+xml"];
      const maxSize = 50 * 1024; // 50KB

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
          image: "Image size should be less than 50KB.",
        }));
        return;
      }

      try {
        const compressedFile = await compressImage(file);
        setSelectedImage(compressedFile);
        setErrors((prev) => ({ ...prev, image: null })); // Clear error
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to compress image.",
          confirmButtonText: "OK",
        });
      }
    } else {
      // Clear image selection
      setSelectedImage(null);
      setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const handleLinkInputChange = (e) => setLinkInput(e.target.value);

  const handleLinkInputKeyPress = (e) => {
    if (e.key === "Enter" && linkInput.trim() !== "") {
      e.preventDefault();
      // Basic URL validation
      if (!/^https?:\/\//i.test(linkInput.trim())) {
        setErrors((prev) => ({
          ...prev,
          links: "Please enter a valid URL starting with http:// or https://",
        }));
        return;
      }

      setLinks(links ? links + "," + linkInput.trim() : linkInput.trim());
      setLinkInput("");
      setErrors((prev) => ({ ...prev, links: null }));
    }
  };

  const removeLink = (linkToRemove) => {
    const linkArray = links.split(",");
    const filteredLinks = linkArray.filter((link) => link !== linkToRemove);
    const newLinks = filteredLinks.join(",");
    setLinks(newLinks);
    // if (!newLinks) {
    //   setErrors((prev) => ({
    //     ...prev,
    //     links: "At least one link is required",
    //   }));
    // }
  };

  const fetchDropdownValues = async () => {
    try {
      const endpoint = "dropdown/getDropdownValues?category=Privacy";
      fetchData(endpoint)
        .then((result) => {
          if (result && result.data) {
            return result.data;
          } else {
            throw new Error("Invalid data format");
          }
        })
        .then((data) => {
          setDropdownValues(data);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please fill all required fields correctly",
        confirmButtonText: "OK",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Submission",
      text: "Are you sure you want to post this discussion?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "CANCEL",
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);
      try {
        let imageToSend = selectedImage?.startsWith("data:")
          ? selectedImage.split(",")[1]
          : selectedImage;

        const endpoint = "discussion/discussionpost";
        const method = "POST";
        const body = {
          title,
          content,
          tags: tags,
          url: links,
          image: imageToSend || null, // Explicitly set to null if no image
          visibility: privacy.id,
        };
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };

        const response = await fetchData(endpoint, method, body, headers);

        if (!response || !response.success) {
          throw new Error(response?.message || "Failed to post discussion");
        }
        const postID = response.data?.postID || Date.now().toString();
        const newDiscussion = {
          DiscussionID: postID,
          Title: title,
          Content: content,
          Tag: tags,
          ResourceUrl: links,
          Image: selectedImage,
          Visibility: {
            id: privacy.id,
            value: privacy.value,
          },
          comment: [],
        };

        // Only update if setDiscussions is provided
        if (typeof setDiscussions === "function") {
          setDiscussions((prev) => [
            newDiscussion,
            ...(Array.isArray(prev) ? prev : []),
          ]);
        }

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message || "Discussion Posted Successfully",
          confirmButtonText: "OK",
        });

        // Reset form
        setTitle("");
        setContent("");
        setTags("");
        setLinks("");
        setSelectedImage(null);
        setTagInput("");
        setLinkInput("");
        setPrivacy({ id: "", value: "" });
        closeModal();
      } catch (error) {
        console.error("Submission error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Something went wrong, try again",
          confirmButtonText: "OK",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCloseModal = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Any unsaved changes will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, close it!",
      cancelButtonText: "No, keep editing!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Reset the form
        setTitle("");
        setContent("");
        setTags("");
        setLinks("");
        setSelectedImage(null);
        setTagInput("");
        setLinkInput("");
        setPrivacy({ id: "", value: "" });
        setErrors({});

        // Close the modal
        closeModal();
      }
    });
  };

  useEffect(() => {
    try {
      fetchDropdownValues();
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="border border-gray-300 rounded-lg p-4"
      >
        <h3 className="text-lg font-bold mb-4">Start a New Discussion</h3>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="title">
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
              setErrors((prev) => ({ ...prev, title: null }));
            }}
            required
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
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
              setErrors((prev) => ({ ...prev, content: null }));
            }}
            className={`border rounded-lg h-48 ${errors.content ? "border-red-500" : ""
              }`}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['clean']
              ]
            }}
            formats={[
              'header',
              'bold', 'italic', 'underline', 'strike',
              'code-block',
              'list', 'bullet',
              'clean'
            ]}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
        </div>

        <div className="mb-4 pt-8">
          <label className="block text-gray-700 font-bold mb-2">
            Tags<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2 border rounded-lg ${errors.tags ? "border-red-500" : ""
              }`}
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyPress={handleTagInputKeyPress}
            placeholder="Press Enter to add a tag"
          />
          <div className="mt-2 flex flex-wrap">
            {tags
              .split(",")
              .filter((tag) => tag)
              .map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center bg-DGXgreen text-white rounded-full px-3 py-1 mr-2 mt-2"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    className="ml-2 focus:outline-none"
                    onClick={() => removeTag(tag)}
                  >
                    <FaWindowClose />
                  </button>
                </div>
              ))}
          </div>
          {errors.tags && (
            <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Links
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2 border rounded-lg ${errors.links ? "border-red-500" : ""
              }`}
            value={linkInput}
            onChange={handleLinkInputChange}
            onKeyPress={handleLinkInputKeyPress}
            placeholder="Press Enter to add a link"
          />
          <div className="mt-2 flex flex-wrap">
            {links
              .split(",")
              .filter((link) => link)
              .map((link, index) => (
                <div
                  key={index}
                  className="flex items-center bg-DGXgreen text-white rounded-full px-3 py-1 mr-2 mt-2"
                >
                  <span>{link}</span>
                  <button
                    type="button"
                    className="ml-2 focus:outline-none"
                    onClick={() => removeLink(link)}
                  >
                    <FaWindowClose />
                  </button>
                </div>
              ))}
          </div>
          {errors.links && (
            <p className="text-red-500 text-sm mt-1">{errors.links}</p>
          )}
        </div>

        <div className="mb-4 relative">
          <label className="block text-gray-700 font-bold mb-2">Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={`border w-full p-2 ${errors.image ? "border-red-500" : ""
              }`}
          />

          {errors.image && (
            <p className="text-red-500 text-sm">{errors.image}</p>
          )}

          {selectedImage && (
            <div className="mt-2">
              <img src={selectedImage} alt="Selected" className="max-h-40" />
              <button
                type="button"
                className="text-red-500 text-sm mt-1"
                onClick={() => {
                  setSelectedImage(null);
                  setErrors((prev) => ({ ...prev, image: null }));
                }}
              >
                Remove Image
              </button>
            </div>
          )}

          {/* Validation message positioned at the bottom-left */}
          <div className="absolute bottom-0 right-0 text-xs text-DGXblue mt-1">
            <span>Max size: 50KB | Formats: .jpeg, .png .svg</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Privacy
            <span className="text-red-500">*</span>
          </label>
          <select
            value={privacy.value}
            onChange={(e) => {
              const selectedOption = dropdownValues.find(
                (item) => item.ddValue.toLowerCase() === e.target.value
              );
              if (selectedOption) {
                setPrivacy({
                  id: selectedOption.idCode,
                  value: selectedOption.ddValue.toLowerCase(),
                });
                setErrors((prev) => ({ ...prev, privacy: null }));
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg ${errors.privacy ? "border-red-500" : ""
              }`}
          >
            <option value="">Select Privacy</option>
            {dropdownValues.map((item) => (
              <option key={item.idCode} value={item.ddValue.toLowerCase()}>
                {item.ddValue}
              </option>
            ))}
          </select>
          {errors.privacy && (
            <p className="text-red-500 text-sm mt-1">{errors.privacy}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
            onClick={handleCloseModal}
          >
            Close
          </button>
          <button
            type="submit"
            className="bg-DGXgreen text-white py-2 px-4 rounded-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </>
  );
};

export default AddDiscussion;

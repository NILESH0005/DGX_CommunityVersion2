import React, { useState, useRef, useEffect, useContext } from "react";
import ByteArrayImage from "../../../../utils/ByteArrayImage";
import FileUploader from "../../../../container/FileUploader";
import {
  FaEdit,
  FaTrash,
  FaFolder,
  FaTimes,
  FaImage,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";
import Swal from "sweetalert2";
import ApiContext from "../../../../context/ApiContext";

const EditModule = ({
  module,
  onDelete,
  onViewSubmodules,
  onUpdateSuccess,
}) => {
  const [editedModule, setEditedModule] = useState(module);
  const [isEditing, setIsEditing] = useState(false);
  const [isImageEditing, setIsImageEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const textareaRef = useRef(null);
  const descriptionRef = useRef(null);
  const [isDescriptionClamped, setIsDescriptionClamped] = useState(false);
  const { userToken, fetchData } = useContext(ApiContext);

  // useEffect(() => {
  //   console.log("edddddittt", editedModule);

  //   if (editedModule.ModuleImageUrl) {
  //     setImagePreview(editedModule.ModuleImageUrl);
  //     return;
  //   }
  //   if (editedModule.ModuleImage?.data) {
  //     setImagePreview(
  //       `data:${editedModule.ModuleImage.contentType || "image/jpeg"};base64,${
  //         editedModule.ModuleImage.data
  //       }`
  //     );
  //     return;
  //   }
  //   if (editedModule.ModuleImagePath) {
  //     setImagePreview(
  //       `${window.location.origin}/${editedModule.ModuleImagePath}`
  //     );
  //     return;
  //   }

  //   // ✅ Fallback → No image
  //   setImagePreview(null);
  // }, [editedModule]);

  // ✅ Decide which image to show based on priority

  useEffect(() => {
    setEditedModule(module);
    // ✅ Priority 1: If ModuleImageUrl exists → use it directly
    if (module.ModuleImageUrl) {
      setImagePreview(module.ModuleImageUrl);
      return;
    }

    // ✅ Priority 2: If ModuleImage (byte array) exists → render as base64
    if (module.ModuleImage?.data) {
      setImagePreview(
        `data:${module.ModuleImage.contentType || "image/jpeg"};base64,${
          module.ModuleImage.data
        }`
      );
      return;
    }

    // ✅ Priority 3: If ModuleImagePath exists → serve from local upload folder
    if (module.ModuleImagePath) {
      setImagePreview(`${window.location.origin}/${module.ModuleImagePath}`);
      return;
    }

    // ✅ Fallback → No image
    setImagePreview(null);
  }, [module]);

  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight,
        100
      )}px`;
    }
  }, [editedModule.ModuleDescription, isEditing]);

  useEffect(() => {
    if (descriptionRef.current && !isEditing) {
      const element = descriptionRef.current;
      setIsDescriptionClamped(element.scrollHeight > element.clientHeight);
    }
  }, [editedModule.ModuleDescription, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedModule((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (uploadResult) => {
    const { filePath } = uploadResult;
    const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;
    const newImageUrl = `${baseUploadsUrl}/${filePath}`;

    setImagePreview(newImageUrl);
    setIsImageEditing(false);

    setEditedModule((prev) => ({
      ...prev,
      ModuleImagePath: filePath,
      ModuleImageUrl: newImageUrl,
      ModuleImage: null,
    }));
  };

  const handleCancelImageEdit = () => {
    setIsImageEditing(false);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleSaveChanges = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save these changes?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Save it!",
    });

    if (result.isConfirmed) {
      try {
        const endpoint = `lmsEdit/updateModule/${editedModule.ModuleID}`;
        const method = "POST";

        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };

        // Preserve the existing image paths/URLs
        const body = {
          ModuleName: editedModule.ModuleName,
          ModuleDescription: editedModule.ModuleDescription,
          ModuleImageUrl: editedModule.ModuleImageUrl, // Keep original URL
          ModuleImagePath: editedModule.ModuleImagePath, // Keep original path
          SortingOrder: editedModule.SortingOrder || 1,
        };

        const response = await fetchData(endpoint, method, body, headers);

        if (response && response.success) {
          Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Module has been updated successfully.",
          });

          const updatedModule = {
            ...module, // Start with original module
            ...response.data, // Apply server updates
            ModuleImageUrl: editedModule.ModuleImageUrl,
            ModuleImagePath: editedModule.ModuleImagePath,
          };

          // Notify parent of the update
          if (onUpdateSuccess) {
            onUpdateSuccess(updatedModule);
          }

          setIsEditing(false);
        } else {
          throw new Error(response.message || "Failed to update module.");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to update module: ${error.message}`,
        });
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 w-full border border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {isImageEditing ? (
        <div className="h-full flex flex-col items-center justify-center p-4 bg-black bg-opacity-70">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-32 object-contain mb-4 transition-opacity duration-300"
            />
          ) : (
            <p className="text-gray-200">No Image Available</p>
          )}

          <FileUploader
            moduleName="LMS"
            folderName="module-banners"
            onUploadComplete={handleImageUpload}
            accept="image/*"
            maxSize={200 * 1024}
            label="Upload Banner Image"
          />

          <div className="flex gap-2 flex-wrap justify-center mt-2">
            <button
              type="button"
              onClick={handleCancelImageEdit}
              className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-xs transition-colors duration-200 flex items-center"
            >
              <FaTimes className="mr-1" />
              Cancel
            </button>
          </div>
        </div>
      ) : imagePreview ? (
        <div className="relative w-full h-full">
          <img
            src={imagePreview}
            alt={editedModule.ModuleName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            }}
          />
          {isEditing && (
            <button
              onClick={() => setIsImageEditing(true)}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow transition-all duration-200 hover:scale-110"
              data-tooltip-id="edit-image-tooltip"
              data-tooltip-content="Edit Image"
            >
              <FaEdit size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
          {isEditing ? (
            <div className="text-center p-4">
              <p className="text-gray-200 mb-3 text-sm">No Image Available</p>
              <button
                onClick={() => setIsImageEditing(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200 shadow-md hover:shadow-lg flex items-center mx-auto"
              >
                <FaImage className="mr-1" />
                Add Image
              </button>
            </div>
          ) : (
            <p className="text-gray-200">No Image Available</p>
          )}
        </div>
      )}

      {/* ✅ Content Section */}
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <div className="flex-grow">
          {isEditing ? (
            <div className="space-y-4 h-full flex flex-col">
              <div>
                <label
                  htmlFor="ModuleName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Module Name
                </label>
                <input
                  type="text"
                  id="ModuleName"
                  name="ModuleName"
                  value={editedModule.ModuleName}
                  onChange={handleChange}
                  className="w-full border border-DGXgreen dark:border-DGXgreen dark:bg-DGXblue dark:text-DGXwhite p-2 rounded-md focus:ring-2 focus:ring-DGXgreen focus:border-DGXgreen transition-all duration-200"
                  placeholder="Module Name"
                />
              </div>
              <div className="flex-grow">
                <label
                  htmlFor="ModuleDescription"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  ref={textareaRef}
                  id="ModuleDescription"
                  name="ModuleDescription"
                  value={editedModule.ModuleDescription || ""}
                  onChange={handleChange}
                  className="w-full border border-DGXgreen dark:border-DGXgreen dark:bg-DGXblue dark:text-DGXwhite p-2 rounded-md focus:ring-2 focus:ring-DGXgreen focus:border-DGXgreen transition-all duration-200 flex-grow"
                  placeholder="Module Description"
                  style={{ minHeight: "100px" }}
                />
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 flex items-center"
                  >
                    ✅ Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center"
                  >
                    ❌ Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                {editedModule.ModuleName}
              </h3>
              <div className="prose dark:prose-invert max-w-none mb-2">
                <div
                  ref={descriptionRef}
                  className={`text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm sm:text-base ${
                    !showFullDescription ? "line-clamp-3" : ""
                  }`}
                >
                  {editedModule.ModuleDescription || "No description provided"}
                </div>
                {(isDescriptionClamped || showFullDescription) && (
                  <button
                    onClick={toggleDescription}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm mt-1 flex items-center"
                  >
                    {showFullDescription ? (
                      <>
                        <FaAngleUp className="mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <FaAngleDown className="mr-1" />
                        Read More
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
              data-tooltip-id="edit-tooltip"
              data-tooltip-content="Edit Module"
            >
              <FaEdit size={14} />
            </button>
            <button
              onClick={() => onDelete(editedModule.ModuleID)}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
              data-tooltip-id="delete-tooltip"
              data-tooltip-content="Delete Module"
            >
              <FaTrash size={14} />
            </button>
            {onViewSubmodules && (
              <button
                onClick={() => onViewSubmodules(editedModule.ModuleID)}
                className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center"
                data-tooltip-id="submodules-tooltip"
                data-tooltip-content="View Submodules"
              >
                <FaFolder size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ✅ Tooltips */}
      <ReactTooltip id="edit-tooltip" place="top" effect="solid" />
      <ReactTooltip id="delete-tooltip" place="top" effect="solid" />
      <ReactTooltip id="submodules-tooltip" place="top" effect="solid" />
      <ReactTooltip id="edit-image-tooltip" place="top" effect="solid" />
    </div>
  );
};

export default EditModule;

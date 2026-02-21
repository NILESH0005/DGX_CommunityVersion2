import React, { useState, useRef, useEffect, useContext } from "react";
import ByteArrayImage from "../../../../utils/ByteArrayImage";
import FileUploader from "../../../../container/FileUploader";
import Noimage from "../../../../../public/images";
import {
  FaEdit,
  FaTrash,
  FaFolder,
  FaTimes,
  FaImage,
  FaAngleDown,
  FaAngleUp,
  FaExclamationCircle,
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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const textareaRef = useRef(null);
  const descriptionRef = useRef(null);
  const [isDescriptionClamped, setIsDescriptionClamped] = useState(false);
  const { userToken, fetchData } = useContext(ApiContext);

  // Validation rules
  const validationRules = {
    ModuleName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_&@.,!?()]+$/,
      message: {
        required: "Module name is required",
        minLength: "Module name must be at least 2 characters",
        maxLength: "Module name cannot exceed 100 characters",
        pattern: "Module name contains invalid characters",
      },
    },
    ModuleDescription: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      pattern: /^[a-zA-Z0-9\s\-_&@.,!?()\n\r]*$/,
      message: {
        required: "Description is required",
        minLength: "Description must be at least 10 characters",
        maxLength: "Description cannot exceed 1000 characters",
        pattern: "Description contains invalid characters",
      },
    },
  };

  // Validation function
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    const errors = [];

    if (rules.required && (!value || value.trim() === "")) {
      errors.push(rules.message.required);
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      errors.push(rules.message.minLength);
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors.push(rules.message.maxLength);
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push(rules.message.pattern);
    }

    return errors.length > 0 ? errors[0] : "";
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, editedModule[field] || "");
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    setEditedModule(module);

    if (module.ModuleImageUrl && typeof module.ModuleImageUrl === "string") {
      setImagePreview(module.ModuleImageUrl);
      return;
    }
    if (module.ModuleImage?.data && typeof module.ModuleImage.data === "string") {
      setImagePreview(
        `data:${module.ModuleImage.contentType || "image/jpeg"};base64,${
          module.ModuleImage.data
        }`
      );
      return;
    }
    if (module.ModuleImagePath && typeof module.ModuleImagePath === "string") {
      const cleanPath = module.ModuleImagePath.replace(/^\/+/, "");
      setImagePreview(`${window.location.origin}/${cleanPath}`);
      return;
    }

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

  // Auto-validate when editing starts
  useEffect(() => {
    if (isEditing) {
      validateForm();
    } else {
      setErrors({});
      setTouched({});
    }
  }, [isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedModule((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field in real-time
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleImageUpload = (uploadResult) => {
    if (!uploadResult || typeof uploadResult !== "object") {
      console.error("Invalid upload result:", uploadResult);
      return;
    }

    const { filePath } = uploadResult;

    if (typeof filePath !== "string") {
      console.error("Invalid filePath:", filePath);
      return;
    }

    const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;
    const cleanFilePath = filePath.replace(/^\/+/, "");
    const newImageUrl = `${baseUploadsUrl}/${cleanFilePath}`;

    setImagePreview(newImageUrl);
    setIsImageEditing(false);

    setEditedModule((prev) => ({
      ...prev,
      ModuleImagePath: cleanFilePath,
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
    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();

    if (!isValid) {
      // Show error message for first invalid field
      const firstErrorField = Object.keys(errors)[0];
      const firstError = errors[firstErrorField];
      
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: `${firstErrorField}: ${firstError}`,
        confirmButtonColor: "#3085d6",
      });
      
      // Scroll to first error field
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
      
      return;
    }

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

        const body = {
          ModuleName: editedModule.ModuleName.trim(),
          ModuleDescription: editedModule.ModuleDescription.trim(),
          ModuleImageUrl: editedModule.ModuleImageUrl,
          ModuleImagePath: editedModule.ModuleImagePath,
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
            ...module,
            ...response.data,
            ModuleImageUrl: editedModule.ModuleImageUrl,
            ModuleImagePath: editedModule.ModuleImagePath,
          };
          
          if (onUpdateSuccess) {
            onUpdateSuccess(updatedModule);
          }

          setIsEditing(false);
          setErrors({});
          setTouched({});
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

  const handleCancelEdit = () => {
    // Reset form to original values
    setEditedModule(module);
    setErrors({});
    setTouched({});
    setIsEditing(false);
  };

  // Character counter component
  const CharacterCounter = ({ value, maxLength, fieldName }) => {
    if (!maxLength) return null;
    
    const currentLength = value?.length || 0;
    const isNearLimit = currentLength > maxLength * 0.8;
    const isExceeding = currentLength > maxLength;
    
    return (
      <div className={`text-xs mt-1 ${isExceeding ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-gray-500'}`}>
        {currentLength}/{maxLength} characters
        {isExceeding && <span className="ml-2 font-semibold">Exceeds limit!</span>}
      </div>
    );
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
            <img
              src={Noimage}
              alt="No Image Available"
              className="max-h-32 object-contain mb-4 opacity-70"
            />
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
              <img
                src={Noimage}
                alt="No Image Available"
                className="max-h-20 object-contain mb-3 opacity-70 mx-auto"
              />
              <button
                onClick={() => setIsImageEditing(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200 shadow-md hover:shadow-lg flex items-center mx-auto"
              >
                <FaImage className="mr-1" />
                Add Image
              </button>
            </div>
          ) : (
            <img
              src={Noimage}
              alt="No Image Available"
              className="max-h-20 object-contain opacity-70"
            />
          )}
        </div>
      )}
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <div className="flex-grow">
          {isEditing ? (
            <div className="space-y-4 h-full flex flex-col">
              {/* Module Name Field */}
              <div>
                <label
                  htmlFor="ModuleName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Module Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="ModuleName"
                    name="ModuleName"
                    value={editedModule.ModuleName || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full border ${
                      errors.ModuleName && touched.ModuleName
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-DGXgreen dark:border-DGXgreen focus:ring-2 focus:ring-DGXgreen focus:border-DGXgreen"
                    } dark:bg-DGXblue dark:text-DGXwhite p-2 rounded-md transition-all duration-200`}
                    placeholder="Enter module name"
                  />
                  {errors.ModuleName && touched.ModuleName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FaExclamationCircle className="text-red-500" />
                    </div>
                  )}
                </div>
                {errors.ModuleName && touched.ModuleName && (
                  <div className="flex items-center mt-1 text-red-500 text-xs">
                    <FaExclamationCircle className="mr-1" size={10} />
                    {errors.ModuleName}
                  </div>
                )}
                <CharacterCounter
                  value={editedModule.ModuleName}
                  maxLength={validationRules.ModuleName.maxLength}
                  fieldName="ModuleName"
                />
              </div>

              {/* Module Description Field */}
              <div className="flex-grow">
                <label
                  htmlFor="ModuleDescription"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description *
                </label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    id="ModuleDescription"
                    name="ModuleDescription"
                    value={editedModule.ModuleDescription || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full border ${
                      errors.ModuleDescription && touched.ModuleDescription
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-DGXgreen dark:border-DGXgreen focus:ring-2 focus:ring-DGXgreen focus:border-DGXgreen"
                    } dark:bg-DGXblue dark:text-DGXwhite p-2 rounded-md transition-all duration-200 flex-grow`}
                    placeholder="Enter module description (minimum 10 characters)"
                    style={{ minHeight: "100px" }}
                    rows={4}
                  />
                  {errors.ModuleDescription && touched.ModuleDescription && (
                    <div className="absolute right-3 top-3">
                      <FaExclamationCircle className="text-red-500" />
                    </div>
                  )}
                </div>
                {errors.ModuleDescription && touched.ModuleDescription && (
                  <div className="flex items-center mt-1 text-red-500 text-xs">
                    <FaExclamationCircle className="mr-1" size={10} />
                    {errors.ModuleDescription}
                  </div>
                )}
                <CharacterCounter
                  value={editedModule.ModuleDescription}
                  maxLength={validationRules.ModuleDescription.maxLength}
                  fieldName="ModuleDescription"
                />
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={Object.keys(errors).some(key => errors[key])}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 flex items-center ${
                    Object.keys(errors).some(key => errors[key])
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white`}
                >
                  ✅ Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center"
                >
                  ❌ Cancel
                </button>
              </div>

              {/* Validation Summary (optional) */}
              {Object.keys(errors).length > 0 && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <p className="text-red-600 dark:text-red-400 text-sm font-semibold">
                    Please fix the following errors:
                  </p>
                  <ul className="list-disc list-inside text-red-500 dark:text-red-300 text-xs mt-1">
                    {Object.entries(errors).map(([field, error]) => (
                      error && (
                        <li key={field}>
                          {field === "ModuleName" ? "Module Name" : "Description"}: {error}
                        </li>
                      )
                    ))}
                  </ul>
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
      <ReactTooltip id="edit-tooltip" place="top" effect="solid" />
      <ReactTooltip id="delete-tooltip" place="top" effect="solid" />
      <ReactTooltip id="submodules-tooltip" place="top" effect="solid" />
      <ReactTooltip id="edit-image-tooltip" place="top" effect="solid" />
    </div>
  );
};

export default EditModule;
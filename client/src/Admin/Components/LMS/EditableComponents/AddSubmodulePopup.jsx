import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import FileUploader from "../../../../container/FileUploader";
import { FaExclamationCircle, FaTimes } from "react-icons/fa";

const AddSubmodulePopup = ({ moduleId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    SubModuleName: "",
    SubModuleDescription: "",
    SubModuleImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef(null);

  // Validation rules only for title and description
  const validationRules = {
    SubModuleName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_&@.,!?()]+$/,
      message: {
        required: "Submodule name is required",
        minLength: "Must be at least 2 characters",
        maxLength: "Cannot exceed 100 characters",
        pattern: "Contains invalid characters",
      },
    },
    SubModuleDescription: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      pattern: /^[a-zA-Z0-9\s\-_&@.,!?()\n\r]*$/,
      message: {
        required: "Description is required",
        minLength: "Must be at least 10 characters",
        maxLength: "Cannot exceed 1000 characters",
        pattern: "Contains invalid characters",
      },
    },
  };

  // Validate field
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    if (rules.required && (!value || value.trim() === "")) {
      return rules.message.required;
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      return rules.message.minLength;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return rules.message.maxLength;
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.message.pattern;
    }

    return "";
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validateField('SubModuleName', formData.SubModuleName);
    if (nameError) newErrors.SubModuleName = nameError;

    const descError = validateField('SubModuleDescription', formData.SubModuleDescription);
    if (descError) newErrors.SubModuleDescription = descError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight,
        80
      )}px`;
    }
  }, [formData.SubModuleDescription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
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

  const handleImageUpload = (result) => {
    if (result.error) {
      return;
    }

    if (result.file) {
      const previewUrl = URL.createObjectURL(result.file);
      setImagePreview(previewUrl);

      setFormData((prev) => ({
        ...prev,
        SubModuleImage: result.file,
        SubModuleImagePath: result.filePath, 
      }));
    }
  };

  const CharacterCounter = ({ value, maxLength }) => {
    if (!maxLength) return null;
    
    const currentLength = value?.length || 0;
    const isExceeding = currentLength > maxLength;
    
    return (
      <div className={`text-xs mt-1 ${isExceeding ? 'text-red-500' : 'text-gray-500'}`}>
        {currentLength}/{maxLength} characters
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();

    if (!isValid) {
      // Show SweetAlert with validation errors
      const errorMessages = Object.entries(errors)
        .filter(([_, error]) => error)
        .map(([field, error]) => {
          const fieldName = field === "SubModuleName" ? "Submodule Name" : 
                           field === "SubModuleDescription" ? "Description" : field;
          return `${fieldName}: ${error}`;
        })
        .join('<br>');

      Swal.fire({
        title: "Validation Error",
        html: `Please fix the following errors:<br><br>${errorMessages}`,
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setIsUploading(true);

    try {
      const newSubmodule = await onSave(moduleId, formData);
      if (newSubmodule) {
        Swal.fire({
          title: "Success!",
          text: "Submodule added successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        onClose();
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to add submodule",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Check if button should be disabled
  const hasErrors = Object.keys(errors).some(key => errors[key]);
  const isButtonDisabled = isUploading || hasErrors;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Add New Submodule
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Submodule Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Submodule Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="SubModuleName"
                  value={formData.SubModuleName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.SubModuleName && touched.SubModuleName
                      ? "border-red-500 focus:border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  }`}
                  placeholder="Enter submodule name"
                />
                {errors.SubModuleName && touched.SubModuleName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaExclamationCircle className="text-red-500" />
                  </div>
                )}
              </div>
              {errors.SubModuleName && touched.SubModuleName && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <FaExclamationCircle className="mr-1" size={12} />
                  {errors.SubModuleName}
                </div>
              )}
              <CharacterCounter
                value={formData.SubModuleName}
                maxLength={validationRules.SubModuleName.maxLength}
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  name="SubModuleDescription"
                  value={formData.SubModuleDescription}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.SubModuleDescription && touched.SubModuleDescription
                      ? "border-red-500 focus:border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  }`}
                  placeholder="Enter description (minimum 10 characters)"
                  rows="3"
                />
                {errors.SubModuleDescription && touched.SubModuleDescription && (
                  <div className="absolute right-3 top-3">
                    <FaExclamationCircle className="text-red-500" />
                  </div>
                )}
              </div>
              {errors.SubModuleDescription && touched.SubModuleDescription && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <FaExclamationCircle className="mr-1" size={12} />
                  {errors.SubModuleDescription}
                </div>
              )}
              <CharacterCounter
                value={formData.SubModuleDescription}
                maxLength={validationRules.SubModuleDescription.maxLength}
              />
            </div>

            {/* Banner Image Field (No Validation) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Banner Image
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-40 w-full object-contain rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
              )}

              {/* File Uploader */}
              <FileUploader
                moduleName="LMS"
                folderName="submodule-banners"
                onUploadComplete={handleImageUpload}
                accept="image/*"
                maxSize={200 * 1024}
                label={imagePreview ? "Change Image" : "Upload Image"}
              />
              
              {/* Optional image info */}
              <div className="text-xs text-gray-500 mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="font-medium mb-1">Image Info (Optional):</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Recommended size: Less than 200KB</li>
                  <li>Formats: JPG, PNG, GIF, WEBP, SVG</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl transition-all font-medium shadow-lg hover:shadow-xl ${
                  isButtonDisabled
                    ? "bg-gray-400 dark:bg-gray-500 cursor-not-allowed text-gray-700 dark:text-gray-300"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                }`}
                disabled={isButtonDisabled}
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  "Add Submodule"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSubmodulePopup;
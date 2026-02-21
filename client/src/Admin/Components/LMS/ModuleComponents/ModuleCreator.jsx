import React, { useState, useContext, useEffect  } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import ApiContext from "../../../../context/ApiContext"; // Adjust path as needed
import FileUploader from "../../../../container/FileUploader"; // Adjust path as needed

const ModuleCreator = ({ onCreate, onCancel, existingModules = [] }) => {
  const [isCreated, setIsCreated] = useState(false);
  const [newModule, setNewModule] = useState({
    id: uuidv4(),
    name: "",
    description: "",
    banner: null,
    bannerPath: null,
    bannerUrl: null,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const { userToken } = useContext(ApiContext);

  const validationRules = {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_&@.,!?()]+$/,
      message: {
        required: "Module name is required",
        minLength: "Module name must be at least 3 characters",
        maxLength: "Module name cannot exceed 100 characters",
        pattern: "Module name contains invalid characters",
      },
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 500,
      message: {
        required: "Description is required",
        minLength: "Description must be at least 10 characters",
        maxLength: "Description cannot exceed 500 characters",
      },
    },
    banner: {
      required: true,
      message: {
        required: "Banner image is required",
      },
    },
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    const errors = [];

    if (rules.required) {
      if (name === "banner") {
        // For banner, check if bannerUrl exists
        if (!newModule.bannerUrl && !newModule.banner) {
          errors.push(rules.message.required);
        }
      } else if (!value || value.trim() === "") {
        errors.push(rules.message.required);
      }
    }

    if (rules.minLength && value && value.trim().length < rules.minLength) {
      errors.push(rules.message.minLength);
    }

    if (rules.maxLength && value && value.trim().length > rules.maxLength) {
      errors.push(rules.message.maxLength);
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push(rules.message.pattern);
    }

    return errors.length > 0 ? errors[0] : "";
  };

  const validateForm = () => {
    const newErrors = {};
    const nameError = validateField("name", newModule.name);
    if (nameError) newErrors.name = nameError;
    const descError = validateField("description", newModule.description);
    if (descError) newErrors.description = descError;
    const bannerError = validateField(
      "banner",
      newModule.bannerUrl || newModule.banner
    );
    if (bannerError) newErrors.banner = bannerError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      newModule.name.trim().length >= 3 &&
      newModule.description.trim().length >= 10 &&
      (newModule.bannerUrl || newModule.banner)
    );
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [newModule, touched]);

  const handleCreate = () => {
    // Mark all fields as touched
    const allTouched = {
      name: true,
      description: true,
      banner: true,
    };
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();

    if (!isValid) {
      // Show first error in alert
      const firstErrorField = Object.keys(errors)[0];
      const firstError = errors[firstErrorField];

      // Create error message
      let errorMessage = "Please fix the following errors:";
      Object.entries(errors).forEach(([field, error]) => {
        if (error) {
          errorMessage += `\n• ${
            field.charAt(0).toUpperCase() + field.slice(1)
          }: ${error}`;
        }
      });

      // Show alert
      alert(errorMessage);
      return;
    }

    try {
      const module = {
        ModuleName: newModule.name.trim(),
        ModuleDescription: newModule.description.trim(),
        ModuleImage: newModule.banner || null,
        ModuleImagePath: newModule.bannerPath || null,
        ModuleImageUrl: newModule.bannerUrl || null,
        subModules: [],
        createdAt: new Date().toISOString(),
      };

      onCreate(module);
      setIsCreated(true);
    } catch (error) {
      console.error("Error creating module:", error);
      setErrors({ submit: "Failed to create module" });
    }
  };

  const handleImageUpload = (uploadResult) => {
    if (!uploadResult || !uploadResult.success) {
      setErrors({
        ...errors,
        banner: uploadResult?.message || "Image upload failed",
      });
      setIsUploading(false);
      return;
    }

    const { filePath } = uploadResult;

    if (!filePath) {
      setErrors({ ...errors, banner: "No file path received from server" });
      setIsUploading(false);
      return;
    }

    // Clean and construct URL
    const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;
    const cleanFilePath = filePath.replace(/^\/+/, "");
    const imageUrl = `${baseUploadsUrl}/${cleanFilePath}`;

    // Store ONLY the file path string, not the entire object
    setNewModule((prev) => ({
      ...prev,
      bannerPath: cleanFilePath,
      bannerUrl: imageUrl,
      banner: {
        success: uploadResult.success,
        filePath: cleanFilePath,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
      },
    }));

    // Mark banner as touched and clear error
    setTouched((prev) => ({ ...prev, banner: true }));
    setErrors((prev) => ({ ...prev, banner: null }));

    setIsUploading(false);
  };

  const handleRemoveImage = () => {
    setNewModule((prev) => ({
      ...prev,
      banner: null,
      bannerPath: null,
      bannerUrl: null,
    }));

    // Set error if banner was required
    setErrors((prev) => ({ ...prev, banner: "Banner image is required" }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewModule((prev) => ({ ...prev, [name]: value }));

    // Mark field as touched
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  // Character counter component
  const CharacterCounter = ({ value, maxLength, fieldName }) => {
    if (!maxLength) return null;

    const currentLength = value?.trim().length || 0;
    const isNearLimit = currentLength > maxLength * 0.8;
    const isExceeding = currentLength > maxLength;

    return (
      <div
        className={`text-xs mt-1 ${
          isExceeding
            ? "text-red-500 font-semibold"
            : isNearLimit
            ? "text-yellow-500"
            : "text-gray-500"
        }`}
      >
        {currentLength}/{maxLength} characters
        {isExceeding && <span className="ml-2">(Exceeds limit!)</span>}
      </div>
    );
  };

  // Render validation error
  const renderError = (fieldName) => {
    if (errors[fieldName] && touched[fieldName]) {
      return (
        <div className="flex items-center mt-1 text-red-500 text-sm">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {errors[fieldName]}
        </div>
      );
    }
    return null;
  };

  if (isCreated) {
    const allModules = [
      ...existingModules,
      {
        ...newModule,
        banner:
          newModule.bannerUrl ||
          (newModule.banner ? URL.createObjectURL(newModule.banner) : null),
        subModules: [],
        createdAt: new Date().toISOString(),
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-4xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Module Created Successfully!
              </h3>
              <p className="text-gray-600">
                Your new learning module is ready for content
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setIsCreated(false);
                  setNewModule({
                    id: uuidv4(),
                    name: "",
                    description: "",
                    banner: null,
                    bannerPath: null,
                    bannerUrl: null,
                  });
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 font-medium"
              >
                Create Another
              </button>
              <button
                onClick={onCancel}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:scale-95 transition-all duration-200 font-medium"
              >
                Back to Modules
              </button>
            </div>
          </div>
        </motion.div>

        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          Your Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allModules.map((module) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                {(module.bannerUrl || module.banner) && (
                  <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg border">
                    <img
                      src={
                        module.bannerUrl ||
                        (module.banner && typeof module.banner !== "string"
                          ? URL.createObjectURL(module.banner)
                          : module.banner)
                      }
                      alt={module.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-image.png"; // Add a fallback
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {module.name}
                  </h3>
                  {module.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {module.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {module.subModules?.length || 0} submodules
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(module.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Create New Module
      </h2>

      <div className="space-y-5">
        {/* Module Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Introduction to React"
            className={`border w-full p-3 rounded-lg focus:outline-none transition ${
              errors.name && touched.name
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-blue-500"
            }`}
            value={newModule.name}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {renderError("name")}
          <CharacterCounter
            value={newModule.name}
            maxLength={validationRules.name.maxLength}
            fieldName="name"
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            placeholder="Brief description of what this module covers..."
            className={`border w-full p-3 rounded-lg focus:outline-none transition h-32 ${
              errors.description && touched.description
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-blue-500"
            }`}
            value={newModule.description}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {renderError("description")}
          <CharacterCounter
            value={newModule.description}
            maxLength={validationRules.description.maxLength}
            fieldName="description"
          />
        </div>

        {/* Banner Image Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banner Image <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-blue-500 mb-2">
            Recommended size: <strong>800×400px</strong> | Max:{" "}
            <strong>200KB</strong>
          </p>

          {newModule.bannerUrl || newModule.banner ? (
            <div className="relative">
              <img
                src={
                  newModule.bannerUrl ||
                  (newModule.banner && typeof newModule.banner !== "string"
                    ? URL.createObjectURL(newModule.banner)
                    : newModule.banner)
                }
                alt="Preview"
                className="h-40 w-full object-contain border rounded-lg mb-3 bg-gray-50"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
                type="button"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div
              className={
                errors.banner && touched.banner
                  ? "border border-red-500 rounded-lg p-2"
                  : ""
              }
            >
              <FileUploader
                moduleName="LMS"
                folderName="module-banners"
                onUploadComplete={handleImageUpload}
                accept="image/*"
                maxSize={200 * 1024}
                label="Upload Banner Image"
                previewType="image"
              />
            </div>
          )}

          {renderError("banner")}

          {isUploading && (
            <div className="flex items-center gap-2 text-blue-600 text-sm mt-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Uploading image...
            </div>
          )}
        </div>
      </div>

      {errors.submit && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm font-semibold mb-1">
            Please fix the following issues:
          </p>
          <ul className="list-disc list-inside text-yellow-600 text-sm">
            {errors.name && touched.name && <li>Module Name: {errors.name}</li>}
            {errors.description && touched.description && (
              <li>Description: {errors.description}</li>
            )}
            {errors.banner && touched.banner && (
              <li>Banner Image: {errors.banner}</li>
            )}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-8 border-t mt-8">
        <button
          onClick={onCancel}
          type="button"
          className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:scale-95 transition-all duration-200 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!isFormValid() || isUploading}
          className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200 ${
            !isFormValid() || isUploading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          }`}
        >
          {isUploading ? "Uploading..." : "Create Module"}
        </button>
      </div>
    </motion.div>
  );
};

export default ModuleCreator;

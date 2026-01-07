import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, X, Check, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import FileUploader from "../../../../container/FileUploader";

const AddSubModuleForm = ({ onAddSubModule, errors: propErrors, setErrors: setPropErrors, onCancel }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newSubModule, setNewSubModule] = useState({
    id: uuidv4(),
    SubModuleName: "",
    SubModuleDescription: "",
    SubModuleImagePath: null,
    SubModuleImageUrl: null,
  });
  
  const [localErrors, setLocalErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules
  const validationRules = {
    SubModuleName: {
      required: true,
      minLength: 3,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_&@.,!?()]+$/,
      message: {
        required: "Submodule name is required",
        minLength: "Submodule name must be at least 3 characters",
        maxLength: "Submodule name cannot exceed 100 characters",
        pattern: "Submodule name contains invalid characters",
      },
    },
    SubModuleDescription: {
      required: true,
      minLength: 10,
      maxLength: 500,
      message: {
        required: "Description is required",
        minLength: "Description must be at least 10 characters",
        maxLength: "Description cannot exceed 500 characters",
      },
    },
    SubModuleImagePath: {
      required: true,
      message: {
        required: "Submodule image is required",
      },
    },
  };

  // Validate a single field
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    const errors = [];

    if (rules.required) {
      if (name === "SubModuleImagePath") {
        // For image, check if path or URL exists
        if (!newSubModule.SubModuleImagePath && !newSubModule.SubModuleImageUrl) {
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

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};

    // Validate SubModuleName
    const nameError = validateField("SubModuleName", newSubModule.SubModuleName);
    if (nameError) newErrors.SubModuleName = nameError;

    // Validate SubModuleDescription
    const descError = validateField("SubModuleDescription", newSubModule.SubModuleDescription);
    if (descError) newErrors.SubModuleDescription = descError;

    // Validate SubModuleImagePath
    const imageError = validateField("SubModuleImagePath", newSubModule.SubModuleImagePath);
    if (imageError) newErrors.SubModuleImagePath = imageError;

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      newSubModule.SubModuleName.trim().length >= 3 &&
      newSubModule.SubModuleDescription.trim().length >= 10 &&
      (newSubModule.SubModuleImagePath || newSubModule.SubModuleImageUrl)
    );
  };

  // Auto-validate when form changes
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [newSubModule, touched]);

  const resetForm = () => {
    setNewSubModule({
      id: uuidv4(),
      SubModuleName: "",
      SubModuleDescription: "",
      SubModuleImagePath: null,
      SubModuleImageUrl: null,
    });
    setLocalErrors({});
    setTouched({});
    if (setPropErrors) setPropErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {
      SubModuleName: true,
      SubModuleDescription: true,
      SubModuleImagePath: true,
    };
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();

    if (!isValid) {
      // Find first error field and scroll to it
      const firstErrorField = Object.keys(localErrors)[0];
      if (firstErrorField) {
        const errorElement = document.getElementById(`${firstErrorField}-error`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    // Call parent add function
    onAddSubModule({
      ...newSubModule,
      SubModuleName: newSubModule.SubModuleName.trim(),
      SubModuleDescription: newSubModule.SubModuleDescription.trim(),
    });

    // Reset form and collapse
    resetForm();
    setIsFormVisible(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsFormVisible(false);
    onCancel?.();
  };

  const handleAddAnother = () => {
    resetForm();
    setIsFormVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubModule(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleImageUpload = (uploadResult) => {
    if (!uploadResult || !uploadResult.success) {
      const errorMsg = uploadResult?.message || "Image upload failed";
      setLocalErrors(prev => ({ ...prev, SubModuleImagePath: errorMsg }));
      if (setPropErrors) setPropErrors(prev => ({ ...prev, SubModuleImagePath: errorMsg }));
      return;
    }

    const { filePath } = uploadResult;

    if (!filePath) {
      const errorMsg = "No file path received from server";
      setLocalErrors(prev => ({ ...prev, SubModuleImagePath: errorMsg }));
      if (setPropErrors) setPropErrors(prev => ({ ...prev, SubModuleImagePath: errorMsg }));
      return;
    }

    // Clean and construct URL
    const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL || "";
    const cleanFilePath = filePath.replace(/^\/+/, "");
    const imageUrl = `${baseUploadsUrl}/${cleanFilePath}`;

    setNewSubModule(prev => ({
      ...prev,
      SubModuleImagePath: cleanFilePath,
      SubModuleImageUrl: imageUrl,
    }));

    // Clear image error
    setLocalErrors(prev => ({ ...prev, SubModuleImagePath: null }));
    if (setPropErrors) setPropErrors(prev => ({ ...prev, SubModuleImagePath: null }));
    setTouched(prev => ({ ...prev, SubModuleImagePath: true }));
  };

  const handleRemoveImage = () => {
    setNewSubModule(prev => ({
      ...prev,
      SubModuleImagePath: null,
      SubModuleImageUrl: null,
    }));
    
    // Set error if image was required
    setLocalErrors(prev => ({ ...prev, SubModuleImagePath: "Submodule image is required" }));
    setTouched(prev => ({ ...prev, SubModuleImagePath: true }));
  };

  // Character counter component
  const CharacterCounter = ({ value, maxLength, fieldName }) => {
    if (!maxLength) return null;
    
    const currentLength = value?.trim().length || 0;
    const isNearLimit = currentLength > maxLength * 0.8;
    const isExceeding = currentLength > maxLength;
    
    return (
      <div className={`text-xs mt-1 ${isExceeding ? 'text-red-500 font-semibold' : isNearLimit ? 'text-yellow-500' : 'text-gray-500'}`}>
        {currentLength}/{maxLength} characters
        {isExceeding && <span className="ml-2">(Exceeds limit!)</span>}
      </div>
    );
  };

  // Render validation error
  const renderError = (fieldName) => {
    const error = localErrors[fieldName] || propErrors?.[fieldName];
    const isTouched = touched[fieldName];
    
    if (error && isTouched) {
      return (
        <motion.div
          id={`${fieldName}-error`}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-600 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
    >
      {/* Header / Toggle */}
      <div
        className="flex items-center justify-between bg-blue-50 px-6 py-4 cursor-pointer hover:bg-blue-100 transition"
        onClick={() => setIsFormVisible((prev) => !prev)}
      >
        <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-blue-600" />
          {isFormVisible ? "Create New Submodule" : "Add Another Submodule"}
        </h3>
        {isFormVisible ? (
          <ChevronUp className="w-5 h-5 text-blue-700" />
        ) : (
          <ChevronDown className="w-5 h-5 text-blue-700" />
        )}
      </div>

      {/* Collapsible Form */}
      <AnimatePresence>
        {isFormVisible && (
          <motion.form
            onSubmit={handleSubmit}
            key="submoduleForm"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-6 space-y-6">
              {/* Submodule Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submodule Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="SubModuleName"
                  placeholder="e.g., React Fundamentals"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    (localErrors.SubModuleName && touched.SubModuleName) || (propErrors?.SubModuleName)
                      ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none transition duration-200`}
                  value={newSubModule.SubModuleName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {renderError("SubModuleName")}
                <CharacterCounter 
                  value={newSubModule.SubModuleName} 
                  maxLength={validationRules.SubModuleName.maxLength} 
                  fieldName="SubModuleName" 
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submodule Image <span className="text-red-500">*</span>
                </label>
                <div className={`rounded-lg border-2 ${
                  (localErrors.SubModuleImagePath && touched.SubModuleImagePath) || (propErrors?.SubModuleImagePath)
                    ? "border-red-500"
                    : "border-gray-200"
                } p-4 transition duration-200`}>
                  {newSubModule.SubModuleImageUrl ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={newSubModule.SubModuleImageUrl}
                          alt="Submodule preview"
                          className="w-full h-48 object-contain rounded-lg border bg-gray-50"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/800x400?text=Image+Failed+to+Load";
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Image uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <FileUploader
                      moduleName="LMS"
                      folderName="subModule-banners"
                      onUploadComplete={handleImageUpload}
                      accept="image/*"
                      maxSize={200 * 1024}
                      label="Upload Submodule Image"
                      previewType="image"
                    />
                  )}
                </div>
                {renderError("SubModuleImagePath")}
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 800×400px, max 200KB. Required field.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="SubModuleDescription"
                  placeholder="What will students learn in this submodule?"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    (localErrors.SubModuleDescription && touched.SubModuleDescription) || (propErrors?.SubModuleDescription)
                      ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none transition duration-200`}
                  rows={4}
                  value={newSubModule.SubModuleDescription}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {renderError("SubModuleDescription")}
                <CharacterCounter 
                  value={newSubModule.SubModuleDescription} 
                  maxLength={validationRules.SubModuleDescription.maxLength} 
                  fieldName="SubModuleDescription" 
                />
              </div>

              {/* Validation Summary */}
              {Object.keys(localErrors).length > 0 && Object.keys(touched).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Please fix the following issues:
                  </h4>
                  <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                    {localErrors.SubModuleName && touched.SubModuleName && (
                      <li>Submodule Name: {localErrors.SubModuleName}</li>
                    )}
                    {localErrors.SubModuleDescription && touched.SubModuleDescription && (
                      <li>Description: {localErrors.SubModuleDescription}</li>
                    )}
                    {localErrors.SubModuleImagePath && touched.SubModuleImagePath && (
                      <li>Submodule Image: {localErrors.SubModuleImagePath}</li>
                    )}
                  </ul>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <motion.button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={!isFormValid()}
                  className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 ${
                    !isFormValid()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  whileHover={isFormValid() ? { scale: 1.02 } : {}}
                  whileTap={isFormValid() ? { scale: 0.98 } : {}}
                >
                  <Check className="w-5 h-5" />
                  Add Submodule
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* "Add Another" Button - Shows when form is collapsed */}
      <AnimatePresence>
        {!isFormVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 border-t border-gray-200">
              <motion.button
                type="button"
                onClick={handleAddAnother}
                className="w-full py-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium flex items-center justify-center gap-2 transition-all duration-200 border border-blue-200"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <PlusCircle className="w-5 h-5" />
                Add Another Submodule
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AddSubModuleForm;
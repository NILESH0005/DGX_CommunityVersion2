import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { compressImage } from '../../../../utils/compressImage';
import { motion } from 'framer-motion';

const ModuleCreator = ({ onCreate, onCancel, existingModules = [] }) => {
  const [isCreated, setIsCreated] = useState(false);
  const [newModule, setNewModule] = useState({
    id: uuidv4(),
    name: '',
    description: '',
    banner: null
  });
  const [errors, setErrors] = useState({});
  const [isCompressing, setIsCompressing] = useState(false);

  const handleCreate = async () => {
    if (!newModule.name.trim()) {
      setErrors({ name: 'Module name is required' });
      return;
    }

    try {
      setIsCompressing(true);
      let compressedBanner = null;
      if (newModule.banner) {
        try {
          compressedBanner = await compressImage(newModule.banner);
        } catch (error) {
          console.error('Image compression failed:', error);
          compressedBanner = await convertFileToBase64(newModule.banner);
        }
      }

      const module = {
        ModuleName: newModule.name.trim(),
        ModuleImage: compressedBanner,
        ModuleDescription: newModule.description.trim(),
        subModules: [],
        createdAt: new Date().toISOString()
      };

      onCreate(module);
      setIsCreated(true);
    } catch (error) {
      console.error('Error creating module:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (200KB = 200 * 1024 bytes)
    if (file.size > 200 * 1024) {
      setErrors({
        ...errors,
        banner: 'Image size must be 200KB or less'
      });
      // Clear the file input
      e.target.value = '';
      return;
    }

    // Clear any previous banner errors
    if (errors.banner) {
      setErrors({
        ...errors,
        banner: null
      });
    }

    setNewModule({ ...newModule, banner: file });
  };

  if (isCreated) {
    const allModules = [...existingModules, {
      ...newModule,
      banner: newModule.banner ? URL.createObjectURL(newModule.banner) : null,
      subModules: [],
      createdAt: new Date().toISOString()
    }];

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
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Module Created Successfully!</h3>
              <p className="text-gray-600">Your new learning module is ready for content</p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setIsCreated(false);
                  setNewModule({
                    id: uuidv4(),
                    name: '',
                    description: '',
                    banner: null
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
                {module.banner && (
                  <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg border">
                    <img
                      src={module.banner}
                      alt={module.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{module.name}</h3>
                  {module.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{module.description}</p>
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
      {/* Header */}
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

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Module Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Introduction to React"
            className={`border w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            value={newModule.name}
            onChange={(e) => {
              setNewModule({ ...newModule, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: null });
            }}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            placeholder="Brief description of what this module covers..."
            className="border w-full p-3 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 transition"
            value={newModule.description}
            onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
          />
        </div>

        {/* Banner Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banner Image
          </label>
          <p className="text-xs text-blue-500 mb-2">
            Recommended size: <strong>800×400px</strong> | Max: <strong>200KB</strong>
          </p>
          <div className="relative">
            <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              {newModule.banner ? (
                <>
                  <img
                    src={URL.createObjectURL(newModule.banner)}
                    alt="Preview"
                    className="h-32 object-contain mb-3 rounded-lg"
                  />
                  <button
                    onClick={() => setNewModule({ ...newModule, banner: null })}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Remove Image
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center w-full cursor-pointer">
                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-sm text-gray-500 mb-1 font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 200KB</p>
                  <input
                    type="file"
                    className="hidden"
                    id="module-banner-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            {errors.banner && <p className="mt-1 text-sm text-red-500">{errors.banner}</p>}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-8 border-t mt-8">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:scale-95 transition-all duration-200 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={isCompressing || (newModule.banner && newModule.banner.size > 200 * 1024)}
          className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200 ${
            isCompressing || (newModule.banner && newModule.banner.size > 200 * 1024)
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          }`}
        >
          {isCompressing ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Creating...
            </span>
          ) : (
            "Create Module"
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ModuleCreator;
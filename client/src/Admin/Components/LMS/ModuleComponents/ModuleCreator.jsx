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
      <div className="bg-white p-6 rounded-lg shadow border-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Module Created Successfully!</h3>
              <p className="text-gray-600 text-sm">Your new learning module is ready for content</p>
            </div>

            <div className="flex justify-center space-x-3">
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
                className="px-4 py-2 bg-DGXblue text-white rounded-md hover:bg-blue-600 transition"
              >
                Create Another
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Back to Modules
              </button>
            </div>
          </div>
        </motion.div>

        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Your Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allModules.map((module) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start space-x-3">
                {module.banner && (
                  <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded border">
                    <img
                      src={module.banner}
                      alt={module.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 truncate">{module.name}</h3>
                  {module.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{module.description}</p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
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
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border-2">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Create New Module</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Introduction to React"
            className={`border w-full p-2 rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            value={newModule.name}
            onChange={(e) => {
              setNewModule({ ...newModule, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: null });
            }}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            placeholder="Brief description of what this module covers..."
            className="border w-full p-2 rounded border-gray-300 h-32"
            value={newModule.description}
            onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banner Image
          </label>
          <div className="relative">
            <div className="text-xs text-DGXblue mb-1">
              <span>Recommended size: 800x400px | Max size: 200KB</span>
            </div>
            <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              {newModule.banner ? (
                <>
                  <img
                    src={URL.createObjectURL(newModule.banner)}
                    alt="Preview"
                    className="h-32 object-contain mb-3 rounded"
                  />
                  <button
                    onClick={() => setNewModule({ ...newModule, banner: null })}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove Image
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center w-full cursor-pointer">
                  <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-sm text-gray-500 mb-1">Click to upload or drag and drop</p>
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
            {errors.banner && <p className="mt-1 text-xs text-red-500">{errors.banner}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={isCompressing || (newModule.banner && newModule.banner.size > 200 * 1024)}
          className="px-4 py-2 bg-DGXblue text-white rounded-md hover:bg-blue-600 transition disabled:opacity-70"
        >
          {isCompressing ? 'Creating...' : 'Create Module'}
        </button>
      </div>
    </div>
  );
};

export default ModuleCreator;
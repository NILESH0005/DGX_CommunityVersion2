import React, { useState, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import FileUploader from "../../../../container/FileUploader";
import AddSubModuleForm from "../SubModuleComponents/AddSubModuleForm";
import ApiContext from "../../../../context/ApiContext";

const ModuleCreator = ({
  onCreate,
  onCancel,
  existingModules = [],
  userToken,
}) => {
  const [isCreated, setIsCreated] = useState(false);
  const [showSubModuleForm, setShowSubModuleForm] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const { fetchData } = useContext(ApiContext);

  const [newModule, setNewModule] = useState({
    id: uuidv4(),
    name: "",
    description: "",
    bannerPath: null,
    subModules: [],
  });
  const [errors, setErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const updateLocalStorage = (modules) => {
    try {
      localStorage.setItem("modules", JSON.stringify(modules));
    } catch (error) {
      console.error("Error saving to local storage:", error);
    }
  };

  const handleCreate = async () => {
    if (!newModule.name.trim()) {
      setErrors({ name: "Module name is required" });
      return;
    }

    setIsCreating(true);

    try {
      // ✅ Step 1: Validate module name via API
      const endpoint = "lms/validate";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };
      const body = { moduleName: newModule.name };

      const data = await fetchData(endpoint, method, body, headers);

      if (data.exists) {
        setErrors({ name: data.message || "Module already exists" });
        setIsCreating(false);
        return;
      }

      // ✅ Step 2: Create module locally
      const module = {
        id: newModule.id,
        ModuleName: newModule.name.trim(),
        ModuleImage: newModule.bannerPath,
        ModuleDescription: newModule.description.trim(),
        subModules: newModule.subModules,
        createdAt: new Date().toISOString(),
      };

      const updatedModules = [...existingModules, module];
      updateLocalStorage(updatedModules);

      setCurrentModule({
        ...module,
        banner: module.ModuleImage,
      });

      onCreate(module);
      setIsCreated(true);
    } catch (error) {
      console.error("Error creating module:", error);
      setErrors({ name: "Something went wrong. Please try again." });
    } finally {
      setIsCreating(false);
    }
  };

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
            onChange={(e) =>
              setNewModule({ ...newModule, description: e.target.value })
            }
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

          <FileUploader
            moduleName="LMS"
            folderName="module-banners"
            onUploadComplete={(filePath) => {
              setNewModule({ ...newModule, bannerPath: filePath });
              if (errors.banner) setErrors({ ...errors, banner: null });
            }}
            accept="image/*"
            maxSize={200 * 1024}
            label="Upload Banner Image"
          />

          {errors.banner && (
            <p className="mt-1 text-sm text-red-500">{errors.banner}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-8 border-t mt-8">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:scale-95 transition-all duration-200"
        >
          Cancel
        </button>

        <button
          onClick={handleCreate}
          disabled={isCreating || !!errors.name}
          className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200 ${
            isCreating || !!errors.name
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          }`}
        >
          {isCreating ? (
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

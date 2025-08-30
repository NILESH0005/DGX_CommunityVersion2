import React, { useState, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import FileUploader from "../../../../container/FileUploader";
import AddSubModuleForm from "../SubModuleComponents/AddSubModuleForm";
// import { fetchData } from "../../../../utils/";
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
      // 🔹 Step 1: Validate module name with API
      const endpoint = "lms/validate"; // your route
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };
      const body = { moduleName: newModule.name };

      const data = await fetchData(endpoint, method, body, headers);

      if (data.exists) {
        // 🚫 Block creation if already exists
        setErrors({ name: data.message || "Module already exists" });
        setIsCreating(false);
        return;
      }

      // 🔹 Step 2: Create module locally
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
    <div className="bg-white p-6 rounded-lg shadow border-2">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Create New Module
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Introduction to React"
            className={`border w-full p-2 rounded ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            value={newModule.name}
            onChange={(e) => {
              setNewModule({ ...newModule, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: null });
            }}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            placeholder="Brief description of what this module covers..."
            className="border w-full p-2 rounded border-gray-300 h-32"
            value={newModule.description}
            onChange={(e) =>
              setNewModule({ ...newModule, description: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banner Image
          </label>
          <div className="text-xs text-blue-500 mb-1">
            <span>Recommended size: 800x400px | Max size: 200KB</span>
          </div>
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
            <p className="mt-1 text-xs text-red-500">{errors.banner}</p>
          )}
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
          disabled={isCreating || !!errors.name} // 🔹 prevent submit if error exists
          className="px-4 py-2 bg-DGXblue text-white rounded-md hover:bg-blue-600 transition disabled:opacity-70"
        >
          {isCreating ? "Creating..." : "Create Module"}
        </button>
      </div>
    </div>
  );
};

export default ModuleCreator;

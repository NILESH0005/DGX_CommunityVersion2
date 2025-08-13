import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import FileUploader from "../../../../container/FileUploader";
import AddSubModuleForm from "../SubModuleComponents/AddSubModuleForm";

const ModuleCreator = ({ onCreate, onCancel, existingModules = [] }) => {
  const [isCreated, setIsCreated] = useState(false);
  const [showSubModuleForm, setShowSubModuleForm] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
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
      console.log("Updated localStorage:", modules);
    } catch (error) {
      console.error("Error saving to local storage:", error);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${window.location.origin}/${path.replace(/^\/+/, "")}`;
  };

  const handleCreate = async () => {
    if (!newModule.name.trim()) {
      setErrors({ name: "Module name is required" });
      return;
    }
    setIsCreating(true);

    try {
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

      onCreate(module); // This should trigger parent to update its modules state
      setIsCreated(true);

      // Return the new module so parent can use it
      return module;
    } catch (error) {
      console.error("Error creating module:", error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddSubModule = (subModule) => {
    const newSubModule = {
      id: uuidv4(),
      SubModuleName: subModule.SubModuleName,
      SubModuleDescription: subModule.SubModuleDescription,
      SubModuleImage: subModule.SubModuleImagePath,
      createdAt: new Date().toISOString(),
      units: [],
    };
    const updatedNewModule = {
      ...newModule,
      subModules: [...newModule.subModules, newSubModule],
    };
    setNewModule(updatedNewModule);
    const updatedCurrentModule = {
      ...currentModule,
      subModules: [...(currentModule.subModules || []), newSubModule],
    };
    setCurrentModule(updatedCurrentModule);
    const currentModules = JSON.parse(localStorage.getItem("modules")) || [];
    const updatedModules = currentModules.map((module) =>
      module.id === newModule.id
        ? { ...module, subModules: [...module.subModules, newSubModule] }
        : module
    );

    localStorage.setItem("modules", JSON.stringify(updatedModules));

    setShowSubModuleForm(false);
  };

  if (showSubModuleForm) {
    return (
      <AddSubModuleForm
        onAddSubModule={handleAddSubModule}
        onCancel={() => setShowSubModuleForm(false)}
        errors={errors}
        setErrors={setErrors}
      />
    );
  }

  if (isCreated) {
    const allModules = [
      ...existingModules,
      {
        ...currentModule,
        banner: currentModule.ModuleImage, // Using the path directly now
        subModules: newModule.subModules,
      },
    ];

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
                <svg
                  className="w-6 h-6 text-green-600"
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
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                Module Created Successfully!
              </h3>
              <p className="text-gray-600 text-sm">
                {newModule.subModules.length > 0
                  ? `${newModule.subModules.length} submodules added`
                  : "Add submodules to get started"}
              </p>
            </div>

            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowSubModuleForm(true)}
                className="px-4 py-2 bg-DGXblue text-white rounded-md hover:bg-blue-600 transition"
              >
                {newModule.subModules.length > 0
                  ? "Add Another Submodule"
                  : "Add First Submodule"}
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

        {newModule.subModules.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              Submodules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newModule.subModules.map((subModule) => (
                <motion.div
                  key={subModule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    {subModule.SubModuleImage && (
                      <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded border">
                        <img
                          src={subModule.SubModuleImage}
                          alt={subModule.SubModuleName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">
                        {subModule.SubModuleName}
                      </h3>
                      {subModule.SubModuleDescription && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {subModule.SubModuleDescription}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <button
                          onClick={onCancel}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreate}
                          disabled={isCreating || !newModule.bannerPath}
                          className="px-4 py-2 bg-DGXblue text-white rounded-md hover:bg-blue-600 transition disabled:opacity-70"
                        >
                          {isCreating ? "Creating..." : "Create Module"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

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
          disabled={isCreating}
          className="px-4 py-2 bg-DGXblue text-white rounded-md hover:bg-blue-600 transition disabled:opacity-70"
        >
          {isCreating ? "Creating..." : "Create Module"}
        </button>
      </div>
    </div>
  );
};

export default ModuleCreator;

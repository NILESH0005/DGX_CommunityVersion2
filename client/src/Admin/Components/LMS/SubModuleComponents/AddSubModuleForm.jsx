import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { PlusCircle, X, Check } from "lucide-react";
import FileUploader from "../../../../container/FileUploader";

const AddSubModuleForm = ({ onAddSubModule, errors, setErrors, onCancel }) => {
  const [newSubModule, setNewSubModule] = useState({
    SubModuleName: "",
    SubModuleDescription: "",
    SubModuleImagePath: null,
  });
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newSubModule.SubModuleName.trim()) {
      setErrors({ SubModuleName: "Submodule name is required" });
      return;
    }

    onAddSubModule(newSubModule);
    resetForm(); // Clear the form after submission
  };
  const resetForm = () => {
    setNewSubModule({
      id: uuidv4(),
      SubModuleName: "",
      SubModuleDescription: "",
      SubModuleImagePath: null,
    });
    setErrors({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-DGXwhite rounded-xl shadow-lg overflow-hidden border border-DGXgray/20"
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-DGXblue flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-DGXgreen" />
              Add New Submodule
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-DGXblue">
                Submodule Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., React Fundamentals"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.SubModuleName
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-DGXgray/30 focus:ring-DGXgreen focus:border-DGXgreen"
                    } bg-DGXwhite text-DGXblack transition duration-200`}
                  value={newSubModule.SubModuleName}
                  onChange={(e) => {
                    setNewSubModule({
                      ...newSubModule,
                      SubModuleName: e.target.value,
                    });
                    if (errors.SubModuleName)
                      setErrors({ ...errors, SubModuleName: null });
                  }}
                />
                {errors.SubModuleName && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    {errors.SubModuleName}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Image Upload Field - Updated */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-DGXblue">
                Submodule Image
              </label>
              <FileUploader
                moduleName="LMS"           // Same module as before
                folderName="subModule-banners" // Changed from "module-banners" to "subModule-banners"
                onUploadComplete={(filePath) => {
                  setNewSubModule({
                    ...newSubModule,
                    SubModuleImagePath: filePath,
                  });
                  if (errors.SubModuleImage)
                    setErrors({ ...errors, SubModuleImage: null });
                }}
                accept="image/*"
                maxSize={200 * 1024}
                label="Upload Submodule Image"
                previewType="image"
              />
              {errors.SubModuleImage && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  {errors.SubModuleImage}
                </motion.p>
              )}
            </div>

            {/* Description Field */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-DGXblue">
                Description
              </label>
              <textarea
                placeholder="What will students learn in this submodule?"
                className="w-full px-4 py-3 rounded-lg border border-DGXgray/30 focus:ring-DGXgreen focus:border-DGXgreen bg-DGXwhite text-DGXblack transition duration-200"
                rows={4}
                value={newSubModule.SubModuleDescription}
                onChange={(e) =>
                  setNewSubModule({
                    ...newSubModule,
                    SubModuleDescription: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8">
            <motion.button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg border border-DGXgray/30 text-DGXblue hover:bg-DGXgray/10 transition duration-200 font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={!!errors.SubModuleImage}
              className="px-6 py-2.5 rounded-lg bg-DGXgreen hover:bg-[#68a600] text-DGXwhite font-medium transition duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              Add Submodule
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default AddSubModuleForm;

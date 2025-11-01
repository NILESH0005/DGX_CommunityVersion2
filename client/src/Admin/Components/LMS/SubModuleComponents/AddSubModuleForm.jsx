import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import FileUploader from "../../../../container/FileUploader";

const AddSubModuleForm = ({ onAddSubModule, errors, setErrors, onCancel }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newSubModule, setNewSubModule] = useState({
    id: uuidv4(),
    SubModuleName: "",
    SubModuleDescription: "",
    SubModuleImagePath: null,
  });

  const resetForm = () => {
    setNewSubModule({
      id: uuidv4(),
      SubModuleName: "",
      SubModuleDescription: "",
      SubModuleImagePath: null,
    });
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newSubModule.SubModuleName.trim()) {
      setErrors({ SubModuleName: "Submodule name is required" });
      return;
    }

    // Call parent add function
    onAddSubModule(newSubModule);

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
                  placeholder="e.g., React Fundamentals"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.SubModuleName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } focus:outline-none transition duration-200`}
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

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submodule Image
                </label>
                <FileUploader
                  moduleName="LMS"
                  folderName="subModule-banners"
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="What will students learn in this submodule?"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200"
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
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
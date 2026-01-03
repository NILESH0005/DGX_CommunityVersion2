import React from "react";
import ModuleCreator from "./ModuleComponents/ModuleCreator";
import { motion } from "framer-motion";

const ModuleComponent = ({
  mode,
  module,
  onCreateModule,
  onManageSubmodules,
  onCreate,
  onCancel,
}) => {
  if (mode === "empty") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all duration-300"
      >
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-5">
          <svg
            className="w-12 h-12 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          Start by creating a module
        </h3>
        <p className="text-gray-600 mb-6">
          Modules help you organize your learning materials efficiently.
        </p>
        <button
          onClick={onCreateModule}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200"
        >
          + Create New Module
        </button>
      </motion.div>
    );
  }

  // --- Create Mode ---
  if (mode === "create") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
       
      >
        <ModuleCreator onCancel={onCancel} onCreate={onCreate} />
      </motion.div>
    );
  }
  return null;
};

export default ModuleComponent;

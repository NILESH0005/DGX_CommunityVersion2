import React from "react";
import { motion } from "framer-motion";

const ProgressBar = ({ subModuleID, progressData }) => {
  // Find the relevant progress for this specific submodule
  const submoduleProgress = progressData?.find(
    item => item.SubModuleID === subModuleID
  );

  if (!submoduleProgress) {
    return (
      <div className="text-gray-400 text-sm">
        Progress data loading...
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Progress</span>
        <span>{submoduleProgress.ProgressPer}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${submoduleProgress.ProgressPer}%` }}
          transition={{ duration: 0.8, type: 'spring', damping: 10 }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {submoduleProgress.readCount} of {submoduleProgress.totalFileCount} files completed
      </div>
    </div>
  );
};

export default ProgressBar;
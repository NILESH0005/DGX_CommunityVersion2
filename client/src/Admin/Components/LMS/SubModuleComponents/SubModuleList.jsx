import React, { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Trash2, PlusCircle, Eye, Edit3, Layers } from "lucide-react";

const SubModuleList = ({
  subModules,
  selectedSubModule,
  onSelectSubModule,
  onRemoveSubModule,
}) => {
  // Function to trigger animation - this will be called when units change
  const triggerUnitAnimation = useCallback((subModuleId) => {
    // This function will be called when units are added or removed
    // The animation is already built into the component structure
    console.log(`Animation triggered for submodule: ${subModuleId}`);
  }, []);

  // Memoized empty state component
  const EmptyState = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-200 transition-colors duration-300"
      >
        <div className="relative mb-3 sm:mb-4">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <PlusCircle className="w-12 h-12 sm:w-14 sm:h-14 text-blue-300" />
          </motion.div>
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-sm opacity-50" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1 sm:mb-2 text-center">
          No Submodules Yet
        </h3>
        <p className="text-gray-500 text-center text-xs sm:text-sm max-w-xs">
          Create your first submodule to organize course content and start
          building your curriculum.
        </p>
      </motion.div>
    ),
    []
  );

  // Memoized submodule item component with enhanced animation
  const SubModuleItem = useCallback(
    ({ subModule, index, isSelected }) => (
      <motion.div
        key={subModule.id}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.3,
          delay: index * 0.05,
          type: "spring",
          stiffness: 100,
        }}
        whileHover={{
          y: -2,
          scale: 1.02,
          boxShadow: "0 8px 25px -8px rgba(0, 0, 0, 0.15)",
        }}
        whileTap={{ scale: 0.98 }}
        className={`group relative p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 backdrop-blur-sm ${
          isSelected
            ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50/80 shadow-lg shadow-green-500/10"
            : "border-gray-200 bg-white/80 hover:border-green-300 hover:bg-green-50/30 shadow-sm"
        }`}
        onClick={() => onSelectSubModule(subModule)}
      >
        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -left-1 sm:-left-2 top-1/2 transform -translate-y-1/2 w-1 sm:w-2 h-6 sm:h-8 bg-green-500 rounded-full"
          />
        )}

        <div className="flex justify-between items-start gap-3 sm:gap-4">
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
            {/* Header with title and status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-semibold text-base sm:text-lg leading-tight truncate pr-2 ${
                    isSelected
                      ? "text-green-700"
                      : "text-gray-800 group-hover:text-green-600"
                  }`}
                >
                  {subModule.SubModuleName}
                </h4>

                {/* Description */}
                <p
                  className={`text-xs sm:text-sm mt-1 sm:mt-2 leading-relaxed ${
                    isSelected
                      ? "text-green-600/80"
                      : "text-gray-600 group-hover:text-green-500/80"
                  } line-clamp-2`}
                >
                  {subModule.SubModuleDescription || "No description provided"}
                </p>
              </div>

              {/* Selection badge */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full"
                >
                  <Eye className="w-3 h-3" />
                  <span className="hidden xs:inline">Selected</span>
                </motion.div>
              )}
            </div>

            {/* Metadata footer */}
            <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-gray-100 group-hover:border-green-100">
              <div className="flex items-center gap-2 sm:gap-4 text-xs">
                {/* Units count */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full font-medium ${
                    isSelected
                      ? "bg-green-500/15 text-green-700"
                      : "bg-gray-100 text-gray-600 group-hover:bg-green-500/10 group-hover:text-green-600"
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span className="text-xs">
                    {subModule.units?.length || 0}{" "}
                    {subModule.units?.length === 1 ? "unit" : "units"}
                  </span>
                </motion.div>

                {/* Edit hint */}
                {!isSelected && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hidden sm:flex items-center gap-1 text-gray-400"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span className="hidden md:inline">Click to view</span>
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          {/* Delete button */}
          <motion.button
            whileHover={{
              scale: 1.1,
              backgroundColor: isSelected
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(0, 0, 0, 0.05)",
            }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveSubModule(subModule.id);
            }}
            className={`p-1.5 sm:p-2 rounded-xl transition-colors flex-shrink-0 ${
              isSelected
                ? "text-red-500 hover:bg-red-500/20"
                : "text-gray-400 hover:text-red-500 hover:bg-red-500/10"
            }`}
            aria-label={`Remove ${subModule.SubModuleName}`}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    ),
    [onSelectSubModule, onRemoveSubModule]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100/80 backdrop-blur-sm overflow-hidden w-full hover:shadow-lg transition-shadow duration-300"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 pb-2 sm:pb-4">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 z-10 relative" />
              <div className="absolute inset-0 bg-green-100 rounded-full blur-sm opacity-60" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                Course Submodules
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                {subModules.length}{" "}
                {subModules.length === 1 ? "submodule" : "submodules"} total
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 pt-0 sm:pt-2">
        <AnimatePresence mode="wait">
          {subModules.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {EmptyState}
            </motion.div>
          ) : (
            <motion.div
              key="submodules-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 sm:space-y-3"
            >
              {subModules.map((subModule, index) => (
                <SubModuleItem
                  key={subModule.id}
                  subModule={subModule}
                  index={index}
                  isSelected={selectedSubModule?.id === subModule.id}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SubModuleList;
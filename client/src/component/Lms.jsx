import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TeachingModules from "./LMS/TeachingModules";
export const Lms = () => {
  // Example data for modules with thumbnails
  const modules = [
    {
      id: 1,
      title: "Teaching Kits",
      description: "Access and render text files, PowerPoints, and Jupyter Notebooks",
      progress: 30,
      thumbnail: "../public/TeachingKit.jpeg",
      topics: [
        { id: 1, title: "Introduction to Teaching Kits", content: "Content for Introduction" },
        { id: 2, title: "Using Jupyter Notebooks", content: "Content for Jupyter Notebooks" },
      ],
    },
    {
      id: 2,
      title: "Data Sets",
      description: "Access structured/unstructured datasets with upload & manage options",
      progress: 60,
      thumbnail: "https://via.placeholder.com/300",
      topics: [
        { id: 1, title: "Introduction to Data Sets", content: "Content for Data Sets" },
        { id: 2, title: "Uploading Data", content: "Content for Uploading Data" },
      ],
    },
    // Add more modules with topics and subtopics
  ];

  // State for selected module and sidebar visibility
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Handle module click
  const handleModuleClick = (module) => {
    setSelectedModule(module);
    setSelectedTopic(null); // Reset selected topic when a new module is selected
  };

  // Handle topic click
  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold">Welcome to the LMS</h1>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="space-y-8">
            {/* Title and Description */}
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">LMS Platform</h1>
              <p className="text-gray-600">Explore our interactive learning modules</p>
            </div>

            {/* Grid of Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {modules.map((module) => (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white p-6 rounded-lg shadow-lg cursor-pointer transition-transform duration-200"
                  onClick={() => handleModuleClick(module)}
                >
                  <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <img
                      src={module.thumbnail}
                      alt={module.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
                  <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Sidebar for Selected Module and Topics */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg p-6 overflow-y-auto"
          >
            <button
              onClick={() => setSelectedModule(null)}
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              &larr; Back
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedModule.title}</h2>
            <p className="text-gray-600 mb-6">{selectedModule.description}</p>

            {/* List of Topics */}
            <div className="space-y-4">
              {selectedModule.topics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleTopicClick(topic)}
                >
                  <h3 className="text-lg font-semibold">{topic.title}</h3>
                </div>
              ))}
            </div>

            {/* Selected Topic Content */}
            <AnimatePresence>
              {selectedTopic && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-6 p-4 bg-gray-50 rounded-lg"
                >
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="text-gray-600 hover:text-gray-900 mb-4"
                  >
                    &larr; Back to Topics
                  </button>
                  <h3 className="text-xl font-bold mb-4">{selectedTopic.title}</h3>
                  <p className="text-gray-600">{selectedTopic.content}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lms;
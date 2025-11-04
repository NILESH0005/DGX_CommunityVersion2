import React, { useState, useEffect } from "react";
import DynamicModuleCard from "./ModuleCard";
import LeaderBoard from "./LeaderBoard";
import { FiBookOpen, FiHelpCircle } from "react-icons/fi";

const LearningPath = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasModules, setHasModules] = useState(true); // check dynamically if needed

  useEffect(() => {
    const simulateLoad = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // simulate loading effect
    return () => clearTimeout(simulateLoad);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 text-gray-900 transition-all duration-500 relative">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/60 border-b border-white/30 shadow-lg p-6 md:p-8 flex justify-between items-start md:items-center flex-col md:flex-row">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-DGXgreen DGXblue drop-shadow-sm">
            LMS Platform
          </h1>
          <p className="text-gray-700 text-lg md:text-xl font-medium">
            Explore our interactive learning modules
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden backdrop-blur-sm">
        {/* Modules Section */}
        <div className="w-full lg:w-3/4 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-80 text-gray-600 text-lg font-medium animate-pulse">
              Loading modules...
            </div>
          ) : hasModules ? (
            <div className="animate-fadeInSlow">
              <DynamicModuleCard />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-3xl p-10 max-w-lg mx-auto transition-all duration-300 hover:shadow-xl">
                <div className="bg-gradient-to-br from-indigo-500/20 to-blue-400/20 p-5 rounded-full mb-4">
                  <FiBookOpen className="text-6xl text-indigo-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  No Learning Modules Available
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Your learning space is being set up. Please check back soon or
                  contact the admin for updates.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard Section */}
        <div className="w-full lg:w-1/4 backdrop-blur-xl bg-white/50 border-t lg:border-t-0 lg:border-l border-white/30 shadow-lg overflow-y-auto transition-all duration-300">
          {/* Header */}
          <div className="p-6 sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-white/30 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-indigo-800 tracking-tight">
              Top Learners
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Recognizing excellence in learning
            </p>
          </div>

          {/* Leaderboard Body */}
          <div className="p-6 space-y-4">
            <LeaderBoard />
          </div>
        </div>
      </div>

      {/* Floating Help Icon */}
      <button className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 focus:outline-none">
        <FiHelpCircle className="text-2xl" />
      </button>
    </div>
  );
};

export default LearningPath;

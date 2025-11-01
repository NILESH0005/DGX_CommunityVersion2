import React, { useState, useEffect } from "react";
import DynamicModuleCard from "./ModuleCard";
import LeaderBoard from "./LeaderBoard";
import { FiBookOpen } from "react-icons/fi";

const LearningPath = () => {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        // Replace with your actual API call
        // const response = await fetch("/api/lms/modules");
        // const data = await response.json();
        const data = []; // simulate empty data
        setModules(data);
      } catch (error) {
        console.error("Error fetching LMS modules:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchModules();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 text-gray-900 transition-all duration-500">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/60 border-b border-white/30 shadow-lg p-6 md:p-8 flex justify-between items-start md:items-center flex-col md:flex-row ">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800 drop-shadow-sm">
            LMS Platform
          </h1>
          <p className="text-gray-700 text-lg md:text-xl font-medium">
            Explore your personalized learning journey
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
          ) : modules.length === 0 ? (
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
          ) : (
            <div className="animate-fadeInSlow">
              <DynamicModuleCard modules={modules} />
            </div>
          )}
        </div>

        {/* Leaderboard Section */}
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
    </div>
  );
};

export default LearningPath;

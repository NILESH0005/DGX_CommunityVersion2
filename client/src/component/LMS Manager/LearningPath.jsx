import React from "react";
import DynamicModuleCard from "./ModuleCard";
import LeaderBoard from "./LeaderBoard";
import { FiHelpCircle } from "react-icons/fi";

const LearningPath = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Header with ChatBot */}
      <header className="bg-white shadow-sm p-4 md:p-6 flex justify-between items-start md:items-center flex-col md:flex-row">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-DGXblue">LMS Platform</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-xl md:text-2xl">
            Explore our interactive learning modules
          </p>
        </div>
        
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Modules Cards Section - Full width on mobile, 3/4 on desktop */}
        <div className="w-full lg:w-3/4 overflow-y-auto p-4 md:p-6">
          <DynamicModuleCard />
        </div>

        {/* Leaderboard Section - Full width on mobile, 1/4 on desktop */}
        <div className="w-full lg:w-1/4 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 shadow-sm lg:shadow-none overflow-y-auto">
          <div className="p-4 md:p-6 sticky top-0 bg-white z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-DGXblue mb-4 md:mb-6">
              Top Learners
            </h2>
          </div>
          <div className="pb-4 px-4 md:px-6">
            <LeaderBoard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
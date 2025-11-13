import React, { useState, useEffect } from "react";
import DynamicModuleCard from "./ModuleCard";
import LeaderBoard from "./LeaderBoard";
import HeroModel from "./ChatBot"; // 👈 import your 3D model
import ChatBotModal from "./ChatBotModal"; // 👈 import chatbot modal
import { FiHelpCircle } from "react-icons/fi";

const LearningPath = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasModules, setHasModules] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false); // 👈 state for chatbot modal

  useEffect(() => {
    const simulateLoad = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(simulateLoad);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 text-gray-900 transition-all duration-500 relative">
      <header className="backdrop-blur-md bg-white/60 border-b border-white/30 shadow-lg py-1 px-4 md:py-2 md:px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="space-y-2 md:w-2/3 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 drop-shadow-sm">
            LMS Platform
          </h1>
          <p className="text-gray-700 text-lg md:text-xl font-medium">
            Explore our interactive learning modules
          </p>
        </div>

        <div
          onClick={() => setIsChatOpen(true)}
          className="mt-4 md:mt-0 md:w-1/3 flex flex-col md:flex-row justify-center items-center cursor-pointer hover:scale-105 transition-transform text-center md:text-left"
          title="Click to chat with assistant"
        ></div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden backdrop-blur-sm">
        <div className="w-full lg:w-3/4 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-80 text-gray-600 text-lg font-medium animate-pulse">
              Loading modules...
            </div>
          ) : hasModules ? (
            <DynamicModuleCard />
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                No Learning Modules Available
              </h3>
              <p className="text-gray-600">
                Your learning space is being set up. Please check back soon.
              </p>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="w-full lg:w-1/4 backdrop-blur-xl bg-white/50 border-t lg:border-t-0 lg:border-l border-white/30 shadow-lg overflow-y-auto">
          <div className="p-6 sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-white/30 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-indigo-800">
              Top Learners
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Recognizing excellence in learning
            </p>
          </div>
          <div className="p-6 space-y-4">
            <LeaderBoard />
          </div>
        </div>
      </div>

      {/* Floating Help Icon (optional second trigger) */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 "
      >
          {/* Text beside model */}
        {/* <div className="md:ml-3 mt-2 md:mt-0">
          <h3 className="text-lg font-semibold text-indigo-700">Chatbot</h3>
          <p className="text-gray-600 text-sm">Click to ask a question</p>
        </div>  */}


        {/* Model */}
        <div className="w-[120px] h-[120px] flex justify-center items-center">
          <HeroModel />
        </div>

      
      </button>

      {/* Chat Modal*/}
      <ChatBotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default LearningPath;

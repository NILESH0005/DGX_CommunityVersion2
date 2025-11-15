import React from "react";
import { motion } from "framer-motion";

const UserInsightsSection = () => {
  /* -------------------------------------
      DUMMY DATA (replace with API later)
  -------------------------------------- */
  const mostAttemptedQuiz = {
    name: "React Basics Master Quiz",
    attempts: 148,
  };

  const highestScorer = {
    user: "Rohit Rawat",
    score: 98,
  };

  const mostLikedContent = {
    user: "Ananya Sharma",
    title: "Beginner Guide to Microservices",
    likes: 520,
  };

  const insights = [
    {
      id: 1,
      label: "Most Attempted Quiz",
      detail: mostAttemptedQuiz.name,
      subDetail: `${mostAttemptedQuiz.attempts} attempts`,
      color: "bg-blue-100 text-blue-700",
      border: "border-blue-300",
      onClick: () => console.log("Navigate → Quiz Stats"),
    },

    {
      id: 2,
      label: "Highest Quiz Scorer",
      detail: highestScorer.user,
      subDetail: `Score: ${highestScorer.score}/100`,
      color: "bg-green-100 text-green-700",
      border: "border-green-300",
      onClick: () => console.log("Navigate → User Score Insights"),
    },

    {
      id: 3,
      label: "Most Liked User Content",
      detail: mostLikedContent.user,
      subDetail: `${mostLikedContent.likes} likes • ${mostLikedContent.title}`,
      color: "bg-amber-100 text-amber-700",
      border: "border-amber-300",
      onClick: () => console.log("Navigate → Content Engagement"),
    },
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 font-inter w-full h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-DGXblue rounded"></span>
        User Insights
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {insights.map((box) => (
          <motion.div
            key={box.id}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            onClick={box.onClick}
            className={`p-5 bg-gray-50 rounded-xl border ${box.border} cursor-pointer shadow-sm hover:shadow-md transition`}
          >
            {/* Title */}
            <h3 className="font-semibold text-gray-800 text-sm mb-3 hover:text-DGXblue transition">
              {box.label}
            </h3>

            {/* Highlight Badge */}
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${box.color}`}
            >
              {box.detail}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              {box.subDetail}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UserInsightsSection;

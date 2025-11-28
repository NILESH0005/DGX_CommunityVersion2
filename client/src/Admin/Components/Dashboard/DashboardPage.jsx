import React, { useState } from "react";
import { motion } from "framer-motion";
import ApprovalSection from "./ApprovalSection";
import TrendingSection from "./TrendingSection";
import UserInsightsSection from "./UserInsightsSection";
import TopContentSection from "./TopContentSection";
const today = new Date().toLocaleDateString("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});
const DashboardPage = () => {
  const [filterType, setFilterType] = useState("7d"); // default: last 7 days
  const [customRange, setCustomRange] = useState({ from: "", to: "" });

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  // Combined filter object passed to all children
  const filterData = {
    type: filterType,
    from: customRange.from,
    to: customRange.to,
  };

  return (
    <motion.div
      className="min-h-screen p-6 font-inter"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome to your content management dashboard
              </p>
            </div>
         
          </div>
        </motion.div>

        {/* 🌟 GLOBAL DATE FILTER */}
        <motion.div variants={itemVariants}>
          <div
            className="
      bg-white 
      border border-gray-200 
      shadow-[0_2px_6px_rgba(0,0,0,0.05)] 
      rounded-2xl 
      p-5 
      flex flex-wrap items-center justify-between gap-5
      transition-all
    "
          >
            {/* LEFT SIDE: Filter Controls */}
            <div className="flex items-center gap-5 flex-wrap">
              {/* Filter Type */}
              <select
                value={filterType}
                onChange={handleFilterChange}
                className="
          rounded-lg 
          px-4 py-2 
          text-sm
          bg-gradient-to-br from-gray-50 to-white 
          border border-gray-300
          shadow-sm
          focus:ring-2 focus:ring-blue-400 focus:border-blue-400
          transition-all
          cursor-pointer
        "
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="custom">Custom Range</option>
              </select>

              {/* Custom Date Fields */}
              {filterType === "custom" && (
                <div className="flex items-center gap-4">
                  {/* From Date */}
                  <input
                    type="date"
                    className="
              px-3 py-2 
              text-sm
              border border-gray-300 
              rounded-lg 
              bg-white 
              shadow-sm
              focus:ring-2 focus:ring-blue-400 focus:border-blue-400
              transition-all
            "
                    value={customRange.from}
                    onChange={(e) =>
                      setCustomRange({ ...customRange, from: e.target.value })
                    }
                  />

                  {/* To Date */}
                  <input
                    type="date"
                    className="
              px-3 py-2 
              text-sm
              border border-gray-300 
              rounded-lg 
              bg-white 
              shadow-sm
              focus:ring-2 focus:ring-blue-400 focus:border-blue-400
              transition-all
            "
                    value={customRange.to}
                    onChange={(e) =>
                      setCustomRange({ ...customRange, to: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Today’s Date Display */}
            <div
              className="
        px-4 py-2 
        bg-blue-50 
        text-blue-700 
        rounded-lg 
        text-sm 
        font-medium 
        shadow-sm 
        border border-blue-200
      "
            >
              📅 Today: {today}
            </div>
          </div>
        </motion.div>

        {/* Trending Section */}
        <motion.div variants={itemVariants}>
          <TrendingSection dateFilter={filterData} />
        </motion.div>

        {/* Main Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              whileHover={{ y: -1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sh "
            >
              <ApprovalSection dateFilter={filterData} />
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              whileHover={{ y: -1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sh"
            >
              <TopContentSection dateFilter={filterData} />
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom - Insights */}
        <motion.div variants={itemVariants}>
          <motion.div
            whileHover={{ y: -1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sh "
          >
            <UserInsightsSection dateFilter={filterData} />
          </motion.div>
        </motion.div>

       
      </div>
    </motion.div>
  );
};

export default DashboardPage;






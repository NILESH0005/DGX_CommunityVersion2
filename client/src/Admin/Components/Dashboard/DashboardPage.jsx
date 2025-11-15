import React from "react";
import { motion } from "framer-motion";
import ApprovalSection from "./ApprovalSection";
import TrendingSection from "./TrendingSection";
import UserInsightsSection from "./UserInsightsSection";
import TopContentSection from "./TopContentSection";

const DashboardPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
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
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Live</span>
            </div>
          </div>
        </motion.div>

        {/* Trending Section */}
        <motion.div variants={itemVariants}>
          <TrendingSection />
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* LEFT SIDE - 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              whileHover={{ y: -1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full"
            >
              <ApprovalSection />
            </motion.div>
          </div>

          {/* RIGHT SIDE - 1 COLUMN */}
          <div className="space-y-6">
            <motion.div
              whileHover={{ y: -1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full"
            >
               <TopContentSection />
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Section - Full width */}
        <motion.div variants={itemVariants}>
          <motion.div
            whileHover={{ y: -1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
           
             <UserInsightsSection />
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center pt-8 pb-4">
          <p className="text-gray-400 text-sm">
            © 2024 Content Management System • v2.4.1
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;

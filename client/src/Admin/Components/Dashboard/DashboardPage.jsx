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
      className="min-h-screen bg-gray-50 p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your content management dashboard
          </p>
        </motion.div>

        {/* Trending Section at the top */}
        <motion.div variants={itemVariants}>
          <TrendingSection />
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
        >
          {/* LEFT SIDE - 2 COLUMNS */}
          <div className="lg:col-span-2 h-full flex">
            <ApprovalSection />
          </div>

          {/* RIGHT SIDE - 1 COLUMN */}
          <div className="h-full flex">
            <UserInsightsSection />
          </div>
        </motion.div>

        {/* Bottom Section - Full width */}
        <motion.div variants={itemVariants} className="mt-6">
          <TopContentSection />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;

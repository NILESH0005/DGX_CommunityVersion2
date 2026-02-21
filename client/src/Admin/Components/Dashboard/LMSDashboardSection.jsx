import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import ApiContext from "../../../context/ApiContext";
import {
  FaBook,
  FaEye,
  FaClock,
  FaStar,
  FaLayerGroup,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";

const LMSDashboardSection = () => {
  const { fetchData } = useContext(ApiContext);
  const [moduleData, setModuleData] = useState([]);
  const [submoduleData, setSubmoduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch data from both APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch both module and submodule data in parallel
        const [moduleResponse, submoduleResponse] = await Promise.all([
          fetchData("lms/module-views", "GET"),
          fetchData("lms/submodule-views", "GET"),
        ]);

        if (moduleResponse?.success) {
          // Convert string numbers to actual numbers and add missing properties
          const processedModules = moduleResponse.data.map((module) => ({
            ...module,
            moduleId: module.moduleID,
            moduleName: module.moduleName,
            totalViews: Number(module.totalViews) || 0,
            totalTimeSpent: Number(module.totalTimeSpent) || 0,
            // Use API values for ratings instead of hardcoded defaults
            avgRating: Number(module.avgRating) || 0,
            ratingCount: Number(module.ratingCount) || 0,
            // Only add placeholder for missing properties not in API
            subModulesCount: 3, // Keep this if not in API
          }));
          setModuleData(processedModules);
        }

        if (submoduleResponse?.success) {
          setSubmoduleData(submoduleResponse.data || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [fetchData]);

  // Calculate dashboard statistics
  const calculateStats = () => {
    if (moduleData.length === 0) {
      return {
        totalModules: 0,
        totalSubmodules: 0,
        totalViews: 0,
        totalTimeSpent: 0,
        avgRating: 0,
        mostViewedModule: null,
        leastViewedModule: null,
        highestEngagementModule: null,
      };
    }

    const totalModules = moduleData.length;
    const totalSubmodules = submoduleData.length || moduleData.length * 3; // Fallback calculation

    const totalViews = moduleData.reduce(
      (sum, module) => sum + module.totalViews,
      0
    );
    const totalTimeSpent = moduleData.reduce(
      (sum, module) => sum + module.totalTimeSpent,
      0
    );

    // Calculate average rating (using placeholder values)
    const totalRatings = moduleData.reduce(
      (sum, module) => sum + (module.avgRating || 0),
      0
    );
    const avgRating =
      totalModules > 0 ? (totalRatings / totalModules).toFixed(1) : "0.0";

    // Find special modules
    const mostViewedModule = [...moduleData].sort(
      (a, b) => b.totalViews - a.totalViews
    )[0];
    const leastViewedModule = [...moduleData].sort(
      (a, b) => a.totalViews - b.totalViews
    )[0];
    const highestEngagementModule = [...moduleData].sort(
      (a, b) => b.totalTimeSpent - a.totalTimeSpent
    )[0];

    return {
      totalModules,
      totalSubmodules,
      totalViews,
      totalTimeSpent,
      avgRating,
      mostViewedModule,
      leastViewedModule,
      highestEngagementModule,
    };
  };

  const stats = calculateStats();

  // Format time for display
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return "0m";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Find modules needing attention (low views or time spent)
  const getModulesNeedingAttention = () => {
    return moduleData
      .filter((module) => module.totalViews <= 1 && module.totalTimeSpent < 300) // Less than 5 minutes
      .slice(0, 4);
  };

  // Get top performing modules
  const getTopPerformingModules = () => {
    return [...moduleData]
      .sort(
        (a, b) =>
          b.totalViews * 2 +
          b.totalTimeSpent / 100 -
          (a.totalViews * 2 + a.totalTimeSpent / 100)
      )
      .slice(0, 4);
  };

  // StatCard Component
  const StatCard = ({ icon, title, value, subtitle, gradient, iconColor }) => (
    <motion.div
      whileHover={{ scale: isMobile ? 1 : 1.05 }}
      className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl ${iconColor || "bg-indigo-100"}`}>
          <div className="text-2xl">{icon}</div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-full ${gradient}`}
        />
      </div>
    </motion.div>
  );

  // ModuleCard Component for dashboard
  const DashboardModuleCard = ({ module, index, highlight, metric }) => {
    const engagementPercentage = Math.min(
      (module.totalTimeSpent / 3600) * 100,
      100
    ); // Cap at 100%

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: isMobile ? 1 : 1.02 }}
        className={`bg-white rounded-xl p-4 shadow-md border ${
          highlight === "warning"
            ? "border-orange-200 bg-orange-50"
            : highlight === "success"
            ? "border-emerald-200 bg-emerald-50"
            : "border-gray-200"
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-sm truncate">
              {module.moduleName}
            </h4>
            <p className="text-xs text-gray-500 mt-1">ID: {module.moduleId}</p>
          </div>
          {metric && (
            <div className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
              {metric}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <FaEye className="mx-auto text-gray-400 mb-1 text-sm" />
            <p className="text-xs font-bold">{module.totalViews}</p>
            <p className="text-xs text-gray-500">Views</p>
          </div>
          <div className="text-center">
            <FaClock className="mx-auto text-gray-400 mb-1 text-sm" />
            <p className="text-xs font-bold">
              {formatTime(module.totalTimeSpent)}
            </p>
            <p className="text-xs text-gray-500">Time</p>
          </div>
          <div className="text-center">
            <FaStar className="mx-auto text-yellow-400 mb-1 text-sm" />
            <p className="text-xs font-bold">
              {module.avgRating ? Number(module.avgRating).toFixed(1) : "0.0"}
            </p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
        </div>

        {/* <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Engagement</span>
            <span>{Math.round(engagementPercentage)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${engagementPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full ${
                highlight === "warning"
                  ? "bg-gradient-to-r from-orange-400 to-red-400"
                  : highlight === "success"
                  ? "bg-gradient-to-r from-emerald-400 to-green-500"
                  : "bg-gradient-to-r from-indigo-400 to-purple-400"
              }`}
            />
          </div>
        </div> */}
      </motion.div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-10"></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-3xl"></div>
              <div className="h-96 bg-gray-200 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FaChartLine className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                LMS Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Overview of learning module performance and engagement metrics
              </p>
            </div>
          </div>
        </motion.div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<FaBook />}
            title="Total Modules"
            value={stats.totalModules}
            subtitle="Active learning modules"
            gradient="bg-gradient-to-r from-indigo-400 to-purple-400"
            iconColor="bg-indigo-100 text-indigo-600"
          />

          <StatCard
            icon={<FaLayerGroup />}
            title="Submodules"
            value={stats.totalSubmodules}
            subtitle="Across all modules"
            gradient="bg-gradient-to-r from-emerald-400 to-green-400"
            iconColor="bg-emerald-100 text-emerald-600"
          />

          <StatCard
            icon={<FaEye />}
            title="Total Views"
            value={stats.totalViews}
            subtitle="All-time module views"
            gradient="bg-gradient-to-r from-blue-400 to-cyan-400"
            iconColor="bg-blue-100 text-blue-600"
          />

          <StatCard
            icon={<FaClock />}
            title="Total Time"
            value={formatTime(stats.totalTimeSpent)}
            subtitle="Learning engagement"
            gradient="bg-gradient-to-r from-amber-400 to-orange-400"
            iconColor="bg-amber-100 text-amber-600"
          />
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.mostViewedModule && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaEye className="text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Most Viewed</h3>
              </div>
              <p className="text-lg font-bold text-gray-900 truncate">
                {stats.mostViewedModule.moduleName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.mostViewedModule.totalViews} views •{" "}
                {formatTime(stats.mostViewedModule.totalTimeSpent)}
              </p>
            </motion.div>
          )}

          {stats.highestEngagementModule && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FaClock className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900">Highest Engagement</h3>
              </div>
              <p className="text-lg font-bold text-gray-900 truncate">
                {stats.highestEngagementModule.moduleName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {formatTime(stats.highestEngagementModule.totalTimeSpent)} spent
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <FaStar className="text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900">Average Rating</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.avgRating}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Across all rated modules
            </p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Modules */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                🏆 Top Performing Modules
              </h2>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                {getTopPerformingModules().length} modules
              </span>
            </div>

            <div className="space-y-4">
              {getTopPerformingModules().length > 0 ? (
                getTopPerformingModules().map((module, index) => (
                  <DashboardModuleCard
                    key={module.moduleId}
                    module={module}
                    index={index}
                    highlight="success"
                    metric={`Rank #${index + 1}`}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaChartLine className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p>No module data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Modules Needing Attention */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                ⚠️ Modules Needing Attention
              </h2>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {getModulesNeedingAttention().length} modules
              </span>
            </div>

            <div className="space-y-4">
              {getModulesNeedingAttention().length > 0 ? (
                getModulesNeedingAttention().map((module, index) => (
                  <DashboardModuleCard
                    key={module.moduleId}
                    module={module}
                    index={index}
                    highlight="warning"
                    metric="Low Engagement"
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaExclamationTriangle className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p>All modules are performing well! 🎉</p>
                  <p className="text-sm mt-2">
                    No modules with low engagement detected
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Modules Summary */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            📊 All Modules Overview
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Module Name
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Views
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Time Spent
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Engagement
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {moduleData.slice(0, 8).map((module) => (
                  <tr
                    key={module.moduleId}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {module.moduleName}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {module.moduleId}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FaEye className="text-gray-400 mr-2" />
                        <span className="font-medium">{module.totalViews}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FaClock className="text-gray-400 mr-2" />
                        <span className="font-medium">
                          {formatTime(module.totalTimeSpent)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-400 to-purple-400"
                            style={{
                              width: `${Math.min(
                                (module.totalTimeSpent / 3600) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.min(
                            Math.round((module.totalTimeSpent / 3600) * 100),
                            100
                          )}
                          %
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {module.totalViews > 2 && module.totalTimeSpent > 600 ? (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                          Active
                        </span>
                      ) : module.totalViews === 0 ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          Not Started
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                          Low Engagement
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {moduleData.length > 8 && (
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Showing 8 of {moduleData.length} modules
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LMSDashboardSection;

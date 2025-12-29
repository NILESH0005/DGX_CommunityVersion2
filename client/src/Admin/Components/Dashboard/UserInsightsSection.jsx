import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApiContext from "../../../context/ApiContext";

const UserInsightsDashboard = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceData, setDeviceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Import your API context
  const { fetchData } = React.useContext(ApiContext);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch device analytics data
  useEffect(() => {
    const fetchDeviceAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetchData("dashboard/deviceAnalytics", "GET");

        if (response.success && response.data) {
          const { total, data } = response;
          setTotalUsers(total);

          // Transform the API response to match your component structure
          const transformedData = [
            {
              id: 1,
              device: "Mobile & Tablet",
              percentage: parseFloat(data.mobileTablet?.percentage || 0),
              users: data.mobileTablet?.users || 0,
              icon: "📱",
              color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              bgColor: "bg-gradient-to-br from-blue-50 to-purple-50",
            },
            {
              id: 2,
              device: "Desktop & Laptop",
              percentage: parseFloat(data.desktopLaptop?.percentage || 0),
              users: data.desktopLaptop?.users || 0,
              icon: "💻",
              color: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
            },
          ];

          setDeviceData(transformedData);
        }
      } catch (error) {
        console.error("Error fetching device analytics:", error);
        // Fallback to sample data if API fails
        setDeviceData(getSampleData());
        setTotalUsers(10069);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceAnalytics();
  }, []);

  const getAvatarFromName = (name = "") => {
    return name ? name.charAt(0).toUpperCase() : "👤";
  };

  // Derive role from email (optional logic)
  const getRoleFromEmail = (email = "") => {
    if (email.includes("giindia")) return "GI Employee";
    if (email.includes("gmail")) return "Community Member";
    return "User";
  };

  useEffect(() => {
    const fetchMostActiveUsers = async () => {
      try {
        const response = await fetchData("dashboard/getMostActiveUsers", "GET");

        if (response.success && Array.isArray(response.data)) {
          const transformedUsers = response.data.map((user) => ({
            id: user.UserID,
            name: user.Name || "Unknown User",
            email: user.EmailId || "",
            score: Number(user.TotalScore) || 0,
            interaction: Number(user.InteractionScore) || 0,
            loginCount: Number(user.LoginCount) || 0,
            activeDays: Number(user.ActiveDays) || 0,
          }));

          setActiveUsers(transformedUsers);
        }
      } catch (error) {
        console.error("Error fetching most active users:", error);
      }
    };

    fetchMostActiveUsers();
  }, []);

  // Sample data for fallback
  const getSampleData = () => {
    return [
      {
        id: 1,
        device: "Mobile & Tablet",
        percentage: 65,
        users: 6544,
        icon: "📱",
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        bgColor: "bg-gradient-to-br from-blue-50 to-purple-50",
      },
      {
        id: 2,
        device: "Desktop & Laptop",
        percentage: 32,
        users: 3225,
        icon: "💻",
        color: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      },
      {
        id: 3,
        device: "Unknown",
        percentage: 3,
        users: 300,
        icon: "❓",
        color: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
      },
    ];
  };

  const EngagementCard = ({ user, index }) => {
    const medals = ["🥇", "🥈", "🥉"];
    const progress = Math.min((user.score / 200) * 100, 100);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.15 }}
        whileHover={{ scale: isMobile ? 1 : 1.03 }}
        className={`relative bg-white rounded-2xl p-4 sm:p-6 shadow-md border 
        ${
          index === 0
            ? "border-yellow-300 shadow-yellow-100"
            : "border-gray-100"
        }
        hover:shadow-xl transition-all`}
      >
        {/* Rank Badge */}
        <div className="absolute -top-3 -right-3 text-2xl sm:text-3xl">
          {medals[index]}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-lg sm:text-xl font-bold">
            {user.name?.charAt(0) || "👤"}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base sm:text-lg text-gray-900 truncate">
              {user.name}
            </h4>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <div className="text-right self-end sm:self-auto">
            <p className="text-xs text-gray-500">Total Score</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">
              {user.score}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center mb-4">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">Logins</p>
            <p className="font-bold text-sm sm:text-base text-gray-900">
              {user.loginCount}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">Active Days</p>
            <p className="font-bold text-sm sm:text-base text-gray-900">
              {user.activeDays}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">Interactions</p>
            <p className="font-bold text-sm sm:text-base text-gray-900">
              {user.interaction}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Engagement Level</span>
            <span>{progress.toFixed(0)}%</span>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400"
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const DeviceCard = ({ device, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: isMobile ? 1 : 1.03 }}
      onClick={() =>
        setSelectedDevice(device.id === selectedDevice ? null : device.id)
      }
      className={`${device.bgColor} rounded-2xl p-4 sm:p-6 border-2 border-transparent hover:border-gray-200 transition-all duration-300 cursor-pointer relative overflow-hidden group`}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="text-4xl sm:text-6xl">{device.icon}</div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl"
            style={{ background: device.color }}
          >
            <span className="text-white">{device.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {device.device}
            </h3>
            <p className="text-sm text-gray-600">
              {device.users.toLocaleString()} users
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Usage</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              {device.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-white/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${device.percentage}%` }}
              transition={{ delay: index * 0.1 + 0.2, duration: 1 }}
              className="h-full rounded-full"
              style={{ background: device.color }}
            />
          </div>
        </div>

        {/* Hover Info */}
        {selectedDevice === device.id && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-gray-200/50"
          >
            <div className="text-xs text-gray-600">
              {device.device === "Mobile & Tablet"
                ? "Includes smartphones and tablets (Android, iOS, iPad)"
                : device.device === "Desktop & Laptop"
                ? "Includes desktop computers and laptops (Windows, macOS, Linux)"
                : "Devices that couldn't be categorized"}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-DGXgreen"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-gray-50 to-white min-h-screen p-4 sm:p-6 font-sans"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-8 sm:h-10 bg-gradient-to-b from-green-500 to-emerald-400 rounded-full"></div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Engagement Dashboard
                </h1>
              </div>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl">
                Real-time insights into user engagement patterns and platform
                usage metrics
              </p>
            </div>
            {!isMobile && (
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {totalUsers.toLocaleString()}
                </div>
                <div className="text-sm text-green-600 font-medium">
                  Total logged devices
                </div>
              </div>
            )}
          </div>

          {/* Mobile-only total users display */}
          {isMobile && (
            <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Logged Devices</p>
                  <p className="text-lg font-bold text-gray-900">
                    {totalUsers.toLocaleString()}
                  </p>
                </div>
                <div className="text-green-600">
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column - Device Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                    📱 Device Distribution
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Platform usage across different device types
                  </p>
                </div>
                {!isMobile && (
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {totalUsers.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Total logged devices
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 sm:space-y-6">
                {deviceData.map((device, index) => (
                  <DeviceCard key={device.id} device={device} index={index} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Most Active Users */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                    ⭐ Most Active Users
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Top contributors by engagement score
                  </p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {activeUsers.length > 0 ? (
                  activeUsers
                    .slice(0, isMobile ? 2 : 3)
                    .map((user, index) => (
                      <EngagementCard key={user.id} user={user} index={index} />
                    ))
                ) : (
                  <p className="text-gray-500 text-sm sm:text-base text-center py-8">
                    No activity data available
                  </p>
                )}

                {/* Mobile view all button */}
                {activeUsers.length > 2 && isMobile && (
                  <button className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    View All {activeUsers.length} Users
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserInsightsDashboard;

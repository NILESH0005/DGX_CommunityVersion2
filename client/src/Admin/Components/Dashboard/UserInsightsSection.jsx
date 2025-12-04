import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApiContext from "../../../context/ApiContext";

const UserInsightsDashboard = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceData, setDeviceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Import your API context
  const { fetchData } = React.useContext(ApiContext);

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

  const userLeaderboard = [
    {
      id: 1,
      name: "Rohit Rawat",
      score: 98,
      avatar: "👨‍💻",
      activity: 142,
      role: "Software Engineer",
    },
    {
      id: 2,
      name: "Ananya Sharma",
      score: 95,
      avatar: "👩‍🎓",
      activity: 138,
      role: "Data Analyst",
    },
    {
      id: 3,
      name: "Nilesh Kumar",
      score: 92,
      avatar: "👨‍💼",
      activity: 125,
      role: "Product Manager",
    },
    {
      id: 4,
      name: "Nisha Patel",
      score: 89,
      avatar: "👩‍🔬",
      activity: 118,
      role: "UX Designer",
    },
  ];

  const EngagementCard = ({ user, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
              {user.avatar}
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">↑</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {user.name}
            </h4>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>
        </div>
      </div>
      
      <div className="relative pt-2">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(user.activity / 150) * 100}%` }}
            transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Activity Score</span>
          <span className="font-medium">{user.score}</span>
        </div>
      </div>
    </motion.div>
  );

  const DeviceCard = ({ device, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.03 }}
      onClick={() => setSelectedDevice(device.id === selectedDevice ? null : device.id)}
      className={`${device.bgColor} rounded-2xl p-6 border-2 border-transparent hover:border-gray-200 transition-all duration-300 cursor-pointer relative overflow-hidden group`}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="text-6xl">{device.icon}</div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: device.color }}
          >
            <span className="text-white">{device.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{device.device}</h3>
            <p className="text-sm text-gray-600">{device.users.toLocaleString()} users</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Usage</span>
            <span className="text-xl font-bold text-gray-900">{device.percentage.toFixed(1)}%</span>
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
      className="bg-gradient-to-br from-gray-50 to-white min-h-screen p-6 font-sans"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-10 bg-gradient-to-b from-green-500 to-emerald-400 rounded-full"></div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Engagement Dashboard
                </h1>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl">
                Real-time insights into user engagement patterns and platform usage metrics
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Device Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 Device Distribution</h2>
                  <p className="text-gray-600">Platform usage across different device types</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{totalUsers.toLocaleString()}</div>
                  <div className="text-sm text-green-600 font-medium">Total logged devices</div>
                </div>
              </div>

              <div className="space-y-6">
                {deviceData.map((device, index) => (
                  <DeviceCard key={device.id} device={device} index={index} />
                ))}
              </div>
            </div>
          </motion.div> 

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">⭐ Most Active Users</h2>
                  <p className="text-gray-600">Top contributors by engagement score</p>
                </div>
                {/* <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Weekly Ranking</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-gray-900">Live updates</span>
                  </div>
                </div> */}
              </div>

              <div className="space-y-4">
                {userLeaderboard.map((user, index) => (
                  <EngagementCard key={user.id} user={user} index={index} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserInsightsDashboard;
import React, { useState } from "react";
import { motion } from "framer-motion";

const ApprovalSection = () => {
  /* -------------------------
     DUMMY DATA
  -------------------------- */
  const approvalData = {
    pendingBlogs: 12,
    pendingEvents: 5,
    pendingDiscussions: 8,
    pendingUsers: 3,
    totalPending: 28
  };

  const pieChartData = [
    { label: "Blogs", value: 12, percentage: 43, color: "#3B82F6", bgColor: "bg-blue-100", textColor: "text-blue-600" },
    { label: "Discussions", value: 8, percentage: 29, color: "#10B981", bgColor: "bg-green-100", textColor: "text-green-600" },
    { label: "Events", value: 5, percentage: 18, color: "#F59E0B", bgColor: "bg-orange-100", textColor: "text-orange-600" },
    { label: "Users", value: 3, percentage: 10, color: "#EF4444", bgColor: "bg-red-100", textColor: "text-red-600" }
  ];

  const [selectedSegment, setSelectedSegment] = useState(null);

  /* -------------------------
     PIE CHART COMPONENT
  -------------------------- */
  const PieChart = ({ data, size = 160 }) => {
    const radius = size / 2;
    const circumference = 2 * Math.PI * radius;
    
    let currentAngle = 0;

    const segments = data.map((item, index) => {
      const percentage = item.value / approvalData.totalPending;
      const angle = percentage * 360;
      const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
      const rotation = currentAngle;
      
      currentAngle += angle;

      return {
        ...item,
        strokeDasharray,
        rotation: rotation - 90, // Start from top
        angle
      };
    });

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={radius}
              cy={radius}
              r={radius - 4}
              fill="none"
              stroke={segment.color}
              strokeWidth="8"
              strokeDasharray={segment.strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer hover:opacity-80"
              style={{
                transform: `rotate(${segment.rotation}deg)`,
                transformOrigin: `${radius}px ${radius}px`
              }}
              onMouseEnter={() => setSelectedSegment(segment)}
              onMouseLeave={() => setSelectedSegment(null)}
              onClick={() => console.log(`Navigate to ${segment.label} approvals`)}
            />
          ))}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="text-2xl font-bold text-gray-800">{approvalData.totalPending}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>

        {/* Tooltip */}
        {selectedSegment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10"
          >
            <div className="font-semibold">{selectedSegment.label}</div>
            <div>{selectedSegment.value} items ({selectedSegment.percentage}%)</div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </motion.div>
        )}
      </div>
    );
  };

  /* -------------------------
     STATS CARDS
  -------------------------- */
  const statsCards = [
    {
      id: 1,
      label: "Pending Blog Approvals",
      count: approvalData.pendingBlogs,
      color: "bg-blue-100 text-blue-600 border-blue-200",
      icon: "📝",
      description: "Blog posts awaiting review",
      onClick: () => console.log("Navigate → blog approvals"),
    },
    {
      id: 2,
      label: "Pending Event Approvals",
      count: approvalData.pendingEvents,
      color: "bg-orange-100 text-orange-600 border-orange-200",
      icon: "📅",
      description: "Events needing approval",
      onClick: () => console.log("Navigate → event approvals"),
    },
    {
      id: 3,
      label: "Pending Discussions",
      count: approvalData.pendingDiscussions,
      color: "bg-green-100 text-green-600 border-green-200",
      icon: "💬",
      description: "Discussions in moderation",
      onClick: () => console.log("Navigate → discussion approvals"),
    },
    {
      id: 4,
      label: "User Verifications",
      count: approvalData.pendingUsers,
      color: "bg-red-100 text-red-600 border-red-200",
      icon: "👥",
      description: "Users awaiting verification",
      onClick: () => console.log("Navigate → user approvals"),
    }
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 font-inter w-full h-full flex flex-col "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-green-500 rounded"></span>
          Approvals Dashboard
        </h2>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {approvalData.totalPending} Total Pending
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Left Side - Stats Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {statsCards.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 ${item.color} text-left shadow-sm hover:shadow-md transition-all duration-200 group`}
                onClick={item.onClick}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">{item.icon}</div>
                  <motion.div
                    className={`text-lg font-bold ${item.color.split(' ')[1]}`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.count}
                  </motion.div>
                </div>
                
                <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-gray-900 transition">
                  {item.label}
                </h3>
                
                <p className="text-xs text-gray-500">
                  {item.description}
                </p>

                {/* Hover action indicator */}
                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-gray-400">Click to review</span>
                  <span className="text-xs">→</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right Side - Pie Chart */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide self-start">
            Breakdown
          </h3>
          
          <PieChart data={pieChartData} size={180} />
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {pieChartData.map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                whileHover={{ scale: 1.05 }}
                onMouseEnter={() => setSelectedSegment(item)}
                onMouseLeave={() => setSelectedSegment(null)}
                onClick={() => console.log(`Filter by ${item.label}`)}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 truncate">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.percentage}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-semibold text-gray-600">Oldest Pending</div>
              <div className="text-lg font-bold text-gray-800">8</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-semibold text-gray-600"> Reviewed Today</div>
              <div className="text-lg font-bold text-gray-800">6</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      {/* <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Last updated: Just now
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
          onClick={() => console.log("Navigate to all approvals")}
        >
          Review All Approvals
        </motion.button>
      </div> */}
    </motion.div>
  );
};

export default ApprovalSection;
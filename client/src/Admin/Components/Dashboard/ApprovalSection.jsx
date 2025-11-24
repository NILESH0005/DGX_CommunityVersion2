import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import ApiContext from "../../../context/ApiContext";
import { useNavigate } from "react-router-dom";

const ApprovalSection = () => {
  const [approvalData, setApprovalData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchData } = useContext(ApiContext);
  const navigate = useNavigate();
  /* -----------------------------
       FETCH APPROVAL COUNTS
  ------------------------------ */
  const fetchApprovalCounts = async () => {
    try {
      setLoading(true);

      const response = await fetchData("dashboard/getApprovalCounts", "GET");

      if (response.success && response.data) {
        const data = response.data;

        setApprovalData(data);

        const { pendingBlogs, pendingEvents, pendingUsers, totalPending } =
          data;

        const pie = [
          {
            label: "Blogs",
            value: pendingBlogs,
            percentage: Math.round((pendingBlogs / totalPending) * 100),
            color: "#3B82F6",
            bgColor: "bg-blue-100",
            textColor: "text-blue-600",
          },
          {
            label: "Events",
            value: pendingEvents,
            percentage: Math.round((pendingEvents / totalPending) * 100),
            color: "#F59E0B",
            bgColor: "bg-orange-100",
            textColor: "text-orange-600",
          },
          {
            label: "Users",
            value: pendingUsers,
            percentage: Math.round((pendingUsers / totalPending) * 100),
            color: "#EF4444",
            bgColor: "bg-red-100",
            textColor: "text-red-600",
          },
        ];

        setPieChartData(pie);
      } else {
        throw new Error("Failed to fetch approval counts");
      }
    } catch (err) {
      console.error("Approval counts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalCounts();
  }, []);

  if (loading || !approvalData) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading approval dashboard...
      </div>
    );
  }

  const statsCards = [
    {
      id: 1,
      label: "Pending Blog Approvals",
      count: approvalData.pendingBlogs,
      color: "bg-blue-100 text-blue-600 border-blue-200",
      icon: "📝",
      description: "Blog posts awaiting review",
      onClick: () => {
        navigate("/AdminDashboard", {
          state: { open: "blog_manager", filter: "Pending" },
        });
      },
    },

    {
      id: 2,
      label: "Pending Event Approvals",
      count: approvalData.pendingEvents,
      color: "bg-orange-100 text-orange-600 border-orange-200",
      icon: "📅",
      description: "Events needing approval",
      onClick: () => {
        navigate("/AdminDashboard", {
          state: { open: "events" , filter: "Pending"},
        });
      },
    },
    {
      id: 4,
      label: "User Verifications",
      count: approvalData.pendingUsers,
      color: "bg-red-100 text-red-600 border-red-200",
      icon: "👥",
      description: "Users awaiting verification",
      onClick: () => {
        navigate("/AdminDashboard", {
          state: { open: "users" },
        });
      },
    },
  ];

  /* -----------------------------
          PIE CHART
  ------------------------------ */
  const PieChart = ({ data, size = 160 }) => {
    const radius = size / 2;
    const circumference = 2 * Math.PI * radius;
    let currentAngle = 0;

    const segments = data.map((item) => {
      const percentage = item.value / approvalData.totalPending;
      const angle = percentage * 360;
      const strokeDasharray = `${circumference * percentage} ${
        circumference * (1 - percentage)
      }`;

      const rotation = currentAngle - 90;
      currentAngle += angle;

      return {
        ...item,
        strokeDasharray,
        rotation,
      };
    });

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((seg, idx) => (
            <circle
              key={idx}
              cx={radius}
              cy={radius}
              r={radius - 4}
              fill="none"
              stroke={seg.color}
              strokeWidth="8"
              strokeDasharray={seg.strokeDasharray}
              strokeLinecap="round"
              style={{
                transform: `rotate(${seg.rotation}deg)`,
                transformOrigin: `${radius}px ${radius}px`,
              }}
              onMouseEnter={() => setSelectedSegment(seg)}
              onMouseLeave={() => setSelectedSegment(null)}
              className="cursor-pointer hover:opacity-80 transition"
            ></circle>
          ))}
        </svg>

        {/* Center total count */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="text-2xl font-bold text-gray-800">
            {approvalData.totalPending}
          </div>
          <div className="text-xs text-gray-500">Total</div>
        </div>

        {selectedSegment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full
                       bg-gray-900 text-white px-3 py-2 rounded-lg text-sm"
          >
            <div className="font-semibold">{selectedSegment.label}</div>
            <div>
              {selectedSegment.value} items ({selectedSegment.percentage}%)
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 font-inter w-full h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-green-500 rounded"></span>
          Approvals Dashboard
        </h2>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {approvalData.totalPending} Total Pending
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT - STATS CARDS */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {statsCards.map((card) => (
              <motion.button
                key={card.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border-2 ${card.color} shadow-sm`}
                onClick={card.onClick}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl">{card.icon}</span>
                  <span className="text-lg font-bold">{card.count}</span>
                </div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">
                  {card.label}
                </h4>
                <p className="text-xs text-gray-500">{card.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* RIGHT - PIE CHART */}
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">
            Breakdown
          </h3>
          <PieChart data={pieChartData} size={180} />
        </div>
      </div>
    </motion.div>
  );
};

export default ApprovalSection;

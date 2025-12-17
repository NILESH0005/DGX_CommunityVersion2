import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
 
} from "recharts";
import ApiContext from "../../../context/ApiContext";

const TopContentSection = () => {
  const { fetchData } = useContext(ApiContext);
  const [processData, setProcessData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colorMap = {
    LMS: "#76B900",
    Blog: "#1E3A8A", 
    Discussion: "#F59E0B"
  };

  const fetchProcessCounts = async () => {
    try {
      setLoading(true);
      const response = await fetchData("dashboard/processCounts", "GET");

      if (response.success && response.data) {
        const filteredData = response.data
          .filter(item => item.ProcessName !== "Event")
          .map(item => ({
            name: item.ProcessName,
            value: item.viewCount, 
            color: colorMap[item.ProcessName] || "#6B7280" 
          }));

        setProcessData(filteredData);
      } else {
        throw new Error("Failed to fetch process counts");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching process counts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcessCounts();
  }, []);

  // Calculate percentages and prepare chart data
  const donutData = React.useMemo(() => {
    if (!processData.length) return [];

    const total = processData.reduce((sum, item) => sum + item.value, 0);
    
    return processData.map(item => ({
      ...item,
      percent: Math.round((item.value / total) * 100),
      // For demo purposes, adding random trend - you can replace this with actual trend data
      trend: Math.random() > 0.5 ? "up" : "down"
    }));
  }, [processData]);

  const totalCount = donutData.reduce((sum, d) => sum + d.value, 0);

  if (loading) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full p-6 font-inter flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-DGXgreen"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full p-6 font-inter flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center text-red-500">
          Error loading content data: {error}
        </div>
      </motion.div>
    );
  }

  if (!donutData.length) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full p-6 font-inter flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center text-gray-500">
          No content data available
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full p-6 font-inter flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-5 bg-DGXgreen rounded"></span>
        Content Views Overview
      </h2>

      {/* TOTAL SUMMARY */}
      <p className="text-sm text-gray-600 mb-3">
        Total Views:{" "}
        <span className="font-semibold text-gray-900">
          {totalCount.toLocaleString()}
        </span>
      </p>

      {/* MAIN CONTENT: Donut + Details */}
      <div className="flex flex-1 items-center justify-between">
        {/* DONUT CHART */}
        <div className="w-44 h-44 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={3}
                dataKey="percent"
              >
                {donutData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LEGENDS WITH DETAILS */}
        <div className="flex flex-col justify-center gap-4 ml-3">
          {donutData.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              {/* Color Dot */}
              <div
                className="w-3 h-3 rounded-full mt-1"
                style={{ backgroundColor: item.color }}
              ></div>

              <div>
                {/* Title */}
                <p className="text-sm font-semibold text-gray-800">
                  {item.name}
                </p>

                {/* Count + Percentage */}
                <p className="text-xs text-gray-500">
                  {item.value?.toLocaleString()} views
                 
                </p>

                {/* Trend Indicator */}
                {/* <p
                  className={`text-xs mt-1 flex items-center gap-1 ${
                    item.trend === "up" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.trend === "up" ? "▲ Increased" : "▼ Decreased"}
                </p> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SPARKLINE TREND GRAPH */}
      
    </motion.div>
  );
};

export default TopContentSection;
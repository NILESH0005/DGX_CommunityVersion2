import React from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const TopContentSection = () => {
  /* -----------------------------------
     DONUT CHART DATA (Dummy Data)
  -------------------------------------*/
  const donutData = [
    { name: "LMS Views", value: 4000, percent: 40, color: "#76B900", trend: "up" },
    { name: "Blog Views", value: 3500, percent: 35, color: "#1E3A8A", trend: "down" },
    { name: "Discussions", value: 2500, percent: 25, color: "#F59E0B", trend: "up" },
  ];

  const totalViews = donutData.reduce((sum, d) => sum + d.value, 0);

  /* -----------------------------------
     SPARKLINE TREND DATA
  -------------------------------------*/
  const sparklineData = [
    { uv: 1800 },
    { uv: 2400 },
    { uv: 2100 },
    { uv: 3200 },
    { uv: 2900 },
    { uv: 3500 },
    { uv: 4000 },
  ];

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full p-6 font-inter flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-5 bg-DGXgreen rounded"></span>
        Content Performance Overview
      </h2>

      {/* TOTAL SUMMARY */}
      <p className="text-sm text-gray-600 mb-3">
        Total Engagement:{" "}
        <span className="font-semibold text-gray-900">
          {totalViews.toLocaleString()}
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
                  {item.value.toLocaleString()} views
                  <span className="ml-2 font-semibold text-gray-700">
                    ({item.percent}%)
                  </span>
                </p>

                {/* Trend Indicator */}
                <p
                  className={`text-xs mt-1 flex items-center gap-1 ${
                    item.trend === "up" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.trend === "up" ? "▲ Increased" : "▼ Decreased"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SPARKLINE TREND GRAPH */}
      <div className="mt-3 h-14">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <Area
              type="monotone"
              dataKey="uv"
              stroke="#76B900"
              fill="#76B90033"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default TopContentSection;

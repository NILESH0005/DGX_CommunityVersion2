import React from "react";
import { motion } from "framer-motion";

const ApprovalSection = () => {
  /* -------------------------
     DUMMY COUNTS (replace with API)
  -------------------------- */
  const pendingBlogs = 12;
  const pendingEvents = 5;

  const pendingUsers = 0;        // optional
  const pendingDiscussions = 0;  // optional

  const items = [
    {
      id: 1,
      label: "Pending Blog Approvals",
      count: pendingBlogs,
      color: "bg-blue-100 text-blue-600",
      border: "border-blue-200",
      onClick: () => console.log("Navigate → blog approvals"),
    },
    {
      id: 2,
      label: "Pending Upcoming Events",
      count: pendingEvents,
      color: "bg-green-100 text-green-600",
      border: "border-green-200",
      onClick: () => console.log("Navigate → event approvals"),
    },

    // OPTIONAL EXTRAS — ENABLE WHEN NEEDED
    // {
    //   id: 3,
    //   label: "Pending User Verifications",
    //   count: pendingUsers,
    //   color: "bg-purple-100 text-purple-600",
    //   border: "border-purple-200",
    //   onClick: () => console.log("Navigate → user approvals"),
    // },
    // {
    //   id: 4,
    //   label: "Pending Discussion Approvals",
    //   count: pendingDiscussions,
    //   color: "bg-amber-100 text-amber-600",
    //   border: "border-amber-200",
    //   onClick: () => console.log("Navigate → discussion approvals"),
    // },
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 font-inter w-full h-full flex flex-col"

      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
        <span className="w-2 h-6 bg-DGXgreen rounded"></span>
        Approvals Dashboard
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {items.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`p-5 rounded-xl bg-gray-50 border ${item.border} text-left shadow-sm hover:bg-gray-100 transition`}
            onClick={item.onClick}
          >
            {/* Label */}
            <h3 className="font-semibold text-gray-800 text-sm mb-3 hover:text-DGXblue transition">
              {item.label}
            </h3>

            {/* Count Badge */}
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${item.color}`}
            >
              {item.count} Pending
            </div>

            {/* Extra info */}
            <p className="text-xs text-gray-500 mt-3">
              Click to review approvals
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default ApprovalSection;

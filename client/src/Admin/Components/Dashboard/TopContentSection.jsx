import React from "react";

const TopContentSection = () => {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Top Contributors & Content
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Contributors */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-700 mb-2">Top Contributors</h3>
          <p className="text-sm text-gray-500">
            Highlight top contributors in blogs and discussions.
          </p>
        </div>

        {/* Top Performing Content */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-700 mb-2">Top Performing Content (Top 5)</h3>
          <p className="text-sm text-gray-500">
            Display top 5 high-performing content items.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TopContentSection;

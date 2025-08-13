import React from "react";
import { motion } from "framer-motion";

const Map = ({ mapEmbedUrl }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      {mapEmbedUrl ? (
        <iframe
          src={mapEmbedUrl}
          className="w-full h-full border-0 rounded-lg"
          allowFullScreen
          loading="lazy"
          title="Location Map"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center h-full bg-gray-100 rounded-lg"
        >
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-gray-500 font-medium">Map not available</p>
            <p className="text-gray-400 text-sm mt-1">Location details will be displayed here</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Map;
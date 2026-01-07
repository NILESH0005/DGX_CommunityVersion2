import React from 'react';
import { BookOpen, Image as ImageIcon, Clock, BarChart3, Target } from 'lucide-react';

const UnitDetails = ({ subModule }) => {
  // Calculate total duration and other metrics
  const totalDuration = subModule.units?.reduce((total, unit) => total + (unit.duration || 0), 0) || 0;
  const completedUnits = subModule.units?.filter(unit => unit.completed)?.length || 0;
  const progressPercentage = subModule.units?.length ? (completedUnits / subModule.units.length) * 100 : 0;

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Function to get image source
  const getImageSrc = () => {
    // Check for different possible image properties
    if (subModule.SubModuleImageUrl) {
      return subModule.SubModuleImageUrl;
    }
    if (subModule.SubModuleImagePath) {
      const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL || '';
      const cleanPath = subModule.SubModuleImagePath.replace(/^\/+/, '');
      return `${baseUploadsUrl}/${cleanPath}`;
    }
    if (subModule.SubModuleImage) {
      // If it's a string URL
      if (typeof subModule.SubModuleImage === 'string') {
        // Check if it's already a URL or needs base URL
        if (subModule.SubModuleImage.startsWith('http') || subModule.SubModuleImage.startsWith('data:')) {
          return subModule.SubModuleImage;
        } else {
          const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL || '';
          const cleanPath = subModule.SubModuleImage.replace(/^\/+/, '');
          return `${baseUploadsUrl}/${cleanPath}`;
        }
      }
      // If it's an object with data property (base64)
      if (subModule.SubModuleImage.data && subModule.SubModuleImage.contentType) {
        return `data:${subModule.SubModuleImage.contentType};base64,${subModule.SubModuleImage.data}`;
      }
    }
    // Return a placeholder if no image
    return 'https://via.placeholder.com/200x200?text=No+Image';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full hover:shadow-md transition-shadow duration-200">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-100">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Title Section */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">
                    {subModule.SubModuleName}
                  </h3>
                  
                  {/* Description */}
                  {subModule.SubModuleDescription && (
                    <p className="text-gray-600 mt-2 leading-relaxed text-base max-w-3xl">
                      {subModule.SubModuleDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm group-hover:border-green-400 transition-colors duration-200">
                  <img 
                    src={getImageSrc()} 
                    alt={subModule.SubModuleName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/200x200?text=Image+Error';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-end justify-center pb-2 rounded-xl transition-all duration-200">
                  <div className="flex items-center gap-1 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ImageIcon className="w-3 h-3" />
                    <span>View</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitDetails;
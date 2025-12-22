import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ApiContext from "../../context/ApiContext";
import ByteArrayImage from "../../utils/ByteArrayImage";
import {
  FaAngleDown,
  FaAngleUp,
  FaEye,
  FaClock,
  FaPlayCircle,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import Swal from "sweetalert2";
import images from "../../../public/images";

const ModuleCard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchData, userToken } = useContext(ApiContext);
  const navigate = useNavigate();
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Fetch Modules & Views
  useEffect(() => {
    const fetchModulesAndViews = async () => {
      try {
        setLoading(true);

        // 1️⃣ Fetch modules + views
        const [modulesResponse, viewsResponse] = await Promise.all([
          fetchData("dropdown/getModules", "GET"),
          fetchData("lms/module-views", "GET"),
        ]);

        if (!modulesResponse?.success) {
          throw new Error(modulesResponse?.message || "Failed to load modules");
        }

        const modulesData = modulesResponse.data || [];
        const viewsData = viewsResponse?.data || [];

        // 2️⃣ Fetch ratings (IMPORTANT: before map)
        const ratingRequests = modulesData.map((module) =>
          fetchData(`lms/module-rating/${module.ModuleID}`, "GET")
        );

        const ratingResponses = await Promise.all(ratingRequests);

        // 3️⃣ Merge modules + views + ratings
        const mergedModules = modulesData.map((module, index) => {
          const viewEntry = viewsData.find(
            (v) => v.moduleID === module.ModuleID
          );

          const ratingData = ratingResponses[index]?.data || {};

          return {
            ...module,
            totalViews: viewEntry ? viewEntry.totalViews : 0,
            totalTimeSpent: viewEntry ? Number(viewEntry.totalTimeSpent) : 0,
            Rating: ratingData.avgRating ?? 0,
            totalRatings: ratingData.totalRatings ?? 0,
          };
        });

        setModules(mergedModules);

        // 4️⃣ Expand state
        const initialExpandedState = {};
        mergedModules.forEach(
          (m) => (initialExpandedState[m.ModuleID] = false)
        );
        setExpandedDescriptions(initialExpandedState);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          title: "Error",
          text: error.message || "Failed to fetch module data",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModulesAndViews();
  }, [fetchData]);

  const formatTime = (totalSeconds) => {
    if (!totalSeconds || totalSeconds === 0) return "Not started";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatTimeCompact = (totalSeconds) => {
    if (!totalSeconds || totalSeconds === 0) return "0s";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getTimeSpentColor = (totalSeconds) => {
    if (!totalSeconds || totalSeconds === 0) return "text-gray-500 bg-gray-100";

    if (totalSeconds < 60) {
      return "text-yellow-700 bg-yellow-100"; // Less than 1 minute
    } else if (totalSeconds < 300) {
      return "text-blue-700 bg-blue-100"; // Less than 5 minutes
    } else {
      return "text-green-700 bg-green-100"; // 5 minutes or more
    }
  };

  const handleModuleClick = (moduleId, moduleName) => {
    if (!userToken) {
      Swal.fire({
        title: "Login Required",
        text: "You need to login to access this module",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Go to Login",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#4f46e5",
        cancelButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/SignInn");
        }
      });
      return;
    }
    localStorage.setItem("moduleName", moduleName);
    localStorage.setItem("moduleId", moduleId);
    navigate(`/module/${moduleId}`, {
      state: {
        moduleName: moduleName,
        moduleId: moduleId,
      },
    });
  };

  const toggleDescription = (moduleId, event) => {
    event.stopPropagation();
    setExpandedDescriptions((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const isDescriptionClamped = (description) =>
    description && description.length > 100;

  const renderModuleImage = (module) => {
    if (module.ModuleImageUrl) {
      return (
        <img
          src={module.ModuleImageUrl}
          alt={module.ModuleName}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = images.Noimage;
            e.target.className = "w-full h-full object-contain bg-gray-200 p-4";
          }}
        />
      );
    }
    if (module.ModuleImage) {
      return (
        <ByteArrayImage
          byteArray={module.ModuleImage.data}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      );
    }
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-100 to-purple-100">
        <img
          src={images.Noimage}
          alt="No Image Available"
          className="w-2/3 h-2/3 object-contain opacity-70"
        />
      </div>
    );
  };

  // =========================
  // Loading Skeleton
  // =========================
  if (loading) {
    return (
      <div className="min-h-[60vh] p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="backdrop-blur-lg bg-white/60 border border-white/40 rounded-3xl overflow-hidden shadow-lg animate-pulse"
            >
              <div className="h-48 bg-gradient-to-r from-indigo-100 to-purple-100"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-white/70 rounded w-3/4"></div>
                <div className="h-4 bg-white/70 rounded w-1/4"></div>
                <div className="h-16 bg-white/70 rounded"></div>
                <div className="h-10 bg-white/70 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatTimeSmart = (totalSeconds) => {
    if (!totalSeconds || totalSeconds <= 0) return "0m";

    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }

    if (minutes > 0) {
      return `${minutes}m`;
    }

    return `${totalSeconds}s`;
  };

  // =========================
  // Render Actual Modules
  // =========================
  return (
    <div className="min-h-[60vh] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div
            key={module.ModuleID}
            onClick={() =>
              handleModuleClick(module.ModuleID, module.ModuleName)
            }
            className="backdrop-blur-lg bg-white/60 border border-white/40 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            {/* Module Image */}
            <div className="h-44 sm:h-48 overflow-hidden relative">
              {renderModuleImage(module)}
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-indigo-900 mb-2 hover:text-indigo-600 transition-colors duration-300 break-words group-hover:text-indigo-700">
                {module.ModuleName}
              </h3>

              {/* Stats Row (RESPONSIVE) */}
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  {/* 👁 Views */}
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <FaEye className="text-indigo-400" />
                    <span className="font-medium">{module.totalViews}</span>
                    <span className="hidden sm:inline">views</span>
                  </div>

                  {/* ⏱ Time */}
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <FaClock className="text-purple-400" />
                    <span className="font-medium">
                      {formatTimeSmart(module.totalTimeSpent)}
                    </span>
                  </div>

                  {/* 👥 Average Rating */}
                  <div className="flex items-center gap-2 whitespace-nowrap cursor-pointer hover:text-blue-600 transition-colors">
                    <FaUsers className="text-purple-400" />

                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-700">
                        {(module.Rating ?? 0).toFixed(1)}
                      </span>

                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`text-xs ${
                              star <= module.Rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p
                  className={`text-gray-700 text-sm sm:text-base leading-relaxed ${
                    expandedDescriptions[module.ModuleID]
                      ? "overflow-y-auto max-h-32"
                      : "line-clamp-2"
                  }`}
                >
                  {module.ModuleDescription || "No description available."}
                </p>

                {isDescriptionClamped(module.ModuleDescription) && (
                  <button
                    onClick={(e) => toggleDescription(module.ModuleID, e)}
                    className="text-indigo-500 hover:text-indigo-700 mt-2 text-sm flex items-center group/button"
                  >
                    {expandedDescriptions[module.ModuleID] ? (
                      <>
                        <FaAngleUp className="mr-1 group-hover/button:-translate-y-0.5 transition-transform" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <FaAngleDown className="mr-1 group-hover/button:translate-y-0.5 transition-transform" />
                        Read More
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleCard;

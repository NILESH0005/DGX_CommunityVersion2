import React, { useState, useEffect, useContext } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import ApiContext from "../../context/ApiContext";
import ByteArrayImage from "../../utils/ByteArrayImage";
import ProgressBar from "./ProgressBar";
import { FaAngleDown, FaAngleUp, FaArrowLeft, FaEye } from "react-icons/fa";
import images from "../../../public/images";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.12)" },
};

const imageVariants = {
  hover: { scale: 1.05 },
  initial: { scale: 1 },
};

const descriptionVariants = {
  collapsed: { height: 72, opacity: 0.8, transition: { duration: 0.3 } },
  expanded: { height: "auto", opacity: 1, transition: { duration: 0.5 } },
};

const SubModuleCard = () => {
  const { moduleId } = useParams();
  const [searchParams] = useSearchParams();
  const [subModules, setSubModules] = useState([]);
  const [moduleName, setModuleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);
  const [progressData, setProgressData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [viewedSubModules, setViewedSubModules] = useState(new Set());
  const [subModuleViews, setSubModuleViews] = useState([]);

  const recordSubModuleView = async (subModuleId) => {
    try {
      if (!userToken) {
        console.log("User not logged in, skipping view recording");
        return;
      }

      const viewData = {
        ProcessName: "LMS",
        reference: subModuleId,
      };

      const response = await fetchData(
        "progressTrack/recordView",
        "POST",
        viewData,
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        if (response.data.alreadyViewed) {
          console.log("View was already recorded previously");
        } else {
          console.log("First-time view recorded successfully:", response.data);
        }
      } else {
        console.error("Error recording submodule view:", response?.message);
      }
    } catch (error) {
      console.error("Error recording submodule view:", error);
    }
  };

  // Handle submodule click
  const handleSubModuleClick = async (subModule) => {
    // Record the view (service will handle the "only once" logic)
    await recordSubModuleView(subModule.SubModuleID);

    navigate(`/submodule/${subModule.SubModuleID}`, {
      state: {
        moduleId,
        moduleName,
        submoduleName: subModule.SubModuleName,
      },
    });
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const subModulesResponse = await fetchData(
        `dropdown/getSubModules?moduleId=${moduleId}`,
        "GET"
      );
      if (!subModulesResponse?.success) {
        setError(subModulesResponse?.message || "Failed to fetch submodules");
        return;
      }

      setSubModules(subModulesResponse.data);

      const progressResponse = await fetchData(
        "progressTrack/getModuleSubmoduleProgress",
        "POST",
        { moduleID: moduleId },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );
      if (progressResponse?.success) {
        setProgressData(progressResponse.data);
      }

      const viewsResponse = await fetchData("lms/submodule-views", "GET");
      if (viewsResponse?.success) {
        setSubModuleViews(viewsResponse.data);
      }

      const initialExpandedState = {};
      subModulesResponse.data.forEach((subModule) => {
        initialExpandedState[subModule.SubModuleID] = false;
      });
      setExpandedDescriptions(initialExpandedState);

      if (!moduleName) {
        const currentModule = subModulesResponse.data[0]?.ModuleName;
        if (currentModule) {
          setModuleName(currentModule);
          if (!searchParams.get("moduleName")) {
            navigate(`?moduleName=${encodeURIComponent(currentModule)}`, {
              replace: true,
            });
          }
        }
      }
    } catch (error) {
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const renderSubModuleImage = (subModule) => {
    if (subModule.SubModuleImageUrl) {
      return (
        <motion.img
          src={subModule.SubModuleImageUrl}
          alt={subModule.SubModuleName}
          className="w-full h-full object-cover rounded-t-lg"
          variants={imageVariants}
          initial="initial"
          whileHover="hover"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = images.Noimage;
            e.target.className =
              "w-full h-full object-contain bg-gray-200 p-4 rounded-t-lg";
          }}
          loading="lazy"
        />
      );
    }

    if (subModule.SubModuleImage) {
      return (
        <motion.div
          className="w-full h-full rounded-t-lg overflow-hidden"
          variants={imageVariants}
          initial="initial"
          whileHover="hover"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ByteArrayImage
            byteArray={subModule.SubModuleImage.data}
            className="w-full h-full object-cover rounded-t-lg"
          />
        </motion.div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full bg-gray-200 rounded-t-lg animate-pulse">
        <img
          src={images.Noimage}
          alt="No Image Available"
          className="w-3/4 h-3/4 object-contain opacity-70"
          loading="lazy"
        />
      </div>
    );
  };

  useEffect(() => {
    const nameFromParams = searchParams.get("moduleName");
    if (nameFromParams) {
      setModuleName(decodeURIComponent(nameFromParams));
    } else if (location.state?.moduleName) {
      setModuleName(location.state.moduleName);
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        const subModulesResponse = await fetchData(
          `dropdown/getSubModules?moduleId=${moduleId}`,
          "GET"
        );
        if (!subModulesResponse?.success) {
          setError(subModulesResponse?.message || "Failed to fetch submodules");
          return;
        }

        setSubModules(subModulesResponse.data);

        const progressResponse = await fetchData(
          "progressTrack/getModuleSubmoduleProgress",
          "POST",
          { moduleID: moduleId },
          {
            "Content-Type": "application/json",
            "auth-token": userToken,
          }
        );

        if (progressResponse?.success) {
          setProgressData(progressResponse.data);
        }

        const viewsResponse = await fetchData("lms/submodule-views", "GET");
        if (viewsResponse?.success) {
          setSubModuleViews(viewsResponse.data);
        }

        const initialExpandedState = {};
        subModulesResponse.data.forEach((subModule) => {
          initialExpandedState[subModule.SubModuleID] = false;
        });
        setExpandedDescriptions(initialExpandedState);

        if (!moduleName) {
          const currentModule = subModulesResponse.data[0]?.ModuleName;
          if (currentModule) {
            setModuleName(currentModule);
            if (!searchParams.get("moduleName")) {
              navigate(`?moduleName=${encodeURIComponent(currentModule)}`, {
                replace: true,
              });
            }
          }
        }
      } catch (error) {
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [
    location.state,
    searchParams,
    moduleId,
    fetchData,
    navigate,
    moduleName,
    userToken,
  ]);

  const toggleDescription = (subModuleId, event) => {
    event.stopPropagation();
    setExpandedDescriptions((prev) => ({
      ...prev,
      [subModuleId]: !prev[subModuleId],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-[400px] flex flex-col"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0 rounded-t-xl"></div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-grow"></div>
                  <div className="h-12 mt-4 flex items-center">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
            >
              Back to Modules
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 relative">
      <button
        onClick={() => navigate("/LearningPath")}
        aria-label="Back to all Modules"
        className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow border border-gray-300
    hover:shadow-md hover:bg-gray-100 hover:border-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-400
    transition-all duration-150 group"
      >
        <FaArrowLeft
          className="text-gray-600 group-hover:-translate-x-1 group-hover:text-blue-700 transition-transform duration-150"
          aria-hidden="true"
        />
        <span className="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors duration-150">
          All Modules
        </span>
        <span className="sr-only">Return to the module list page</span>
      </button>

      <div className="max-w-7xl mx-auto pt-6 px-2 sm:px-6 lg:px-8">
        {moduleName && (
          <motion.div
            className="w-full text-center mb-12 mt-8 px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 mb-3 select-none">
              {moduleName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl font-light select-none">
              Explore the learning modules under this section
            </p>
            <div className="h-1 w-24 mx-auto mt-3 rounded-full bg-gradient-to-r from-blue-500 to-teal-400"></div>
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {subModules.length > 0 ? (
            subModules.map((subModule) => {
              const isExpanded = expandedDescriptions[subModule.SubModuleID];

              return (
                <motion.div
                  key={subModule.SubModuleID}
                  layout
                  variants={cardVariants}
                  whileHover="hover"
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-pointer flex flex-col overflow-hidden border border-transparent hover:border-gradient-to-r hover:from-blue-400 hover:via-teal-300 hover:to-blue-500 transition-all duration-300`}
                  onClick={() => handleSubModuleClick(subModule)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSubModuleClick(subModule);
                    }
                  }}
                >
                  <div className="h-48 sm:h-44 md:h-40 bg-gray-100 dark:bg-gray-700 overflow-hidden rounded-t-xl">
                    {renderSubModuleImage(subModule)}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 break-words hover:text-blue-600 dark:hover:text-teal-400 transition-colors duration-200 select-text">
                      {subModule.SubModuleName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                      <FaEye className="text-gray-400 text-base" />
                      <span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {subModuleViews.find(
                            (v) => v.subModuleID === subModule.SubModuleID
                          )?.totalViews || 0}
                        </span>{" "}
                        views
                      </span>
                    </p>
                    <motion.div
                      className="relative overflow-hidden text-gray-700 dark:text-gray-300 text-base mb-3 select-text"
                      initial={false}
                      animate={isExpanded ? "expanded" : "collapsed"}
                      variants={descriptionVariants}
                    >
                      <p
                        className={`leading-relaxed ${
                          !isExpanded ? "line-clamp-3" : ""
                        }`}
                        aria-live="polite"
                      >
                        {subModule.SubModuleDescription}
                      </p>

                      {subModule.SubModuleDescription &&
                      subModule.SubModuleDescription.length > 100 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDescription(subModule.SubModuleID, e);
                          }}
                          aria-label={
                            isExpanded
                              ? "Collapse description"
                              : "Expand description"
                          }
                          className="absolute bottom-0 right-0 bg-gradient-to-t from-white dark:from-gray-900 via-white/50 dark:via-gray-900/70 p-1 rounded-full backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
                        </button>
                      ) : null}
                    </motion.div>

                    <div className="mt-auto pt-2">
                      <ProgressBar
                        subModuleID={subModule.SubModuleID}
                        progressData={progressData}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                No submodules found for this module
              </p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
              >
                Back to Modules
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SubModuleCard;

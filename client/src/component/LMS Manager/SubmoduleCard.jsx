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
import { FaAngleDown, FaAngleUp, FaArrowLeft } from "react-icons/fa";

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

  // useEffect(() => {
  //   // console.log("useEffect")
  //   const nameFromParams = searchParams.get("moduleName");
  //   if (nameFromParams) {
  //     setModuleName(decodeURIComponent(nameFromParams));
  //   } else if (location.state?.moduleName) {
  //     setModuleName(location.state.moduleName);
  //   }
  // }, [location.state, searchParams]);
  const renderSubModuleImage = (subModule) => {
    // ✅ If we already have a full URL
    if (subModule.SubModuleImageUrl) {
      return (
        <img
          src={subModule.SubModuleImageUrl}
          alt={subModule.SubModuleName}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null; // prevent infinite loop
            e.target.src =
              "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            e.target.className = "w-full h-full bg-gray-200";
          }}
        />
      );
    }

    // ✅ If we have a byte array image
    if (subModule.SubModuleImage) {
      return (
        <ByteArrayImage
          byteArray={subModule.SubModuleImage.data}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      );
    }

    // ✅ Fallback placeholder
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm h-full bg-gray-200">
        No Image
      </div>
    );
  };

  useEffect(() => {
    console.log("useEffect");
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
        // console.log("check calls");
        const subModulesResponse = await fetchData(
          `dropdown/getSubModules?moduleId=${moduleId}`,
          "GET"
        );
        console.log("resss", subModulesResponse)
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
        console.log("progress response", progressResponse);

        if (progressResponse?.success) {
          setProgressData(progressResponse.data);
        } else {
          console.error("Progress fetch failed:", progressResponse?.message);
        }

        const initialExpandedState = {};
        subModulesResponse.data.forEach((subModule) => {
          initialExpandedState[subModule.SubModuleID] = false;
        });
        setExpandedDescriptions(initialExpandedState);

        // Set module name if not already set
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
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [
    location.state, searchParams,
    moduleId,
    fetchData,
    navigate,
    searchParams,
    moduleName,
    location.state,
    userToken,
  ]);

  const toggleDescription = (subModuleId, event) => {
    event.stopPropagation();
    setExpandedDescriptions((prev) => ({
      ...prev,
      [subModuleId]: !prev[subModuleId],
    }));
  };

  const handleSubModuleClick = (subModule) => {
    navigate(`/submodule/${subModule.SubModuleID}`, {
      state: {
        moduleId,
        moduleName,
        submoduleName: subModule.SubModuleName,
      },
    });
  };

  const isDescriptionClamped = (description) => {
    return description && description.length > 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden h-[400px] flex flex-col"
              >
                <div className="h-48 bg-gray-200 animate-pulse flex-shrink-0"></div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded animate-pulse flex-grow"></div>
                  <div className="h-12 mt-4 flex items-center">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300"
            >
              Back to Modules
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <button
        onClick={() => navigate("/LearningPath")}
        className="fixed left-6 top-18 z-10 flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-50 border border-gray-200 group"
      >
        <FaArrowLeft className="text-blue-600 group-hover:text-blue-800 transition-colors" />
        <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
          All Modules
        </span>
      </button>

      <div className="max-w-7xl mx-auto pt-2">
        {moduleName && (
          <div className="w-full text-center mb-10 mt-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {moduleName}
            </h1>
            <p className="text-gray-500 text-lg">
              Explore the learning modules under this section
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subModules.length > 0 ? (
            subModules.map((subModule) => (
              <div
                key={subModule.SubModuleID}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${expandedDescriptions[subModule.SubModuleID] ? "h-auto" : "h-[400px]"
                  }`}
                onClick={() => handleSubModuleClick(subModule)}
              >
                <div className="h-40 bg-gray-100 overflow-hidden flex-shrink-0">
                  {renderSubModuleImage(subModule)}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors duration-200 break-words">
                    {subModule.SubModuleName}
                  </h3>
                  <div className="overflow-hidden">
                    <p
                      className={`text-gray-600 text-base mb-1 hover:text-gray-800 transition-colors duration-200 break-words ${expandedDescriptions[subModule.SubModuleID]
                        ? "overflow-y-auto max-h-32"
                        : "line-clamp-3"
                        }`}
                    >
                      {subModule.SubModuleDescription}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-600">
                No submodules found for this module
              </p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300"
              >
                Back to Modules
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubModuleCard;

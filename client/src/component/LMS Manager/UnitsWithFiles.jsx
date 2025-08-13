import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import ApiContext from "../../context/ApiContext";
import FileViewer from "../../utils/FileViewer";
import Quiz from "../quiz/Quiz";
import Swal from "sweetalert2";
import { FiFileText, FiFolder, FiX, FiMenu, FiBook, FiArrowLeft } from "react-icons/fi";
import FetchQuizQuestions from "../quiz/DemoQuiz";

const UnitsWithFiles = () => {
  const { subModuleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [allUnits, setAllUnits] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [viewedFiles, setViewedFiles] = useState(new Set());
  const [userFileIds, setUserFileIds] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [moduleName, setModuleName] = useState("");
  const [subModuleName, setSubModuleName] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  // Get module and submodule names from location state if available
  // useEffect(() => {
  //   if (location.state?.moduleName) {
  //     setModuleName(location.state.moduleName);
  //   }
  //   if (location.state?.submoduleName) {
  //     setSubModuleName(location.state.submoduleName);
  //   }
  // }, [location.state]);
  // In your useEffect for getting module/submodule names
  useEffect(() => {
    // Set names from location state or localStorage
    const moduleName =
      location.state?.moduleName || localStorage.getItem("moduleName");
    const submoduleName =
      location.state?.submoduleName || localStorage.getItem("submoduleName");

    if (moduleName) setModuleName(moduleName);
    if (submoduleName) setSubModuleName(submoduleName);

    // Handle missing subModuleId
    if (!subModuleId) {
      const storedSubModuleId = localStorage.getItem("subModuleId");
      if (storedSubModuleId) {
        navigate(`/submodule/${storedSubModuleId}`, {
          replace: true,
          state: {
            moduleName,
            submoduleName,
            moduleId: localStorage.getItem("moduleId"),
          },
        });
      }
    }
  }, [location.state, subModuleId, navigate]);

  useEffect(() => {
    const fetchUserFileIds = async () => {
      try {
        if (!userToken) {
          console.log("No user token available, skipping file IDs fetch");
          return;
        }

        const response = await fetchData(
          "progressTrack/getUserFileIDs",
          "POST",
          {},
          {
            "Content-Type": "application/json",
            "auth-token": userToken,
          }
        );

        if (response?.success) {
          const fileIds = response.data.fileIds.map((file) => file.FileID);
          setViewedFiles(new Set(fileIds));
          setUserFileIds(response.data.fileIds);
        } else {
          console.error("Failed to fetch user file IDs:", response?.message);
        }
      } catch (error) {
        console.error("Error fetching user's file IDs:", error);
      }
    };

    if (userToken) {
      fetchUserFileIds();
    }
  }, [userToken, fetchData]);

  useEffect(() => {
    const fetchDataForSubmodule = async () => {
      try {
        setLoading(true);
        setError(null);
        const unitsResponse = await fetchData(
          `dropdown/getUnitsWithFiles/${subModuleId}`,
          "GET"
        );
        console.log("rrrrrrrrrrrrrr", unitsResponse);

        const quizzesResponse = await fetchData(
          "quiz/getQuizzesByRefId",
          "POST",
          { refId: subModuleId },
          {
            "Content-Type": "application/json",
            "auth-token": userToken,
          }
        );

        console.log("reessspoonnseee", quizzesResponse);

        if (unitsResponse?.success) {
          setAllUnits(unitsResponse.data);
          const filtered = unitsResponse.data.filter((unit) => {
            return String(unit.SubModuleID) === String(subModuleId);
          });
          setFilteredUnits(filtered);
        }

        if (quizzesResponse?.success) {
          const transformedQuizzes = quizzesResponse.data
            .map((quiz) => ({
              ...quiz,
              group_id: quiz.QuizGroupID,
            }))
            .sort((a, b) => a.QuizLevel - b.QuizLevel);
          setQuizzes(transformedQuizzes);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (subModuleId) {
      fetchDataForSubmodule();
    }
  }, [subModuleId, fetchData, userToken]);

  const recordFileView = async (fileId, unitId) => {
    try {
      // Check if THIS USER has already viewed THIS FILE
      if (viewedFiles.has(fileId)) {
        console.log("File already viewed by this user");
        return;
      }

      const response = await fetchData(
        "lmsEdit/recordFileView",
        "POST",
        { FileID: fileId },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        if (response.message !== "File view already recorded for this user") {
          setViewedFiles((prev) => new Set(prev).add(fileId));
        }
      } else {
        console.error(
          "Error recording file view:",
          response?.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error(
        "Error recording file view:",
        error.message || "Unknown error"
      );
    }
  };

  const handleFileSelect = (file, unit) => {
    setSelectedQuiz(null);
    setSelectedFile({
      ...file,
      unitName: unit.UnitName,
      unitDescription: unit.UnitDescription,
    });
    recordFileView(file.FileID, unit.UnitID);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleBackToSubmodules = () => {
    const moduleId = localStorage.getItem("moduleId");
    const moduleName = localStorage.getItem("moduleName");

    if (moduleId && moduleName) {
      navigate(`/module/${moduleId}`, {
        state: {
          moduleName: moduleName,
          moduleId: moduleId
        }
      });
    } else {
      navigate(-1); // Fallback to browser back if no module info is available
    }
  };

  const needsReadMore = (text) => {
    if (!text) return false;
    return text.split(" ").length > 10;
  };

  const getTruncatedText = (text, wordLimit = 10) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };
  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "pdf":
        return <FiFileText className="w-4 h-4" />;
      case "ipynb":
        return <FiBook className="w-4 h-4" />;
      case "docx":
        return <FiFileText className="w-4 h-4" />;
      default:
        return <FiFileText className="w-4 h-4" />;
    }
  };

  const isExternalLink = (file) => {
    return (
      file.FileType === "link" ||
      (file.FilePath &&
        (file.FilePath.startsWith("http://") ||
          file.FilePath.startsWith("https://")))
    );
  };

  const removeFileExtension = (filename) => {
    return filename.replace(/\.[^/.]+$/, "");
  };

  if (!subModuleId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">No Submodule Selected</h2>
          <p className="text-gray-600">
            Please select a submodule from the menu to view its units and files.
          </p>
        </div>
      </div>
    );
  }

  const handleQuizSelect = (quiz) => {
    navigate(`/quiz/${quiz.QuizID}`, {
      state: {
        quiz: {
          ...quiz,
          group_id: 2,
          QuizID: quiz.QuizID,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <div
          className={`${isSidebarCollapsed ? "w-16" : "w-64 lg:w-80"
            } bg-[#1f2937] text-white p-4 border-r border-gray-700 transition-all duration-300`}
        >
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-6 animate-pulse"></div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-700 rounded mb-3 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="flex-1 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6 animate-pulse"></div>
          <div className="h-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (filteredUnits.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">No Units Found</h2>
          <p className="text-gray-600">
            There are no units available for the selected submodule.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <button
        onClick={handleBackToSubmodules}
        className="fixed left-6 top-18 z-50 flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-50 border border-gray-200 group"
      >
        <FiArrowLeft className="text-blue-600 group-hover:text-blue-800 transition-colors" />
        <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
          Back
        </span>
      </button>
      <div
        className={`${isSidebarCollapsed ? "w-20" : "w-80"
          } bg-[#1f2937] text-white border-r border-gray-700 overflow-y-auto transition-all duration-300 ease-in-out relative`}
      >
        {/* Toggle Button - Made Bigger and More Visible */}
        <div className="flex justify-center pt-14">
          <button
            onClick={toggleSidebar}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full p-3 border-2 border-blue-500 hover:from-blue-700 hover:to-blue-800 hover:border-blue-400 transition-all duration-200 z-20 shadow-lg hover:shadow-xl transform hover:scale-110 group"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <FiMenu className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
            ) : (
              <FiX className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            )}
          </button>
        </div>

        <div className="p-4">

          <div className="space-y-2">
            {filteredUnits.map((unit) => {
              const needsReadMoreUnit = needsReadMore(unit.UnitDescription);
              const isExpanded = expandedDescriptions.has(
                `unit-${unit.UnitID}`
              );
              return (
                <div
                  key={unit.UnitID}
                  className={`${isSidebarCollapsed ? "p-3" : "p-2"}  
                  `}
                  onClick={() => {
                    if (unit.files?.length > 0) {
                      setSelectedFile({
                        ...unit.files[0],
                        unitName: unit.UnitName,
                        unitDescription: unit.UnitDescription,
                      });
                    }
                  }}
                >
                  {isSidebarCollapsed ? (
                    <div className="flex justify-center" title={unit.UnitName}>
                      <FiFolder className="w-6 h-6 text-yellow-400" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
                          <FiFolder className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-2 text-white leading-tight">
                            {unit.UnitName}
                          </h3>
                          {/* <p className="text-gray-300 text-sm leading-relaxed">
                            {needsReadMoreUnit ? (
                              <>
                                {isExpanded
                                  ? unit.UnitDescription
                                  : getTruncatedText(unit.UnitDescription)}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDescription(`unit-${unit.UnitID}`);
                                  }}
                                  className="ml-2 text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
                                >
                                  {isExpanded ? "Read less" : "Read more"}
                                </button>
                              </>
                            ) : (
                              unit.UnitDescription
                            )}
                          </p> */}
                          <p className="text-gray-300 text-sm leading-relaxed break-words">
                            {needsReadMoreUnit ? (
                              <>
                                {isExpanded
                                  ? unit.UnitDescription
                                  : getTruncatedText(unit.UnitDescription)}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDescription(`unit-${unit.UnitID}`);
                                  }}
                                  className="ml-2 text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
                                >
                                  {isExpanded ? "Read less" : "Read more"}
                                </button>
                              </>
                            ) : (
                              unit.UnitDescription
                            )}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {unit.files?.length > 0 && (
                    <div
                      className={`${isSidebarCollapsed
                        ? "mt-3 space-y-1"
                        : "mt-4 ml-2 border-l-2 border-gray-600 pl-4 space-y-2"
                        }`}
                    >
                      {unit.files.map((file) => {
                        const isViewed = viewedFiles.has(file.FileID);
                        const isSelected = selectedFile?.FileID === file.FileID;

                        return (
                          <div
                            key={file.FileID}
                            className={`${isSidebarCollapsed
                              ? "p-2 flex justify-center rounded-lg"
                              : "py-3 px-3 rounded-lg"
                              } flex items-center transition-all duration-200 ${isSelected
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md transform scale-105"
                                : isViewed
                                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-500 hover:to-green-600 shadow-sm"
                                  : "text-gray-300 hover:text-white hover:bg-gray-600/70 hover:shadow-sm"
                              } cursor-pointer group`}
                            title={
                              isSidebarCollapsed
                                ? removeFileExtension(file.FilesName)
                                : ""
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileSelect(file, unit);
                            }}
                          >
                            {isSidebarCollapsed ? (
                              <div className="flex justify-center">
                                {getFileIcon(file.fileType)}
                              </div>
                            ) : (
                              <>
                                <div className="mr-3 flex-shrink-0 transition-transform group-hover:scale-110">
                                  {getFileIcon(file.fileType)}
                                </div>
                                {/* <div className="flex-1 min-w-0">
                                  <span className="block truncate font-medium text-sm">
                                    {removeFileExtension(file.FilesName)}
                                  </span>
                                  {isViewed && !isSelected && (
                                    <span className="text-xs text-green-300 mt-1 block">
                                      ✓ Completed
                                    </span>
                                  )}
                                </div> */}
                                <div className="flex-1 min-w-0">
                                  <span className="block font-medium text-sm whitespace-normal break-words">
                                    {removeFileExtension(file.FilesName)}
                                  </span>
                                  {isViewed && !isSelected && (
                                    <span className="text-xs text-green-300 mt-1 block">
                                      ✓ Completed
                                    </span>
                                  )}
                                </div>
                                {isViewed && (
                                  <div className="ml-2 flex-shrink-0">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                      <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {quizzes.length > 0 && (
            <div className="mb-6">
              <h3
                className={`font-bold ${isSidebarCollapsed ? "text-center" : "text-lg mb-2"
                  }`}
              >
                {isSidebarCollapsed ? "Q" : "Assessment"}
              </h3>
              <div className="space-y-2">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.QuizID}
                    className={`${isSidebarCollapsed ? "p-2 flex justify-center" : "p-2"
                      } rounded hover:bg-gray-700 cursor-pointer ${selectedQuiz?.QuizID === quiz.QuizID ? "bg-blue-600" : ""
                      }`}
                    onClick={() => handleQuizSelect(quiz)}
                    title={isSidebarCollapsed ? quiz.QuizName : ""}
                  >
                    {isSidebarCollapsed ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <div>
                        <h4 className="font-medium">{quiz.QuizName}</h4>
                        <p className="text-xs text-gray-300">
                          {quiz.QuizDuration} min • {quiz.PassingPercentage}% to
                          pass
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {subModuleName || "Submodule Content"}
              </h1>
              {selectedFile && (
                <p className="text-gray-600 mt-1">
                  Unit: {selectedFile.unitName || "Current Unit"}
                </p>
              )}
            </div>
          </div>
          <hr className="my-4 border-gray-200" />
        </div>
        {selectedQuiz ? (
          // Render Quiz component when a quiz is selected

          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {selectedQuiz.QuizName}
              </h1>
              <p className="text-gray-600 mt-2">
                Duration: {selectedQuiz.QuizDuration} minutes | Passing Score:{" "}
                {selectedQuiz.PassingPercentage}% id:{selectedQuiz.QuizID}
              </p>
            </div>

            <Quiz
              quizz={{
                ...selectedQuiz,
                QuizID: selectedQuiz.QuizID,
                group_id: selectedQuiz.group_id || selectedQuiz.QuizGroupID,
                title: selectedQuiz.QuizName,
                duration: selectedQuiz.QuizDuration,
                passingPercentage: selectedQuiz.PassingPercentage,
              }}
              onQuizComplete={() => {
                setSelectedQuiz(null);
                Swal.fire({
                  title: "Quiz Completed!",
                  icon: "success",
                  confirmButtonText: "OK",
                });
              }}
            />
          </div>
        ) : selectedFile ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mt-4">
                {removeFileExtension(selectedFile.FilesName)}
              </h2>
            </div>
            {isExternalLink(selectedFile) ? (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-8">
                <div className="max-w-md w-full text-center">
                  <div className="mb-6">
                    <svg
                      className="w-16 h-16 mx-auto text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3zM5 5h6V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-2v6H5V5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4">
                    {selectedFile.FilesName || "External Content Link"}
                  </h3>
                  <p className="mb-6 text-gray-600 italic">
                    {selectedFile.Description ||
                      "This content is hosted externally. Click the button below to view it."}
                  </p>
                  <a
                    href={selectedFile.FilePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200 inline-flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3zM5 5h6V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-2v6H5V5z" />
                    </svg>
                    Open
                    {/* {selectedFile.FilesName || "Link"}  */}
                    Link
                  </a>
                </div>
              </div>
            ) : (
              <div
                className={`flex-1 w-full rounded-xl shadow-lg relative overflow-hidden ${selectedFile?.fileType === "ipynb"
                  ? "bg-[#f5f5f5] border border-gray-300"
                  : "bg-white border"
                  }`}
              >
                {selectedFile?.fileType === "ipynb" && (
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gray-200 flex items-center px-4 border-b border-gray-300 z-10">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="ml-4 text-sm text-gray-600 font-medium">
                      {removeFileExtension(selectedFile.FilesName)}
                    </div>
                  </div>
                )}
                <div
                  className={
                    selectedFile?.fileType === "ipynb"
                      ? "h-full pt-8"
                      : "h-full"
                  }
                >
                  <FileViewer
                    fileUrl={`${import.meta.env.VITE_API_BASEURL}${selectedFile?.FilePath
                      }`}
                    className="w-full h-full"
                  />
                </div>
                {selectedFile?.fileType === "ipynb" && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-100 flex items-center px-4 border-t border-gray-300 text-xs text-gray-500">
                    <span>Kernel: Python 3</span>
                    <span className="mx-2">|</span>
                    <span>Notebook</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 max-w-md">
              <h2 className="text-2xl font-bold mb-4">Select Content</h2>
              <p className="text-gray-600">
                Please select a quiz or file from the sidebar to view its
                content.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

UnitsWithFiles.propTypes = {
  subModuleId: PropTypes.string.isRequired,
};

export default UnitsWithFiles;

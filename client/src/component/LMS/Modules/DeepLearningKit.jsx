import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import FeedbackForm from "../FeedBackForm.jsx";

const DeepLearningKit = () => {
  const { category, subcategory } = useParams();
  const navigate = useNavigate();
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState("ppt");
  const [feedback, setFeedback] = useState([]);

  const subcategories = [
    {
      id: 9,
      title: "Quick Start Guide",
      path: "quick-start-guide",
      fileId: "1ZJ_2u-I1oCPM3MvOT6IPpUboHRjR4iNW",
      type: "pdf",
    },
    {
      id: 2,
      title: "Module 1: Introduction to Machine Learning",
      path: "introduction-to-machine-learning",
      nested: [
        {
          id: 21,
          title: "Lecture 1",
          path: "lecture-1",
          fileId: "1cxu8olBlBx47UuOOvXksCkzoOG4FWYTb",
          type: "ppt",
        },
        {
          id: 22,
          title: "Lecture 2",
          path: "lecture-1",
          fileId: "1tCmysnYqZ8_9OkSVcSB_2bqEVXM4JEDm",
          type: "ppt",
        },
        {
          id: 23,
          title: "Lecture 3",
          path: "lecture-1",
          fileId: "1SB8U0anqOUHV28hVKOIrFXI_AEdDr6Gx",
          type: "ppt",
        },
        { id: 27, title: "Assessment", path: "QuizList", type: "link" },
      ],
    },
    {
      id: 3,
      title: "Module 2: Introduction to Deep Learning",
      path: "introduction-to-deep-learning",
      nested: [
        {
          id: 24,
          title: "Lecture 1",
          path: "lecture-2",
          fileId: "1SJpcG-IkIErkKVsgVdklSnFPzbZzNnLE",
          type: "ppt",
        },
        {
          id: 25,
          title: "Lecture 2",
          path: "lecture-2",
          fileId: "1RTs5sYGhC4I4-IK5B70QzNytQnbCLCq2",
          type: "ppt",
        },
        {
          id: 26,
          title: "Lecture 3",
          path: "lecture-2",
          fileId: "11BqsB-JjyRhY5GdVeONPZB8Iqelozqwy",
          type: "ppt",
        },
        {
          id: 271,
          title: "Assessment",
          path: "/component/quiz/QuizList",
          type: "link",
        },
      ],
    },
    {
      id: 4,
      title: "Module 3: Convolutional Neural Networks",
      path: "convolutional-neural-networks",
      nested: [
        {
          id: 27,
          title: "Lecture 1",
          path: "lecture-1",
          fileId: "1B6tUpU5OK9yPrORfOSEidwnG_1SYajL5",
          type: "ppt",
        },
        {
          id: 28,
          title: "Lecture 2",
          path: "lecture-2",
          fileId: "10xmgrDssO2b0Usi9G2OGibo2pjtLGnYH",
          type: "ppt",
        },
        {
          id: 29,
          title: "Lecture 3",
          path: "lecture-3",
          fileId: "1IXb-sDk8_LK0SGWgikZ8JiYcijtMJDdn",
          type: "ppt",
        },
        {
          id: 272,
          title: "Assessment",
          path: "/component/quiz/QuizList",
          type: "link",
        },
      ],
    },
    {
      id: 5,
      title: "Module 4: Energy Based Learning",
      path: "energy based learning",
      nested: [
        {
          id: 30,
          title: "Lecture 2",
          path: "lecture-2",
          fileId: "1CIi-gmxYTyRM0VcrtVenAXmG5W4w5HCj",
          type: "ppt",
        },
        {
          id: 31,
          title: "Lecture 2",
          path: "lecture-2",
          fileId: "1Mf4YV6XYCE56FVOzomyCNj-gHdFjydMp",
          type: "ppt",
        },
        {
          id: 32,
          title: "Lecture 3",
          path: "lecture-3",
          fileId: "10XXxuyhk46g2B5VZ7Bn-7c9F65setZHk",
          type: "ppt",
        },
        {
          id: 273,
          title: "Assessment",
          path: "/component/quiz/QuizList",
          type: "link",
        },
      ],
    },
    {
      id: 6,
      title: "Module 5: Optimization Techniques",
      path: "optimization techniques",
      nested: [
        {
          id: 33,
          title: "Lecture 1",
          path: "lecture-1",
          fileId: "1IAs20TnsM3Zebpnrd6yROezZ5JnXhcfg",
          type: "ppt",
        },
        {
          id: 274,
          title: "Assessment",
          path: "/component/quiz/QuizList",
          type: "link",
        },
      ],
    },
    {
      id: 7,
      title: "Module 6: Learning With Memory",
      path: "learning with memory",
      nested: [
        {
          id: 34,
          title: "Lecture 2",
          path: "lecture-2",
          fileId: "1NsfQjhY4Dpn1y2aV5hOVOelN7UQY_X4z",
          type: "ppt",
        },
        {
          id: 35,
          title: "Lecture 3",
          path: "lecture-2",
          fileId: "1TgNQGoGnMM5VTlkJJgOM1L8cf6LIWXiX",
          type: "ppt",
        },
        {
          id: 36,
          title: "Lecture 4",
          path: "lecture-2",
          fileId: "1QU4s8XCAMpkzLnMscN-T2eFvccOv2R7t",
          type: "ppt",
        },
        {
          id: 37,
          title: "Lecture 5",
          path: "lecture-2",
          fileId: "1lMwLxL_pA5Y_f7Z8xJCImenVMTYK2bkJ",
          type: "ppt",
        },
        {
          id: 38,
          title: "Lecture 6",
          path: "lecture-2",
          fileId: "1lygf6GXexJp3qhu0IMUNCO5ZkDsLeFg2",
          type: "ppt",
        },
        {
          id: 39,
          title: "Lecture 1",
          path: "lecture-1",
          fileId: "1mydloBanxw39e8iVn41Ow3nIX3Wq0MBs",
          type: "ppt",
        },
        {
          id: 275,
          title: "Assessment",
          path: "/component/quiz/QuizList",
          type: "link",
        },
      ],
    },
    {
      id: 8,
      title: "Module 7: Future Chalenges",
      path: "future chalenges",
      fileId: "1KGQ00fu9ZLQjwFHQOxw7PASmY0xAaLkg",
      type: "ppt",
    },
    {
      id: 10,
      title: "2nd Release Note",
      path: "2nd-release-note",
      fileId: "1fw_MKjMWCK0GP5vWAS9Dqj8IXTv7YHmG",
      type: "pdf",
    },
    {
      id: 11,
      title: "DLI Online Course and Certificate",
      path: "dli-online-course-and-certificate",
      fileId: "19gtDdyGFK-1RoFN1H_fR1xU9zraVn0Vx",
      type: "pdf",
    },
    {
      id: 12,
      title: "Syllabus",
      path: "syllabus",
      fileId: "16vkcuE7xa0Syh0mZAfCfxpGdm93v4tdj",
      type: "pdf",
    },
    {
      id: 14,
      title: "Video Trial",
      path: "video-trial",
      fileId: "1ufLceJD1z_AKRIdQjwgHk5aMuaC9PYXj",
      type: "mp4",
    },
  ];

  const handleFeedbackSubmit = (fileId, rating, comment) => {
    const newFeedback = {
      fileId,
      rating,
      comment,
      timestamp: new Date().toISOString(),
    };

    // Save feedback to localStorage
    const updatedFeedback = [...feedback, newFeedback];
    localStorage.setItem("userFeedback", JSON.stringify(updatedFeedback));
    setFeedback(updatedFeedback);

    // Optionally, send feedback to a backend server
    sendFeedbackToServer(newFeedback);
  };

  // Get embed link
  const getEmbedURL = (fileId, type = "ppt") => {
    switch (type) {
      case "ppt":
        return `https://docs.google.com/presentation/d/${fileId}/embed`;
      case "pdf":
        return `https://drive.google.com/file/d/${fileId}/preview`;
      case "mp4":
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      case "txt":
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      default:
        return "";
    }
  };

  // Auto-select the first file on load
  useEffect(() => {
    if (subcategories.length > 0 && !selectedFileId) {
      const firstSubcategory = subcategories[0];
      if (firstSubcategory.nested && firstSubcategory.nested.length > 0) {
        setSelectedFileId(firstSubcategory.nested[0].fileId);
        setSelectedFileType(firstSubcategory.nested[0].type);
      } else if (firstSubcategory.fileId) {
        setSelectedFileId(firstSubcategory.fileId);
        setSelectedFileType(firstSubcategory.type);
      }
    }
  }, [subcategories]);

  const handleSubcategoryClick = (path, fileId, type = "ppt") => {
    console.log(
      "Navigating to:",
      path,
      "with fileId:",
      fileId,
      "and type:",
      type
    );
    if (fileId) {
      setSelectedFileId(fileId);
      setSelectedFileType(type);
    }
  };

  const toggleNestedSubcategories = (id) => {
    setExpandedSubcategory((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
    };

    const disableKeyboardShortcuts = (e) => {
      // Disable Ctrl+S, Ctrl+P, etc.
      if (e.ctrlKey && (e.key === "s" || e.key === "p")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableKeyboardShortcuts);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableKeyboardShortcuts);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Deep Learning Kit</h2>
        <ul className="space-y-2">
          {subcategories.map((sub) => (
            <li key={sub.id}>
              <div
                className={`flex items-center justify-between hover:bg-gray-700 hover:text-white p-2 rounded cursor-pointer ${
                  subcategory === sub.path ? "bg-gray-700 text-white" : ""
                }`}
                onClick={() => {
                  if (sub.nested) {
                    toggleNestedSubcategories(sub.id);
                  } else {
                    handleSubcategoryClick(sub.path, sub.fileId, sub.type);
                  }
                }}
              >
                <span>{sub.title}</span>
                {sub.nested && (
                  <span className="text-xs">
                    {expandedSubcategory === sub.id ? "▼" : "▶"}
                  </span>
                )}
              </div>
              {sub.nested && expandedSubcategory === sub.id && (
                <ul className="pl-4 mt-2 space-y-2">
                  {sub.nested.map((nestedSub) => (
                    <li
                      key={nestedSub.id}
                      className={`p-2 rounded flex items-center ${
                        subcategory === nestedSub.path
                          ? "bg-gray-700 text-white"
                          : ""
                      }`}
                    >
                      {nestedSub.type === "link" ? (
                        <Link
                          to="/QuizList" // Fixed path to match your route
                          className="flex items-center text-blue-300 hover:text-blue-100 hover:underline w-full"
                        >
                          <span className="mr-2">📝</span>
                          <span>{nestedSub.title}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedFileId(nestedSub.fileId);
                            setSelectedFileType(nestedSub.type);
                          }}
                          className="flex items-center text-blue-300 hover:text-blue-100 hover:underline w-full"
                        >
                          <span className="mr-2">📊</span>
                          <span>{nestedSub.title}</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Section */}
        <div className="bg-white shadow-sm p-6">
          <h1 className="text-4xl font-bold text-center">Deep Learning Kit</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {selectedFileId && (
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold mb-4 text-DGXblue text-center">
                {
                  subcategories.find(
                    (s) =>
                      s.fileId === selectedFileId ||
                      (s.nested &&
                        s.nested.some((n) => n.fileId === selectedFileId))
                  )?.title
                }
              </h2>

              <div
                className="w-full max-w-7xl h-[70vh] border rounded-lg shadow-lg overflow-hidden relative"
                onContextMenu={(e) => e.preventDefault()}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "50px",
                    height: "50px",
                    backgroundColor: "transparent",
                    zIndex: 10,
                  }}
                />

                {selectedFileType === "mp4" ? (
                  <video
                    key={selectedFileId}
                    src={getEmbedURL(selectedFileId, selectedFileType)}
                    className="w-full h-full"
                    controls
                  />
                ) : (
                  <iframe
                    key={selectedFileId}
                    src={getEmbedURL(selectedFileId, selectedFileType)}
                    className="w-full h-full"
                    allowFullScreen
                  />
                )}
              </div>

              {selectedFileId && (
                <div className="w-full max-w-7xl mt-6">
                  <FeedbackForm
                    fileId={selectedFileId}
                    onSubmit={handleFeedbackSubmit}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeepLearningKit;

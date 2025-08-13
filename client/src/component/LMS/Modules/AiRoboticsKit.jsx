import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import FeedbackForm from "../FeedBackForm";

const AiRoboticsKit = () => {
    const { category, subcategory } = useParams();
    const navigate = useNavigate();
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [expandedSubcategory, setExpandedSubcategory] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState("ppt");
    const [feedback, setFeedback] = useState([]);

    // Data for Edge AI and Robotics Kit
    const subcategories = [
        {
            id: 1,
            title: "Module 1 - Introduction to Edge AI",
            path: "intro-edge-ai",
            nested: [
                { 
                    id: 11, 
                    title: "Labs", 
                    path: "labs", 
                    fileId: "15bR6ZPmAM4poFKaq5ld6cS87bAubERlh", 
                    type: "pdf" 
                },
                { 
                    id: 12, 
                    title: "Lecture Slides", 
                    path: "lecture-slides", 
                    fileId: "1mul-7RboG3eOhwZItA8seYlHpnZLe2xk", 
                    type: "ppt" 
                },
                { 
                    id: 13, 
                    title: "Assessment", 
                    path: "/QuizList", 
                    type: "link" 
                }
            ],
        },
        {
            id: 2,
            title: "Module 2 - Vision Deep Neural Networks (DNNs)",
            path: "vision-dnns",
            nested: [
                { 
                    id: 21, 
                    title: "Labs", 
                    path: "labs", 
                    fileId: "1NUIdYNK8zaUteKMGTpBP8A5hZ63fEsxu/", 
                    type: "pdf" 
                },
                { 
                    id: 22, 
                    title: "Lecture Slides", 
                    path: "lecture-slides", 
                    fileId: "1JjvhJdoo-HyrCIkC04FDXPCWKg8cGx3V", 
                    type: "ppt" 
                },
                { 
                    id: 23, 
                    title: "Assessment", 
                    path: "/QuizList", 
                    type: "link" 
                }
            ],
        },
        {
            id: 3,
            title: "Module 3 - Diversity, Ethics, and Security",
            path: "ethics-security",
            nested: [
                { 
                    id: 31, 
                    title: "Labs", 
                    path: "labs", 
                    fileId: "1HEZdYNDzJydx1ExYoyJd7_iCjLL8SPiW", 
                    type: "pdf" 
                },
                { 
                    id: 32, 
                    title: "Lecture Slides", 
                    path: "lecture-slides", 
                    fileId: "1OQxcvPYrO2CD69O8Jgg_7wySnvh8kLPC", 
                    type: "ppt" 
                },
                { 
                    id: 33, 
                    title: "Assessment", 
                    path: "/QuizList", 
                    type: "link" 
                }
            ],
        },
        {
            id: 4,
            title: "Module 4 - Autonomous Robotics",
            path: "autonomous-robotics",
            nested: [
                { 
                    id: 41, 
                    title: "Labs", 
                    path: "labs", 
                    fileId: "1wt_4PzUUw3i5T6KsI6Gsv9Cs1H_ZzpsA", 
                    type: "pdf" 
                },
                { 
                    id: 42, 
                    title: "Lecture Slides", 
                    path: "lecture-slides", 
                    fileId: "1cib91-UB4PKe1aqj0dMyvyN6LLygqXTG", 
                    type: "ppt" 
                },
                { 
                    id: 43, 
                    title: "Assessment", 
                    path: "/QuizList", 
                    type: "link" 
                }
            ],
        },
        {
            id: 5,
            title: "Module 5 - Resources Link",
            path: "resources-link",
            fileId: "1lyclFJ2YZy_WGzMFSDOUjlDuRO1BLNH1",
            type: "pdf"
        }
    ];

    const handleFeedbackSubmit = (fileId, rating, comment) => {
        const newFeedback = {
            fileId,
            rating,
            comment,
            timestamp: new Date().toISOString(),
        };

        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("userFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    const getEmbedURL = (fileId, type = "ppt") => {
        switch (type) {
            case "ppt":
                return `https://docs.google.com/presentation/d/${fileId}/embed`;
            case "pdf":
                return `https://drive.google.com/file/d/${fileId}/preview`;
            case "mp4":
                return `https://drive.google.com/uc?export=download&id=${fileId}`;
            default:
                return "";
        }
    };

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
            if (e.ctrlKey && (e.key === 's' || e.key === 'p')) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', disableRightClick);
        document.addEventListener('keydown', disableKeyboardShortcuts);

        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            document.removeEventListener('keydown', disableKeyboardShortcuts);
        };
    }, []);

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Edge AI & Robotics Kit</h2>
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
                                        {expandedSubcategory === sub.id ? '▼' : '▶'}
                                    </span>
                                )}
                            </div>
                            {sub.nested && expandedSubcategory === sub.id && (
                                <ul className="pl-4 mt-2 space-y-2">
                                    {sub.nested.map((nestedSub) => (
                                        <li
                                            key={nestedSub.id}
                                            className={`p-2 rounded flex items-center ${
                                                subcategory === nestedSub.path ? "bg-gray-700 text-white" : ""
                                            }`}
                                        >
                                            {nestedSub.type === "link" ? (
                                                <Link 
                                                    to="/QuizList"
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
                                                    <span className="mr-2">
                                                        {nestedSub.type === "ppt" ? "📊" : "📄"}
                                                    </span>
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
            <div className="flex-1 p-4 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4 text-center">Edge AI and Robotics Teaching Kit</h1>
                {selectedFileId && (
                    <div className="w-full max-w-7xl h-[90vh] border rounded-lg shadow overflow-hidden relative"
                        onContextMenu={(e) => e.preventDefault()}>
                        {/* Transparent overlay to block the pop-out button */}
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
                )}
                {selectedFileId && (
                    <FeedbackForm
                        fileId={selectedFileId}
                        onSubmit={handleFeedbackSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default AiRoboticsKit;
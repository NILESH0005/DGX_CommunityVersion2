import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import FeedbackForm from "../FeedBackForm";

const IndustrialMetaverseKit = () => {
    const { category, subcategory } = useParams();
    const navigate = useNavigate();
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [expandedSubcategory, setExpandedSubcategory] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState("ppt");
    const [feedback, setFeedback] = useState([]);

    // Data for Industrial Metaverse Kit
    const subcategories = [
        {
            id: 1,
            title: "Module 1 - Introduction to the Industrial Metaverse",
            path: "introduction-industrial-metaverse",
            nested: [
                { 
                    id: 11, 
                    title: "Lecture 1 Slides", 
                    path: "lecture-1-slides", 
                    fileId: "1dX0bu6ngwZGFauzNjbWkRb4T3fJdCFJn", 
                    type: "ppt" 
                },
                { 
                    id: 12, 
                    title: "Lecture 2 Slides", 
                    path: "lecture-2-slides", 
                    fileId: "11EIAdmOs6Atav6Zu6DUcMaN8rxDOx0Ws", 
                    type: "ppt" 
                },
                { 
                    id: 13, 
                    title: "Lecture 3 Slides", 
                    path: "lecture-3-slides", 
                    fileId: "12qPSU8eaLiweS3kXdP30e_gCn4kO4NOa", 
                    type: "ppt" 
                },
                { 
                    id: 14, 
                    title: "Lecture 4 Slides", 
                    path: "lecture-4-slides", 
                    fileId: "1e6k1tjf-1A7mEatDrs0n3AOmtXNBOyoQ", 
                    type: "ppt" 
                },
                { 
                    id: 15, 
                    title: "Lecture 5 Slides", 
                    path: "lecture-5-slides", 
                    fileId: "1xj7eY_EfgN2RBQ_ajetcgNG0xn7uItR4", 
                    type: "ppt" 
                },
                { 
                    id: 16, 
                    title: "Assessment", 
                    path: "/QuizList", 
                    type: "link" 
                }
            ],
        },
        {
            id: 2,
            title: "Module 2 - Develop Tools for your Industrial Metaverse Pipeline",
            path: "develop-tools",
            nested: [
                { 
                    id: 21, 
                    title: "Lecture 1 Slides", 
                    path: "lecture-1-slides", 
                    fileId: "1o4540DX47rN4bDtU2AGcTxnVLA6Av7Rd", 
                    type: "ppt" 
                },
                { 
                    id: 22, 
                    title: "Lecture 2 Slides", 
                    path: "lecture-2-slides", 
                    fileId: "1tVutgv-7_aOb6yE4sr9XuI-tcMgEG1GJ", 
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
            title: "Module 3 - Create Robust Physically Accurate Simulations",
            path: "accurate-simulations",
            nested: [
                { 
                    id: 31, 
                    title: "Lecture 1 Slides", 
                    path: "lecture-1-slides", 
                    fileId: "1yjkZap6zAbp5I4LB86y2-CFyjBjAHzBi", 
                    type: "ppt" 
                },
                { 
                    id: 32, 
                    title: "Lecture 2 Slides", 
                    path: "lecture-2-slides", 
                    fileId: "1B2dbAL9LW6BP7ygQ1IYzYudg8zrCB6YB", 
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
            title: "Module 4 - Introduction to Universal Scene Description (USD)",
            path: "universal-scene-description",
            nested: [
                { 
                    id: 41, 
                    title: "Lecture 1 Slides", 
                    path: "lecture-1-slides", 
                    fileId: "14dVN7J8d4mi3-h0hAce91zNrKAywWB62", 
                    type: "ppt" 
                },
                { 
                    id: 42, 
                    title: "Assessment", 
                    path: "/QuizList", 
                    type: "link" 
                }
            ],
        },
        {
            id: 7,
            title: "Module 7 - Using the Isaac Sim GUI",
            path: "isaac-sim-gui",
            nested: [
                { 
                    id: 71, 
                    title: "Lecture 1 Slides", 
                    path: "lecture-1-slides", 
                    fileId: "1AQV9RlC6CHJ59kFMpFqNtHh5THy-DMwI", 
                    type: "ppt" 
                },
                { 
                    id: 72, 
                    title: "Assessment", 
                    path: "/QuizList", 
                    type: "link" 
                }
            ],
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
                <h2 className="text-lg font-semibold mb-4">Industrial Metaverse Kit</h2>
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
            <div className="flex-1 p-4 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4 text-center">Industrial Metaverse Teaching Kit</h1>
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

export default IndustrialMetaverseKit;
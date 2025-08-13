import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import FeedbackForm from "../FeedBackForm";

const GenAiKit = () => {
    const { category, subcategory } = useParams();
    const navigate = useNavigate();
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [expandedSubcategory, setExpandedSubcategory] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState("ppt");
    const [feedback, setFeedback] = useState([]);

    // Data for Generative AI Kit
    const subcategories = [
        {
            id: 1,
            title: "Module 1 - Introduction to the Industrial Metaverse Teaching Kit",
            path: "intro-industrial-metaverse",
            nested: [
                { 
                    id: 11, 
                    title: "Demos", 
                    path: "demos", 
                    fileId: "1lrnOJ6OxB6oH1Qv3W7IJMWEIH-_4xRqA", 
                    type: "ppt" 
                },
                { 
                    id: 12, 
                    title: "DLI Online Courses", 
                    path: "dli-courses", 
                    fileId: "1Rezo5LlgGySUUhvw8mggUEWm85xsKY57", 
                    type: "ppt" 
                },
                { 
                    id: 13, 
                    title: "Knowledge Checks", 
                    path: "knowledge-checks", 
                    fileId: "1dmb0dahI3lbXphJZJUHt4IwEwPwq6u40", 
                    type: "pdf" 
                },
                { 
                    id: 14, 
                    title: "Labs", 
                    path: "labs", 
                    fileId: "1gue58GtQcVGLXAlhza1mT9zFxS1fIEfT", 
                    type: "ipynb" 
                },
                { 
                    id: 15, 
                    title: "Lecture Slides", 
                    path: "lecture-slides", 
                    fileId: "1xnP-5e33tP7MSPVazY4UHzufVbNl4pwN", 
                    type: "csv" 
                },
                { 
                    id: 16, 
                    title: "Lecture Slides", 
                    path: "lecture-slides", 
                    fileId: "1jzDvRk5-BYGI4Kd7lNmM0zyVnDpRoA2R", 
                    type: "ipynb" 
                },
                { 
                    id: 17, 
                    title: "Assessment", 
                    path: "/QuizList", 
                    type: "link" 
                }
            ],
        },
        {
            id: 3,
            title: "Module 3 - Large Language Models and the Transformer",
            path: "llm-transformer",
            nested: [
                { 
                    id: 31, 
                    title: "DLI Online Courses", 
                    path: "dli-courses", 
                    fileId: "1BngleGOQ9u1GIGX0yialYZtTPV1UuNn6", 
                    type: "pdf" 
                },
                { 
                    id: 32, 
                    title: "Assessment", 
                    path: "/QuizList", 
                    type: "link" 
                }
            ],
        },
        {
            id: 4,
            title: "Module 4 - LLM Scaling Laws and LLM Families",
            path: "llm-scaling-families",
            nested: [
                { 
                    id: 41, 
                    title: "DLI Online Courses", 
                    path: "dli-courses", 
                    fileId: "1uZN0ZNADa0MwpxP9gYp6nFclSg8Lj4mo", 
                    type: "pdf" 
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
            id: 6,
            title: "Module 6 - Diffusion Models in Generative AI",
            path: "diffusion-models",
            nested: [
                { 
                    id: 61, 
                    title: "Demos", 
                    path: "demos", 
                    fileId: "1CXMExl5uR3YoQUqQN7rUaVC5h_KODjEl", 
                    type: "html" 
                },
                { 
                    id: 62, 
                    title: "Demos", 
                    path: "demos", 
                    fileId: "1CXMExl5uR3YoQUqQN7rUaVC5h_KODjEl/2", 
                    type: "ppt" 
                },
                { 
                    id: 63, 
                    title: "Demos", 
                    path: "demos", 
                    fileId: "1MYK7UlxMEu0WW5eh218qwCnHsHiab_J1/3", 
                    type: "ppt" 
                },
                { 
                    id: 64, 
                    title: "DLI Online Courses", 
                    path: "dli-courses", 
                    fileId: "1JY0W12G21NizFGUFeUl4UrDAgj_pv3PY", 
                    type: "pdf" 
                },
                { 
                    id: 65, 
                    title: "Knowledge Checks 1", 
                    path: "knowledge-checks", 
                    fileId: "1-AEoJWfgYih85cOIdGUgmo8ViK2RiwHK", 
                    type: "pdf" 
                },
                { 
                    id: 66, 
                    title: "Knowledge Checks 2", 
                    path: "knowledge-checks", 
                    fileId: "1-AEoJWfgYih85cOIdGUgmo8ViK2RiwHK", 
                    type: "pdf" 
                },
                { 
                    id: 67, 
                    title: "Knowledge Checks 3", 
                    path: "knowledge-checks", 
                    fileId: "1-AEoJWfgYih85cOIdGUgmo8ViK2RiwHK", 
                    type: "pdf" 
                },
                { 
                    id: 68, 
                    title: "Labs", 
                    path: "labs", 
                    fileId: "1qgpOkp_zip1zm6MXEiepVWR7CI5R7GPg", 
                    type: "pdf" 
                },
                { 
                    id: 69, 
                    title: "Lecture Slides", 
                    path: "lecture-slides", 
                    fileId: "1byEUFn57_60wq8i6f1mpRYkB-G_NEWGV", 
                    type: "ppt" 
                },
                { 
                    id: 70, 
                    title: "Assessment", 
                    path: "/QuizList", 
                    type: "link" 
                }
            ],
        },
        {
            id: 7,
            title: "Module 7 - Model Training (Pre-Training, Instruction Following, and PEFT)",
            path: "model-training",
            nested: [
                { 
                    id: 71, 
                    title: "DLI Online Courses", 
                    path: "dli-courses", 
                    fileId: "1oNQkQ2mKl9dm6OiNc1zBRx-EbURPL4wI", 
                    type: "pdf" 
                },
                { 
                    id: 72, 
                    title: "Assessment", 
                    path: "/QuizList", 
                    type: "link" 
                }
            ],
        },
        {
            id: 8,
            title: "Module 8 - LLM Orchestration",
            path: "llm-orchestration",
            nested: [
                { 
                    id: 81, 
                    title: "Demos", 
                    path: "demos", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_DEMOS1", 
                    type: "ppt" 
                },
                { 
                    id: 82, 
                    title: "Demos", 
                    path: "demos", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_DEMOS2", 
                    type: "ppt" 
                },
                { 
                    id: 83, 
                    title: "Demos", 
                    path: "demos", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_DEMOS3", 
                    type: "ppt" 
                },
                { 
                    id: 84, 
                    title: "DLI Online Courses", 
                    path: "dli-courses", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_DLI1", 
                    type: "pdf" 
                },
                { 
                    id: 85, 
                    title: "DLI Online Courses", 
                    path: "dli-courses", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_DLI2", 
                    type: "pdf" 
                },
                { 
                    id: 86, 
                    title: "DLI Online Courses", 
                    path: "dli-courses", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_DLI3", 
                    type: "pdf" 
                },
                { 
                    id: 87, 
                    title: "Knowledge Checks", 
                    path: "knowledge-checks", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_KNOWLEDGE", 
                    type: "pdf" 
                },
                { 
                    id: 88, 
                    title: "Knowledge Checks", 
                    path: "knowledge-checks", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_KNOWLEDGE1", 
                    type: "pdf" 
                },
                { 
                    id: 89, 
                    title: "Knowledge Checks", 
                    path: "knowledge-checks", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_KNOWLEDGE2", 
                    type: "pdf" 
                },
                { 
                    id: 90, 
                    title: "Labs", 
                    path: "labs", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_LABS", 
                    type: "pdf" 
                },
                { 
                    id: 91, 
                    title: "Lecture Slides", 
                    path: "lecture-slides", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_LECTURES", 
                    type: "ppt" 
                },
                { 
                    id: 92, 
                    title: "Lecture Slides", 
                    path: "lecture-slides", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_LECTURES1", 
                    type: "ppt" 
                },
                { 
                    id: 93, 
                    title: "Lecture Slides", 
                    path: "lecture-slides", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD8_LECTURES2", 
                    type: "ppt" 
                },
                { 
                    id: 94, 
                    title: "Assessment", 
                    path: "/QuizList", 
                    type: "link" 
                }
            ],
        },
        {
            id: 9,
            title: "Module 9 - Scaling Model Training to Distributed Workloads",
            path: "scaling-training",
            nested: [
                { 
                    id: 92, 
                    title: "DLI Online Courses", 
                    path: "dli-courses", 
                    fileId: "YOUR_GOOGLE_DRIVE_FILE_ID_FOR_MOD9_DLI", 
                    type: "pdf" 
                },
                { 
                    id: 93, 
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
                <h2 className="text-lg font-semibold mb-4">Generative AI Kit</h2>
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
                                                        {nestedSub.type === "ppt" ? "📊" : 
                                                         nestedSub.type === "pdf" ? "📄" :
                                                         nestedSub.type === "ipynb" ? "📓" :
                                                         nestedSub.type === "csv" ? "📋" : "📁"}
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
                <h1 className="text-4xl font-bold mb-4 text-center">Generative AI Teaching Kit</h1>
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

export default GenAiKit;
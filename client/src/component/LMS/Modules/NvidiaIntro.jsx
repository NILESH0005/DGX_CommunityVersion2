import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FeedbackForm from "../FeedBackForm";

const NvidiaIntro = () => {
    const { category, subcategory } = useParams();
    const navigate = useNavigate();
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [expandedSubcategory, setExpandedSubcategory] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState("ppt");
    const [feedback, setFeedback] = useState([]);

    // Data for NVIDIA presentations and code file
    const subcategories = [
        {
            id: 1,
            title: "Intro to AI",
            path: "intro-to-ai",
            fileId: "1oD2nrB0jk9c16BpEJx4tkbP2VyFrd7dl",
            type: "ppt",
        },
        {
            id: 2,
            title: "NVIDIA Tech Stack",
            path: "nvidia-tech-stack",
            fileId: "1uyg1EuxeK76JLYlGZpXexzdbSft-bZGg",
            type: "ppt",
        },
        {
            id: 3,
            title: "GPU Fundamentals",
            path: "gpu-fundamentals",
            fileId: "1qp6GExAiJpPbEBo0xViuhZJ69d4CEUs-",
            type: "ppt",
        },
        {
            id: 4,
            title: "Introduction to DGX A100",
            path: "introduction-to-dgx-a100",
            fileId: "1wCiGJrDxvZy0qtkmiRAj5nhLGJBf508l",
            type: "ppt",
        },
        {
            id: 5,
            title: "Introduction to NGC",
            path: "introduction-to-ngc",
            fileId: "10vTOLQRbIArU4oLxN879TxkXghFypi6V",
            type: "ppt",
        },
        {
            id: 6,
            title: "Code Files",
            path: "code-files",
            fileId: "1ZXf08chKC3oB9qexH7sVwK2cfREZEnZb",
            type: "ipynb",
            download: true // Flag to indicate this should be a download link
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
            case "ipynb":
                return `https://drive.google.com/uc?export=download&id=${fileId}`;
            default:
                return "";
        }
    };

    const getDownloadLink = (fileId) => {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    };

    useEffect(() => {
        if (subcategories.length > 0 && !selectedFileId) {
            const firstSubcategory = subcategories[0];
            if (firstSubcategory.fileId) {
                setSelectedFileId(firstSubcategory.fileId);
                setSelectedFileType(firstSubcategory.type);
            }
        }
    }, [subcategories]);

    const handleSubcategoryClick = (path, fileId, type = "ppt", download = false) => {
        if (download) {
            // Handle download logic
            window.open(getDownloadLink(fileId), '_blank');
        } else {
            setSelectedFileId(fileId);
            setSelectedFileType(type);
        }
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
                <h2 className="text-4lg font-semibold mb-4">NVIDIA Resources</h2>
                <ul className="space-y-2">
                    {subcategories.map((sub) => (
                        <li key={sub.id}>
                            <div
                                className={`hover:bg-gray-700 hover:text-white p-2 rounded cursor-pointer flex items-center justify-between ${subcategory === sub.path ? "bg-gray-700 text-white" : ""
                                    }`}
                                onClick={() => handleSubcategoryClick(sub.path, sub.fileId, sub.type, sub.download)}
                            >
                                <span>{sub.title}</span>
                                {sub.download && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4 text-center">NVIDIA Introduction</h1>
                {selectedFileId && selectedFileType !== "ipynb" && (
                    <div className="w-full max-w-7xl h-[90vh] border rounded-lg shadow overflow-hidden relative"
                        onContextMenu={(e) => e.preventDefault()}>
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
                {selectedFileId && selectedFileType !== "ipynb" && (
                    <FeedbackForm
                        fileId={selectedFileId}
                        onSubmit={handleFeedbackSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default NvidiaIntro;
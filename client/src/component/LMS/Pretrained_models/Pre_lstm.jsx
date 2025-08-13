import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import FeedbackForm from "../FeedBackForm";
import ApiContext from '../../../context/ApiContext';

const Pre_lstm = () => {
    const navigate = useNavigate();
    const { userToken } = useContext(ApiContext);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState("pdf");
    const [fileContent, setFileContent] = useState("");
    const [feedback, setFeedback] = useState([]);

    // Pre-LSTM files
    const preLstmFiles = [
        {
            id: 1,
            title: "LSTM Documentation (PDF)",
            fileId: "1vTzUkVtWJmDKiSdFocLrDvUKmZ71RSxp",
            type: "pdf",
            icon: "📄",
            description: "Complete guide to LSTM implementation"
        },
        {
            id: 2,
            title: "Preprocessing Notebook (IPYNB)",
            fileId: "WUMm8uBZVYbAr-mF5cvoZp87PaznifVf",
            type: "ipynb",
            icon: "📓",
            description: "Jupyter notebook with data preprocessing steps"
        },
        {
            id: 3,
            title: "Configuration File (TXT)",
            fileId: "18h0UlqKLHuDBRv-2Eh7jtT2DAE1-9RnM",
            type: "txt",
            icon: "📝",
            description: "Text configuration file for LSTM setup"
        },
        {
            id: 4,
            title: "LSTM Assessment",
            type: "quiz",
            quizId: 3, // Unique quiz ID
            groupId: 101, // Unique group ID
            icon: "🧠",
            description: "Test your understanding of LSTM concepts"
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
        localStorage.setItem("preLstmFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    const handleFileClick = (file) => {
        if (file.type === "quiz") {
            if (!userToken) {
                alert("Please login to access the quiz");
                return;
            }
            navigate(`/quiz/${file.quizId}`, {
                state: {
                    quiz: {
                        QuizID: file.quizId,
                        group_id: file.groupId,
                        title: file.title
                    }
                }
            });
        } else {
            setSelectedFileId(file.fileId);
            setSelectedFileType(file.type);
        }
    };

    const getEmbedURL = (fileId, type) => {
        switch (type) {
            case "pdf":
                return `https://drive.google.com/file/d/${fileId}/preview`;
            case "ipynb":
                return `https://nbviewer.jupyter.org/urls/docs.google.com/uc?export=download&id=${fileId}`;
            default:
                return "";
        }
    };

    const fetchTextFile = async (fileId) => {
        try {
            const response = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`);
            const text = await response.text();
            setFileContent(text);
        } catch (error) {
            console.error("Error loading text file:", error);
            setFileContent("Error loading file content");
        }
    };

    // Set first file as default on component mount
    useEffect(() => {
        const firstFile = preLstmFiles.find(f => f.type === "pdf");
        if (firstFile && !selectedFileId) {
            setSelectedFileId(firstFile.fileId);
            setSelectedFileType(firstFile.type);
        }

        // Security measures
        const disableRightClick = (e) => e.preventDefault();
        const disableKeys = (e) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'p')) e.preventDefault();
        };

        document.addEventListener('contextmenu', disableRightClick);
        document.addEventListener('keydown', disableKeys);

        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            document.removeEventListener('keydown', disableKeys);
        };
    }, []);

    useEffect(() => {
        if (selectedFileType === "txt" && selectedFileId) {
            fetchTextFile(selectedFileId);
        } else {
            setFileContent("");
        }
    }, [selectedFileId, selectedFileType]);

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Pre-LSTM Materials</h2>
                <ul className="space-y-2">
                    {preLstmFiles.map((file) => (
                        <li key={file.id}>
                            <button
                                onClick={() => handleFileClick(file)}
                                className={`flex items-center w-full p-3 rounded text-left hover:bg-gray-700 ${
                                    selectedFileId === file.fileId ? "bg-gray-700" : ""
                                }`}
                            >
                                <span className="mr-3 text-lg">{file.icon}</span>
                                <div>
                                    <div className="font-medium">{file.title}</div>
                                    <div className="text-xs text-gray-300 mt-1">{file.description}</div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 flex flex-col">
                <h1 className="text-3xl font-bold mb-6 text-center">Pre-LSTM Preparation</h1>
                
                {selectedFileType === "txt" ? (
                    <div className="flex-1 w-full border rounded-xl shadow-lg overflow-hidden bg-white p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {preLstmFiles.find(f => f.fileId === selectedFileId)?.title}
                            </h2>
                            <button 
                                onClick={() => {
                                    const blob = new Blob([fileContent], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = 'config.txt';
                                    link.click();
                                    URL.revokeObjectURL(url);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Download
                            </button>
                        </div>
                        <pre className="bg-gray-100 p-4 rounded overflow-auto h-full text-sm">
                            {fileContent || "Loading file content..."}
                        </pre>
                    </div>
                ) : selectedFileId ? (
                    <>
                        <div className="flex-1 w-full border rounded-xl shadow-lg overflow-hidden relative bg-white"
                            onContextMenu={(e) => e.preventDefault()}>
                            {/* Block Google Drive's pop-out button */}
                            <div className="absolute top-0 right-0 w-12 h-12 z-10" />
                            
                            <iframe
                                key={`${selectedFileId}-${selectedFileType}`}
                                src={getEmbedURL(selectedFileId, selectedFileType)}
                                className="w-full h-full"
                                allowFullScreen
                                title={preLstmFiles.find(f => f.fileId === selectedFileId)?.title || "Content Viewer"}
                            />
                        </div>

                        <div className="mt-6 w-full max-w-2xl mx-auto">
                            <FeedbackForm
                                fileId={selectedFileId}
                                onSubmit={handleFeedbackSubmit}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Select a file to view</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const sendFeedbackToServer = (feedback) => {
    // Implement your feedback submission logic here
    console.log("Submitting feedback:", feedback);
    // Example: axios.post('/api/feedback/pre-lstm', feedback)
};

export default Pre_lstm;
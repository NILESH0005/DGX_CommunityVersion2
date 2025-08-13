import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import FeedbackForm from "../FeedBackForm";
import ApiContext from '../../../context/ApiContext';

const Pre_deepspeech = () => {
    const navigate = useNavigate();
    const { userToken } = useContext(ApiContext); // Get user token
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState("pdf");
    const [feedback, setFeedback] = useState([]);

    // Pre-DeepSpeech files
    const preDeepSpeechFiles = [
        {
            id: 1,
            title: "Pre-DeepSpeech Guide (PDF)",
            fileId: "1q4gPAu6jj03aleNUrc86rSOs1i_pnNAf/", // Replace with actual PDF ID
            type: "pdf",
            icon: "📄",
            description: "Preparation guide for DeepSpeech implementation"
        },
        {
            id: 2,
            title: "Pre-Processing Notebook (IPYNB)",
            fileId: "1AL6Jx_XYsjktrfIUHwtYNTZne7FLY67n",
            type: "ipynb",
            icon: "📓",
            description: "Jupyter notebook with data preprocessing steps"
        },
        {
            id: 3,
            title: "Assessment",
            type: "quiz",
            quizId: 2, 
            groupId: 456, 
            icon: "📝",
            description: "Test your knowledge with this assessment"
        },
    ];

    const handleFeedbackSubmit = (fileId, rating, comment) => {
        const newFeedback = {
            fileId,
            rating,
            comment,
            timestamp: new Date().toISOString(),
        };
        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("preDeepSpeechFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
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

    // Set first file as default on component mount
    useEffect(() => {
        if (preDeepSpeechFiles.length > 0 && !selectedFileId) {
            setSelectedFileId(preDeepSpeechFiles[0].fileId);
            setSelectedFileType(preDeepSpeechFiles[0].type);
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

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Pre-DeepSpeech Materials</h2>
                <ul className="space-y-2">
                    {preDeepSpeechFiles.map((file) => (
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
                <h1 className="text-3xl font-bold mb-6 text-center">Pre-DeepSpeech Preparation</h1>

                {selectedFileId && (
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
                                title={preDeepSpeechFiles.find(f => f.fileId === selectedFileId)?.title || "Content Viewer"}
                            />
                        </div>

                        <div className="mt-6 w-full max-w-2xl mx-auto">
                            <FeedbackForm
                                fileId={selectedFileId}
                                onSubmit={handleFeedbackSubmit}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const sendFeedbackToServer = (feedback) => {
    // Implement your feedback submission logic here
    console.log("Submitting feedback:", feedback);
    // Example: axios.post('/api/feedback/pre-deepspeech', feedback)
};

export default Pre_deepspeech;
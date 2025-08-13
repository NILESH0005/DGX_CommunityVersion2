import React, { useState } from "react";
import FeedbackForm from "../FeedBackForm";

const Vision_trans = () => {
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [selectedFileType, setSelectedFileType] = useState("");
    const [feedback, setFeedback] = useState([]);

    // Vision Transformers files
    const visionTransFiles = [
        {
            id: 1,
            title: "Vision Transformers (PDF Guide)",
            fileId: "1Sq0iAKTyJ3TKQmV38wpUnM8sj3vp6gas", // Replace with actual PDF ID
            type: "pdf",
            description: "Comprehensive guide on Vision Transformer (ViT) architecture"
        },
        {
            id: 2,
            title: "Vision Transformers (Jupyter Notebook)",
            fileId: "1RDzc7lpfOhU3QO_QdkpuPrbvFCUrFwzY", // Replace with actual notebook ID
            type: "notebook",
            description: "Practical implementation of Vision Transformers (ViTs)"
        },
        {
            id: 3,
            title: "Assignment",
            icon: "📓"
        }
    ];

    const handleFeedbackSubmit = (fileId, rating, comment) => {
        const newFeedback = {
            fileId,
            fileName: selectedFileName,
            fileType: selectedFileType,
            rating,
            comment,
            timestamp: new Date().toISOString()
        };
        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("visionTransFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    // Set first file as default on component mount
    useState(() => {
        if (visionTransFiles.length > 0 && !selectedFileId) {
            setSelectedFileId(visionTransFiles[0].fileId);
            setSelectedFileName(visionTransFiles[0].title);
            setSelectedFileType(visionTransFiles[0].type);
        }

        // Security measures
        const disableRightClick = (e) => e.preventDefault();
        const disableShortcuts = (e) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'c')) e.preventDefault();
        };

        document.addEventListener('contextmenu', disableRightClick);
        document.addEventListener('keydown', disableShortcuts);

        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            document.removeEventListener('keydown', disableShortcuts);
        };
    }, []);

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Navigation Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-xl font-bold mb-6">Vision Transformers</h2>
                <ul className="space-y-3">
                    {visionTransFiles.map(file => (
                        <li key={file.id}>
                            <button
                                onClick={() => {
                                    setSelectedFileId(file.fileId);
                                    setSelectedFileName(file.title);
                                    setSelectedFileType(file.type);
                                }}
                                className={`flex flex-col w-full p-3 rounded text-left hover:bg-gray-700 transition-colors ${
                                    selectedFileId === file.fileId ? "bg-gray-700 border-l-4 border-blue-500" : ""
                                }`}
                            >
                                <span className="font-medium">{file.title}</span>
                                <span className="text-sm text-gray-300 mt-1">{file.description}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {selectedFileName || "Select a Resource"}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {visionTransFiles.find(f => f.fileId === selectedFileId)?.description || ""}
                    </p>
                </div>
                
                {selectedFileId && (
                    <>
                        <div className="flex-1 w-full border rounded-xl shadow-lg relative overflow-hidden bg-white"
                            onContextMenu={(e) => e.preventDefault()}>
                            {/* Block Google Drive pop-out button */}
                            <div className="absolute top-0 right-0 w-14 h-14 z-10" />
                            
                            <iframe
                                key={selectedFileId}
                                src={`https://drive.google.com/file/d/${selectedFileId}/preview`}
                                className="w-full h-full"
                                allowFullScreen
                                title={`${selectedFileName} Viewer`}
                                sandbox="allow-scripts allow-same-origin"
                            />
                        </div>

                        <div className="mt-8 w-full max-w-3xl mx-auto">
                            <FeedbackForm 
                                fileId={selectedFileId}
                                fileName={selectedFileName}
                                fileType={selectedFileType}
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
    // Implement your feedback submission logic
    console.log("Submitting Vision Transformers feedback:", feedback);
    // Example: axios.post('/api/feedback/vision-transformers', feedback)
};

export default Vision_trans;
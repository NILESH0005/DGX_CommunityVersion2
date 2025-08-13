import React, { useState } from "react";
import FeedbackForm from "../FeedBackForm";

const Humanevol = () => {
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [selectedFileType, setSelectedFileType] = useState("");
    const [feedback, setFeedback] = useState([]);

    // Human Evolution files
    const humanEvolFiles = [
        {
            id: 1,
            title: "DCGAN Implementation (Notebook)",
            fileId: "1q6z37kH0KUPdHM07_woU6o-kNBJiR-DG", // Replace with actual notebook ID
            type: "notebook",
            description: "Jupyter notebook for human evolution process using DCGAN"
        },
        {
            id: 2,
            title: "Evolution Video (MP4)",
            fileId: "1cNvPv98Rjr4ONB91Sbz7HDndLzvk4TFR", // Replace with actual video ID
            type: "video",
            description: "Video demonstration of human evolution process"
        },
        {
            id: 3,
            title: "README Documentation (PDF)",
            fileId: "1ZLJwcsukkxGLDCotkYvmhQlL21KLwES8", // Replace with actual PDF ID
            type: "pdf",
            description: "Project documentation and instructions"
        },
        {
            id: 4,
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
        localStorage.setItem("humanEvolFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    // Set first file as default on component mount
    useState(() => {
        if (humanEvolFiles.length > 0 && !selectedFileId) {
            setSelectedFileId(humanEvolFiles[0].fileId);
            setSelectedFileName(humanEvolFiles[0].title);
            setSelectedFileType(humanEvolFiles[0].type);
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

    const renderFileContent = () => {
        if (!selectedFileId) return null;

        const currentFile = humanEvolFiles.find(f => f.fileId === selectedFileId);

        switch(currentFile.type) {
            case "notebook":
            case "pdf":
                return (
                    <iframe
                        key={selectedFileId}
                        src={`https://drive.google.com/file/d/${selectedFileId}/preview`}
                        className="w-full h-full"
                        allowFullScreen
                        title={`${selectedFileName} Viewer`}
                        sandbox="allow-scripts allow-same-origin"
                    />
                );
            case "video":
                return (
                    <div className="w-full h-full flex items-center justify-center">
                        <iframe
                            src={`https://drive.google.com/file/d/${selectedFileId}/preview`}
                            className="w-full h-full max-w-4xl"
                            allowFullScreen
                            title={`${selectedFileName} Video Player`}
                            sandbox="allow-scripts allow-same-origin"
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Navigation Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-xl font-bold mb-6">Human Evolution Project</h2>
                <ul className="space-y-3">
                    {humanEvolFiles.map(file => (
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
                        {humanEvolFiles.find(f => f.fileId === selectedFileId)?.description || ""}
                    </p>
                </div>
                
                <div className="flex-1 w-full border rounded-xl shadow-lg relative overflow-hidden bg-white"
                    onContextMenu={(e) => e.preventDefault()}>
                    {/* Block Google Drive pop-out button */}
                    <div className="absolute top-0 right-0 w-14 h-14 z-10" />
                    
                    {selectedFileId && renderFileContent()}
                </div>

                <div className="mt-8 w-full max-w-3xl mx-auto">
                    <FeedbackForm 
                        fileId={selectedFileId}
                        fileName={selectedFileName}
                        fileType={selectedFileType}
                        onSubmit={handleFeedbackSubmit}
                    />
                </div>
            </div>
        </div>
    );
};

const sendFeedbackToServer = (feedback) => {
    // Implement your feedback submission logic
    console.log("Submitting Human Evolution feedback:", feedback);
    // Example: axios.post('/api/feedback/human-evolution', feedback)
};

export default Humanevol;
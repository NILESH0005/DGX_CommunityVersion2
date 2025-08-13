import React, { useState } from "react";
import FeedbackForm from "../FeedBackForm";

const Genaimodels = () => {
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [feedback, setFeedback] = useState([]);

    // GenAI Model Notebook files
    const modelFiles = [
        {
            id: 1,
            title: "DGX Fine-tune Llama 2",
            fileId: "14Vo3UYc2iLTCnoWcII_8vBCqJCEIciGi", // Replace with actual Google Drive ID
            description: "Guide to fine-tuning Llama 2 model on DGX systems"
        },
        {
            id: 2,
            title: "Fine-tuning Microsoft Phi 1.5b",
            fileId: "1t5XvKkzKboRiyvvI9hWXPW7M9t3IFQar", // Replace with actual Google Drive ID
            description: "Custom dataset fine-tuning for Microsoft Phi 1.5b model"
        },
        {
            id: 3,
            title: "Finetuning Mistral 7b Using AutoTrain",
            fileId: "1qN4DRIGMDjNhENYSoTKQ9jG-nBQQty36", // Replace with actual Google Drive ID
            description: "Automated fine-tuning of Mistral 7b model with AutoTrain"
        }
    ];

    const handleFeedbackSubmit = (fileId, rating, comment) => {
        const newFeedback = {
            fileId,
            fileName: selectedFileName,
            rating,
            comment,
            timestamp: new Date().toISOString()
        };
        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("genaiModelsFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    // Set first notebook as default on component mount
    useState(() => {
        if (modelFiles.length > 0 && !selectedFileId) {
            setSelectedFileId(modelFiles[0].fileId);
            setSelectedFileName(modelFiles[0].title);
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
                <h2 className="text-xl font-bold mb-6">GenAI Model Notebooks</h2>
                <ul className="space-y-3">
                    {modelFiles.map(file => (
                        <li key={file.id}>
                            <button
                                onClick={() => {
                                    setSelectedFileId(file.fileId);
                                    setSelectedFileName(file.title);
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
                        {selectedFileName || "Select a Notebook"}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {modelFiles.find(f => f.fileId === selectedFileId)?.description || ""}
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
                                title={`${selectedFileName} Notebook Viewer`}
                            />
                        </div>

                        <div className="mt-8 w-full max-w-3xl mx-auto">
                            <FeedbackForm 
                                fileId={selectedFileId}
                                fileName={selectedFileName}
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
    console.log("Submitting GenAI model feedback:", feedback);
    // Example: axios.post('/api/feedback/genai-models', feedback)
};

export default Genaimodels;
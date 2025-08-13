import React, { useState } from "react";
import FeedbackForm from "../FeedBackForm";

const Housepred = () => {
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [selectedFileType, setSelectedFileType] = useState("");
    const [feedback, setFeedback] = useState([]);

    // House Prediction files
    const housePredFiles = [
        {
            id: 1,
            title: "Data Description (TXT)",
            fileId: "1m4kISOHwFcNKyfYdGkofde8sv4wpm6i6",
            type: "text",
            description: "Description of the house prediction dataset",
            downloadUrl: "https://drive.google.com/uc?export=download&id=1m4kISOHwFcNKyfYdGkofde8sv4wpm6i6"
        },
        {
            id: 2,
            title: "Example Load (Python)",
            fileId: "1WHG-qhS4PkTK-fxTlC5YPOmXEjcVr0BC",
            type: "python",
            description: "Python script to load and process the data",
            downloadUrl: "https://drive.google.com/uc?export=download&id=1WHG-qhS4PkTK-fxTlC5YPOmXEjcVr0BC"
        },
        {
            id: 3,
            title: "README Guide (PDF)",
            fileId: "1a5gv6aiCEyjsSLXo7Qvur2m2KQ6LEgMm",
            type: "pdf",
            description: "Project documentation and instructions"
        },
        {
            id: 4,
            title: "Test Dataset (CSV)",
            fileId: "1DyqUZfJ_BCcF4Eu0nVNH360iHbMsCM_U",
            type: "csv",
            description: "Test dataset for house price prediction",
            downloadUrl: "https://drive.google.com/uc?export=download&id=1DyqUZfJ_BCcF4Eu0nVNH360iHbMsCM_U"
        },
        {
            id: 5,
            title: "Train Dataset (CSV)",
            fileId: "1PAnwqwZtBp14hzmDW0jvr7Y9PxQJQYcJ",
            type: "csv",
            description: "Training dataset for house price prediction",
            downloadUrl: "https://drive.google.com/uc?export=download&id=1PAnwqwZtBp14hzmDW0jvr7Y9PxQJQYcJ"
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
        localStorage.setItem("housePredFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    const handleDownload = (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Set PDF as default on component mount
    useState(() => {
        if (housePredFiles.length > 0 && !selectedFileId) {
            const defaultFile = housePredFiles.find(f => f.type === "pdf") || housePredFiles[0];
            setSelectedFileId(defaultFile.fileId);
            setSelectedFileName(defaultFile.title);
            setSelectedFileType(defaultFile.type);
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

        const currentFile = housePredFiles.find(f => f.fileId === selectedFileId);

        switch(currentFile.type) {
            case "text":
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{currentFile.title}</h3>
                        <p className="text-gray-500 mb-6">{currentFile.description}</p>
                        <button
                            onClick={() => handleDownload(currentFile.downloadUrl, 'data_description.txt')}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Download Text File
                        </button>
                    </div>
                );
            case "python":
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{currentFile.title}</h3>
                        <p className="text-gray-500 mb-6">{currentFile.description}</p>
                        <button
                            onClick={() => handleDownload(currentFile.downloadUrl, 'example_load.py')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Download Python File
                        </button>
                    </div>
                );
            case "csv":
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{currentFile.title}</h3>
                        <p className="text-gray-500 mb-6">{currentFile.description}</p>
                        <button
                            onClick={() => handleDownload(currentFile.downloadUrl, currentFile.title.toLowerCase().replace(/\s+/g, '_') + '.csv')}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Download CSV File
                        </button>
                    </div>
                );
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
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Navigation Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-xl font-bold mb-6">House Price Prediction</h2>
                <ul className="space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    {housePredFiles.map(file => (
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
                        {housePredFiles.find(f => f.fileId === selectedFileId)?.description || ""}
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
    console.log("Submitting House Prediction feedback:", feedback);
    // Example: axios.post('/api/feedback/house-prediction', feedback)
};

export default Housepred;
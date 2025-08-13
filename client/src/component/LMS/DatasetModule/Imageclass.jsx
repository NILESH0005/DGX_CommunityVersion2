import React, { useState } from "react";
import FeedbackForm from "../FeedBackForm";

const Imageclass = () => {
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [selectedFileType, setSelectedFileType] = useState("");
    const [feedback, setFeedback] = useState([]);

    // Image Classification files
    const imageClassFiles = [
        {
            id: 1,
            title: "Example Code (Python)",
            fileId: "1hcddND_B6H7MpWLTgw0jZzo-GmJxqmJu",
            type: "python",
            description: "Python code to load and process image data",
            downloadUrl: "https://drive.google.com/uc?export=download&id=1hcddND_B6H7MpWLTgw0jZzo-GmJxqmJu"
        },
        {
            id: 2,
            title: "Test Input Data (CSV)",
            fileId: "1FZ3dm1xAVMRkLk2E7CkAP47uHKA26PWz",
            type: "csv",
            description: "Test input data for image classification",
            downloadUrl: "https://drive.google.com/uc?export=download&id=1FZ3dm1xAVMRkLk2E7CkAP47uHKA26PWz"
        },
        {
            id: 3,
            title: "Training Input Data (CSV)",
            fileId: "1PY7OQ-Z6ABBrApYkJMeShphdNkzJNrLb",
            type: "csv",
            description: "Training input data for image classification",
            downloadUrl: "https://drive.google.com/uc?export=download&id=1PY7OQ-Z6ABBrApYkJMeShphdNkzJNrLb"
        },
        {
            id: 4,
            title: "Test Labels (CSV)",
            fileId: "1vVIOCNtJaaIzqs8kubkocwCEsF2lXV1w",
            type: "csv",
            description: "Test labels for image classification",
            downloadUrl: "https://drive.google.com/uc?export=download&id=1vVIOCNtJaaIzqs8kubkocwCEsF2lXV1w"
        },
        {
            id: 5,
            title: "Training Labels (CSV)",
            fileId: "1B-Kxzr8AFoqDfZONV22LRdFUrri-j8ok",
            type: "csv",
            description: "Training labels for image classification",
            downloadUrl: "https://drive.google.com/uc?export=download&id=1B-Kxzr8AFoqDfZONV22LRdFUrri-j8ok"
        },
        {
            id: 6,
            title: "README Guide (PDF)",
            fileId: "1N5sk8jHh6qYERsPNOeT5WHqx099gn4jY",
            type: "pdf",
            description: "Documentation for image classification project"
        },
        {
            id: 7,
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
        localStorage.setItem("imageClassFeedback", JSON.stringify(updatedFeedback));
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
        if (imageClassFiles.length > 0 && !selectedFileId) {
            const defaultFile = imageClassFiles.find(f => f.type === "pdf") || imageClassFiles[0];
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

        const currentFile = imageClassFiles.find(f => f.fileId === selectedFileId);

        switch(currentFile.type) {
            case "python":
            case "csv":
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className={`w-24 h-24 ${
                            currentFile.type === "python" ? "bg-blue-100" : "bg-green-100"
                        } rounded-full flex items-center justify-center mx-auto mb-4`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${
                                currentFile.type === "python" ? "text-blue-600" : "text-green-600"
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d={currentFile.type === "python" ? 
                                    "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" : 
                                    "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"} />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{currentFile.title}</h3>
                        <p className="text-gray-500 mb-6">{currentFile.description}</p>
                        <button
                            onClick={() => handleDownload(currentFile.downloadUrl, currentFile.title.replace(/\s+/g, '_').toLowerCase() + (currentFile.type === "python" ? '.py' : '.csv'))}
                            className={`px-6 py-3 ${
                                currentFile.type === "python" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                            } text-white rounded-lg transition-colors`}
                        >
                            Download {currentFile.type === "python" ? "Python File" : "CSV File"}
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
                <h2 className="text-xl font-bold mb-6">Image Classification</h2>
                <ul className="space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    {imageClassFiles.map(file => (
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
                        {imageClassFiles.find(f => f.fileId === selectedFileId)?.description || ""}
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
    console.log("Submitting Image Classification feedback:", feedback);
    // Example: axios.post('/api/feedback/image-classification', feedback)
};

export default Imageclass;
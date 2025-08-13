import React, { useState } from "react";
import FeedbackForm from "../FeedBackForm";

const Iris = () => {
    const [feedback, setFeedback] = useState([]);
    
    // Iris dataset zip file
    const irisFile = {
        id: "1acm1UjEAsBOq2OOuIgFtK7qcm1p5A6dh", // Replace with actual Google Drive ID
        title: "Iris Dataset",
        description: "Complete Iris flower dataset in zip format",
        type: "zip",
        downloadUrl: `https://drive.google.com/uc?export=download&id=1acm1UjEAsBOq2OOuIgFtK7qcm1p5A6dh` // Replace ID
    };

    const handleFeedbackSubmit = (rating, comment) => {
        const newFeedback = {
            fileId: irisFile.id,
            fileName: irisFile.title,
            fileType: irisFile.type,
            rating,
            comment,
            timestamp: new Date().toISOString()
        };
        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("irisFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    const handleDownload = () => {
        // Create temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = irisFile.downloadUrl;
        link.setAttribute('download', 'iris_dataset.zip');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Security measures
    useState(() => {
        const disableRightClick = (e) => e.preventDefault();
        document.addEventListener('contextmenu', disableRightClick);
        return () => document.removeEventListener('contextmenu', disableRightClick);
    }, []);

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Navigation Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-xl font-bold mb-6">Iris Dataset</h2>
                <div className="p-3 rounded bg-gray-700 border-l-4 border-blue-500">
                    <span className="font-medium">{irisFile.title}</span>
                    <span className="text-sm text-gray-300 mt-1 block">{irisFile.description}</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {irisFile.title}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {irisFile.description}
                    </p>
                </div>
                
                {/* Download Area */}
                <div className="flex-1 flex flex-col items-center justify-center border rounded-xl shadow-lg bg-white p-8">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Iris Dataset Package</h3>
                        <p className="text-gray-500 mb-6">This ZIP file contains the complete Iris flower dataset for machine learning applications.</p>
                        <button
                            onClick={handleDownload}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Download Dataset (ZIP)
                        </button>
                        <p className="text-sm text-gray-400 mt-3">File size: ~2.5MB (approx)</p>
                    </div>
                </div>

                {/* Feedback section */}
                <div className="mt-8 w-full max-w-3xl mx-auto">
                    <FeedbackForm 
                        fileId={irisFile.id}
                        fileName={irisFile.title}
                        fileType={irisFile.type}
                        onSubmit={handleFeedbackSubmit}
                    />
                </div>
            </div>
        </div>
    );
};

const sendFeedbackToServer = (feedback) => {
    // Implement your feedback submission logic
    console.log("Submitting Iris dataset feedback:", feedback);
    // Example: axios.post('/api/feedback/iris', feedback)
};

export default Iris;
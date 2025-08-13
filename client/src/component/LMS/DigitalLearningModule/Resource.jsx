import React, { useState, useEffect } from "react";
import FeedbackForm from "../FeedBackForm";

const Resource = () => {
    const [feedback, setFeedback] = useState([]);
    
    // Resource PDF file
    const resourceFile = {
        id: 1,
        title: "Self Paced Learning Courses",
        fileId: "1gmuZReZHgWZxjYY76qPo24GZj0XvQAFB", // Replace with actual PDF ID
        type: "pdf",
        description: "Complete catalog of self-paced learning resources",
        lastUpdated: "June 2023"
    };

    const handleFeedbackSubmit = (fileId, rating, comment) => {
        const newFeedback = {
            fileId,
            rating,
            comment,
            timestamp: new Date().toISOString(),
        };
        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("resourceFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    const getEmbedURL = (fileId) => {
        return `https://drive.google.com/file/d/${fileId}/preview`;
    };

    useEffect(() => {
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
            {/* Sidebar - Simplified for single resource */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Learning Resources</h2>
                <div className="p-3 rounded bg-gray-700">
                    <div className="font-medium">{resourceFile.title}</div>
                    <div className="text-xs text-gray-300 mt-1">{resourceFile.description}</div>
                    <div className="text-xs text-gray-400 mt-1">Updated: {resourceFile.lastUpdated}</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 flex flex-col">
                <h1 className="text-3xl font-bold mb-6 text-center">Self Paced Learning Courses</h1>
                
                <div className="flex-1 w-full max-w-5xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-4 bg-gray-100 border-b">
                            <h2 className="text-xl font-semibold">{resourceFile.title}</h2>
                            <p className="text-gray-600">{resourceFile.description}</p>
                        </div>
                        
                        <div className="w-full h-[70vh] border rounded-b-lg overflow-hidden relative"
                            onContextMenu={(e) => e.preventDefault()}>
                            {/* Block Google Drive's pop-out button */}
                            <div className="absolute top-0 right-0 w-12 h-12 z-10" />
                            
                            <iframe
                                src={getEmbedURL(resourceFile.fileId)}
                                className="w-full h-full"
                                allowFullScreen
                                title={resourceFile.title}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <FeedbackForm
                            fileId={resourceFile.fileId}
                            onSubmit={handleFeedbackSubmit}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const sendFeedbackToServer = (feedback) => {
    // Implement your feedback submission logic here
    console.log("Submitting feedback:", feedback);
    // Example: axios.post('/api/feedback/resource', feedback)
};

export default Resource;
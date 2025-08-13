import React, { useState } from "react";
import FeedbackForm from "../FeedBackForm";

const Cvat = () => {
    const [feedback, setFeedback] = useState([]);
    
    // CVAT Guide PDF file
    const cvatFile = {
        id: "1eXDbttCuLUvKmnV5qtwXYjJfZvXn2JKd", // Replace with actual PDF ID
        title: "CVAT Annotation Guide",
        description: "Complete guide for Computer Vision Annotation Tool (CVAT)",
        type: "pdf"
    };

    const handleFeedbackSubmit = (rating, comment) => {
        const newFeedback = {
            fileId: cvatFile.id,
            fileName: cvatFile.title,
            fileType: cvatFile.type,
            rating,
            comment,
            timestamp: new Date().toISOString()
        };
        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("cvatFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    // Security measures
    useState(() => {
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
            {/* Navigation Sidebar (simplified for single file) */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-xl font-bold mb-6">CVAT Resources</h2>
                <div className="p-3 rounded bg-gray-700 border-l-4 border-blue-500">
                    <span className="font-medium">{cvatFile.title}</span>
                    <span className="text-sm text-gray-300 mt-1 block">{cvatFile.description}</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {cvatFile.title}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {cvatFile.description}
                    </p>
                </div>
                
                {/* PDF Viewer */}
                <div className="flex-1 w-full border rounded-xl shadow-lg relative overflow-hidden bg-white"
                    onContextMenu={(e) => e.preventDefault()}>
                    {/* Block Google Drive pop-out button */}
                    <div className="absolute top-0 right-0 w-14 h-14 z-10" />
                    
                    <iframe
                        src={`https://drive.google.com/file/d/${cvatFile.id}/preview`}
                        className="w-full h-full"
                        allowFullScreen
                        title={`${cvatFile.title} Viewer`}
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>

                {/* Feedback section */}
                <div className="mt-8 w-full max-w-3xl mx-auto">
                    <FeedbackForm 
                        fileId={cvatFile.id}
                        fileName={cvatFile.title}
                        fileType={cvatFile.type}
                        onSubmit={handleFeedbackSubmit}
                    />
                </div>
            </div>
        </div>
    );
};

const sendFeedbackToServer = (feedback) => {
    // Implement your feedback submission logic
    console.log("Submitting CVAT feedback:", feedback);
    // Example: axios.post('/api/feedback/cvat', feedback)
};

export default Cvat;
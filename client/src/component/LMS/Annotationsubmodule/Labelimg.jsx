import React, { useState } from "react";
import FeedbackForm from "../FeedBackForm";

const Labelimg = () => {
    const [feedback, setFeedback] = useState([]);
    
    // LabelImg PDF file
    const labelImgFile = {
        id: "1k43r-5Kmztpi0orV2C5pFH3G4YuZVDti", // Replace with actual PDF ID
        title: "LabelImg Annotation Guide",
        description: "Complete guide for LabelImg image annotation tool",
        type: "pdf"
    };

    const handleFeedbackSubmit = (rating, comment) => {
        const newFeedback = {
            fileId: labelImgFile.id,
            fileName: labelImgFile.title,
            fileType: labelImgFile.type,
            rating,
            comment,
            timestamp: new Date().toISOString()
        };
        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("labelImgFeedback", JSON.stringify(updatedFeedback));
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
            {/* Navigation Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-xl font-bold mb-6">LabelImg Resources</h2>
                <div className="p-3 rounded bg-gray-700 border-l-4 border-blue-500">
                    <span className="font-medium">{labelImgFile.title}</span>
                    <span className="text-sm text-gray-300 mt-1 block">{labelImgFile.description}</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {labelImgFile.title}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {labelImgFile.description}
                    </p>
                </div>
                
                {/* PDF Viewer */}
                <div className="flex-1 w-full border rounded-xl shadow-lg relative overflow-hidden bg-white"
                    onContextMenu={(e) => e.preventDefault()}>
                    {/* Block Google Drive pop-out button */}
                    <div className="absolute top-0 right-0 w-14 h-14 z-10" />
                    
                    <iframe
                        src={`https://drive.google.com/file/d/${labelImgFile.id}/preview`}
                        className="w-full h-full"
                        allowFullScreen
                        title={`${labelImgFile.title} Viewer`}
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>

                {/* Feedback section */}
                <div className="mt-8 w-full max-w-3xl mx-auto">
                    <FeedbackForm 
                        fileId={labelImgFile.id}
                        fileName={labelImgFile.title}
                        fileType={labelImgFile.type}
                        onSubmit={handleFeedbackSubmit}
                    />
                </div>
            </div>
        </div>
    );
};

const sendFeedbackToServer = (feedback) => {
    // Implement your feedback submission logic
    console.log("Submitting LabelImg feedback:", feedback);
    // Example: axios.post('/api/feedback/labelimg', feedback)
};

export default Labelimg;
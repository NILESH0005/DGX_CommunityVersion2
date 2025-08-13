import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FeedbackForm from "../FeedBackForm";

const Aws = () => {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState([]);
    
    // AWS PDF file details
    const awsPdf = {
        fileId: "1WR7LWoYswjAjqAjeLD4s14d6p-T7ej9i", // Replace with your actual Google Drive file ID
        title: "AWS Learning Resources",
        type: "pdf"
    };

       

    const handleFeedbackSubmit = (fileId, rating, comment) => {
        const newFeedback = {
            fileId,
            rating,
            comment,
            timestamp: new Date().toISOString(),
        };

        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("userFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    const getEmbedURL = (fileId, type = "pdf") => {
        switch (type) {
            case "pdf":
                return `https://drive.google.com/file/d/${fileId}/preview`;
            default:
                return "";
        }
    };

    // Disable right-click and keyboard shortcuts
    useState(() => {
        const disableRightClick = (e) => {
            e.preventDefault();
        };

        const disableKeyboardShortcuts = (e) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'p')) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', disableRightClick);
        document.addEventListener('keydown', disableKeyboardShortcuts);

        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            document.removeEventListener('keydown', disableKeyboardShortcuts);
        };
    }, []);

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar - Simplified since there's only one file */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-lg font-semibold mb-4">AWS Resources</h2>
                <ul className="space-y-2">
                    <li>
                        <div className="flex items-center hover:bg-gray-700 hover:text-white p-2 rounded cursor-pointer bg-gray-700 text-white">
                            <span>{awsPdf.title}</span>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4 text-center">AWS Learning Materials</h1>
                <div className="w-full max-w-7xl h-[90vh] border rounded-lg shadow overflow-hidden relative"
                    onContextMenu={(e) => e.preventDefault()}>
                    {/* Transparent overlay to block the pop-out button */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "50px",
                            height: "50px",
                            backgroundColor: "transparent",
                            zIndex: 10,
                        }}
                    />
                    <iframe
                        src={getEmbedURL(awsPdf.fileId, awsPdf.type)}
                        className="w-full h-full"
                        allowFullScreen
                    />
                </div>
                
                <FeedbackForm
                    fileId={awsPdf.fileId}
                    onSubmit={handleFeedbackSubmit}
                />
            </div>
        </div>
    );
};

// Helper function to send feedback to server (same as in AiRoboticsKit)
const sendFeedbackToServer = (feedback) => {
    // Implement your feedback submission logic here
    console.log("Feedback submitted:", feedback);
};

export default Aws;
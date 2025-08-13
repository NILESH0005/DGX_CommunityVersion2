import React, { useState } from "react";
import FeedbackForm from "../FeedBackForm";

const Tutorials = () => {
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const [selectedVideoTitle, setSelectedVideoTitle] = useState("");
    const [feedback, setFeedback] = useState([]);

    // Tutorial videos data
    const tutorialVideos = [
        {
            id: 1,
            title: "Artificial Intelligence Tutorial",
            videoId: "1GHPX9neaLZrs484zk2jF11msR6ADBbMa", // Replace with actual video ID
            description: "Comprehensive introduction to Artificial Intelligence concepts"
        },
        {
            id: 2,
            title: "Convolutional Neural Networks Explained",
            videoId: "1XaUrSyoYCKjpDgqO4c6G4gAn3jtZv56p", // Replace with actual video ID
            description: "Detailed explanation of CNN architecture and applications"
        },
        {
            id: 3,
            title: "Deep Learning Crash Course",
            videoId: "1MoZ-CgCAIIeCxeroA6-Woaj1PpRgMpEH", // Replace with actual video ID
            description: "Quick-start guide to Deep Learning fundamentals"
        },
        {
            id: 4,
            title: "Machine Learning Crash Course",
            videoId: "1LvvCE3k8ubVQvmtIzVoU-gsu4_z06jEF", // Replace with actual video ID
            description: "Essential Machine Learning concepts in under 1 hour"
        },
        {
            id: 5,
            title: "Neural Network Explained",
            videoId: "10OTiefIKXQIaXb7sOPIsSZvYDCnyUq_6", // Replace with actual video ID
            description: "Understanding the building blocks of Neural Networks"
        },
        {
            id: 6,
            title: "Recurrent Neural Network Explained",
            videoId: "1B00MK2-ZnW3PT_dySsEVjUy6dPBc4OJh", // Replace with actual video ID
            description: "Complete guide to RNNs and their applications"
        },
        {
            id: 7,
            title: "Assignment",
            icon: "📓"
        }
    ];

    const handleFeedbackSubmit = (videoId, rating, comment) => {
        const newFeedback = {
            videoId,
            videoTitle: selectedVideoTitle,
            rating,
            comment,
            timestamp: new Date().toISOString()
        };
        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("tutorialsFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    // Set first video as default on component mount
    useState(() => {
        if (tutorialVideos.length > 0 && !selectedVideoId) {
            setSelectedVideoId(tutorialVideos[0].videoId);
            setSelectedVideoTitle(tutorialVideos[0].title);
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
                <h2 className="text-xl font-bold mb-6">AI Tutorial Videos</h2>
                <ul className="space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    {tutorialVideos.map(video => (
                        <li key={video.id}>
                            <button
                                onClick={() => {
                                    setSelectedVideoId(video.videoId);
                                    setSelectedVideoTitle(video.title);
                                }}
                                className={`flex flex-col w-full p-3 rounded text-left hover:bg-gray-700 transition-colors ${
                                    selectedVideoId === video.videoId ? "bg-gray-700 border-l-4 border-blue-500" : ""
                                }`}
                            >
                                <span className="font-medium">{video.title}</span>
                                <span className="text-sm text-gray-300 mt-1">{video.description}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {selectedVideoTitle || "Select a Tutorial"}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {tutorialVideos.find(v => v.videoId === selectedVideoId)?.description || ""}
                    </p>
                </div>
                
                {selectedVideoId && (
                    <>
                        <div className="flex-1 w-full border rounded-xl shadow-lg relative overflow-hidden bg-white"
                            onContextMenu={(e) => e.preventDefault()}>
                            {/* Block Google Drive pop-out button */}
                            <div className="absolute top-0 right-0 w-14 h-14 z-10" />
                            
                            <div className="w-full h-full flex items-center justify-center">
                                <iframe
                                    key={selectedVideoId}
                                    src={`https://drive.google.com/file/d/${selectedVideoId}/preview`}
                                    className="w-full h-full max-w-4xl"
                                    allowFullScreen
                                    title={`${selectedVideoTitle} Video Player`}
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            </div>
                        </div>

                        <div className="mt-8 w-full max-w-3xl mx-auto">
                            <FeedbackForm 
                                fileId={selectedVideoId}
                                fileName={selectedVideoTitle}
                                fileType="video"
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
    console.log("Submitting Tutorial feedback:", feedback);
    // Example: axios.post('/api/feedback/tutorials', feedback)
};

export default Tutorials;
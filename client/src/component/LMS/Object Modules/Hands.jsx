import React, { useState } from "react";
import FeedbackForm from "../FeedBackForm";

const Hands = () => {
    const [selectedExample, setSelectedExample] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [feedback, setFeedback] = useState([]);

    // Hands-on examples data using Google Drive file IDs
    const examples = [
        {
            id: 1,
            title: "Example 1: CNN with CIFAR-10",
            description: "Convolutional Neural Network implementation using CIFAR-10 dataset",
            files: [
                {
                    id: "1CrpMkrIK07vGbc8IDFvQwNaWFF2wxgjz", // Replace with actual Google Drive ID for IPYNB
                    name: "cnn_cifar10_dataset.ipynb",
                    type: "notebook",
                    driveId: "1CrpMkrIK07vGbc8IDFvQwNaWFF2wxgjz" // Same as id
                },
                {
                    id: "1ppTHlb3gCx-u1C1dbnajiFHqBgm8U7eN", // Replace with actual Google Drive ID for JPG
                    name: "small_images.jpg",
                    type: "image",
                    driveId: "1ppTHlb3gCx-u1C1dbnajiFHqBgm8U7eN" // Same as id
                }
            ]
        },
        {
            id: 2,
            title: "Example 2: KNN Classification",
            description: "k-Nearest Neighbors implementation with Iris dataset",
            files: [
                {
                    id: "1t1e21xVL5soiFikZRLhYNgcJgYa5EoTp", // Replace with actual Google Drive ID for IPYNB
                    name: "knn_classification.ipynb",
                    type: "notebook",
                    driveId: "1t1e21xVL5soiFikZRLhYNgcJgYa5EoTp" // Same as id
                },
                {
                    id: "1ldz8A_PrDo-NXEgsFGWUv70gvqGYVgY9", // Replace with actual Google Drive ID for PNG
                    name: "iris_petal_sepal.png",
                    type: "image",
                    driveId: "1ldz8A_PrDo-NXEgsFGWUv70gvqGYVgY9" // Same as id
                }
            ]
        },
        {
            id: 3,
            title: "Assignment",
            icon: "📓"
        }
    ];

    const handleFeedbackSubmit = (exampleId, rating, comment) => {
        const newFeedback = {
            exampleId,
            exampleTitle: selectedExample?.title,
            rating,
            comment,
            timestamp: new Date().toISOString()
        };
        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("handsFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    // Set first example as default on component mount
    useState(() => {
        if (examples.length > 0 && !selectedExample) {
            setSelectedExample(examples[0]);
            setSelectedFile(examples[0].files[0]);
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
        if (!selectedFile) return null;

        // Common iframe props
        const iframeProps = {
            className: "w-full h-full",
            title: selectedFile.name,
            allowFullScreen: true,
            frameBorder: "0"
        };

        switch (selectedFile.type) {
            case "notebook":
                return (
                    <div className="w-full h-full">
                        <iframe
                            src={`https://drive.google.com/file/d/${selectedFile.driveId}/preview`}
                            {...iframeProps}
                        />
                    </div>
                );
            case "image":
                return (
                    <div className="w-full h-full">
                        <iframe
                            src={`https://drive.google.com/file/d/${selectedFile.driveId}/preview`}
                            {...iframeProps}
                        />
                    </div>
                );
            case "pdf":
                return (
                    <div className="w-full h-full">
                        <iframe
                            src={`https://drive.google.com/file/d/${selectedFile.driveId}/preview`}
                            {...iframeProps}
                        />
                    </div>
                );
            case "ppt":
                return (
                    <div className="w-full h-full">
                        <iframe
                            src={`https://docs.google.com/presentation/d/${selectedFile.driveId}/preview`}
                            {...iframeProps}
                        />
                    </div>
                );
            default:
                return (
                    <div className="flex justify-center items-center h-full text-gray-500">
                        <p>Unsupported file type</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Navigation Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-xl font-bold mb-6">Hands-on Examples</h2>
                <ul className="space-y-3">
                    {examples.map(example => (
                        <li key={example.id}>
                            <button
                                onClick={() => {
                                    setSelectedExample(example);
                                    setSelectedFile(example.files[0]);
                                }}
                                className={`flex flex-col w-full p-3 rounded text-left hover:bg-gray-700 transition-colors ${
                                    selectedExample?.id === example.id ? "bg-gray-700 border-l-4 border-blue-500" : ""
                                }`}
                            >
                                <span className="font-medium">{example.title}</span>
                                <span className="text-sm text-gray-300 mt-1">{example.description}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {selectedExample?.title || "Select an Example"}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {selectedExample?.description || ""}
                    </p>
                    
                    {/* File selector tabs */}
                    {selectedExample && (
                        <div className="flex space-x-2 mt-4 overflow-x-auto">
                            {selectedExample.files.map(file => (
                                <button
                                    key={file.id}
                                    onClick={() => setSelectedFile(file)}
                                    className={`px-4 py-2 rounded-t-lg whitespace-nowrap ${
                                        selectedFile?.id === file.id
                                            ? "bg-white text-gray-800 border-t border-l border-r border-gray-300"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    {file.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Content display area */}
                <div className="flex-1 w-full border rounded-b-lg rounded-r-lg shadow-lg bg-white overflow-hidden relative">
                    {/* Block Google Drive pop-out button */}
                    <div className="absolute top-0 right-0 w-14 h-14 z-10" />
                    
                    {selectedFile ? (
                        renderFileContent()
                    ) : (
                        <div className="flex justify-center items-center h-full text-gray-400">
                            <p>Select a file to preview</p>
                        </div>
                    )}
                </div>

                {/* Feedback section */}
                {selectedExample && (
                    <div className="mt-8 w-full max-w-3xl mx-auto">
                        <FeedbackForm 
                            fileId={selectedExample.id}
                            fileName={selectedExample.title}
                            onSubmit={handleFeedbackSubmit}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const sendFeedbackToServer = (feedback) => {
    // Implement your feedback submission logic
    console.log("Submitting hands-on feedback:", feedback);
    // Example: axios.post('/api/feedback/hands-on', feedback)
};

export default Hands;
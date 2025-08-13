import React, { useState } from "react";
import { FaFire } from "react-icons/fa6";


const FeedbackForm = ({ fileId, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(fileId, rating, comment);
        setRating(0);
        setComment("");
    };

    return (
        <div className="mt-6 w-full max-w-6xl">
            <h3 className="text-xl font-bold mb-2">Feedback</h3>
            <form onSubmit={handleSubmit}>
                <div className="flex items-center mb-4">
                    <span className="mr-2">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`text-2xl ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
                            onClick={() => setRating(star)}
                        >
                            <FaFire />
                        </button>
                    ))}
                </div>
                <textarea
                    className="w-full p-2 border rounded-lg mb-4"
                    rows="4"
                    placeholder="Your feedback..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <button
                    type="submit"
                    className="bg-DGXblue text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                    Submit Feedback
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;
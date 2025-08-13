import React, { useState } from "react";
import { FaCalendarAlt, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const CreateQuiz = ({ onBack }) => {
  const [quizData, setQuizData] = useState({
    name: "",
    level: "Easy",
    duration: 30,
    negativeMarking: false,
    startDate: "",
    endDate: "",
    type: "Public",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData({
      ...quizData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Quiz Data Submitted:", quizData);
    fetch("/api/create-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizData),
    })
      .then((res) => res.json())
      .then((data) => console.log("Success:", data))
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Increased width to max-w-6xl */}
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl p-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>

        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
          Quiz Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Quiz Name
            </label>
            <input
              type="text"
              name="name"
              value={quizData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quiz name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select Quiz Level
            </label>
            <select
              name="level"
              value={quizData.level}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Quiz Time (minutes): {quizData.duration}
            </label>
            <input
              type="range"
              name="duration"
              min="5"
              max="180"
              value={quizData.duration}
              onChange={handleChange}
              className="w-full range range-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="negativeMarking"
              checked={quizData.negativeMarking}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-gray-700 font-medium">
              Enable Negative Marking
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                <FaCalendarAlt /> Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={quizData.startDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
                <FaCalendarAlt /> End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={quizData.endDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select Quiz Type
            </label>
            <select
              name="type"
              value={quizData.type}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
          >
            <FaCheckCircle className="mr-2" /> Create Quiz
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;
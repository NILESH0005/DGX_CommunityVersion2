import React from "react";

const QuizStartHeader = ({ quizData }) => {
  if (!quizData)
    return (
      <h2 className="text-xl font-bold text-red-500 animate-pulse">
        No quiz data available.
      </h2>
    );

  return (
    <div className="w-full max-w-screen bg-DGXblue text-white shadow-2xl p-8 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
      {/* Quiz Name */}
      <h1 className="text-4xl font-extrabold mb-4 animate-fade-in-down">
        {quizData.name}
      </h1>

      {/* Negative Marking Text (Full Width) */}
      <div className="w-full bg-opacity-80 py-3 mb-4 animate-fade-in-down delay-100">
        <p
          className={`text-lg font-semibold ${
            quizData.negativeMarking ? "text-green-400" : "text-red-400"
          }`}
        >
          {quizData.negativeMarking
            ? "✅ Negative Marking: Enabled"
            : "⚠️ Negative Marking: Disabled"}
        </p>
      </div>

      {/* Quiz Details */}
      <p className="text-lg font-semibold mb-2 animate-fade-in-down delay-200">
        Level:{" "}
        <span className="font-bold text-yellow-300">{quizData.level}</span> | Duration:{" "}
        <span className="font-bold text-yellow-300">{quizData.duration} min</span>
      </p>
      <p className="text-sm mb-4 animate-fade-in-down delay-300">
        🗓️ Start:{" "}
        <span className="font-bold text-yellow-300">
          {quizData.startDate} {quizData.startTime}
        </span>{" "}
        | 🕒 End:{" "}
        <span className="font-bold text-yellow-300">
          {quizData.endDate} {quizData.endTime}
        </span>
      </p>
    </div>
  );
};

export default QuizStartHeader;

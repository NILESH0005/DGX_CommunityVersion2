import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuizTimer from "./QuizTimer";

const QuizHeader = ({ startTimer, isTimerRunning }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Ensure quizData is not undefined
  const quizData = location.state?.quizData || {
    name: "Default Quiz",
    level: "N/A",
    duration: 5,
  };

  const currentQuestion = 3;
  const totalQuestions = 10;

  // Handle missing quizData (e.g., page refresh)
  // if (!location.state?.quizData) {
  //   console.warn("Quiz data is missing! Redirecting to the quiz selection page...");
  //   navigate("/quiz-selection");
  // }

  return (
    <div className="flex flex-col items-center bg-DGXblue text-white p-2 shadow-2xl ">
      {/* Quiz Title */}
      <h2 className="text-center text-4xl font-extrabold mb-2 animate-pulse">
        Quiz: {quizData.name}
      </h2>
      <p className="text-center text-xl font-semibold mb-4">
        Level: {quizData.level} | Duration: {quizData.duration} min
      </p>

      <div className="flex justify-between w-full mt-6">
        {/* Question Count */}
        {/* <div className="flex items-center">
          <span className="text-2xl font-bold bg-white text-blue-600 px-4 py-2 rounded-full shadow-lg">
            Question {currentQuestion} of {totalQuestions}
          </span>
        </div> */}

        {/* Timer Component */}
        <div className="flex items-center">
          <QuizTimer initialTime={quizData.duration * 60} isRunning={isTimerRunning} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white h-3 rounded-full mt-6 overflow-hidden">
        <div
          className="bg-yellow-400 h-full rounded-full"
          style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
        ></div>
      </div>

      {/* Interactive Button */}
      <button
        className="mt-6 bg-white text-blue-600 text-xl font-bold px-8 py-3 rounded-full shadow-lg hover:bg-blue-100 transition duration-300"
        onClick={startTimer}
      >
        {isTimerRunning ? "Pause Quiz" : "Start Quiz"}
      </button>
    </div>
  );
};

export default QuizHeader;
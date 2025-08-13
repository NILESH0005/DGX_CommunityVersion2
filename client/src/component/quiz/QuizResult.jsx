import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Confetti from "react-confetti";
import { FaTrophy, FaClock, FaChartBar, FaAward } from "react-icons/fa";

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get all data passed from the quiz component
  const {
    quiz = {},
    userAnswers = [],
    questions = [],
    startTime,
    endTime,
    score = 0,
    totalQuestions = 0,
    correctAnswers = 0,
    timeTaken = "0m 0s",
  } = location.state || {};

  // Calculate results if not provided
  const calculateResults = () => {
    // If values were passed directly, use them
    if (score > 0 || correctAnswers > 0) {
      return {
        score,
        totalQuestions,
        correctAnswers,
        timeTaken,
        percentage: Math.round((correctAnswers / totalQuestions) * 100),
      };
    }

    let correctCount = 0;
    let totalScore = 0;

    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer && userAnswer.isCorrect) {
        correctCount++;
        totalScore += question.totalMarks || 1;
      }
    });

    let calculatedTimeTaken = timeTaken;
    if (startTime && endTime) {
      const timeDiffInSeconds = Math.floor((endTime - startTime) / 1000);
      const minutes = Math.floor(timeDiffInSeconds / 60);
      const seconds = timeDiffInSeconds % 60;
      calculatedTimeTaken = `${minutes}m ${seconds}s`;
    }

    return {
      score: totalScore,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeTaken: calculatedTimeTaken,
      percentage: Math.round((correctCount / questions.length) * 100),
    };
  };

  const {
    score: finalScore,
    totalQuestions: finalTotalQuestions,
    correctAnswers: finalCorrectAnswers,
    timeTaken: finalTimeTaken,
    percentage,
  } = calculateResults();

  const [showResult, setShowResult] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowResult(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getPerformanceMessage = () => {
    if (percentage >= 80) return "Outstanding Performance! 🏆";
    if (percentage >= 60) return "Great Job! Keep Improving!";
    if (percentage >= 40) return "Good Attempt! Practice More!";
    return "Keep Trying! You'll Get Better!";
  };

  const getPerformanceColor = () => {
    if (percentage >= 80) return "text-emerald-500";
    if (percentage >= 60) return "text-blue-500";
    if (percentage >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const handleBackToQuizzes = () => {
    navigate("/QuizList");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {percentage >= 80 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {showResult && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="bg-white p-6 rounded-2xl shadow-xl w-full"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
                  percentage >= 80
                    ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                    : "bg-gradient-to-r from-blue-400 to-indigo-500"
                } text-white text-3xl font-bold mb-4 shadow-lg`}
              >
                {percentage}%
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {quiz?.quizName || "Quiz"} Results
              </h1>
              <p
                className={`text-lg font-semibold ${getPerformanceColor()} mb-4`}
              >
                {getPerformanceMessage()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <div className="flex justify-center text-blue-500 mb-2">
                  <FaChartBar size={20} />
                </div>
                <h3 className="text-sm font-medium text-gray-700">Score</h3>
                <p className="text-xl font-bold text-gray-800">
                  {finalScore} pts
                </p>
              </div>

              
              <div className="bg-emerald-50 p-4 rounded-xl text-center">
                <div className="flex justify-center text-emerald-500 mb-2">
                  <FaTrophy size={20} />
                </div>
                <h3 className="text-sm font-medium text-gray-700">Correct</h3>
                <p className="text-xl font-bold text-gray-800">
                  {finalCorrectAnswers}/{finalTotalQuestions}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl text-center">
                <div className="flex justify-center text-purple-500 mb-2">
                  <FaAward size={20} />
                </div>
                <h3 className="text-sm font-medium text-gray-700">Accuracy</h3>
                <p className="text-xl font-bold text-gray-800">
                  {percentage}%
                </p>
              </div>
            </div>

            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToQuizzes}
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Back to Quizzes
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default QuizResult;
import React, { useState, useEffect } from "react";

const QuizTimer = ({ initialTime = 60, isRunning, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    let timer;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      clearInterval(timer);
      if (onTimeUp) onTimeUp(); // Call function when timer reaches 0
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onTimeUp]);

  // Convert seconds into HH:MM:SS format
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-DGXgreen px-6 py-3 rounded-lg text-white font-semibold text-lg">
      ⏳ {formatTime(timeLeft)}
    </div>
  );
};

export default QuizTimer;
  
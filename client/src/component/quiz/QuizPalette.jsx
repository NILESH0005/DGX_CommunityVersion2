import React from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const QuizPalette = ({
  questionStatus,
  currentQuestion,
  setCurrentQuestion,
  timer,
  totalQuestions,
}) => {

  //old code
  // const getStatusClass = (status, questionNumber) => {
  //   const baseClasses = "w-8 h-8 flex items-center justify-center rounded-full text-sm border-2";
    
  //   if (questionNumber === currentQuestion + 1) {
  //     return cn(baseClasses, "border-blue-500 bg-white text-blue-500 font-bold");
  //   }
    
  //   switch (status) {
  //     case "answered":
  //       return cn(baseClasses, "border-green-500 bg-green-100 text-green-700");
  //     case "not-answered":
  //       return cn(baseClasses, "border-red-500 bg-red-100 text-red-700");
  //     case "marked":
  //       return cn(baseClasses, "border-purple-500 bg-purple-100 text-purple-700");
  //     default:
  //       return cn(baseClasses, "border-gray-300 bg-white text-gray-700");
  //   }
  // };
// Update getStatusClass to better handle marked questions
//updated code
const getStatusClass = (status, questionNumber) => {
  const baseClasses = "w-8 h-8 flex items-center justify-center rounded-full text-sm border-2";
  
  if (questionNumber === currentQuestion + 1) {
    return cn(
      baseClasses, 
      "border-blue-500 bg-white text-blue-500 font-bold",
      status === 'marked' ? "ring-2 ring-purple-300" : ""
    );
  }
  
  switch (status) {
    case "answered":
      return cn(baseClasses, "border-green-500 bg-green-100 text-green-700");
    case "not-answered":
      return cn(baseClasses, "border-red-500 bg-red-100 text-red-700");
    case "marked":
      return cn(baseClasses, "border-purple-500 bg-purple-100 text-purple-700");
    default:
      return cn(baseClasses, "border-gray-300 bg-white text-gray-700");
  }
};
  return (
    <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 border border-gray-200">
      {/* Timer Section */}
      <div className="mb-6 bg-gray-50 p-3 rounded-lg">
        <div className="grid grid-cols-3 text-center gap-2">
          <div className="flex flex-col bg-white p-2 rounded">
            <span className="text-2xl font-bold text-blue-600">{timer.hours}</span>
            <span className="text-xs text-gray-500">Hours</span>
          </div>
          <div className="flex flex-col bg-white p-2 rounded">
            <span className="text-2xl font-bold text-blue-600">{timer.minutes}</span>
            <span className="text-xs text-gray-500">Minutes</span>
          </div>
          <div className="flex flex-col bg-white p-2 rounded">
            <span className="text-2xl font-bold text-blue-600">{timer.seconds}</span>
            <span className="text-xs text-gray-500">Seconds</span>
          </div>
        </div>
      </div>

      {/* Question Palette */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Question Palette</h3>
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={cn(
                getStatusClass(questionStatus[num] || "not-visited", num),
                "transition-all hover:scale-105 focus:outline-none"
              )}
              onClick={() => setCurrentQuestion(num - 1)}
              aria-label={`Question ${num}`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-green-500 bg-green-100"></div>
            <span className="text-sm text-gray-700">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-red-500 bg-red-100"></div>
            <span className="text-sm text-gray-700">Not Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-purple-500 bg-purple-100"></div>
            <span className="text-sm text-gray-700">Marked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white"></div>
            <span className="text-sm text-gray-700">Not Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-white"></div>
            <span className="text-sm text-gray-700">Current Question</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPalette;
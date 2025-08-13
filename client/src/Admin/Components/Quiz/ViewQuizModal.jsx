import React, { useState, useEffect, useContext, useMemo } from 'react';
import ApiContext from "../../../context/ApiContext";
import Swal from "sweetalert2";


const ViewQuizModal = ({ quiz, onClose, getCategoryName, getLevelName, formatDateTime }) => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


 
  const allGroups = useMemo(() => {
    const groups = [...new Set(questions.map(q => q.group))];
    return [...groups]; // Include "All Groups" option
  }, [questions]);

  // Filter questions based on selected group
  const filteredQuestions = useMemo(() => {
    return selectedGroup === "All Groups"
      ? questions
      : questions.filter(question => question.group === selectedGroup);
  }, [questions, selectedGroup]);

  // Group filtered questions by their group property
  const groupedQuestions = useMemo(() => {
    return filteredQuestions.reduce((groups, question) => {
      const groupName = question.group;
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(question);
      return groups;
    }, {});
  }, [filteredQuestions]);
 
  const fetchQuizQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userToken) {
        throw new Error("Authentication token is missing");
      }

      const endpoint = "quiz/getQuizQuestions";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };
      const body = {
        quizGroupID: quiz.QuizCategory, // Assuming QuizCategory is the group_id
        QuizID: quiz.QuizID
      };

      const data = await fetchData(endpoint, method, body, headers);
      // console.log("dekho isse", data)

      if (!data) {
        throw new Error("No data received from server");
      }

      if (data.success) {
        const transformedQuestions = transformQuestions(data.data.questions || []);
        setQuestions(transformedQuestions);
      } else {
        throw new Error(data.message || "Failed to fetch questions");
      }
    } catch (err) {
      // console.error("Error fetching questions:", err);
      setError(err.message || "Something went wrong, please try again.");
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || "Failed to load questions",
      });
    } finally {
      setLoading(false);
    }
  };

  const transformQuestions = (apiQuestions) => {
    return apiQuestions.map(apiQ => ({
      id: apiQ.QuestionsID,
      questionText: apiQ.QuestionTxt,
      questionType: apiQ.questionType || "Nilesh", 
      points: apiQ.totalMarks || 1,
      negativePoints: apiQ.negativeMarks || 0,
      group: apiQ.group_name || "General",
      answers: apiQ.options?.map((opt) => ({
        id: opt.id,
        answerText: opt.option_text,
        isCorrect: opt.is_correct
      })) || []
    }));
  };
  
 
  useEffect(() => {
    if (quiz?.QuizID) {
      fetchQuizQuestions();
    }
  }, [quiz]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg p-8 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Centered Quiz Name Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gray-50 p-4 rounded-lg shadow-sm">
            {quiz.QuizName || "Quiz Report"}
          </h2>
        </div>

        {/* Quiz Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-blue-200 text-blue-700">
              Basic Information
            </h3>
            <div className="space-y-4 text-lg">
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">Category:</span>
                <span className="text-gray-900">{getCategoryName(quiz.QuizCategory) || "General Knowledge"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">Level:</span>
                <span className="text-gray-900">{getLevelName(quiz.QuizLevel) || "Intermediate"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">Duration:</span>
                <span className="text-gray-900">{quiz.QuizDuration || 30} mins</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">Negative Marking:</span>
                <span className={`font-medium ${quiz.NegativeMarking ? 'text-red-600' : 'text-green-600'}`}>
                  {quiz.NegativeMarking ? "Yes" : "No"}
                </span>
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-blue-200 text-blue-700">
              Timing & Visibility
            </h3>
            <div className="space-y-4 text-lg">
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">Start Date:</span>
                <span className="text-gray-900">{formatDateTime(quiz.StartDateAndTime) || "2023-11-15 09:00 AM"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">End Date:</span>
                <span className="text-gray-900">{formatDateTime(quiz.EndDateTime) || "2023-11-15 10:30 AM"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">Visibility:</span>
                <span className="text-gray-900">{quiz.QuizVisibility || "Public"}</span>
              </p>
              <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-gray-200">
                <span className="font-semibold text-lg bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  Total Questions: {quiz.QuestionMappedCount || 0}
                </span>
                <span className="font-semibold text-lg bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  Total Marks: {quiz.TotalMarksPerQuiz || 0}
                </span>
                <span className="font-semibold text-lg bg-red-100 text-red-800 px-3 py-1 rounded-full">
                  Negative Marks: -{quiz.NegativeMarking || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions and Answers Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800">Questions & Answers</h3>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between px-4 py-2 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedGroup}
                <svg className="w-5 h-5 ml-2 -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedGroup("All Groups");
                        setIsDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-lg ${selectedGroup === "All Groups" ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      All Groups
                    </button>
                    {allGroups.map(group => (
                      <button
                        key={group}
                        onClick={() => {
                          setSelectedGroup(group);
                          setIsDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-lg ${selectedGroup === group ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {Object.entries(groupedQuestions).map(([groupName, groupQuestions], groupIndex) => (
              <div key={groupName} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                {/* Group Header */}
                <div className="bg-blue-100 px-6 py-3 border-b">
                  <h4 className="font-bold text-xl text-blue-800">{groupName}</h4>
                </div>

                {/* Questions in the group */}
                <div className="space-y-6 p-6">
                  {groupQuestions.map((question, qIndex) => (
                    <div key={question.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-xl">
                          <span className="text-gray-600">Q{groupIndex * groupQuestions.length + qIndex + 1}: </span>
                          {question.questionText}
                        </h4>
                        <div className="flex flex-col items-end space-y-2">
                          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            {question.points} point{question.points !== 1 ? 's' : ''}
                          </span>
                          {quiz.NegativeMarking && (
                            <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                              -{question.negativePoints} point{question.negativePoints !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-md text-gray-600 mb-4">Type: {question.questionType}</p>

                      <div className="ml-4 space-y-3">
                        {question.answers.map((answer) => (
                          <div
                            key={answer.id}
                            className={`flex items-center p-3 rounded-lg ${answer.isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-white border border-gray-200'}`}
                          >
                            <input
                              type={question.questionType === "Multiple Select" ? "checkbox" : "radio"}
                              checked={answer.isCorrect}
                              readOnly
                              className={`mr-3 w-5 h-5 ${answer.isCorrect ? 'accent-green-600' : 'accent-gray-400'}`}
                            />
                            <span className={`text-lg ${answer.isCorrect ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
                              {answer.answerText}
                            </span>
                            {answer.isCorrect && (
                              <span className="ml-auto text-green-600 font-medium text-lg">✓ Correct Answer</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors text-lg font-semibold shadow-md"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewQuizModal;
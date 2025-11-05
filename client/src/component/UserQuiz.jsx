import React, { useState, useEffect, useContext } from 'react';
import ApiContext from '../context/ApiContext';
import moment from 'moment';
import { FaEye } from 'react-icons/fa';

const TrophyIcon = () => <span>🏆</span>;
const ClockIcon = () => <span>⏱️</span>;
const ChartBarIcon = () => <span>📊</span>;
const CalendarIcon = () => <span>📅</span>;
const FilterIcon = () => <span>🔍</span>;
const ArrowTrendingUpIcon = () => <span>📈</span>;
const SparklesIcon = () => <span>✨</span>;

const UserQuiz = () => {
  const [quizData, setQuizData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    category: 'all',
    scoreRange: [0, 100],
  });
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchData, userToken } = useContext(ApiContext);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      setLoading(true);
      try {
        const endpoint = "quiz/getUserQuizHistory";
        const method = "GET";
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };

        const result = await fetchData(endpoint, method, {}, headers);
        console.log("API Response:", result); // Debug log

        if (result.success && result.data && result.data.quizHistory) {
          const transformedData = result.data.quizHistory.map(quiz => ({
            id: `quiz-${quiz.quizID}`,
            date: quiz.latestAttemptDate,
            score: parseFloat(quiz.percentageScore), // Convert string to number
            category: quiz.group_name || 'General',
            isCompleted: true,
            title: quiz.QuizName,
            attempts: quiz.attemptNumber,
            totalObtained: parseFloat(quiz.totalObtained),
            totalPossible: parseFloat(quiz.totalPossible),
            percentageScore: parseFloat(quiz.percentageScore),
          }));

          console.log("Transformed Data:", transformedData); // Debug log
          setQuizData(transformedData);
          setFilteredData(transformedData);
          setAnimate(true);
          setTimeout(() => setAnimate(false), 1000);
        } else {
          console.error("Failed to fetch quiz history:", result.message);
        }
      } catch (error) {
        console.error("Error fetching quiz history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) {
      fetchQuizHistory();
    }
  }, [userToken, fetchData]);

  useEffect(() => {
    let result = [...quizData];

    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      result = result.filter(quiz => new Date(quiz.date) >= cutoffDate);
    }

    if (filters.category !== 'all') {
      result = result.filter(quiz => quiz.category === filters.category);
    }

    result = result.filter(quiz =>
      quiz.percentageScore >= filters.scoreRange[0] &&
      quiz.percentageScore <= filters.scoreRange[1]
    );

    if (searchTerm) {
      result = result.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(result);
  }, [filters, quizData, searchTerm]);

  const getScoreClass = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border border-green-300';
    if (score >= 70) return 'bg-blue-100 text-blue-800 border border-blue-300';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    return 'bg-red-100 text-red-800 border border-red-300';
  };

  const getStatusClass = (isCompleted) => {
    return isCompleted ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-yellow-100 text-yellow-800 border border-yellow-300';
  };

  const categories = [...new Set(quizData.map(q => q.category))];

  // Add debug logging to see what's happening
  console.log("Quiz Data:", quizData);
  console.log("Filtered Data:", filteredData);
  console.log("Loading:", loading);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {animate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl animate-bounce">
            <SparklesIcon className="h-10 sm:h-12 w-10 sm:w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-center">Welcome to Your Quiz Dashboard!</h2>
          </div>
        </div>
      )}
      <div className={`max-w-7xl mx-auto transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
          <TrophyIcon className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500 mr-2" />
          Quiz Performance Dashboard
        </h1>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium">Category:</label>
                <select
                  className="border px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium">Date Range:</label>
                <select
                  className="border px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                >
                  <option value="all">All Time</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="120">Last 120 Days</option> 
                </select>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search quizzes..."
              className="p-2 border rounded text-xs sm:text-sm w-full sm:w-64 md:w-72 lg:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-300">
              <div className="overflow-auto" style={{ maxHeight: "600px" }}>
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-DGXblue text-white">
                      <th className="p-1 sm:p-2 border text-center text-xs sm:text-sm w-8 sm:w-12">#</th>
                      <th className="p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[120px] sm:min-w-[180px]">Quiz Name</th>
                      <th className="p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[80px] sm:min-w-[120px]">Category</th>
                      <th className="p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[60px] sm:min-w-[80px]">Attempts</th>
                      <th className="p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[100px] sm:min-w-[150px]">Attempt Date</th>
                      <th className="p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[80px] sm:min-w-[100px]">Score</th>
                      <th className="p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[80px] sm:min-w-[100px]">Marks</th>
                      <th className="p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[80px] sm:min-w-[100px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((quiz, index) => (
                      <tr key={quiz.id} className="hover:bg-gray-50">
                        <td className="p-1 sm:p-2 border text-center text-xs sm:text-sm w-8 sm:w-12">{index + 1}</td>
                        <td className="p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[120px] sm:min-w-[180px] font-medium">
                          {quiz.title}
                        </td>
                        <td className="p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[80px] sm:min-w-[120px]">
                          {quiz.category}
                        </td>
                        <td className="p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[60px] sm:min-w-[80px]">
                          {quiz.attempts}
                        </td>
                        <td className="p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[100px] sm:min-w-[150px]">
                          {moment.utc(quiz.date).format("MMM D, YYYY h:mm A")}
                        </td>
                        <td className={`p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[80px] sm:min-w-[100px] ${getScoreClass(quiz.percentageScore)}`}>
                          {quiz.percentageScore.toFixed(1)}%
                        </td>
                        <td className="p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[80px] sm:min-w-[100px]">
                          {quiz.totalObtained}/{quiz.totalPossible}
                        </td>
                        <td className={`p-1 sm:p-2 border text-center text-xs sm:text-sm min-w-[80px] sm:min-w-[100px] ${getStatusClass(quiz.isCompleted)}`}>
                          {quiz.isCompleted ? 'Completed' : 'Incomplete'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm sm:text-base mb-4">
                {searchTerm || filters.category !== 'all' || filters.dateRange !== 'all'
                  ? "No quizzes match your search/filters"
                  : "No quiz attempts found"}
              </p>
              {quizData.length === 0 && (
                <p className="text-xs text-gray-400">
                  You haven't attempted any quizzes yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <p>Total Quiz Data: {quizData.length}</p>
            <p>Filtered Data: {filteredData.length}</p>
            <p>Loading: {loading.toString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserQuiz;
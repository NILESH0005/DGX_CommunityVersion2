import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ApiContext from "../../context/ApiContext";

const QuizList = () => {
  const navigate = useNavigate();
  const quizCategoriesRef = useRef(null);
  const { userToken, fetchData } = useContext(ApiContext);
  const [leaderboard, setLeaderboard] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  // Update current time every second for countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userToken) {
        throw new Error("Authentication token is missing");
      }

      const endpoint = "quiz/getUserQuizCategory";
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const data = await fetchData(endpoint, method, {}, headers);
      console.log("Quiz data:", data);

      const leaderboardEndpoint = "quiz/getLeaderboardRanking";
      const leaderboardData = await fetchData(
        leaderboardEndpoint,
        method,
        {},
        headers
      );
      console.log("Leaderboard data:", leaderboardData);

      if (!data || !leaderboardData) {
        throw new Error("No data received from server");
      }

      if (data.success) {
        const quizMap = new Map();

        // First create grouped quizzes
        const groupedQuizzes = data.data.quizzes.reduce((acc, quiz) => {
          if (quizMap.has(quiz.QuizID)) return acc;
          quizMap.set(quiz.QuizID, true);
          const existingGroup = acc.find(
            (group) => group.group_name === quiz.group_name
          );

          if (existingGroup) {
            existingGroup.quizzes.push({
              id: quiz.QuizName,
              title: quiz.QuizName,
              questions: quiz.Total_Question_No,
              points: quiz.MaxScore,
              QuizID: quiz.QuizID,
              group_id: quiz.group_id,
              image: quiz.QuizImage,
              startDate: adjustTimeZone(new Date(quiz.StartDateAndTime)),
              endDate: adjustTimeZone(new Date(quiz.EndDateTime)),
              attempts: quiz.userAttempts || 0,
            });
          } else {
            acc.push({
              id: quiz.group_name,
              group_name: quiz.group_name,
              group_id: quiz.group_id,
              quizzes: [
                {
                  id: quiz.QuizName,
                  title: quiz.QuizName,
                  questions: quiz.Total_Question_No,
                  points: quiz.MaxScore,
                  QuizID: quiz.QuizID,
                  group_id: quiz.group_id,
                  image: quiz.QuizImage,
                  startDate: adjustTimeZone(new Date(quiz.StartDateAndTime)),
                  endDate: adjustTimeZone(new Date(quiz.EndDateTime)),
                  attempts: quiz.userAttempts || 0,
                },
              ],
            });
          }
          return acc;
        }, []);

        // Then filter out groups with no active/upcoming quizzes
        const filteredGroups = groupedQuizzes.filter((group) => {
          return group.quizzes.some((quiz) => {
            const status = getQuizStatus(quiz);
            return status !== "expired";
          });
        });

        // Finally set the filtered groups to state
        setQuizzes(filteredGroups);
      } else {
        throw new Error(data.message || "Failed to fetch quizzes");
      }
      if (leaderboardData.success) {
        const sortedLeaderboard = leaderboardData.data.quizzes
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((user, index) => ({
            ...user,
            rank: index + 1,
            medal:
              index === 0
                ? "🥇"
                : index === 1
                ? "🥈"
                : index === 2
                ? "🥉"
                : `#${index + 1}`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.Name
            )}&background=random`,
          }));

        setLeaderboard(sortedLeaderboard);
      } else {
        console.warn("Failed to fetch leaderboard:", leaderboardData.message);
      }
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError(err.message || "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchQuizzes();
    } else {
      setLoading(false);
      setError("Please login to access quizzes");
    }
  }, [userToken]);

  const handleQuizClick = (quiz, group) => {
    console.log("quiz is", quiz.QuizID);

    navigate(`/quiz/${quiz.QuizID}`, {
      state: {
        quiz: {
          ...quiz,
          group_id: group.group_id,
          QuizID: quiz.QuizID,
        },
      },
    });
  };

  const adjustTimeZone = (date) => {
    if (!date) return null;
    return new Date(date.getTime() - 5 * 60 * 60 * 1000 - 30 * 60 * 1000);
  };

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  const getTimeRemaining = (startDate) => {
    const diff = startDate - now;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const getQuizStatus = (quiz) => {
    if (now < quiz.startDate) {
      return "upcoming";
    } else if (now >= quiz.startDate && now <= quiz.endDate) {
      return "active";
    } else {
      return "expired";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DGXblue mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchQuizzes}
            className="mt-4 bg-DGXblue text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="py-12 sm:py-6 w-full">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Welcome to Quizz
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Test your knowledge, earn points, and compete with others to
              become the top performer!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6"></div>
          </div>
        </div>
      </div>
      <div className="w-full mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-8/12" ref={quizCategoriesRef}>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Quiz Categories
          </h2>
          {quizzes.length > 0 ? (
            quizzes.map((subject) => (
              <div key={subject.id} className="mb-12 group">
                <div className="relative mb-6">
                  <h3 className="text-2xl font-bold text-gray-700 inline-block relative pb-2">
                    {subject.group_name}
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {subject.quizzes.map((quiz) => {
                    const status = getQuizStatus(quiz);
                    if (status === "expired") return null;

                    const timeRemaining = getTimeRemaining(quiz.startDate);

                    return (
                      <div
                        key={quiz.id}
                        className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 border-blue-500 group-hover:border-purple-600 relative overflow-hidden flex flex-col h-full"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 opacity-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-bl-full"></div>

                        {quiz.image && (
                          <div className="mb-4 h-40 overflow-hidden rounded-lg flex-shrink-0">
                            <img
                              src={quiz.image}
                              alt={quiz.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex flex-col flex-grow">
                          <h4 className="text-xl font-bold text-gray-800 mb-2 relative z-10">
                            {quiz.title}
                          </h4>

                          <div className="mt-2 mb-4">
                            <div className="flex gap-4 flex-wrap relative z-10">
                              <span className="flex items-center text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                                {quiz.questions} questions
                              </span>
                              <span className="flex items-center text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                  />
                                </svg>
                                {quiz.points} points
                              </span>
                              {quiz.attempts > 0 && (
                                <span className="flex items-center text-gray-600">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {quiz.attempts} attempt
                                  {quiz.attempts !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>

                          {status === "upcoming" && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-500 mb-2">
                                Starts in:
                              </p>
                              <div className="flex gap-2">
                                {timeRemaining.days > 0 && (
                                  <div className="text-center bg-gray-100 p-2 rounded">
                                    <span className="block text-lg font-bold">
                                      {formatTime(timeRemaining.days)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Days
                                    </span>
                                  </div>
                                )}
                                <div className="text-center bg-gray-100 p-2 rounded">
                                  <span className="block text-lg font-bold">
                                    {formatTime(timeRemaining.hours)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Hours
                                  </span>
                                </div>
                                <div className="text-center bg-gray-100 p-2 rounded">
                                  <span className="block text-lg font-bold">
                                    {formatTime(timeRemaining.minutes)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Mins
                                  </span>
                                </div>
                                <div className="text-center bg-gray-100 p-2 rounded">
                                  <span className="block text-lg font-bold">
                                    {formatTime(timeRemaining.seconds)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Secs
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex-grow"></div>

                          {status === "active" ? (
                            <button
                              className={`w-full py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md relative z-10 mt-4 ${
                                quiz.attempts > 0
                                  ? "bg-DGXblue hover:bg-blue-700 text-white"
                                  : "bg-DGXblue hover:bg-blue-600 text-white"
                              }`}
                              onClick={() => handleQuizClick(quiz, subject)}
                            >
                              {quiz.attempts > 0 ? "Retake Quiz" : "Start Quiz"}
                            </button>
                          ) : (
                            <button
                              className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed relative z-10 mt-4"
                              disabled
                            >
                              Quiz Not Started
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No quizzes available at the moment.
              </p>
            </div>
          )}
        </div>
        <div className="w-full lg:w-4/12">
          <div className="sticky top-6">
            <div className="bg-white p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Top Performers
              </h2>
              <div className="space-y-4">
                {leaderboard.length > 0 ? (
                  <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {" "}
                    {/* Added max-height and overflow */}
                    {leaderboard.map((user) => (
                      <div
                        key={user.Name}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex items-center">
                          <img
                            src={user.avatar}
                            alt={user.Name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="ml-4">
                            <p className="text-lg font-semibold text-gray-800">
                              {user.Name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {user.totalPoints} Points
                            </p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-lime-600">
                          {user.medal}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No leaderboard data available</p>
                )}
                <p className="mt-6 text-sm text-gray-600 text-center">
                  Top performers will be rewarded with exclusive gifts! 🎁
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizList;

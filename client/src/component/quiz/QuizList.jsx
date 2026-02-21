import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ApiContext from "../../context/ApiContext";
import QuizLeaderboard from "./QuizLeaderboard";

const QuizList = () => {
  const navigate = useNavigate();
  const quizCategoriesRef = useRef(null);
  const { userToken, fetchData } = useContext(ApiContext);

  const [leaderboard, setLeaderboard] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  const Noimage = "/assets/no-image.jpg"; // or your own fallback

  const getQuizImageUrl = (imagePath) => {
    if (!imagePath) return Noimage;

    // base64?
    if (imagePath.startsWith("data:image/")) return imagePath;

    // already full URL
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
      return imagePath;

    // build full URL for relative paths
    const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;

    if (!baseUploadsUrl) {
      console.error("VITE_API_UPLOADSURL is not configured!");
      return Noimage;
    }

    const cleanPath = imagePath.replace(/^\/+/, "");
    return `${baseUploadsUrl}/${cleanPath}`;
  };

  // Update time live
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userToken) throw new Error("Authentication token is missing");

      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const data = await fetchData("quiz/getUserQuizCategory", "GET", {}, headers);
      const leaderboardData = await fetchData("quiz/getLeaderboardRanking", "GET", {}, headers);

      if (!data || !leaderboardData) {
        throw new Error("No data received from server");
      }

      // --- QUIZ PROCESSING (UNTOUCHED) ---
      if (data.success) {
        const quizMap = new Map();

        const groupedQuizzes = data.data.quizzes.reduce((acc, quiz) => {
          if (quizMap.has(quiz.QuizID)) return acc;

          quizMap.set(quiz.QuizID, true);

          const existingGroup = acc.find(g => g.group_name === quiz.group_name);

          const quizObj = {
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
          };

          if (existingGroup) {
            existingGroup.quizzes.push(quizObj);
          } else {
            acc.push({
              id: quiz.group_name,
              group_name: quiz.group_name,
              group_id: quiz.group_id,
              quizzes: [quizObj],
            });
          }

          return acc;
        }, []);

        const filteredGroups = groupedQuizzes.filter(group =>
          group.quizzes.some(quiz => getQuizStatus(quiz) !== "expired")
        );

        setQuizzes(filteredGroups);
      }

      // --- LEADERBOARD PROCESSING (UNTOUCHED) ---
      if (leaderboardData.success) {
        const sortedLeaderboard = leaderboardData.data.quizzes
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((user, index) => ({
            ...user,
            rank: index + 1,
            medal:
              index === 0 ? "🥇" :
              index === 1 ? "🥈" :
              index === 2 ? "🥉" :
              `#${index + 1}`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.Name)}&background=random`,
          }));

        setLeaderboard(sortedLeaderboard);
      }

    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError(err.message || "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) fetchQuizzes();
    else {
      setLoading(false);
      setError("Please login to access quizzes");
    }
  }, [userToken]);

  const navigateQuiz = (quiz, group) => {
    navigate(`/quiz/${quiz.QuizID}`, {
      state: { quiz: { ...quiz, group_id: group.group_id } },
    });
  };

  const adjustTimeZone = date =>
    new Date(date.getTime() - 5 * 60 * 60 * 1000 - 30 * 60 * 1000);

  const getQuizStatus = quiz => {
    if (now < quiz.startDate) return "upcoming";
    if (now >= quiz.startDate && now <= quiz.endDate) return "active";
    return "expired";
  };

  const getTimeRemaining = date => {
    const diff = date - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const formatTime = t => (t < 10 ? `0${t}` : t);

  const renderCountdown = (time, status) => (
    <div className="mb-6">
      <p className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wider">
        {status === "upcoming" ? "⏱️ Starts in" : "⏳ Ends in"}
      </p>
      <div className="flex gap-3">
        {time.days > 0 && (
          <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-3 min-w-[70px] border border-purple-100 shadow-sm">
            <span className="text-2xl font-bold text-gray-900">{formatTime(time.days)}</span>
            <span className="text-xs font-medium text-gray-500 mt-1">Days</span>
          </div>
        )}
        <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 min-w-[70px] border border-blue-100 shadow-sm">
          <span className="text-2xl font-bold text-gray-900">{formatTime(time.hours)}</span>
          <span className="text-xs font-medium text-gray-500 mt-1">Hours</span>
        </div>
        <div className="flex flex-col items-center bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-xl p-3 min-w-[70px] border border-cyan-100 shadow-sm">
          <span className="text-2xl font-bold text-gray-900">{formatTime(time.minutes)}</span>
          <span className="text-xs font-medium text-gray-500 mt-1">Mins</span>
        </div>
        <div className="flex flex-col items-center bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-3 min-w-[70px] border border-emerald-100 shadow-sm">
          <span className="text-2xl font-bold text-gray-900">{formatTime(time.seconds)}</span>
          <span className="text-xs font-medium text-gray-500 mt-1">Secs</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 md:p-8">
      {/* Loading & Error States */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading quizzes...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Quizzes</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <div className="relative inline-block mb-6">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4 tracking-tight">
            Quiz Challenge
          </h1>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm"></div>
        </div>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Test your knowledge, climb the leaderboard, and earn your spot among the best!
          Every quiz is a new adventure.
        </p>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-8/12" ref={quizCategoriesRef}>
          <div className=" top-4 z-10 bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Available Quizzes</h2>
                <p className="text-gray-500 mt-2">Select a category and start your challenge</p>
              </div>
             
            </div>
          </div>

          {quizzes.length > 0 ? (
            <div className="space-y-12">
              {quizzes.map(group => (
                <div 
                  key={group.id} 
                  className="relative group"
                >
                  <div className=" top-24 z-10 mb-8">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-white to-gray-50/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-gray-200 shadow-lg">
                      <div className="w-3 h-12 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">{group.group_name}</h3>
                        <p className="text-gray-500 text-sm">{group.quizzes.length} active quiz{group.quizzes.length !== 1 ? 'zes' : ''}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {group.quizzes.map(quiz => {
                      const status = getQuizStatus(quiz);
                      if (status === "expired") return null;

                      const time = status === "upcoming"
                        ? getTimeRemaining(quiz.startDate)
                        : getTimeRemaining(quiz.endDate);

                      const imageUrl = getQuizImageUrl(quiz.image);

                      return (
                        <div
                          key={quiz.id}
                          className="
                            bg-white rounded-3xl border border-gray-200 shadow-lg
                            overflow-hidden hover:shadow-2xl hover:border-blue-200
                            transition-all duration-500 hover:-translate-y-2
                            flex flex-col h-full group/card
                          "
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={imageUrl} 
                              alt={quiz.title}
                              className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                              onError={(e) => {
                                e.target.src = Noimage;
                                e.target.className = "w-full h-full object-contain bg-gray-100 p-4";
                              }}
                            />
                            <div className="absolute top-4 right-4">
                              <span className={`
                                px-3 py-1.5 rounded-full text-xs font-bold tracking-wide
                                ${status === 'active' 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                                  : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                                }
                              `}>
                                {status === 'active' ? 'LIVE NOW' : 'UPCOMING'}
                              </span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"></div>
                          </div>

                          <div className="p-6 flex-grow">
                            <div className="mb-4">
                              <h4 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                {quiz.title}
                              </h4>
                              
                              <div className="flex flex-wrap gap-3 mb-6">
                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                                  <span className="text-blue-600">📊</span>
                                  <span className="text-sm font-medium text-gray-700">{quiz.questions} Qs</span>
                                </div>
                                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full">
                                  <span className="text-purple-600">🏆</span>
                                  <span className="text-sm font-medium text-gray-700">{quiz.points} pts</span>
                                </div>
                                {quiz.attempts > 0 && (
                                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
                                    <span className="text-amber-600">↻</span>
                                    <span className="text-sm font-medium text-gray-700">{quiz.attempts} attempt{quiz.attempts !== 1 ? 's' : ''}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Countdown Timer */}
                            {(status === "upcoming" || status === "active") &&
                              renderCountdown(time, status)}

                            <div className="mt-6 pt-6 border-t border-gray-100">
                              {status === "active" ? (
                                <button
                                  onClick={() => navigateQuiz(quiz, group)}
                                  className="
                                    w-full py-4 rounded-xl text-white font-bold text-lg
                                    bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600
                                    hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600
                                    transform hover:scale-[1.02] active:scale-[0.98]
                                    transition-all duration-300 shadow-lg hover:shadow-xl
                                    flex items-center justify-center gap-3
                                  "
                                >
                                  <span>{quiz.attempts > 0 ? "Retake Quiz" : "Start Quiz Now"}</span>
                                  <span className="text-xl animate-pulse">🚀</span>
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="
                                    w-full py-4 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200
                                    text-gray-400 font-semibold text-lg border border-gray-300
                                    cursor-not-allowed
                                  "
                                >
                                  ⏳ Quiz Starting Soon
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">No Quizzes Available</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Check back soon for new quiz challenges. New categories are added regularly!
              </p>
            </div>
          )}
        </div>

        {/* LEADERBOARD PANEL - SIDEBAR */}
        <div className="w-full lg:w-4/12">
          <div className="sticky top-24">
            <QuizLeaderboard leaderboard={leaderboard} />
            
            {/* Additional Info Card */}
            <div className="mt-8 bg-gradient-to-br from-white to-blue-50/50 rounded-2xl border border-blue-100 p-6 shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">💡</span> How It Works
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-600 text-sm">Select an active quiz from any category</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-600 text-sm">Complete all questions within the time limit</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-pink-600 text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-600 text-sm">Earn points and climb the leaderboard</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizList;
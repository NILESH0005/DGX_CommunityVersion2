import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import QuizHeader from "./QuizHeader";
import QuizPalette from "./QuizPalette";
import ApiContext from "../../context/ApiContext";
import Loader from "../LoadPage";
import Swal from "sweetalert2";

const Quiz = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const quiz = location.state?.quiz || {};

  const STORAGE_KEY = `quiz_attempt_${quiz.QuizID}`;
  const { userToken, fetchData } = useContext(ApiContext);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timer, setTimer] = useState({ hours: 0, minutes: 30, seconds: 0 });
  const [questionStatus, setQuestionStatus] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  const currentQuestionData = questions[currentQuestion];
  const isMCQ = currentQuestionData?.questionType === 0;
  const isMSQ = currentQuestionData?.questionType === 1;

  const loadSavedAnswers = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);

        // Check for both possible structures
        if (parsed.answers?.answers) {
          // New structure with nested answers
          return {
            ...parsed,
            answers: parsed.answers.answers || []
          };
        } else if (Array.isArray(parsed.answers)) {
          // Old structure with direct answers array
          return parsed;
        }

        return null;
      }
      return null;
    } catch (error) {
      console.error("Failed to load saved answers:", error);
      return null;
    }
  };

  const saveAnswersToStorage = (answers) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        answers: {
          quizId: quiz.QuizID,
          groupId: quiz.group_id,
          answers: answers
        },
        questionStatus,
        quizId: quiz.QuizID,
        groupId: quiz.group_id
      }));
    } catch (error) {
      console.error("Failed to save answers:", error);
    }
  };

  const clearAnswerFromStorage = (questionIndex) => {
    const savedData = loadSavedAnswers();
    if (savedData) {
      const updatedAnswers = savedData.answers.map((answer, idx) =>
        idx === questionIndex ? null : answer
      );
      saveAnswersToStorage({
        ...savedData,
        answers: updatedAnswers,
      });
    }
  };

  useEffect(() => {
    if (!quiz?.QuizID) {
      setError("Quiz ID is missing");
      setLoading(false);
      return;
    }

    if (!quiz?.group_id) {
      setError("Group ID is missing");
      setLoading(false);
      return;
    }

    if (userToken) {
      fetchQuizQuestions({
        QuizID: quiz.QuizID,
        group_id: quiz.group_id || null,
        duration: quiz.QuizDuration,
      });
    }
  }, [quiz, userToken]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        console.log("LocalStorage updated:", e);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [STORAGE_KEY]);

  const fetchQuizQuestions = async (quizData) => {
    setLoading(true);
    setError(null);

    try {
      let endpoint, requestBody;

      if (quizData.group_id && quizData.QuizID) {
        endpoint = "quiz/getQuizQuestions";
        requestBody = {
          quizGroupID: quizData.group_id,
          QuizID: quizData.QuizID,
        };
      } else if (quizData.QuizID) {
        endpoint = "quiz/getQuizQuestionsByQuizId";
        requestBody = {
          QuizID: quizData.QuizID,
        };
      } else {
        throw new Error("Insufficient data to fetch questions");
      }

      const data = await fetchData(endpoint, "POST", requestBody, {
        "Content-Type": "application/json",
        "auth-token": userToken,
      });

      if (!data) {
        throw new Error("No data received from server");
      }

      if (data.success) {
        const transformedQuestions = transformQuestions(data.data.questions);
        setQuestions(transformedQuestions);

        const saved = loadSavedAnswers();
        // Ensure selectedAnswers is always an array
        const initialAnswers = Array.isArray(saved?.answers)
          ? saved.answers
          : Array(transformedQuestions.length).fill(null);

        // Make sure the array length matches questions count
        const paddedAnswers = transformedQuestions.length > initialAnswers.length
          ? [...initialAnswers, ...Array(transformedQuestions.length - initialAnswers.length).fill(null)]
          : initialAnswers.slice(0, transformedQuestions.length);

        setSelectedAnswers(paddedAnswers);

        if (transformedQuestions.length > 0) {
          const duration =
            transformedQuestions[0].duration || quizData.duration || 30;
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          setTimer({ hours, minutes, seconds: 0 });
        }

        const initialQuestionStatus = transformedQuestions.reduce(
          (acc, _, index) => {
            acc[index + 1] = "not-visited";
            return acc;
          },
          {}
        );

        setQuestionStatus(initialQuestionStatus);
      } else {
        throw new Error(data.message || "Failed to fetch questions");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err.message || "Failed to load questions");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to load questions",
      });
    } finally {
      setLoading(false);
    }
  };

  const transformQuestions = (apiQuestions) => {
    return apiQuestions.map((item) => {
      const optionsWithIds = item.options.map((option, index) => ({
        ...option,
        id: option.id ? Number(option.id) : index + 1,
      }));

      const correctAnswers = optionsWithIds
        .filter(
          (option) => option.is_correct === true || option.is_correct === 1
        )
        .map((option) => Number(option.id));
      const questionType = correctAnswers.length > 1 ? 1 : 0;

      return {
        id: Number(item.QuestionsID),
        question_text: item.QuestionTxt,
        questionType,
        totalMarks: Number(item.totalMarks) || 1,
        negativeMarks: Number(item.negativeMarks) || 0,
        duration: Number(item.QuizDuration) || 30,
        options: optionsWithIds,
        correctAnswers,
      };
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        let { hours, minutes, seconds } = prev;

        if (hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(interval);
          handleTimeUp();
          return prev;
        }

        if (seconds === 0) {
          if (minutes === 0) {
            hours -= 1;
            minutes = 59;
          } else {
            minutes -= 1;
          }
          seconds = 59;
        } else {
          seconds -= 1;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTimeUp = async () => {
    await Swal.fire({
      title: "Time Up!",
      text: "Your time for this quiz has ended.",
      icon: "warning",
      confirmButtonText: "Submit Now",
    });
    handleQuizSubmit();
  };

  useEffect(() => {
    setQuestionStatus((prev) => {
      const newStatus = { ...prev };

      selectedAnswers.forEach((answer, index) => {
        const questionNum = index + 1;

        if (answer !== null) {
          if (newStatus[questionNum] !== "marked") {
            newStatus[questionNum] = "answered";
          }
        } else if (newStatus[questionNum] === "answered") {
          newStatus[questionNum] = "not-answered";
        }
      });

      return newStatus;
    });
  }, [selectedAnswers]);

  const handleNavigation = (nextQuestion) => {
    setQuestionStatus((prev) => {
      const newStatus = { ...prev };
      const currentQNum = currentQuestion + 1;

      if (!newStatus[currentQNum] || newStatus[currentQNum] === "not-visited") {
        newStatus[currentQNum] =
          selectedAnswers[currentQuestion] !== null
            ? "answered"
            : "not-answered";
      }

      const nextQNum = nextQuestion + 1;
      if (newStatus[nextQNum] === "not-visited") {
        newStatus[nextQNum] = "not-answered";
      }

      return newStatus;
    });

    setCurrentQuestion(nextQuestion);
  };

  const handleAnswerClick = (optionId) => {
    const optionIdNum = Number(optionId);
    const currentQuestionData = questions[currentQuestion];
    const isMSQ = currentQuestionData?.questionType === 1;

    setSelectedAnswers((prev) => {
      const newAnswers = [...prev];
      const currentAnswer = newAnswers[currentQuestion] || {};

      if (isMSQ) {
        const currentSelections = currentAnswer.selectedOptionIds || [];
        const newSelections = currentSelections.includes(optionIdNum)
          ? currentSelections.filter((id) => id !== optionIdNum)
          : [...currentSelections, optionIdNum];

        const correctSelected = newSelections.filter((id) =>
          currentQuestionData.correctAnswers.includes(id)
        ).length;
        const isFullyCorrect =
          correctSelected === currentQuestionData.correctAnswers.length &&
          newSelections.length === currentQuestionData.correctAnswers.length;

        newAnswers[currentQuestion] = {
          ...currentAnswer,
          questionId: currentQuestionData.id,
          selectedOptionIds: newSelections,
          isCorrect: isFullyCorrect,
          marksAwarded: isFullyCorrect
            ? currentQuestionData.totalMarks
            : -currentQuestionData.negativeMarks,
        };
      } else {
        const isCorrect =
          currentQuestionData.correctAnswers.includes(optionIdNum);
        newAnswers[currentQuestion] = {
          ...currentAnswer,
          questionId: currentQuestionData.id,
          selectedOptionId: optionIdNum,
          isCorrect,
          marksAwarded: isCorrect
            ? currentQuestionData.totalMarks
            : -currentQuestionData.negativeMarks,
        };
      }

      saveAnswersToStorage({
        quizId: quiz.QuizID,
        groupId: quiz.group_id,
        answers: newAnswers,
      });

      return newAnswers;
    });

    setQuestionStatus((prev) => ({
      ...prev,
      [currentQuestion + 1]: "answered",
    }));
  };

  const handleSave = () => {
    setQuestionStatus((prev) => ({
      ...prev,
      [currentQuestion + 1]: selectedAnswers[currentQuestion] !== null
        ? "answered"
        : "not-answered",
    }));
  };

  const handleSaveAndNext = () => {
    handleSave();

    if (currentQuestion + 1 < questions.length) {
      handleNavigation(currentQuestion + 1);
    } else {
      handleQuizSubmit();
    }
  };

  const handleClearResponse = () => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = null;
    setSelectedAnswers(newAnswers);

    setQuestionStatus((prev) => ({
      ...prev,
      [currentQuestion + 1]: "not-answered",
    }));

    clearAnswerFromStorage(currentQuestion);
  };

  const handleMarkForReview = () => {
    const currentQuestionNum = currentQuestion + 1;

    setQuestionStatus((prev) => ({
      ...prev,
      [currentQuestionNum]: "marked",
    }));

    if (currentQuestion + 1 < questions.length) {
      handleNavigation(currentQuestion + 1);
    }
  };

  const handleQuizSubmit = async () => {
    if (!userToken) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "Please login to submit the quiz",
      });
      return;
    }

    // Debug: Check what's in localStorage
    console.log("LocalStorage content:", localStorage.getItem(STORAGE_KEY));

    const savedData = loadSavedAnswers();
    console.log("Saved data before preparation:", savedData);

    if (!savedData || !savedData.answers || savedData.answers.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Nothing to Submit",
        text: "Please answer at least one question before submitting.",
      });
      return;
    }

    // Filter out null answers but keep track of answered questions
    const validAnswers = selectedAnswers.filter((answer) => answer !== null);
    console.log("Valid answers:", validAnswers);

    if (validAnswers.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Answers",
        text: "You haven't answered any questions. Please answer at least one question to submit.",
      });
      return;
    }

    const correctCount = validAnswers.filter(
      (answer) => answer.isCorrect
    ).length;
    const incorrectCount = validAnswers.filter(
      (answer) => !answer.isCorrect
    ).length;
    const attemptedCount = validAnswers.length;

    const positiveMarks = validAnswers.reduce(
      (sum, answer) => sum + (answer.isCorrect ? answer.marksAwarded : 0),
      0
    );

    const negativeMarks = validAnswers.reduce(
      (sum, answer) =>
        sum + (!answer.isCorrect ? Math.abs(answer.marksAwarded) : 0),
      0
    );

    const totalScore = positiveMarks - negativeMarks;

    const result = await Swal.fire({
      title: "Are you sure?",
      html: `<p class="mt-4">You won't be able to change your answers after submission!</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!",
    });

    if (!result.isConfirmed) {
      return;
    }

    const swalInstance = Swal.fire({
      title: "Submitting...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      setSubmitting(true);
      setSubmitError(null);

      const endpoint = "quiz/submitQuiz";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      // Prepare answers - use selectedAnswers instead of savedData.answers
      const preparedAnswers = selectedAnswers
        .filter((a) => a !== null)
        .map((answer) => {
          const questionData = questions.find(q => q.id === answer.questionId);
          const base = {
            questionId: Number(answer.questionId),
            isCorrect: Boolean(answer.isCorrect),
            marksAwarded: Number(answer.marksAwarded),
            maxMarks: questionData ? Number(questionData.totalMarks) : 1,
            negativeMarks: questionData ? Number(questionData.negativeMarks) : 0,
          };

          return answer.selectedOptionIds
            ? { ...base, selectedOptionIds: answer.selectedOptionIds }
            : { ...base, selectedOptionId: Number(answer.selectedOptionId) };
        });

      const body = {
        quizId: Number(quiz.QuizID),
        groupId: quiz.group_id ? Number(quiz.group_id) : null,
        answers: preparedAnswers,
      };
      console.log("Final submission body:", body);

      const data = await fetchData(endpoint, method, body, headers);

      if (!data.success) {
        throw new Error(data.message || "Submission failed");
      }

      setSubmitSuccess(true);
      localStorage.removeItem(STORAGE_KEY);

      await swalInstance.close();

      navigate("/quiz-result", {
        state: {
          quiz: quiz,
          score: data.data?.totalScore || totalScore,
          totalQuestions: questions.length,
          answers: validAnswers,
          correctAnswers: correctCount,
          incorrectAnswers: incorrectCount,
          attemptedCount: attemptedCount,
          positiveMarks: positiveMarks,
          negativeMarks: negativeMarks,
          timeTaken: `${timer.hours}h ${timer.minutes}m ${timer.seconds}s`,
          serverData: data.data,
        },
      });
    } catch (error) {
      console.error("Quiz submission error:", error);
      setSubmitError(error.message);

      await swalInstance.close();

      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.message || "Failed to submit quiz. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md w-full">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchQuizQuestions}
            className="mt-4 bg-DGXblue text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition w-full sm:w-auto"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md w-full">
          <p className="text-lg">No questions available for this quiz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-medium text-center mb-4 sm:mb-6 px-2">
          {quiz.title}
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="lg:col-span-3 border border-gray-300 rounded-md bg-white">
            {/* Question Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border-b border-gray-300">
              <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
                <span className="text-sm sm:text-base text-gray-700">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <div className="w-24 sm:w-32 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{
                      width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm">
                    +{questions[currentQuestion]?.totalMarks || 1}
                  </span>
                  <span className="text-green-600 text-xs sm:text-sm font-medium">Correct</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm">
                    -{questions[currentQuestion]?.negativeMarks || 0}
                  </span>
                  <span className="text-red-600 text-xs sm:text-sm font-medium">Wrong</span>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-300">
              <p className="text-base sm:text-lg mb-4 sm:mb-6">
                {questions[currentQuestion]?.question_text}
              </p>
              <div className="flex font-bold">
                <span
                  className={`px-2 sm:px-3 py-1 mb-3 sm:mb-4 rounded-full text-xs sm:text-sm ${
                    isMCQ
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {isMCQ ? "MCQ" : "MSQ"}
                </span>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {questions[currentQuestion]?.options?.map((option) => {
                  const optionId = Number(option.id);
                  const isSelected = isMSQ
                    ? selectedAnswers[currentQuestion]?.selectedOptionIds?.includes(optionId)
                    : selectedAnswers[currentQuestion]?.selectedOptionId === optionId;

                  return (
                    <label
                      key={optionId}
                      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition ${
                        isSelected
                          ? "bg-blue-100 border-2 border-blue-500"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <input
                        type={isMSQ ? "checkbox" : "radio"}
                        name={`question-${currentQuestion}`}
                        checked={isSelected}
                        onChange={() => handleAnswerClick(optionId)}
                        className={isMSQ ? "rounded" : ""}
                      />
                      <span className="text-sm sm:text-base">{option.option_text}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between p-3 sm:p-4 gap-2 sm:gap-0">
              <div className="flex flex-wrap gap-2">
                {currentQuestion > 0 && (
                  <button
                    className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm sm:text-base"
                    onClick={() => handleNavigation(currentQuestion - 1)}
                  >
                    Previous
                  </button>
                )}
                <button
                  className="px-3 sm:px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition text-sm sm:text-base"
                  onClick={handleMarkForReview}
                >
                  Mark for Review
                </button>
                <button
                  className="px-3 sm:px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition text-sm sm:text-base"
                  onClick={handleClearResponse}
                >
                  Clear
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  className={`px-4 sm:px-6 py-2 text-white rounded transition text-sm sm:text-base ${
                    currentQuestion + 1 === questions.length
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={handleSaveAndNext}
                >
                  {currentQuestion + 1 === questions.length
                    ? "Submit Quiz"
                    : "Save & Next"}
                </button>
              </div>
            </div>
          </div>

          <QuizPalette
            questionStatus={questionStatus}
            currentQuestion={currentQuestion}
            setCurrentQuestion={(index) => handleNavigation(index)}
            timer={timer}
            totalQuestions={questions.length}
          />
        </div>
      </div>
    </div>
  );
};

export default Quiz;
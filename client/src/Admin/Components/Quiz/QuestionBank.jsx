import React, { useState, useEffect, useContext } from "react";
import ApiContext from "../../../context/ApiContext";
import QuizQuestions from "./QuizQuestions";
import Swal from "sweetalert2";
import LoadPage from "../../../component/LoadPage";
import EditQuestionModal from "./EditQuestionModal";
import { FaEdit, FaTrash, FaSearch, FaTimes, FaPlus, FaListAlt } from "react-icons/fa";

const QuizBank = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [showQuizQuestions, setShowQuizQuestions] = useState(false);
  const [questionMap, setFinalQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [questionLevels, setQuestionLevels] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => {
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);

  const fetchCategories = async () => {
    const endpoint = `dropdown/getQuestionGroupDropdown`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const data = await fetchData(endpoint, method, {}, headers);
      if (data?.success) {
        setCategories(
          data.data?.sort((a, b) => a.group_name.localeCompare(b.group_name)) ||
            []
        );
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching quiz categories:", error);
      return [];
    }
  };

  const fetchQuestionLevels = async () => {
    const endpoint = `dropdown/getDropdownValues?category=questionLevel`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const data = await fetchData(endpoint, method, {}, headers);
      if (data?.success) {
        setQuestionLevels(data.data || []);
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching question levels:", error);
      return [];
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    const endpoint = "quiz/getQuestion";
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const [questionsData] = await Promise.all([
        fetchData(endpoint, method, {}, headers),
        fetchCategories(),
        fetchQuestionLevels(),
      ]);

      if (questionsData.success) {
        // The new response structure has data.quizzes array with options included
        const quizzes = questionsData.data.quizzes || [];

        const processedQuestions = quizzes.map((quiz) => {
          // Find correct answers
          const correctOptions = quiz.options
            .filter((option) => option.is_correct === 1)
            .map((option) => option.option_text);

          // Join correct answers with " | " separator
          const correctAnswer = correctOptions.join(" | ");

          return {
            id: quiz.question_id,
            question_id: quiz.question_id,
            question_text: quiz.question_text,
            correctAnswer: correctAnswer,
            group: quiz.group_name,
            group_id: quiz.QuizID, // Using QuizID instead of group_id
            Ques_level: quiz.ddValue,
            count: quiz.quiz_count || 0,
            image: null, // Add this if available in response
            options: quiz.options.map((option) => ({
              option_text: option.option_text,
              is_correct: option.is_correct === 1,
              image: null, // Add this if available in response
            })),
          };
        });

        setFinalQuestions(processedQuestions);
      } else {
        setError(questionsData.message || "Failed to fetch questions.");
        Swal.fire(
          "Error",
          questionsData.message || "Failed to fetch questions.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Something went wrong, please try again.");
      Swal.fire("Error", "Something went wrong, please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
    });

    if (!result.isConfirmed) return;

    if (!questionId) {
      Swal.fire("Error", "Question ID is missing.", "error");
      return;
    }

    const endpoint = "quiz/deleteQuestion";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = { id: questionId.toString() };

    try {
      const data = await fetchData(endpoint, method, body, headers);
      if (data?.success) {
        setFinalQuestions((prevQuestions) =>
          prevQuestions.filter((q) => q.id !== questionId)
        );
        Swal.fire("Deleted!", "Question has been deleted.", "success");
      } else {
        Swal.fire(
          "Error",
          data?.message || "Failed to delete the question.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      Swal.fire("Error", "Something went wrong, please try again.", "error");
    }
  };

  const handleEdit = (questionId) => {
    const questionToEdit = questionMap.find((q) => q.id === questionId);

    if (!questionToEdit) {
      Swal.fire("Error", "Question not found in local data", "error");
      return;
    }

    const transformedQuestion = {
      id: questionToEdit.id,
      question_text: questionToEdit.question_text,
      group_id: questionToEdit.group_id?.toString(),
      group_name: questionToEdit.group,
      Ques_level: questionToEdit.Ques_level,
      question_type:
        questionToEdit.options.filter((opt) => opt.is_correct).length > 1
          ? 1
          : 0, // Determine type based on correct answers
      image: questionToEdit.image,
      options: questionToEdit.options.map((option) => ({
        option_text: option.option_text,
        is_correct: option.is_correct,
        image: option.image,
      })),
    };

    setSelectedQuestion(transformedQuestion);
    setShowEditModal(true);
  };

  const transformQuestionData = (apiData) => {
    if (!apiData || apiData.length === 0) return null;

    const questionMap = {};

    apiData.forEach((item) => {
      if (!questionMap[item.question_id]) {
        questionMap[item.question_id] = {
          id: item.question_id,
          question_text: item.question_text,
          group_id: item.group_id?.toString(),
          group_name: item.group_name,
          Ques_level: item.ddValue,
          question_type: item.question_type || 0,
          image: item.question_image || null,
          options: [],
        };
      }

      if (item.option_text) {
        questionMap[item.question_id].options.push({
          option_text: item.option_text,
          is_correct: item.is_correct === 1,
          image: item.option_image || null,
        });
      }
    });

    return Object.values(questionMap)[0];
  };

  const handleCloseModal = (isUpdated = false) => {
    setShowEditModal(false);
    setSelectedQuestion(null);

    if (isUpdated) {
      fetchQuestions();
    }
  };

  const handleQuestionCreated = () => {
    fetchQuestions();
    setShowQuizQuestions(false);
    Swal.fire("Success", "Question added successfully!", "success");
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const groups = ["All", ...new Set(questionMap.map((q) => q.group))];

  const filteredQuestions = questionMap.filter((question) => {
    return (
      (selectedGroup === "All" || question.group === selectedGroup) &&
      (question.question_text || question.text)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  const renderMobileQuestionCard = (question, index) => (
    <div
      key={`${question.id}_${index}`}
      className="p-5 mb-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">Question {index + 1}</h3>
          <p className="text-sm text-gray-600">{question.group}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          question.Ques_level === 'Hard' 
            ? 'bg-red-100 text-red-800' 
            : question.Ques_level === 'Medium'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {question.Ques_level || question.level}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Question:</p>
        <p className="text-sm text-gray-900 line-clamp-2">{question.question_text || question.text}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</p>
        <p className="text-sm text-gray-900 font-medium">{question.correctAnswer}</p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700 font-medium">
            Used: {question.count || 0} times
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(question.id)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(question.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg mb-6 w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showQuizQuestions) {
    return (
      <QuizQuestions
        onBackToBank={() => setShowQuizQuestions(false)}
        onQuestionCreated={handleQuestionCreated}
      />
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <p className="text-red-600 text-center font-medium mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-DGXblue text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium mx-auto block shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Question Bank</h2>
          <p className="text-gray-600 text-sm">
            Total Questions: <span className="font-semibold">{questionMap.length}</span>
          </p>
        </div>
        <button
          onClick={() => setShowQuizQuestions(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-colors duration-200 font-medium shadow-sm"
        >
          <FaPlus />
          Create Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions by text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="w-full md:w-64">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent bg-white"
          >
            {groups.map((group, index) => (
              <option key={index} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Table/Cards */}
      {filteredQuestions.length > 0 ? (
        isMobileView ? (
          <div className="space-y-4">
            {filteredQuestions.map((question, index) =>
              renderMobileQuestionCard(question, index)
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
              <div className="min-w-full">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-DGXgreen">
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 sticky left-0  z-20">
                        #
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 min-w-[300px]">
                        Question
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 min-w-[200px]">
                        Correct Answer
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Group
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Level
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Usage
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredQuestions.map((q, index) => (
                      <tr key={`${q.id}_${index}`} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="p-4 text-sm text-gray-600 font-medium sticky left-0 bg-white z-10">
                          {index + 1}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-bold text-gray-900 line-clamp-2">
                            {q.question_text || q.text}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-900 font-medium">
                            {q.correctAnswer}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                            {q.group}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            q.Ques_level === 'Hard' 
                              ? 'bg-red-100 text-red-800' 
                              : q.Ques_level === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {q.Ques_level || q.level}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaListAlt className="text-gray-400" />
                            <span className="text-sm text-gray-700 font-medium">
                              {q.count || 0} times
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(q.id)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                              title="Edit"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(q.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Delete"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-3">
            <FaSearch size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            {searchQuery || selectedGroup !== "All" 
              ? "No questions match your filters" 
              : "No questions found in the bank"}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-DGXblue hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {showEditModal && selectedQuestion && (
        <EditQuestionModal
          isOpen={showEditModal}
          onClose={() => handleCloseModal(false)}
          questionData={selectedQuestion}
          onUpdateSuccess={() => handleCloseModal(true)}
          categories={categories}
          questionLevels={questionLevels}
        />
      )}
    </div>
  );
};

export default QuizBank;
import React, { useState, useEffect, useContext, useMemo } from "react";
import ApiContext from "../../../context/ApiContext";
import Swal from "sweetalert2";
import LoadPage from "../../../component/LoadPage";
import ViewQuizModal from "./ViewQuizModal";
import EditQuizModal from "./EditQuizModal";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaFilter,
  FaTimes,
  FaSearch,
  FaListUl,
} from "react-icons/fa";

const QuizTable = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [quizLevels, setQuizLevels] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    quizCategory: true,
    quizName: true,
    duration: true,
    startDateTime: true,
    endDateTime: true,
    questions: true,
    participants: true,
    attempts: true,
    totalMarks: true,
    passingPercentage: true,
    actions: true,
    level: false,
    negativeMarking: false,
    visibility: false,
  });

  // Mobile view detection
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

  // Column definitions for better organization
  const columnDefinitions = [
    { key: "quizCategory", label: "Quiz Category" },
    { key: "quizName", label: "Quiz Name" },
    { key: "level", label: "Level" },
    { key: "duration", label: "Duration" },
    { key: "negativeMarking", label: "Negative Marking" },
    { key: "startDateTime", label: "Start Date & Time" },
    { key: "endDateTime", label: "End Date & Time" },
    { key: "visibility", label: "Visibility" },
    { key: "questions", label: "Questions" },
    { key: "participants", label: "Participants" },
    { key: "attempts", label: "Attempts" },
    { key: "totalMarks", label: "Total Marks" },
    { key: "passingPercentage", label: "Passing Percentage" },
    { key: "actions", label: "Actions" },
  ];

  const fetchQuizLevels = async () => {
    try {
      const endpoint = `dropdown/getDropdownValues?category=quizLevel`;
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const result = await fetchData(endpoint, method, headers);
      if (result?.success) {
        setQuizLevels(result.data || []);
      } else {
        throw new Error(result?.message || "Failed to fetch quiz levels");
      }
    } catch (error) {
      setQuizLevels([]);
      throw error;
    }
  };

  const fetchQuizCategories = async () => {
    try {
      const endpoint = `dropdown/getQuizGroupDropdown`;
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const result = await fetchData(endpoint, method, headers);
      if (result?.success) {
        const sortedCategories = (result.data || []).sort((a, b) =>
          a.group_name.localeCompare(b.group_name)
        );
        setCategories(sortedCategories);
      } else {
        throw new Error(result?.message || "Failed to fetch quiz categories");
      }
    } catch (error) {
      setCategories([]);
      throw error;
    }
  };

  const fetchQuizzes = async () => {
    try {
      const endpoint = "quiz/getQuizzes";
      const method = "POST";
      const body = {};
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const result = await fetchData(endpoint, method, body, headers);
      if (result?.success) {
        setQuizzes(result.data?.quizzes || []);
        return result.data?.quizzes || [];
      } else {
        throw new Error(result?.message || "Failed to fetch quizzes");
      }
    } catch (error) {
      setQuizzes([]);
      throw error;
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchQuizzes(),
          fetchQuizCategories(),
          fetchQuizLevels(),
        ]);
      } catch (error) {
        setError(error.message);
        Swal.fire({
          icon: "error",
          title: "Loading Error",
          text: "Failed to load quiz data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // const formatDateTime = (dateString) => {
  //   if (!dateString) return "N/A";

  //   const date = new Date(dateString);
  //   const year = date.getFullYear();
  //   const month = (date.getMonth() + 1).toString().padStart(2, "0");
  //   const day = date.getDate().toString().padStart(2, "0");
  //   const hours = date.getHours().toString().padStart(2, "0");
  //   const minutes = date.getMinutes().toString().padStart(2, "0");

  //   return `${year}-${month}-${day} ${hours}:${minutes}`;
  // };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const getLevelName = (levelId) => {
    if (!quizLevels.length) return "Loading...";
    try {
      const level = quizLevels.find(
        (lvl) =>
          lvl.idCode ===
          (typeof levelId === "string" ? parseInt(levelId, 10) : levelId)
      );
      return level ? level.ddValue : "N/A";
    } catch (e) {
      return "N/A";
    }
  };

  const getCategoryName = (groupId) => {
    if (!categories.length) return "Loading...";
    try {
      const category = categories.find(
        (cat) =>
          cat.group_id ===
          (typeof groupId === "string" ? parseInt(groupId, 10) : groupId)
      );
      return category ? category.group_name : "N/A";
    } catch (e) {
      return "N/A";
    }
  };

  const filteredQuizzes = useMemo(() => {
    if (!searchTerm) return quizzes;
    const searchLower = searchTerm.toLowerCase();
    return quizzes.filter((quiz) => {
      try {
        return (
          quiz.QuizName?.toLowerCase().includes(searchLower) ||
          getCategoryName(quiz.QuizCategory)
            ?.toLowerCase()
            .includes(searchLower) ||
          getLevelName(quiz.QuizLevel)?.toLowerCase().includes(searchLower) ||
          quiz.QuizVisibility?.toLowerCase().includes(searchLower) ||
          quiz.QuizDuration?.toString().includes(searchTerm) ||
          (quiz.NegativeMarking ? "yes" : "no").includes(searchLower) ||
          quiz.PassingPercentage?.toString().includes(searchTerm)
        );
      } catch (e) {
        return false;
      }
    });
  }, [searchTerm, quizzes, categories, quizLevels]);

  const handleDelete = async (quizId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ok!",
    });

    if (result.isConfirmed) {
      try {
        const endpoint = `quiz/deleteQuiz`;
        const method = "POST";
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };
        const body = { QuizID: quizId };

        const response = await fetchData(endpoint, method, body, headers);
        if (response.success) {
          Swal.fire("Deleted!", "Quiz has been deleted.", "success");
          setQuizzes((prevQuizzes) =>
            prevQuizzes.filter((quiz) => quiz.QuizID !== quizId)
          );
        } else {
          throw new Error(response.message || "Failed to delete quiz");
        }
      } catch (error) {
        Swal.fire("Error!", error.message || "Failed to delete quiz", "error");
      }
    }
  };

  const handleView = (quiz) => {
    setSelectedQuiz(quiz);
    setShowViewModal(true);
  };

  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz);
    setShowEditModal(true);
  };

  const handleCloseModal = (updatedQuiz) => {
    setShowViewModal(false);
    setShowEditModal(false);

    if (updatedQuiz) {
      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((quiz) =>
          quiz.QuizID === updatedQuiz.QuizID ? updatedQuiz : quiz
        )
      );
    }

    setSelectedQuiz(null);
  };

  const toggleColumnVisibility = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const toggleAllColumns = (value) => {
    const newVisibility = {};
    columnDefinitions.forEach((col) => {
      newVisibility[col.key] = value;
    });
    setVisibleColumns(newVisibility);
  };

  const renderMobileQuizCard = (quiz, index) => (
    <div
      key={quiz.QuizID}
      className="p-5 mb-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">{quiz.QuizName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600">
              {getCategoryName(quiz.QuizCategory)}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-600">
              {getLevelName(quiz.QuizLevel)}
            </span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            quiz.QuizVisibility === "Public"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {quiz.QuizVisibility}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Start Time</p>
            <p className="text-sm text-gray-900 font-medium">
              {formatDateTime(quiz.StartDateAndTime)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">End Time</p>
            <p className="text-sm text-gray-900 font-medium">
              {formatDateTime(quiz.EndDateTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Duration</p>
              <p className="text-sm text-gray-900 font-medium">
                {quiz.QuizDuration} mins
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">
                Passing %
              </p>
              <p className="text-sm text-gray-900 font-medium">
                {quiz.PassingPercentage || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FaListUl className="text-gray-400 text-sm" />
            <span className="text-sm text-gray-700 font-medium">
              Q: {quiz.QuestionMappedCount || 0}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-700 font-medium">
              P: {quiz.UniqueParticipants || 0}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-700 font-medium">
              A: {quiz.totalMaxAttempts || 0}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleView(quiz)}
            className="p-2 text-DGXblue hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="View"
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => handleEdit(quiz)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(quiz.QuizID)}
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
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <p className="text-red-600 text-center font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-DGXblue text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium mx-auto block shadow-sm"
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Quiz Management
          </h2>
          <p className="text-gray-600 text-sm">
            Total Quizzes:{" "}
            <span className="font-semibold">{quizzes.length}</span>
          </p>
        </div>
        {!isMobileView && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium text-gray-700"
            >
              {showFilters ? <FaTimes /> : <FaFilter />}
              {showFilters ? "Close" : "Columns"}
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search quizzes by name, category, level, visibility..."
          className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent placeholder-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Column Filters */}
      {showFilters && !isMobileView && (
        <div className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-900">
              Visible Columns
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAllColumns(true)}
                className="text-sm bg-DGXgreen hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors duration-200 font-medium"
              >
                Show All
              </button>
              <button
                onClick={() => toggleAllColumns(false)}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-lg transition-colors duration-200 font-medium"
              >
                Hide All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {columnDefinitions.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 p-3 hover:bg-white rounded-lg cursor-pointer transition-colors duration-200"
              >
                <input
                  type="checkbox"
                  checked={visibleColumns[key]}
                  onChange={() => toggleColumnVisibility(key)}
                  className="rounded border-gray-300 text-DGXgreen focus:ring-DGXgreen h-5 w-5"
                />
                <span className="text-sm font-medium text-gray-700">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Quizzes Table/Cards */}
      {filteredQuizzes.length > 0 ? (
        isMobileView ? (
          <div className="space-y-4">
            {filteredQuizzes.map((quiz, index) =>
              renderMobileQuizCard(quiz, index)
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <div
              className="overflow-auto"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              <div className="min-w-full">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-DGXgreen">
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 sticky left-0 bg-dgx z-20">
                        #
                      </th>
                      {columnDefinitions.map(
                        ({ key, label }) =>
                          visibleColumns[key] && (
                            <th
                              key={key}
                              className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 min-w-[150px]"
                            >
                              {label}
                            </th>
                          )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredQuizzes.map((quiz, index) => (
                      <tr
                        key={quiz.QuizID}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="p-4 text-sm text-gray-600 font-medium sticky left-0 bg-white z-10">
                          {index + 1}
                        </td>

                        {visibleColumns.quizCategory && (
                          <td className="p-4 text-sm text-gray-900">
                            {getCategoryName(quiz.QuizCategory)}
                          </td>
                        )}

                        {visibleColumns.quizName && (
                          <td className="p-4">
                            <div className="text-sm font-bold text-gray-900">
                              {quiz.QuizName}
                            </div>
                          </td>
                        )}

                        {visibleColumns.level && (
                          <td className="p-4 text-sm text-gray-600">
                            {getLevelName(quiz.QuizLevel)}
                          </td>
                        )}

                        {visibleColumns.duration && (
                          <td className="p-4 text-sm text-gray-900 font-medium">
                            {quiz.QuizDuration} mins
                          </td>
                        )}

                        {visibleColumns.negativeMarking && (
                          <td className="p-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                quiz.NegativeMarking
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {quiz.NegativeMarking ? "Yes" : "No"}
                            </span>
                          </td>
                        )}

                        {visibleColumns.startDateTime && (
                          <td className="p-4 text-sm text-gray-900">
                            {formatDateTime(quiz.StartDateAndTime)}
                          </td>
                        )}

                        {visibleColumns.endDateTime && (
                          <td className="p-4 text-sm text-gray-900">
                            {formatDateTime(quiz.EndDateTime)}
                          </td>
                        )}

                        {visibleColumns.visibility && (
                          <td className="p-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                quiz.QuizVisibility === "Public"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {quiz.QuizVisibility}
                            </span>
                          </td>
                        )}

                        {visibleColumns.questions && (
                          <td className="p-4 text-sm text-gray-900 font-medium text-center">
                            {quiz.QuestionMappedCount || 0}
                          </td>
                        )}

                        {visibleColumns.participants && (
                          <td className="p-4 text-sm text-gray-900 font-medium text-center">
                            {quiz.UniqueParticipants || 0}
                          </td>
                        )}

                        {visibleColumns.attempts && (
                          <td className="p-4 text-sm text-gray-900 font-medium text-center">
                            {quiz.totalMaxAttempts || 0}
                          </td>
                        )}

                        {visibleColumns.totalMarks && (
                          <td className="p-4 text-sm text-gray-900 font-medium text-center">
                            {quiz.TotalMarksPerQuiz || 0}
                          </td>
                        )}

                        {visibleColumns.passingPercentage && (
                          <td className="p-4 text-sm text-gray-900 font-medium text-center">
                            {quiz.PassingPercentage || 0}%
                          </td>
                        )}

                        {visibleColumns.actions && (
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(quiz)}
                                className="p-2 text-DGXblue hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="View"
                              >
                                <FaEye size={16} />
                              </button>
                              <button
                                onClick={() => handleEdit(quiz)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                                title="Edit"
                              >
                                <FaEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(quiz.QuizID)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete"
                              >
                                <FaTrash size={16} />
                              </button>
                            </div>
                          </td>
                        )}
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
            {searchTerm ? "No quizzes match your search" : "No quizzes found"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-DGXblue hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {showViewModal && selectedQuiz && (
        <ViewQuizModal
          quiz={selectedQuiz}
          onClose={handleCloseModal}
          getCategoryName={getCategoryName}
          getLevelName={getLevelName}
          formatDateTime={formatDateTime}
        />
      )}
      {showEditModal && selectedQuiz && (
        <EditQuizModal
          quiz={selectedQuiz}
          onClose={handleCloseModal}
          categories={categories}
          quizLevels={quizLevels}
        />
      )}
    </div>
  );
};

export default QuizTable;

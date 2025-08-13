import React, { useState, useEffect, useContext } from "react";
import ApiContext from "../../../context/ApiContext.jsx";
import Swal from 'sweetalert2';
import { FaSearch, FaTimes } from 'react-icons/fa';

const QuizMapping = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [quizzes, setQuizzes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [levels, setLevels] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [mappedQuestions, setMappedQuestions] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questionMarks, setQuestionMarks] = useState({});
  const [selectedMappedQuestions, setSelectedMappedQuestions] = useState([]);
  const [loading, setLoading] = useState({
    quizzes: false,
    groups: false,
    levels: false,
    questions: false,
    mapping: false,
    mapped: false
  });
  const [allMarksValue, setAllMarksValue] = useState(1);
  const [allNegativeMarksValue, setAllNegativeMarksValue] = useState(0);
  const [quizHasNegativeMarking, setQuizHasNegativeMarking] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  const handleSetAllMarks = () => {
    const newMarks = { ...questionMarks };
    selectedQuestions.forEach(questionId => {
      newMarks[questionId] = {
        ...newMarks[questionId],
        marks: allMarksValue
      };
    });
    setQuestionMarks(newMarks);
  };

  const handleSetAllNegativeMarks = () => {
    const newMarks = { ...questionMarks };
    selectedQuestions.forEach(questionId => {
      newMarks[questionId] = {
        ...newMarks[questionId],
        negative: allNegativeMarksValue
      };
    });
    setQuestionMarks(newMarks);
  };

  const fetchQuizzes = async () => {
    setLoading(prev => ({ ...prev, quizzes: true }));
    try {
      const data = await fetchData(`dropdown/getQuizDropdown`, "GET");
      if (data.success) {
        setQuizzes(data.data.map(quiz => ({
          ...quiz,
          questionCount: quiz.QuestionCount || 0
        })).sort((a, b) => a.QuizName > b.QuizName ? 1 : -1));
      }
    } catch (error) {
      console.error("Failed to fetch quizzes", error);
    } finally {
      setLoading(prev => ({ ...prev, quizzes: false }));
    }
  };

  const fetchGroups = async () => {
    setLoading(prev => ({ ...prev, groups: true }));
    try {
      const data = await fetchData(`dropdown/getQuestionGroupDropdown`, "GET");
      if (data.success) {
        const formattedGroups = data.data.map(group => ({
          id: group.group_id,
          name: group.group_name
        }));
        setGroups(formattedGroups.sort((a, b) => a.name > b.name ? 1 : -1));
      }
    } catch (error) {
      console.error("Failed to fetch groups", error);
    } finally {
      setLoading(prev => ({ ...prev, groups: false }));
    }
  };

  const fetchLevels = async () => {
    setLoading(prev => ({ ...prev, levels: true }));
    try {
      const data = await fetchData(`dropdown/getDropdownValues?category=questionLevel`, "GET");
      if (data.success) {
        const formattedLevels = data.data.map(level => ({
          id: level.idCode,
          name: level.ddValue
        }));
        setLevels(formattedLevels);
      }
    } catch (error) {
      console.error("Failed to fetch levels", error);
    } finally {
      setLoading(prev => ({ ...prev, levels: false }));
    }
  };

  const fetchMappedQuestions = async () => {
    if (!selectedQuiz) {
      setMappedQuestions([]);
      return;
    }

    setLoading(prev => ({ ...prev, mapped: true }));
    try {
      const endpoint = `quiz/getQuizQuestions`;
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };
      const body = {
        QuizID: parseInt(selectedQuiz)
      };
      const data = await fetchData(endpoint, method, body, headers);

      if (data.success) {
        const questions = data.data?.questions || [];
        setMappedQuestions([]);

        const hasNegativeMarking = questions.some(q => q.negativeMarking);
        setQuizHasNegativeMarking(hasNegativeMarking);

        const questionMap = {};
        questions.forEach(q => {
          if (!questionMap[q.QuestionsID]) {
            questionMap[q.QuestionsID] = {
              mapping_id: q.idCode,
              question_id: q.QuestionsID,
              question_text: q.QuestionTxt,
              totalMarks: q.totalMarks,
              negativeMarks: q.negativeMarks,
              quizGroupID: q.quizGroupID,
              quizId: q.quizId,
              Ques_level: q.Ques_level,
              level_name: q.question_level || "N/A",
              group_name: groups.find(g => g.id === q.quizGroupID)?.name || "N/A",
              AuthAdd: q.AuthAdd,
              AddOnDt: q.AddOnDt,
              delStatus: q.delStatus,
              options: []
            };
          }

          if (q.options) {
            questionMap[q.QuestionsID].options = q.options;
          }
        });

        const formattedQuestions = Object.values(questionMap).map(q => {
          const correctAnswer = q.options.find(opt => opt.is_correct)?.text || "N/A";
          return {
            ...q,
            correct_answer: correctAnswer
          };
        });

        setQuizzes(prev => prev.map(quiz => {
          if (quiz.QuizID.toString() === selectedQuiz) {
            return {
              ...quiz,
              questionCount: questions.length
            };
          }
          return quiz;
        }));

        setMappedQuestions(formattedQuestions);
      } else {
        setMappedQuestions([]);
      }
    } catch (error) {
      console.error("Failed to fetch mapped questions", error);
      setMappedQuestions([]);
    } finally {
      setLoading(prev => ({ ...prev, mapped: false }));
    }
  };

  const fetchQuestions = async () => {
    if (!selectedGroup || !selectedLevel || !selectedQuiz) {
      return;
    }
    const groupId = parseInt(selectedGroup);
    const levelId = parseInt(selectedLevel);

    if (isNaN(groupId) || isNaN(levelId)) {
      return;
    }
    setLoading(prev => ({ ...prev, questions: true }));
    try {
      const data = await fetchData(`quiz/getQuestionsByGroupAndLevel`, "POST", {
        group_id: groupId,
        level_id: levelId
      }, {
        "Content-Type": "application/json",
        "auth-token": userToken,
      });

      if (data.success) {
        const questions = data.data?.questions || [];
        const questionMap = {};
        questions.forEach(q => {
          if (!questionMap[q.question_id]) {
            questionMap[q.question_id] = {
              question_id: q.question_id,
              question_text: q.question_text,
              options: []
            };
          }
          if (q.option_text) {
            questionMap[q.question_id].options.push({
              text: q.option_text,
              is_correct: q.is_correct === 1
            });
          }
        });

        const uniqueQuestions = Object.values(questionMap);
        const unmappedQuestions = uniqueQuestions.filter(q =>
          !mappedQuestions.some(mq => mq.question_id === q.question_id)
        );

        setQuestions(unmappedQuestions);
        const initialMarks = {};
        unmappedQuestions.forEach(q => {
          initialMarks[q.question_id] = {
            marks: questionMarks[q.question_id]?.marks || 1,
            negative: questionMarks[q.question_id]?.negative || 0
          };
        });
        setQuestionMarks(initialMarks);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(prev => ({ ...prev, questions: false }));
    }
  };

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleMarksChange = (questionId, field, value) => {
    if (value === '' || !isNaN(value)) {
      setQuestionMarks(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [field]: value === '' ? '' : (field === 'negative' ? parseFloat(value) : Math.max(0, parseFloat(value)))
        }
      }));
    }
  };

  const prepareMappingData = () => {
    if (!selectedQuiz || selectedQuestions.length === 0) return null;
    const currentDate = new Date();
    const sqlServerDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

    return selectedQuestions.map(questionId => ({
      quizGroupID: parseInt(selectedGroup),
      QuestionsID: questionId,
      QuestionName: questions.find(q => q.question_id === questionId)?.question_text || '',
      negativeMarks: questionMarks[questionId]?.negative || 0,
      totalMarks: questionMarks[questionId]?.marks || 1,
      AuthAdd: userToken,
      AddOnDt: "",
      delStatus: 0,
      quizId: parseInt(selectedQuiz),
      Ques_level: parseInt(selectedLevel)
    }));
  };

  const handleMapQuestions = async () => {
    const mappingData = prepareMappingData();

    if (!mappingData || mappingData.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No valid data to map',
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Confirm Mapping',
        text: `Are you sure you want to map ${mappingData.length} question(s) to this quiz?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
      });

      if (result.isConfirmed) {
        setLoading(prev => ({ ...prev, mapping: true }));

        const endpoint = `quiz/createQuizQuestionMapping`;
        const method = "POST";
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };
        const body = {
          mappings: mappingData
        };

        const response = await fetchData(endpoint, method, body, headers);

        if (response.success) {
          setQuizzes(prev => prev.map(quiz =>
            quiz.QuizID.toString() === selectedQuiz
              ? { ...quiz, questionCount: (quiz.questionCount || 0) + mappingData.length }
              : quiz
          ));
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Questions mapped successfully!',
          });
          setSelectedQuestions([]);
          await fetchMappedQuestions();
          setQuestions(prevQuestions =>
            prevQuestions.filter(q =>
              !mappingData.some(mapped => mapped.QuestionsID === q.question_id)
            ));
        } else {
          throw new Error(response.message || 'Failed to map questions');
        }
      }
    } catch (error) {
      console.error("Mapping error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to map questions',
      });
    } finally {
      setLoading(prev => ({ ...prev, mapping: false }));
    }
  };

  const handleBulkRemoveMapping = async () => {
    if (selectedMappedQuestions.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select at least one question to unmap',
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Confirm Removal',
        text: `Are you sure you want to remove ${selectedMappedQuestions.length} question(s) from this quiz?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes!'
      });

      if (result.isConfirmed) {
        setLoading(prev => ({ ...prev, mapping: true }));

        const endpoint = `quiz/unmappQuestion`;
        const method = "POST";
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };
        const body = {
          mappingIds: selectedMappedQuestions
        };

        const response = await fetchData(endpoint, method, body, headers);

        if (response.success) {
          const unmappedQuestions = mappedQuestions.filter(q =>
            selectedMappedQuestions.includes(q.mapping_id)
          );

          setQuizzes(prev => prev.map(quiz =>
            quiz.QuizID.toString() === selectedQuiz
              ? { ...quiz, questionCount: Math.max(0, (quiz.questionCount || 0) - selectedMappedQuestions.length) }
              : quiz
          ));

          setMappedQuestions(prev =>
            prev.filter(q => !selectedMappedQuestions.includes(q.mapping_id))
          );

          setQuestions(prev => {
            const newQuestions = unmappedQuestions.map(q => ({
              question_id: q.question_id,
              question_text: q.question_text,
              options: q.options || []
            }));

            return [...prev, ...newQuestions].filter((q, index, self) =>
              index === self.findIndex(t => t.question_id === q.question_id)
            );
          });

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: `${selectedMappedQuestions.length} question(s) removed successfully!`,
          });

          setSelectedMappedQuestions([]);
        } else {
          throw new Error(response.message || 'Failed to remove questions');
        }
      }
    } catch (error) {
      console.error("Bulk removal error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to remove questions',
      });
    } finally {
      setLoading(prev => ({ ...prev, mapping: false }));
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchGroups();
    fetchLevels();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      const fetchData = async () => {
        setMappedQuestions([]);
        await fetchMappedQuestions();
      };
      fetchData();
    } else {
      setMappedQuestions([]);
    }
  }, [selectedQuiz]);

  useEffect(() => {
    setSelectedLevel("");
    setQuestions([]);
    setSelectedQuestions([]);
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedLevel && selectedGroup && selectedQuiz) {
      setQuestions([]);
      setSelectedQuestions([]);
      fetchQuestions();
    }
  }, [selectedLevel, selectedGroup, selectedQuiz, mappedQuestions]);

  const handleQuizChange = (e) => {
    const quizId = e.target.value;
    setMappedQuestions([]);
    setSelectedQuestions([]);
    setSelectedMappedQuestions([]);
    setQuestions([]);
    setQuestionMarks({});
    setSelectedQuiz(quizId);
    setSelectedGroup("");
    setSelectedLevel("");
  };

  const renderMobileMappedQuestionCard = (question, index) => (
    <div key={question.mapping_id} className="p-4 mb-4 rounded-lg shadow bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">Question {index + 1}</h3>
          <p className="text-sm text-gray-600">{question.group_name} • {question.level_name}</p>
        </div>
        <input
          type="checkbox"
          checked={selectedMappedQuestions.includes(question.mapping_id)}
          onChange={(e) => {
            setSelectedMappedQuestions(prev =>
              e.target.checked
                ? [...prev, question.mapping_id]
                : prev.filter(id => id !== question.mapping_id)
            );
          }}
          className="h-5 w-5"
        />
      </div>

      <div className="mt-2">
        <p className="text-sm font-medium">Question:</p>
        <p className="text-sm">{question.question_text}</p>
      </div>

      <div className="mt-2">
        <p className="text-sm font-medium">Correct Answer:</p>
        <p className="text-sm">{question.options?.find(opt => opt.is_correct)?.option_text || "N/A"}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-gray-500">Marks</p>
          <p className="text-sm font-medium">{question.totalMarks}</p>
        </div>
        {quizHasNegativeMarking && (
          <div>
            <p className="text-xs text-gray-500">Negative Marks</p>
            <p className="text-sm font-medium">{question.negativeMarks}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMobileAvailableQuestionCard = (question, index) => {
    const currentMarks = questionMarks[question.question_id]?.marks ?? 1;
    const currentNegative = questionMarks[question.question_id]?.negative ?? 0;

    return (
      <div key={question.question_id} className="p-4 mb-4 rounded-lg shadow bg-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">Question {index + 1}</h3>
            <p className="text-sm text-gray-600">Available to Map</p>
          </div>
          <input
            type="checkbox"
            checked={selectedQuestions.includes(question.question_id)}
            onChange={() => handleQuestionSelect(question.question_id)}
            className="h-5 w-5"
          />
        </div>

        <div className="mt-2">
          <p className="text-sm font-medium">Question:</p>
          <p className="text-sm">{question.question_text}</p>
        </div>

        <div className="mt-2">
          <p className="text-sm font-medium">Correct Answer:</p>
          <p className="text-sm">{question.options?.find(opt => opt.is_correct)?.text || "N/A"}</p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Marks</p>
            <input
              type="text"
              inputMode="decimal"
              value={selectedQuestions.includes(question.question_id)
                ? (questionMarks[question.question_id]?.marks ?? '')
                : (questionMarks[question.question_id]?.marks ?? 1)}
              onChange={(e) => {
                handleMarksChange(
                  question.question_id,
                  'marks',
                  e.target.value
                );
              }}
              className="w-full p-1 border rounded"
              disabled={!selectedQuestions.includes(question.question_id)}
            />
          </div>
          {quizHasNegativeMarking && (
            <div>
              <p className="text-xs text-gray-500">Negative Marks</p>
              <input
                type="text"
                inputMode="decimal"
                value={selectedQuestions.includes(question.question_id)
                  ? (questionMarks[question.question_id]?.negative ?? '')
                  : (questionMarks[question.question_id]?.negative ?? 0)}
                onChange={(e) => {
                  handleMarksChange(
                    question.question_id,
                    'negative',
                    e.target.value
                  );
                }}
                className="w-full p-1 border rounded"
                disabled={!selectedQuestions.includes(question.question_id)}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-xl shadow-lg max-w-6xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Quiz Question Mapping</h2>

        {/* Quiz Selection */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">Select Quiz:</label>
          <div className="relative">
            <select
              className="w-full p-2 pl-3 pr-8 border rounded-md text-gray-800 bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleQuizChange}
              value={selectedQuiz}
              disabled={loading.quizzes}
            >
              <option value="">-- Select Quiz Name --</option>
              {quizzes.map(quiz => (
                <option key={quiz.QuizID} value={quiz.QuizID}>
                  {quiz.QuizName} • {quiz.questionCount} {quiz.questionCount === 1 ? 'Question' : 'Questions'}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Mapped Questions Section */}
        {selectedQuiz && (
          <div className="mb-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Currently Mapped Questions</h3>
            {loading.mapped ? (
              <div className="text-center py-4">Loading mapped questions...</div>
            ) : mappedQuestions.length > 0 ? (
              <div>
                <div className="bg-blue-50 p-3 rounded-lg mb-4 flex flex-wrap justify-between gap-2">
                  <div className="text-sm">
                    <span className="font-semibold">Total Questions: </span>
                    <span className="text-blue-700 font-bold">{mappedQuestions.length}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Total Marks: </span>
                    <span className="text-blue-700 font-bold">
                      {mappedQuestions.reduce((sum, q) => sum + (q.totalMarks || 0), 0)}
                    </span>
                  </div>
                  {quizHasNegativeMarking && (
                    <div className="text-sm">
                      <span className="font-semibold">Total Negative Marks: </span>
                      <span className="text-blue-700 font-bold">
                        {mappedQuestions.reduce((sum, q) => sum + (q.negativeMarks || 0), 0)}
                      </span>
                    </div>
                  )}
                </div>

                {isMobileView ? (
                  <div className="space-y-3">
                    {mappedQuestions.map((question, index) => 
                      renderMobileMappedQuestionCard(question, index)
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full bg-white border">
                      <thead>
                        <tr className="bg-DGXgreen text-white">
                          <th className="py-2 px-4 border w-10">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                const allIds = mappedQuestions.map(q => q.mapping_id);
                                setSelectedMappedQuestions(e.target.checked ? allIds : []);
                              }}
                              checked={selectedMappedQuestions.length === mappedQuestions.length && mappedQuestions.length > 0}
                            />
                          </th>
                          <th className="py-2 px-4 border">#</th>
                          <th className="py-2 px-4 border">Question</th>
                          <th className="py-2 px-4 border">Correct Answer</th>
                          <th className="py-2 px-4 border">Group</th>
                          <th className="py-2 px-4 border">Level</th>
                          <th className="py-2 px-4 border">Marks</th>
                          {quizHasNegativeMarking && (
                            <th className="py-2 px-4 border">Negative Marks</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {mappedQuestions.map((question, index) => (
                          <tr key={question.mapping_id} className="border-t hover:bg-gray-50">
                            <td className="py-2 px-4 border text-center">
                              <input
                                type="checkbox"
                                checked={selectedMappedQuestions.includes(question.mapping_id)}
                                onChange={(e) => {
                                  setSelectedMappedQuestions(prev =>
                                    e.target.checked
                                      ? [...prev, question.mapping_id]
                                      : prev.filter(id => id !== question.mapping_id)
                                  );
                                }}
                              />
                            </td>
                            <td className="py-2 px-4 border text-center">{index + 1}</td>
                            <td className="py-2 px-4 border">{question.question_text}</td>
                            <td className="py-2 px-4 border">
                              {question.options?.find(opt => opt.is_correct)?.option_text || "N/A"}
                            </td>
                            <td className="py-2 px-4 border">{question.group_name}</td>
                            <td className="py-2 px-4 border">{question.level_name}</td>
                            <td className="py-2 px-4 border text-center">{question.totalMarks}</td>
                            {quizHasNegativeMarking && (
                              <td className="py-2 px-4 border text-center">{question.negativeMarks}</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedMappedQuestions.length > 0 && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleBulkRemoveMapping}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      disabled={loading.mapping}
                    >
                      {loading.mapping ? 'Removing...' : `Remove Selected (${selectedMappedQuestions.length})`}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {selectedQuiz ? "No questions currently mapped to this quiz" : "Please select a quiz"}
              </div>
            )}
          </div>
        )}

        {/* Group and Level Selection */}
        {selectedQuiz && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Currently Unmapped Questions</h3>
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Question Group:</label>
              <select
                className="w-full p-2 border rounded-md"
                onChange={(e) => setSelectedGroup(e.target.value)}
                value={selectedGroup}
                disabled={loading.groups}>
                <option value="">-- Select Question Group--</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Question Level:</label>
              <select
                className="w-full p-2 border rounded-md"
                onChange={(e) => setSelectedLevel(e.target.value)}
                value={selectedLevel}
                disabled={loading.levels}
              >
                <option value="">-- Select Question Level --</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Available Questions Section */}
        {selectedGroup && selectedLevel && (
          <div className="mb-6 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Available Questions to Map</h3>
              <button
                onClick={handleMapQuestions}
                disabled={!selectedQuiz || selectedQuestions.length === 0 || loading.mapping}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading.mapping ? "Mapping..." : "Map Selected Questions"}
              </button>
            </div>

            {loading.questions ? (
              <div className="text-center py-8">Loading questions...</div>
            ) : questions.length > 0 ? (
              <div>
                {isMobileView ? (
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Set All Marks</label>
                          <div className="flex">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={allMarksValue}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || !isNaN(value)) {
                                  setAllMarksValue(value);
                                  const newMarks = { ...questionMarks };
                                  questions.forEach(question => {
                                    newMarks[question.question_id] = {
                                      ...newMarks[question.question_id],
                                      marks: value === '' ? '' : parseFloat(value) || 1
                                    };
                                  });
                                  setQuestionMarks(newMarks);
                                }
                              }}
                              className="w-full p-1 border rounded"
                            />
                          </div>
                        </div>
                        {quizHasNegativeMarking && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Set All Negative Marks</label>
                            <div className="flex">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={allNegativeMarksValue}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || !isNaN(value)) {
                                    setAllNegativeMarksValue(value);
                                    const newMarks = { ...questionMarks };
                                    questions.forEach(question => {
                                      newMarks[question.question_id] = {
                                        ...newMarks[question.question_id],
                                        negative: value === '' ? '' : parseFloat(value) || 0
                                      };
                                    });
                                    setQuestionMarks(newMarks);
                                  }
                                }}
                                className="w-full p-1 border rounded"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {questions.map((question, index) => 
                      renderMobileAvailableQuestionCard(question, index)
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                      <thead>
                        <tr className="bg-DGXgreen text-white">
                          <th className="py-2 px-4 border w-10">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                const allIds = questions.map(q => q.question_id);
                                setSelectedQuestions(e.target.checked ? allIds : []);
                              }}
                              checked={selectedQuestions.length === questions.length && questions.length > 0}
                            />
                          </th>
                          <th className="py-2 px-4 border">#</th>
                          <th className="py-2 px-4 border">Question Text</th>
                          <th className="py-2 px-4 border">Correct Answer</th>
                          <th className="py-2 px-4 border">
                            <div className="flex items-center justify-between">
                              <span>Marks</span>
                              <div className="flex items-center">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={allMarksValue}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || !isNaN(value)) {
                                      setAllMarksValue(value);
                                      const newMarks = { ...questionMarks };
                                      questions.forEach(question => {
                                        newMarks[question.question_id] = {
                                          ...newMarks[question.question_id],
                                          marks: value === '' ? '' : parseFloat(value) || 1
                                        };
                                      });
                                      setQuestionMarks(newMarks);
                                    }
                                  }}
                                  className="w-16 p-1 border rounded"
                                />
                              </div>
                            </div>
                          </th>
                          {quizHasNegativeMarking && (
                            <th className="py-2 px-4 border">
                              <div className="flex items-center justify-between">
                                <span>Negative Marks</span>
                                <div className="flex items-center">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={allNegativeMarksValue}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === '' || !isNaN(value)) {
                                        setAllNegativeMarksValue(value);
                                        const newMarks = { ...questionMarks };
                                        questions.forEach(question => {
                                          newMarks[question.question_id] = {
                                            ...newMarks[question.question_id],
                                            negative: value === '' ? '' : parseFloat(value) || 0
                                          };
                                        });
                                        setQuestionMarks(newMarks);
                                      }
                                    }}
                                    className="w-16 p-1 border rounded"
                                  />
                                </div>
                              </div>
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {questions.map((question, index) => {
                          const currentMarks = questionMarks[question.question_id]?.marks ?? 1;
                          const currentNegative = questionMarks[question.question_id]?.negative ?? 0;

                          return (
                            <tr key={question.question_id} className="border-t">
                              <td className="py-2 px-4 border text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedQuestions.includes(question.question_id)}
                                  onChange={() => handleQuestionSelect(question.question_id)}
                                  className="h-4 w-4"
                                />
                              </td>
                              <td className="py-2 px-4 border text-center">{index + 1}</td>
                              <td className="py-2 px-4 border">{question.question_text}</td>
                              <td className="py-2 px-4 border">
                                {question.options?.find(opt => opt.is_correct)?.text || "N/A"}
                              </td>
                              <td className="py-2 px-4 border">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={selectedQuestions.includes(question.question_id)
                                    ? (questionMarks[question.question_id]?.marks ?? '')
                                    : (questionMarks[question.question_id]?.marks ?? 1)}
                                  onChange={(e) => {
                                    handleMarksChange(
                                      question.question_id,
                                      'marks',
                                      e.target.value
                                    );
                                  }}
                                  className="w-20 p-1 border rounded"
                                  disabled={!selectedQuestions.includes(question.question_id)}
                                />
                              </td>
                              {quizHasNegativeMarking && (
                                <td className="py-2 px-4 border">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={selectedQuestions.includes(question.question_id)
                                      ? (questionMarks[question.question_id]?.negative ?? '')
                                      : (questionMarks[question.question_id]?.negative ?? 0)}
                                    onChange={(e) => {
                                      handleMarksChange(
                                        question.question_id,
                                        'negative',
                                        e.target.value
                                      );
                                    }}
                                    className="w-20 p-1 border rounded"
                                    disabled={!selectedQuestions.includes(question.question_id)}
                                  />
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No questions available for this group and level combination
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizMapping;
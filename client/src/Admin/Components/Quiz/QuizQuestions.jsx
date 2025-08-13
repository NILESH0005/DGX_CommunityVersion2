import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  FiUpload,
  FiTrash2,
  FiPlus,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import ApiContext from "../../../context/ApiContext";

const QuizQuestions = ({ onBackToBank, onQuestionCreated }) => {
  const { userToken, fetchData } = useContext(ApiContext);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [group, setGroup] = useState("");
  const [image, setImage] = useState(null);
  const [optionImages, setOptionImages] = useState([null, null]);
  const [categories, setCategories] = useState([]);
  const [questionLevels, setQuestionLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [questionType, setQuestionType] = useState("single");
  const [expandedSections, setExpandedSections] = useState({
    settings: true,
    question: true,
    options: true,
  });

  useEffect(() => {
    const fetchQuizCategories = async () => {
      const endpoint = `dropdown/getQuestionGroupDropdown`;
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      try {
        const data = await fetchData(endpoint, method, headers);
        if (data.success) {
          const sortedCategories = data.data.sort((a, b) =>
            a.group_name.localeCompare(b.group_name)
          );
          setCategories(sortedCategories);
          if (sortedCategories.length > 0) {
            setGroup(sortedCategories[0].group_id.toString());
          }
        } else {
          Swal.fire("Error", "Failed to fetch quiz categories.", "error");
        }
      } catch (error) {
        // console.error("Error fetching quiz categories:", error);
        Swal.fire("Error", "Error fetching quiz categories.", "error");
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
        const data = await fetchData(endpoint, method, headers);
        if (data.success) {
          setQuestionLevels(data.data);
        } else {
          Swal.fire("Error", "Failed to fetch question levels.", "error");
        }
      } catch (error) {
        // console.error("Error fetching question levels:", error);
        Swal.fire("Error", "Error fetching question levels.", "error");
      }
    };

    fetchQuizCategories();
    fetchQuestionLevels();
  }, [userToken, fetchData]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire("Error", "Image size must be less than 2 MB.", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleOptionImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire("Error", "Image size must be less than 2 MB.", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newOptionImages = [...optionImages];
        newOptionImages[index] = reader.result;
        setOptionImages(newOptionImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const removeOptionImage = (index) => {
    const newOptionImages = [...optionImages];
    newOptionImages[index] = null;
    setOptionImages(newOptionImages);
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
    setOptionImages([...optionImages, null]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);

      const newOptionImages = [...optionImages];
      newOptionImages.splice(index, 1);
      setOptionImages(newOptionImages);

      const newCorrectAnswers = correctAnswers
        .filter((answer) => answer !== index)
        .map((answer) => (answer > index ? answer - 1 : answer));
      setCorrectAnswers(newCorrectAnswers);
    } else {
      Swal.fire("Error", "You must have at least 2 options!", "error");
    }
  };

  const handleAnswerSelection = (index) => {
    if (questionType === "single") {
      setCorrectAnswers([index]);
    } else {
      const newCorrectAnswers = [...correctAnswers];
      if (newCorrectAnswers.includes(index)) {
        newCorrectAnswers.splice(newCorrectAnswers.indexOf(index), 1);
      } else {
        newCorrectAnswers.push(index);
      }
      setCorrectAnswers(newCorrectAnswers);
    }
  };

 const handleCreateQuestion = async () => {
    // Trim all inputs first
    const trimmedQuestion = questionText.trim();
    const trimmedOptions = options.map(opt => opt.trim()).filter(opt => opt !== "");

    // Validate inputs
    if (!trimmedQuestion) {
        Swal.fire("Error", "Please enter a question!", "error");
        return;
    }

    if (trimmedOptions.length < 2) {
        Swal.fire("Error", "You must have at least 2 valid answer options!", "error");
        return;
    }

    if (correctAnswers.length === 0) {
        Swal.fire("Error", "Please select at least one correct answer!", "error");
        return;
    }

    if (questionType === "multiple" && correctAnswers.length < 2) {
        Swal.fire("Error", "Multiple choice questions require at least 2 correct answers!", "error");
        return;
    }

    // Map only valid options with their correct indices
    const validOptions = options
        .map((opt, index) => ({
            option_text: opt.trim(),
            is_correct: correctAnswers.includes(index) ? 1 : 0,
            image: optionImages[index] || null
        }))
        .filter(opt => opt.option_text !== ""); // Remove empty options

    // Verify we still have enough options after filtering
    if (validOptions.length < 2) {
        Swal.fire("Error", "You must have at least 2 valid answer options after removing empty ones!", "error");
        return;
    }

    // Prepare the request
    const endpoint = "quiz/createQuestion";
    const method = "POST";
    const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
    };
    const body = {
        question_text: trimmedQuestion,
        Ques_level: selectedLevel || null,
        image: image || null,
        group_id: Number(group) || 0,
        question_type: questionType === "multiple" ? 1 : 0,
        options: validOptions
    };

    try {
        const data = await fetchData(endpoint, method, body, headers);

        if (data?.success) {
            Swal.fire("Success", "Question added successfully!", "success");
            // Reset form
            setQuestionText("");
            setOptions(["", ""]);
            setCorrectAnswers([]);
            setImage(null);
            setOptionImages([null, null]);
            setSelectedLevel("");
            // Notify parent component
            if (onQuestionCreated) {
                onQuestionCreated();
            }
        } else {
            Swal.fire("Error", data?.message || "Failed to add question", "error");
        }
    } catch (error) {
        // console.error("Question creation error:", error);
        Swal.fire("Error", "Failed to create question. Please try again.", "error");
    }
};

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-h-screen overflow-hidden flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-center bg-gray-50 p-3 rounded-lg sticky top-0 z-10">
        Create Quiz Question
      </h2>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {/* Settings Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection("settings")}
          >
            <h3 className="text-lg font-bold text-blue-700">
              Question Settings
            </h3>
            {expandedSections.settings ? <FiChevronUp /> : <FiChevronDown />}
          </div>

          {expandedSections.settings && (
            <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Group
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.group_id} value={cat.group_id}>
                      {cat.group_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Level
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <option value="">Select Question Level</option>
                  {questionLevels.map((level) => (
                    <option key={level.idCode} value={level.idCode}>
                      {level.ddValue}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      className="w-4 h-4 text-blue-600"
                      checked={questionType === "single"}
                      onChange={() => setQuestionType("single")}
                    />
                    <span className="text-sm">Single Choice</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      className="w-4 h-4 text-blue-600"
                      checked={questionType === "multiple"}
                      onChange={() => setQuestionType("multiple")}
                    />
                    <span className="text-sm">Multiple Choice</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Question Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection("question")}
          >
            <h3 className="text-lg font-bold text-blue-700">
              Question Content
            </h3>
            {expandedSections.question ? <FiChevronUp /> : <FiChevronDown />}
          </div>

          {expandedSections.question && (
            <div className="p-4 pt-0 space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm min-h-[80px]"
                  placeholder="Enter your question..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
              </div>

              {/* Question Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Image (Optional)
                </label>
                {image ? (
                  <div className="mt-2 relative flex justify-center items-center border border-gray-200 rounded overflow-hidden bg-gray-50 p-2">
                    <img
                      src={image}
                      alt="Preview"
                      className="max-w-full h-auto max-h-[200px] object-contain"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center space-x-2 cursor-pointer bg-gray-50 p-2 rounded border border-dashed border-gray-300 hover:border-blue-500 transition-colors">
                    <FiUpload className="text-blue-500" size={16} />
                    <span className="text-blue-500 font-medium text-sm">
                      Upload Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Options Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection("options")}
          >
            <h3 className="text-lg font-bold text-blue-700">Answer Options</h3>
            {expandedSections.options ? <FiChevronUp /> : <FiChevronDown />}
          </div>

          {expandedSections.options && (
            <div className="p-4 pt-0 space-y-3">
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleAddOption}
                  className="flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
                >
                  <FiPlus size={14} />
                  <span>Add Option</span>
                </button>
              </div>

              <div className="space-y-2">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-2 rounded border border-gray-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center space-x-2 min-w-[120px]">
                        <input
                          type={
                            questionType === "single" ? "radio" : "checkbox"
                          }
                          checked={correctAnswers.includes(index)}
                          onChange={() => handleAnswerSelection(index)}
                          className={`w-4 h-4 cursor-pointer ${
                            questionType === "single"
                              ? "text-blue-600"
                              : "accent-blue-500"
                          }`}
                          name={
                            questionType === "single"
                              ? "correctAnswer"
                              : undefined
                          }
                        />
                        <label className="text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </label>
                      </div>

                      <input
                        type="text"
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={`Option ${String.fromCharCode(
                          65 + index
                        )}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index] = e.target.value;
                          setOptions(newOptions);
                        }}
                      />

                      <div className="flex items-center space-x-1">
                        <label className="flex items-center space-x-1 cursor-pointer bg-gray-200 p-1 rounded hover:bg-gray-300 transition-colors">
                          <FiUpload className="text-blue-500" size={14} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleOptionImageUpload(e, index)}
                            className="hidden"
                          />
                        </label>

                        <button
                          onClick={() => handleRemoveOption(index)}
                          className="flex items-center justify-center bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                          disabled={options.length <= 2}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {optionImages[index] && (
                      <div className="mt-2 relative flex justify-center items-center bg-white p-1 rounded border border-gray-200">
                        <img
                          src={optionImages[index]}
                          alt="Option Preview"
                          className="max-w-full h-20 object-contain"
                        />
                        <button
                          onClick={() => removeOptionImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                        >
                          <FiX size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleCreateQuestion}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors text-sm font-semibold shadow"
          >
            Create Question
          </button>
          <button
            onClick={onBackToBank}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors text-sm font-semibold shadow"
          >
            Go to Question Bank
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestions;
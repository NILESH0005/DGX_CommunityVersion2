import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { FiUpload, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import ApiContext from "../../../context/ApiContext";

const EditQuestionModal = ({
  isOpen,
  onClose,
  questionData,
  onUpdateSuccess,
  categories,
  questionLevels,
}) => {
  const { fetchData, userToken, user } = useContext(ApiContext);
  const [formData, setFormData] = useState({
    id: "",
    question_text: "",
    Ques_level: "",
    group_id: "",
    image: null,
    question_type: 0, // 0 for single, 1 for multiple
    options: [],
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [optionImages, setOptionImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (questionData && isOpen) {
      // Find the category ID that matches the group_name from the API
      const matchedCategory = categories.find(
        (cat) => cat.group_name === questionData.group_name
      );
  
      // Find the question level ID that matches the question_level from the API
      const matchedLevel = questionLevels.find(
        (level) => level.ddValue === questionData.question_level
      );
  
      // Count correct answers to determine question type
      const correctAnswersCount = questionData.options
        ? questionData.options.filter((opt) => opt.is_correct).length
        : 0;
  
      // Transform the API data into our form structure
      const transformedData = {
        id: questionData.id,
        question_text: questionData.question_text || "",
        Ques_level: matchedLevel ? matchedLevel.idCode : "",
        group_id: matchedCategory ? matchedCategory.group_id : "",
        image: questionData.image || null,
        question_type: correctAnswersCount > 1 ? 1 : 0,
        options: questionData.options || [],
      };
  
      // Ensure we have at least 2 options
      if (transformedData.options.length < 2) {
        while (transformedData.options.length < 2) {
          transformedData.options.push({
            option_text: "",
            is_correct: false,
            image: null,
          });
        }
      }
  
      setFormData(transformedData);
      setImagePreview(transformedData.image || null);
      setOptionImages(transformedData.options.map((opt) => opt.image || null));
    }
  }, [questionData, isOpen, categories, questionLevels]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]:
        field === "is_correct" ? value === "true" || value === true : value,
    };

    // Count how many options are marked as correct
    const correctCount = updatedOptions.filter((opt) => opt.is_correct).length;

    // Determine the question type based on correct answers
    let newQuestionType = formData.question_type;
    if (correctCount > 1) {
      newQuestionType = 1; // Multiple
    }

    // If single correct answer type, ensure only one option is marked correct
    if (field === "is_correct" && value && newQuestionType === 0) {
      updatedOptions.forEach((opt, i) => {
        if (i !== index) opt.is_correct = false;
      });
    }

    setFormData((prev) => ({
      ...prev,
      options: updatedOptions,
      question_type: newQuestionType,
    }));
  };

  const handleQuestionTypeChange = (type) => {
    const updatedOptions = [...formData.options];

    // If switching to single choice and multiple options are correct, keep only the first correct one
    if (type === 0) {
      const firstCorrectIndex = updatedOptions.findIndex((opt) => opt.is_correct);
      updatedOptions.forEach((opt, i) => {
        opt.is_correct = i === firstCorrectIndex;
      });
    }

    setFormData((prev) => ({
      ...prev,
      question_type: type,
      options: updatedOptions,
    }));
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

        const updatedOptions = [...formData.options];
        updatedOptions[index].image = reader.result;
        setFormData((prev) => ({ ...prev, options: updatedOptions }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeOptionImage = (index) => {
    const newOptionImages = [...optionImages];
    newOptionImages[index] = null;
    setOptionImages(newOptionImages);

    const updatedOptions = [...formData.options];
    updatedOptions[index].image = null;
    setFormData((prev) => ({ ...prev, options: updatedOptions }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { option_text: "", is_correct: false, image: null },
      ],
    }));
    setOptionImages((prev) => [...prev, null]);
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      Swal.fire("Warning", "You must have at least 2 options.", "warning");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
    setOptionImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire("Error", "Image size must be less than 2 MB.", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const validateForm = () => {
    if (!formData.question_text.trim()) {
      Swal.fire("Error", "Please enter a question!", "error");
      return false;
    }

    if (!formData.group_id) {
      Swal.fire("Error", "Please select a question group!", "error");
      return false;
    }

    if (!formData.Ques_level) {
      Swal.fire("Error", "Please select a question level!", "error");
      return false;
    }

    const validOptions = formData.options.filter(
      (opt) => opt.option_text.trim() !== ""
    );
    if (validOptions.length < 2) {
      Swal.fire(
        "Error",
        "You must have at least 2 valid answer options!",
        "error"
      );
      return false;
    }

    const hasCorrectAnswer = formData.options.some((opt) => opt.is_correct);
    if (!hasCorrectAnswer) {
      Swal.fire("Error", "Please select at least one correct answer!", "error");
      return false;
    }

    if (
      formData.question_type === 1 &&
      formData.options.filter((opt) => opt.is_correct).length < 2
    ) {
      Swal.fire(
        "Error",
        "Multiple choice questions require at least 2 correct answers!",
        "error"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Prepare the payload with only valid options
      const validOptions = formData.options
        .filter((opt) => opt.option_text.trim() !== "")
        .map((opt) => ({
          option_text: opt.option_text.trim(),
          is_correct: opt.is_correct ? 1 : 0,
          image: opt.image || null,
        }));

      const payload = {
        id: formData.id,
        question_text: formData.question_text.trim(),
        Ques_level: formData.Ques_level,
        group_id: formData.group_id,
        image: formData.image || null,
        question_type: formData.question_type,
        options: validOptions,
        AuthLstEdit: user?.email || "Unknown",
      };

      const response = await fetchData("quiz/updateQuestion", "POST", payload, {
        "Content-Type": "application/json",
        "auth-token": userToken,
      });
      if (response?.success) {
        Swal.fire("Success", "Question updated successfully!", "success").then(
          () => {
            onUpdateSuccess();
            onClose();
          }
        );
      } else {
        throw new Error(response?.message || "Failed to update question");
      }
    } catch (error) {
      // console.error("Error updating question:", error);
      Swal.fire(
        "Error",
        error.message || "Failed to update question. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sticky top-0 bg-white z-10 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Edit Question</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Question Settings */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4">
              <h3 className="text-lg font-bold text-blue-700 mb-4">
                Question Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Group Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Group
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                    name="group_id"
                    value={formData.group_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Group</option>
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
                    name="Ques_level"
                    value={formData.Ques_level}
                    onChange={handleInputChange}
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
                        checked={formData.question_type === 0}
                        onChange={() => handleQuestionTypeChange(0)}
                        disabled={
                          formData.options.filter((opt) => opt.is_correct)
                            .length > 1
                        }
                      />
                      <span className="text-sm">Single Choice</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        className="w-4 h-4 text-blue-600"
                        checked={formData.question_type === 1}
                        onChange={() => handleQuestionTypeChange(1)}
                      />
                      <span className="text-sm">Multiple Choice</span>
                    </label>
                  </div>
                  {formData.options.filter((opt) => opt.is_correct).length >
                    1 && (
                    <p className="mt-1 text-sm text-blue-600">
                      Multiple correct answers detected. Question type has been
                      set to "Multiple Choice".
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4">
              <h3 className="text-lg font-bold text-blue-700 mb-4">
                Question Content
              </h3>
              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm min-h-[80px]"
                    placeholder="Enter your question..."
                    name="question_text"
                    value={formData.question_text}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Question Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Image (Optional)
                  </label>
                  {imagePreview ? (
                    <div className="mt-2 relative flex justify-center items-center border border-gray-200 rounded overflow-hidden bg-gray-50 p-2">
                      <img
                        src={imagePreview}
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
            </div>
          </div>

          {/* Answer Options */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-700">Answer Options</h3>
                <button
                  onClick={addOption}
                  className="flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
                >
                  <FiPlus size={14} />
                  <span>Add Option</span>
                </button>
              </div>

              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-2 rounded border border-gray-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center space-x-2 min-w-[120px]">
                        <input
                          type={
                            formData.question_type === 0 ? "radio" : "checkbox"
                          }
                          checked={option.is_correct}
                          onChange={(e) =>
                            handleOptionChange(
                              index,
                              "is_correct",
                              e.target.checked
                            )
                          }
                          className={`w-4 h-4 cursor-pointer ${
                            formData.question_type === 0
                              ? "text-blue-600"
                              : "accent-blue-500"
                          }`}
                          name={
                            formData.question_type === 0
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
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option.option_text}
                        onChange={(e) =>
                          handleOptionChange(index, "option_text", e.target.value)
                        }
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
                          onClick={() => removeOption(index)}
                          className="flex items-center justify-center bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                          disabled={formData.options.length <= 2}
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white pt-4 pb-4 border-t border-gray-200 px-4">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm font-semibold disabled:opacity-70"
            >
              {isLoading ? "Updating..." : "Update Question"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionModal;
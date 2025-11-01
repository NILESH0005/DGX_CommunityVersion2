import React, { useState, useEffect, useContext } from "react";
import { FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import ApiContext from "../../../context/ApiContext";
import Swal from "sweetalert2";
import { compressImage } from "../../../utils/compressImage.js";
import FileUploader from "../../../container/FileUploader.jsx";

const CreateQuiz = ({ moduleId, moduleName, navigateToQuizTable, onBack }) => {
  const { userToken, fetchData } = useContext(ApiContext);
  const [categories, setCategories] = useState([]);
  const [quizLevels, setQuizLevels] = useState([]);
  const [quizData, setQuizData] = useState({
    category: "",
    name: "",
    level: "",
    duration: 30,
    negativeMarking: false,
    passingPercentage: 50,
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    type: "",
    quizImage: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  useEffect(() => {
    const fetchQuizCategories = async () => {
      const endpoint = `dropdown/getQuizGroupDropdown`;
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
        } else {
          Swal.fire("Error", "Failed to fetch quiz categories.", "error");
        }
      } catch (error) {
        // console.error("Error fetching quiz categories:", error);
        Swal.fire("Error", "Error fetching quiz categories.", "error");
      }
    };

    const fetchQuizLevels = async () => {
      const endpoint = `dropdown/getDropdownValues?category=quizLevel`;
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      try {
        const data = await fetchData(endpoint, method, headers);
        if (data.success) {
          setQuizLevels(data.data);
        } else {
          Swal.fire("Error", "Failed to fetch quiz levels.", "error");
        }
      } catch (error) {
        // console.error("Error fetching quiz levels:", error);
        Swal.fire("Error", "Error fetching quiz levels.", "error");
      }
    };

    fetchQuizCategories();
    fetchQuizLevels();
  }, []);

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return {
      currentDate: `${year}-${month}-${day}`,
      currentTime: `${hours}:${minutes}`,
    };
  };

  const { currentDate, currentTime } = getCurrentDateTime();

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "category":
        if (!value) error = "Please select a quiz category";
        break;
      case "name":
        if (!value.trim()) error = "Quiz name is required";
        else if (value.trim().length > 100)
          error = "Quiz name must be less than 100 characters";
        break;
      case "level":
        if (!value) error = "Please select a quiz level";
        break;
      case "type":
        if (!value) error = "Please select a quiz type";
        break;
      case "duration":
        if (value < 5 || value > 180)
          error = "Duration must be between 5 and 180 minutes";
        break;
      case "startDate":
        if (!value) error = "Start date is required";
        break;
      case "passingPercentage":
        if (value < 1 || value > 100)
          error = "Passing percentage must be between 1 and 100";
        break;
      case "startTime":
        if (!value) error = "Start time is required";
        break;
      case "endDate":
        if (!value) error = "End date is required";
        break;
      case "endTime":
        if (!value) error = "End time is required";
        break;
      case "quizImage":
        if (!value) error = "Please upload a quiz banner image";
        break;
      default:
        break;
    }
    return error;
  };

  const validateDateTime = () => {
    const { startDate, startTime, endDate, endTime } = quizData;
    const newErrors = { ...errors };

    if (startDate && endDate && startTime && endTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      const currentDateTime = new Date();

      // Check if start date/time is in the past
      if (startDateTime < currentDateTime) {
        newErrors.startDate = "Start date/time cannot be in the past";
        newErrors.startTime = "Start date/time cannot be in the past";
      } else {
        if (newErrors.startDate === "Start date/time cannot be in the past") {
          delete newErrors.startDate;
        }
        if (newErrors.startTime === "Start date/time cannot be in the past") {
          delete newErrors.startTime;
        }
      }

      // Check if end date/time is after start date/time
      if (endDateTime <= startDateTime) {
        newErrors.endDate = "End date/time must be after start date/time";
        newErrors.endTime = "End date/time must be after start date/time";
      } else {
        if (
          newErrors.endDate === "End date/time must be after start date/time"
        ) {
          delete newErrors.endDate;
        }
        if (
          newErrors.endTime === "End date/time must be after start date/time"
        ) {
          delete newErrors.endTime;
        }
      }

      // Check if duration is at least 30 minutes
      const timeDifference = (endDateTime - startDateTime) / (1000 * 60);
      if (timeDifference < 30) {
        newErrors.endTime = "Quiz duration must be at least 30 minutes";
      } else if (
        newErrors.endTime === "Quiz duration must be at least 30 minutes"
      ) {
        delete newErrors.endTime;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setQuizData((prev) => ({ ...prev, [name]: fieldValue }));

    // Validate field on change if form has been submitted or if clearing an error
    if (isSubmitted || errors[name]) {
      const error = validateField(name, fieldValue);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }

    // Validate date/time fields when they change
    if (name.includes("Date") || name.includes("Time")) {
      setTimeout(validateDateTime, 100);
    }
  };

  const getMinEndTime = () => {
    if (!quizData.startDate || !quizData.startTime) return "";

    const startDateTime = new Date(
      `${quizData.startDate}T${quizData.startTime}`
    );
    const minEndDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);

    const hours = String(minEndDateTime.getHours()).padStart(2, "0");
    const minutes = String(minEndDateTime.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(quizData).forEach((field) => {
      if (field === "negativeMarking") return;

      const error = validateField(field, quizData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Validate date/time
    if (!validateDateTime()) {
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

   const handleImageUpload = (result) => {
    if (result && result.success) {
      // Assuming your API returns the file path or URL in result.data
      const imagePath = result.data || result.filePath;
      setQuizData((prev) => ({
        ...prev,
        quizImage: imagePath,
      }));
      setImageUploaded(true); // Mark image as uploaded
      setErrors((prev) => ({ ...prev, quizImage: "" })); // Clear any image errors
    } else {
      setImageUploaded(false); // Mark image as not uploaded
      setErrors((prev) => ({
        ...prev,
        quizImage: result?.message || "Failed to upload image",
      }));
    }
  };

const handlecreateQuiz = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    // Re-validate the image field based on upload status
    if (!imageUploaded && !quizData.quizImage) {
      setErrors((prev) => ({
        ...prev,
        quizImage: "Please upload a quiz banner image",
      }));
    }

    

    Swal.fire({
      title: "Confirm Quiz Creation",
      text: "Are you sure you want to create this quiz?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);

        const payload = {
          category: quizData.category,
          name: quizData.name,
          level: quizData.level,
          duration: quizData.duration,
          negativeMarking: quizData.negativeMarking,
          passingPercentage: quizData.passingPercentage,
          startDate: quizData.startDate,
          startTime: quizData.startTime,
          endDate: quizData.endDate,
          endTime: quizData.endTime,
          type: quizData.type,
          quizVisibility: quizData.type,
          quizImage: quizData.quizImage,
          refId: moduleId || 0,
          refName: moduleName || "quiz",
        };

        try {
          const endpoint = "quiz/createQuiz";
          const method = "POST";
          const headers = {
            "Content-Type": "application/json",
            "auth-token": userToken,
          };

          const data = await fetchData(endpoint, method, payload, headers);
          setLoading(false);

          if (data && data.success) {
            Swal.fire({
              title: "Success!",
              text: "Quiz has been created successfully.",
              icon: "success",
            }).then(() => {
              navigateToQuizTable();
            });
          } else {
            Swal.fire(
              "Error",
              data?.message || "Failed to create quiz",
              "error"
            );
          }
        } catch (error) {
          setLoading(false);
          Swal.fire(
            "Error",
            "An error occurred while creating the quiz",
            "error"
          );
        }
      }
    });
  };

 
  const minEndTime = getMinEndTime();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 md:p-8">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-center text-DGXblue mb-6">
          Create a New Quiz
        </h2>
        <form onSubmit={handlecreateQuiz} className="space-y-4 md:space-y-6">
          {/* Quiz Category Dropdown with Validation */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Module Category *
            </label>
            <select
              name="category"
              value={quizData.category}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Module Category</option>
              {categories.map((cat) => (
                <option key={cat.group_id} value={cat.group_id}>
                  {cat.group_name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Quiz Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Quiz Name *
            </label>
            <input
              type="text"
              name="name"
              value={quizData.name}
              onChange={handleChange}
              maxLength={100}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter quiz name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Quiz Level Dropdown with Validation */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Quiz Level *
            </label>
            <select
              name="level"
              value={quizData.level}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.level ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Quiz Level</option>
              {quizLevels.map((level) => (
                <option key={level.idCode} value={level.idCode}>
                  {level.ddValue}
                </option>
              ))}
            </select>
            {errors.level && (
              <p className="text-red-500 text-sm mt-1">{errors.level}</p>
            )}
          </div>

          {/* Quiz Duration */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Quiz Duration (minutes): {quizData.duration}
            </label>
            <input
              type="range"
              name="duration"
              min="5"
              max="180"
              value={quizData.duration}
              onChange={handleChange}
              className={`w-full ${errors.duration ? "border-red-500" : ""}`}
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
            )}
          </div>

          {/* Negative Marking */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="negativeMarking"
              checked={quizData.negativeMarking}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-gray-700 font-medium">
              Enable Negative Marking
            </label>
          </div>

          {/* Passing Percentage */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Passing Percentage (%): {quizData.passingPercentage}
            </label>
            <input
              type="range"
              name="passingPercentage"
              min="1"
              max="100"
              value={quizData.passingPercentage}
              onChange={handleChange}
              className={`w-full ${
                errors.passingPercentage ? "border-red-500" : ""
              }`}
            />
            {errors.passingPercentage && (
              <p className="text-red-500 text-sm mt-1">
                {errors.passingPercentage}
              </p>
            )}
          </div>

          {/* Start Date & Time */}
          <div>
            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
              <FaCalendarAlt /> Start Date & Time *
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <input
                  type="date"
                  name="startDate"
                  min={currentDate}
                  value={quizData.startDate}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.startDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div className="w-full md:w-1/2">
                <input
                  type="time"
                  name="startTime"
                  min={
                    quizData.startDate === currentDate ? currentTime : "00:00"
                  }
                  value={quizData.startTime}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.startTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* End Date & Time */}
          <div>
            <label className=" text-gray-700 font-medium mb-2 flex items-center gap-2">
              <FaCalendarAlt /> End Date & Time *
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <input
                  type="date"
                  name="endDate"
                  min={quizData.startDate || currentDate}
                  value={quizData.endDate}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.endDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
              <div className="w-full md:w-1/2">
                <input
                  type="time"
                  name="endTime"
                  min={
                    quizData.startDate === quizData.endDate
                      ? minEndTime
                      : "00:00"
                  }
                  value={quizData.endTime}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.endTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.endTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quiz Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Quiz Type *
            </label>
            <select
              name="type"
              value={quizData.type}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.type ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Quiz Type</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type}</p>
            )}
          </div>

          {/* Quiz Banner Image */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Upload Quiz Banner *
            </label>
            <FileUploader
              moduleName="quiz"
              folderName="quiz-banners"
              onUploadComplete={handleImageUpload}
              accept="image/*"
              maxSize={200 * 1024}
              label="Upload Quiz Banner"
              previewType="image"
            />
            {errors.quizImage && (
              <p className="text-red-500 text-sm mt-1">{errors.quizImage}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-DGXblue text-white p-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                <FaCheckCircle className="mr-2" /> Create Quiz
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;

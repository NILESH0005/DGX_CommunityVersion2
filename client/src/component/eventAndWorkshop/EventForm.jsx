import React, { useRef } from "react";
import { useState, useContext, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Swal from "sweetalert2";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ApiContext from "../../context/ApiContext";
import { compressImage } from "../../utils/compressImage.js";

const EventForm = (props) => {
  const { user, fetchData, userToken } = useContext(ApiContext);
  console.log(user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [dropdownData, setDropdownData] = useState({
    categoryOptions: [],
    companyCategoryOptions: [],
  });

  // const filteredEvents = events.filter(
  //   (event) => statusFilter === "" || event.Status === statusFilter
  // );

  useEffect(() => {
    const fetchDropdownValues = async (category) => {
      const endpoint = `dropdown/getDropdownValues?category=${category}`;
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      try {
        const data = await fetchData(endpoint, method, headers);
        console.log(`Fetched ${category} data:`, data);
        return data.success ? data.data : [];
      } catch (error) {
        console.error("Error fetching dropdown values:", error);
        return [];
      }
    };

    const fetchCategories = async () => {
      try {
        const [eventTypeOptions, eventHostOptions] = await Promise.all([
          fetchDropdownValues("eventType"),
          fetchDropdownValues("eventHost"),
        ]);

        setDropdownData({
          categoryOptions: eventTypeOptions,
          companyCategoryOptions: eventHostOptions,
        });
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };

    fetchCategories();
  }, []);

  const [errors, setErrors] = useState({});
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    categoryId: dropdownData.categoryOptions[0]?.idCode || "",
    companyCategoryId: dropdownData.companyCategoryOptions[0]?.idCode || "",
    poster: "",
    venue: "",
    description: "",
    host: "",
    registerLink: "",
  });

  const validateField = (name, value) => {
    switch (name) {
      case "title":
        return value ? "" : "Event title is required.";
      case "start":
        return value ? "" : "Start date is required.";
      case "end":
        return value ? "" : "End date is required.";
      case "categoryId":
        return value !== "Select one" ? "" : "Please select a category.";
      case "companyCategoryId":
        return value !== "Select one"
          ? ""
          : "Please select a company category.";
      case "venue":
        return value ? "" : "Venue is required.";
      case "description":
        return value ? "" : "Description is required.";
      case "host":
        return value ? "" : "Host is required.";
      case "registerLink":
        return value ? "" : "Register link is required.";
      case "poster":
        return value ? "" : "Poster is required.";
      default:
        return "";
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const fileInputRef = useRef(null);

  // Create refs for input fields
  const titleRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  const categoryRef = useRef(null);
  const companyCategoryRef = useRef(null);
  const venueRef = useRef(null);
  const hostRef = useRef(null);
  const descriptionRef = useRef(null);
  const registerLinkRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const maxLength = 800;

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const allowedFormats = [
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSize = 50 * 1024; // 50KB
      let errorMessage = "";

      if (!allowedFormats.includes(file.type)) {
        errorMessage =
          "Invalid format! Only JPEG, PNG, SVG, and Word files are allowed.";
      } else if (file.size > maxSize) {
        errorMessage = "File size exceeds 50KB! Please upload a smaller file.";
      }

      if (errorMessage) {
        setErrors((prevErrors) => ({ ...prevErrors, poster: errorMessage }));
        e.target.value = "";
        return;
      }

      setErrors((prevErrors) => ({ ...prevErrors, poster: "" }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, poster: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescriptionChange = (value) => {
    if (value.length > maxLength) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        description: `Description must be within ${maxLength} characters.`,
      }));
      return; // Stop if the length exceeds the max limit
    }

    setErrors((prevErrors) => ({ ...prevErrors, description: "" })); // Clear error if valid
    setNewEvent((prevEvent) => ({ ...prevEvent, description: value }));
  };

  const calculateFontSize = (length) => {
    if (length < 50) {
      return "16px";
    } else if (length < 200) {
      return "14px";
    } else {
      return "12px";
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const remainingChars = maxLength - newEvent.description.length;

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file) {
        const compressedFile = await compressImage(file);
        setNewEvent({ ...newEvent, [poster]: compressedFile });
      }
    }
  };

const handleSubmit = async () => {
  // Validate all fields
  const errors = {};
  if (!newEvent.title) errors.title = "Event title is required.";
  if (!newEvent.start) errors.start = "Start date is required.";
  if (!newEvent.end) errors.end = "End date is required.";
  if (!newEvent.categoryId || newEvent.categoryId === "Select one")
    errors.categoryId = "Please select a category.";
  if (!newEvent.companyCategoryId || newEvent.companyCategoryId === "Select one")
    errors.companyCategoryId = "Please select a company category.";
  if (!newEvent.venue) errors.venue = "Venue is required.";
  if (!newEvent.description) errors.description = "Description is required.";
  if (!newEvent.host) errors.host = "Host is required.";
  if (!newEvent.registerLink)
    errors.registerLink = "Register link is required.";
  if (!newEvent.poster) errors.poster = "Poster is required.";

  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    const firstErrorField = Object.keys(errors)[0];
    const refMap = {
      title: titleRef,
      start: startRef,
      end: endRef,
      categoryId: categoryRef,
      companyCategoryId: companyCategoryRef,
      venue: venueRef,
      host: hostRef,
      description: descriptionRef,
      registerLink: registerLinkRef,
    };
    const element = refMap[firstErrorField]?.current;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  const endpoint = "eventandworkshop/addEvent";
  const method = "POST";
  const headers = {
    "Content-Type": "application/json",
    "auth-token": userToken,
  };

  // Explicitly check admin status
  const isAdmin = user.isAdmin === "1";
  const eventStatus = isAdmin ? "Approved" : "Pending";

  const requestBody = {
    userID: user.UserID,
    userName: user.Name,
    title: newEvent.title,
    start: newEvent.start,
    end: newEvent.end,
    category: newEvent.categoryId,
    companyCategory: newEvent.companyCategoryId,
    venue: newEvent.venue,
    host: newEvent.host,
    registerLink: newEvent.registerLink,
    poster: newEvent.poster,
    description: newEvent.description,
    Status: eventStatus, // Make sure this matches your backend's expected field name
  };

  try {
    const response = await fetchData(endpoint, method, requestBody, headers);

    if (response.success) {
      const categoryName = dropdownData.categoryOptions.find(
        (item) => item.idCode === newEvent.categoryId
      )?.ddValue || newEvent.categoryId;

      const companyCategoryName = dropdownData.companyCategoryOptions.find(
        (item) => item.idCode === newEvent.companyCategoryId
      )?.ddValue || newEvent.companyCategoryId;

      const addedEvent = {
        EventID: response.data.eventId,
        EventTitle: newEvent.title,
        StartDate: newEvent.start,
        EndDate: newEvent.end,
        Category: categoryName,
        CategoryId: newEvent.categoryId,
        CompanyCategory: companyCategoryName,
        Venue: newEvent.venue,
        Host: newEvent.host,
        RegistrationLink: newEvent.registerLink,
        EventImage: newEvent.poster,
        EventDescription: newEvent.description,
        UserName: user.Name,
        Status: eventStatus, // Using the same status here
        start: new Date(newEvent.start),
        end: new Date(newEvent.end),
      };

      if (typeof props.setEvents === "function") {
        props.setEvents((prevEvents) => [addedEvent, ...prevEvents]);
      }

      Swal.fire({
        title: isAdmin ? "Event Approved" : "Event Submitted",
        text: isAdmin
          ? "The event has been added and approved."
          : "Your event has been submitted for admin approval.",
        icon: "success",
        confirmButtonText: "OK",
      });

      resetForm();
      setIsModalOpen(false);
    } else {
      Swal.fire({
        title: "Error!",
        text: response.message || "Failed to add event",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    console.error("Error adding event:", error);
    Swal.fire({
      title: "Error!",
      text: "An error occurred while adding the event",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

  const handleCancel = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Any unsaved changes will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
      cancelButtonText: "NO",
    }).then((result) => {
      if (result.isConfirmed) {
        resetForm(); // Reset the form
        setIsModalOpen(false); // Close the modal
      }
    });
  };

  const resetForm = () => {
    setNewEvent({
      title: "",
      start: "",
      end: "",
      category: "Select one",
      companyCategory: "Select one",
      poster: null,
      venue: "",
      description: "",
      host: "",
      registerLink: "", // Reset registerLink
    });
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  const convertToKolkataTime = (date) => {
    const offsetIST = 5.5 * 60 * 60 * 1000; // Offset in milliseconds (5.5 hours ahead)
    return new Date(date.getTime() + offsetIST);
  };
  const handleDateChange = (e, field) => {
    const selectedDate = new Date(e.target.value); // Get selected datetime
    const kolkataTime = convertToKolkataTime(selectedDate); // Convert to IST

    const formattedDate = kolkataTime
      .toISOString()
      .slice(0, 19)
      .replace("T", " "); // Convert to SQL format

    if (field === "start") {
      if (kolkataTime < new Date()) {
        setErrors((prev) => ({
          ...prev,
          start: "Start date cannot be in the past.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, start: "" }));
        handleChange({ target: { name: "start", value: formattedDate } });
      }
    }
    if (field === "end") {
      const startDate = new Date(newEvent.start);
      if (kolkataTime <= startDate) {
        setErrors((prev) => ({
          ...prev,
          end: "End date must be after the start date.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, end: "" }));
        handleChange({ target: { name: "end", value: formattedDate } });
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Event</h2>

        <div className="space-y-6">
          {/* Event Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={newEvent.title}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? "border-red-500 ring-red-500" : "border-gray-300"
              }`}
              ref={titleRef}
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                name="start"
                value={newEvent.start}
                onChange={(e) => handleDateChange(e, "start")}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.start
                    ? "border-red-500 ring-red-500"
                    : "border-gray-300"
                }`}
                min={new Date().toISOString().slice(0, 16)}
              />
              {errors.start && (
                <p className="mt-1 text-sm text-red-600">{errors.start}</p>
              )}
            </div>

            {/* End Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                name="end"
                value={newEvent.end}
                onChange={(e) => handleDateChange(e, "end")}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.end ? "border-red-500 ring-red-500" : "border-gray-300"
                }`}
                min={newEvent.start || new Date().toISOString().slice(0, 16)}
              />
              {errors.end && (
                <p className="mt-1 text-sm text-red-600">{errors.end}</p>
              )}
            </div>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Category */}
            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="categoryId"
                value={
                  newEvent.categoryId ||
                  dropdownData.categoryOptions[0]?.ddValue ||
                  ""
                }
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.categoryId
                    ? "border-red-500 ring-red-500"
                    : "border-gray-300"
                }`}
              >
                {dropdownData.categoryOptions.map((item) => (
                  <option key={item.idCode} value={item.idCode}>
                    {item.ddValue}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
              )}
            </div> */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="categoryId"
                value={newEvent.categoryId || ""}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.categoryId
                    ? "border-red-500 ring-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="" disabled>
                  Please select at least one option
                </option>
                {dropdownData.categoryOptions.map((item) => (
                  <option key={item.idCode} value={item.idCode}>
                    {item.ddValue}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
              )}
            </div>

            {/* Company Category */}
            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Category</label>
              <select
                name="companyCategoryId"
                value={newEvent.companyCategoryId || dropdownData.companyCategoryOptions[0]?.ddValue || ""}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.companyCategoryId ? "border-red-500 ring-red-500" : "border-gray-300"
                }`}
              >
                {dropdownData.companyCategoryOptions.map((item) => (
                  <option key={item.idCode} value={item.idCode}>
                    {item.ddValue}
                  </option>
                ))}
              </select>
              {errors.companyCategoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.companyCategoryId}</p>
              )}
            </div> */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Category
              </label>
              <select
                name="companyCategoryId"
                value={newEvent.companyCategoryId || ""}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.companyCategoryId
                    ? "border-red-500 ring-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="" disabled>
                  Please select at least one option
                </option>
                {dropdownData.companyCategoryOptions.map((item) => (
                  <option key={item.idCode} value={item.idCode}>
                    {item.ddValue}
                  </option>
                ))}
              </select>
              {errors.companyCategoryId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.companyCategoryId}
                </p>
              )}
            </div>
          </div>

          {/* Venue */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue
            </label>
            <input
              type="text"
              name="venue"
              value={newEvent.venue}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.venue ? "border-red-500 ring-red-500" : "border-gray-300"
              }`}
              ref={venueRef}
              placeholder="Enter venue"
            />
            {errors.venue && (
              <p className="mt-1 text-sm text-red-600">{errors.venue}</p>
            )}
          </div>

          {/* Host */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host
            </label>
            <input
              type="text"
              name="host"
              value={newEvent.host}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.host ? "border-red-500 ring-red-500" : "border-gray-300"
              }`}
              ref={hostRef}
              placeholder="Enter host name"
            />
            {errors.host && (
              <p className="mt-1 text-sm text-red-600">{errors.host}</p>
            )}
          </div>

          {/* Registration Link */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Link
            </label>
            <input
              type="text"
              name="registerLink"
              value={newEvent.registerLink}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.registerLink
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300"
              }`}
              ref={registerLinkRef}
              placeholder="Enter registration URL"
            />
            {errors.registerLink && (
              <p className="mt-1 text-sm text-red-600">{errors.registerLink}</p>
            )}
          </div>

          {/* Event Poster */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Poster
              <span className="text-xs text-gray-500 ml-2">
                (Max size: 50KB | Formats: .jpeg, .png)
              </span>
            </label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-full md:w-1/2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {errors.poster && (
                  <p className="mt-1 text-sm text-red-600">{errors.poster}</p>
                )}
              </div>
              {newEvent.poster && (
                <div className="w-full md:w-1/2">
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Preview:
                    </p>
                    <img
                      src={newEvent.poster}
                      alt="Event Poster Preview"
                      className="max-w-full h-auto max-h-40 object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Description
            </label>
            <div
              className={`border rounded-lg overflow-hidden ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            >
              <ReactQuill
                value={newEvent.description}
                onChange={handleDescriptionChange}
                className="h-48"
                style={{
                  fontSize: calculateFontSize(newEvent.description.length),
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                modules={{
                  toolbar: [
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ indent: "-1" }, { indent: "+1" }],
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    [{ color: [] }, { background: [] }],
                    [{ font: [] }],
                    [{ align: [] }],
                    ["clean"],
                  ],
                }}
                formats={[
                  "header",
                  "font",
                  "size",
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "blockquote",
                  "list",
                  "bullet",
                  "indent",
                  "link",
                  "image",
                  "color",
                  "background",
                  "align",
                ]}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              {isFocused && errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {remainingChars} characters remaining
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-DGXgreen text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm;

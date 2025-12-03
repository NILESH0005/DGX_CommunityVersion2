import React, { useState, useContext } from "react";
import moment from "moment";
import Swal from "sweetalert2";
import ApiContext from "../../context/ApiContext";

const DetailsEventModal = ({ selectedEvent, onClose, reloadEvents }) => {
  const { user, userToken, fetchData } = useContext(ApiContext);
  const [remark, setRemark] = useState("");

  const updateEventStatus = async (eventId, Status, remark = "") => {
    const endpoint = `eventandworkshop/updateEvent/${eventId}`;
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    const body = {
      Status,
      remark,
    };

    try {
      const result = await fetchData(endpoint, method, body, headers);
      console.log("Update event result:", result);

      if (result.success) {
        Swal.fire({
          title: "Success!",
          text: `Event ${Status} successfully!`,
          icon: "success",
          confirmButtonText: "OK",
        });

        return true;
      } else {
        Swal.fire({
          title: "Error!",
          text: `Failed to ${Status} event`,
          icon: "error",
          confirmButtonText: "OK",
        });
        console.log("error", result.message);

        return false;
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Error ${Status} event`,
        icon: "error",
        confirmButtonText: "OK",
      });
      console.log("error", error.message);

      return false;
    }
  };

  const handleConfirmation = (Status) => {
    if (!selectedEvent) {
      Swal.fire({
        title: "Error!",
        text: "No event selected.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    Swal.fire({
      title: "Confirmation",
      text: `Are you sure you want to ${Status} this event?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      input: Status === "reject" ? "textarea" : null,
      inputPlaceholder: "Enter remark",
      inputValue: remark,
      preConfirm: (inputValue) => {
        if (Status === "reject" && !inputValue) {
          Swal.showValidationMessage("Remark is required for rejection");
        }
        return inputValue;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (Status === "reject") {
          setRemark(result.value);
        }
        handleConfirmAction(Status, result.value);
      }
    });
  };

  const handleConfirmAction = async (Status, remark = "") => {
    if (!selectedEvent) {
      Swal.fire({
        title: "Error!",
        text: "No event selected.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const success = await updateEventStatus(
      selectedEvent.EventID,
      Status,
      remark
    );

    if (success) {
      // ✅ FIX: Use the reloadEvents function passed as prop
      if (reloadEvents) {
        reloadEvents();
      }
      onClose();
    } else {
      console.error(`Failed to ${Status} event.`);
    }
  };

  if (!selectedEvent) {
    return (
      <div
        id="event-detail"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-auto transform transition-all duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center py-4 sm:py-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Event Details
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              No record found
            </p>
          </div>
          <div className="flex justify-center mt-4 sm:mt-6">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleRegister = () => {
    if (selectedEvent?.RegistrationLink) {
      let url = selectedEvent.RegistrationLink.trim();

      // If URL does not start with http or https → add https://
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      Swal.fire({
        title: "Info",
        text: "Registration link not available",
        icon: "info",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div
      id="event-detail"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out mx-2 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 break-words">
                {selectedEvent.EventTitle}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-200">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                    {moment(selectedEvent.StartDate).format("MMM D, YYYY")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                    {moment(selectedEvent.StartDate).format("h:mm A")} -{" "}
                    {moment(selectedEvent.EndDate).format("h:mm A")}
                  </span>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    selectedEvent.Status
                  )} self-start sm:self-auto`}
                >
                  {selectedEvent.Status}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-slate-600 flex-shrink-0"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-200px)]">
          {/* Event Image */}
          {selectedEvent.EventImage && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={selectedEvent.EventImage}
                alt="Event Poster"
                className="w-full h-48 sm:h-56 lg:h-64 object-cover"
              />
            </div>
          )}

          {/* Key Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-slate-50 rounded-lg p-3 sm:p-4 border border-slate-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Category
                  </p>
                  <p
                    className="text-sm sm:text-lg font-medium text-slate-900 truncate"
                    title={selectedEvent.Category}
                  >
                    {selectedEvent.Category}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 sm:p-4 border border-slate-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Venue
                  </p>
                  <p
                    className="text-sm sm:text-lg font-medium text-slate-900 truncate"
                    title={selectedEvent.Venue}
                  >
                    {selectedEvent.Venue}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 sm:p-4 border border-slate-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Host
                  </p>
                  <p
                    className="text-sm sm:text-lg font-medium text-slate-900 truncate"
                    title={selectedEvent.Host}
                  >
                    {selectedEvent.Host}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              Event Description
            </h3>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 sm:p-6">
              <div
                className="prose prose-sm sm:prose-base max-w-none text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: selectedEvent.EventDescription,
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-200">
            {user.isAdmin == "1" && selectedEvent.Status === "Pending" && (
              <>
                <button
                  onClick={() => handleConfirmation("approve")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 text-sm sm:text-base flex-1 sm:flex-none justify-center"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Approve
                </button>
                <button
                  onClick={() => handleConfirmation("reject")}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 text-sm sm:text-base flex-1 sm:flex-none justify-center"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Reject
                </button>
              </>
            )}
            {user.isAdmin == "1" &&
              (selectedEvent.Status === "Approved" ||
                selectedEvent.Status === "Rejected") && (
                <button
                  onClick={() => handleConfirmation("delete")}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 text-sm sm:text-base flex-1 sm:flex-none justify-center"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              )}
            {selectedEvent.RegistrationLink &&
              selectedEvent.Status !== "Pending" &&
              selectedEvent.Status !== "Rejected" && (
                <button
                  onClick={handleRegister}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg 
            transition-colors duration-200 font-medium flex items-center gap-2 
            text-sm sm:text-base flex-1 sm:flex-none justify-center"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 
         5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 
         3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Register Here
                </button>
              )}
            <button
              onClick={onClose}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 text-sm sm:text-base flex-1 sm:flex-none justify-center"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsEventModal;

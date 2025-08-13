import React, { useState, useContext } from "react";
import moment from "moment";
import Swal from "sweetalert2";
import ApiContext from "../../context/ApiContext";

const DetailsEventModal = ({
  selectedEvent,
  onClose,
  handleEventStatusChange,
}) => {
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
      // This will trigger the parent to update the state
      handleEventStatusChange(selectedEvent.EventID, Status);
      onClose();
    } else {
      console.error(`Failed to ${Status} event.`);
    }
  };

  if (!selectedEvent) {
    return (
      <div
        id="event-detail"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-4xl font-bold mb-6 text-center">Event Details</h2>
          <div className="space-y-4">
            <div className="text-center text-xl">No record found</div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="event-detail"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-4xl font-bold mb-6 text-center">Event Details</h2>
        <div className="space-y-4">
          <div>
            <strong className="text-xl underline">Title:</strong>
            <div className="mt-1 text-lg">{selectedEvent.EventTitle}</div>
          </div>
          <div>
            <strong className="text-xl underline">Date & Time:</strong>
            <div className="mt-1 text-lg">
              {moment
                .utc(selectedEvent.StartDate)
                .format("MMMM D, YYYY h:mm A")}{" "}
              -{" "}
              {moment.utc(selectedEvent.EndDate).format("MMMM D, YYYY h:mm A")}
            </div>
          </div>
          <div>
            <strong className="text-xl underline">Category:</strong>
            <div className="mt-1 text-lg">{selectedEvent.Category}</div>
          </div>
          <div>
            <strong className="text-xl underline">Venue:</strong>
            <div className="mt-1 text-lg">{selectedEvent.Venue}</div>
          </div>
        </div>
        <div className="mb-2">
          <strong className="text-xl underline">Description:</strong>
          <div
            className=""
            dangerouslySetInnerHTML={{ __html: selectedEvent.EventDescription }}
          />
        </div>
        <div className="mb-4">
          <strong className="text-xl underline">Host:</strong>
          <div>
            <span>{selectedEvent.Host}</span>
          </div>
        </div>
        {selectedEvent.EventImage && (
          <img
            src={selectedEvent.EventImage}
            alt="Event Poster"
            className="mb-4 w-full max-w-3xl object-cover"
          />
        )}
        <div className="flex justify-center gap-4 mt-4">
          {user.isAdmin == "1" && selectedEvent.Status === "Pending" && (
            <>
              <button
                onClick={() => handleConfirmation("approve")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                Approve
              </button>
              <button
                onClick={() => handleConfirmation("reject")}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                Reject
              </button>
            </>
          )}
          {user.isAdmin == "1" &&
            (selectedEvent.Status === "Approved" ||
              selectedEvent.Status === "Rejected") && (
              <button
                onClick={() => handleConfirmation("delete")}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                Delete
              </button>
            )}
          {selectedEvent.RegistrationLink &&
            selectedEvent.Status !== "Pending" &&
            selectedEvent.Status !== "Rejected" && (
              <a
                href={selectedEvent.RegistrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                Register Here
              </a>
            )}
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsEventModal;

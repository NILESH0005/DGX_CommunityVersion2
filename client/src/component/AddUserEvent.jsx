import React, { useState, useEffect, useContext } from "react";
import { MdAdd } from "react-icons/md";
import { IoMdList } from "react-icons/io";
import EventForm from "../component/eventAndWorkshop/EventForm";
import LoadPage from "./LoadPage";
import ApiContext from "../context/ApiContext";
import DetailsEventModal from "./eventAndWorkshop/DetailsEventModal";
import moment from "moment";
import images from "../../public/images.js";

const AddUserEvent = (props) => {
  const [showForm, setShowForm] = useState(false);
  const { fetchData, user, userToken } = useContext(ApiContext);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const openModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const filteredEvents = props.events.filter((event) => event.UserID === user.UserID);

  if (loading) {
    return <LoadPage />;
  }

  const updateEvents = (newEvent) => {
    props.setEvents((prevEvents) => [newEvent, ...prevEvents]);
  }

  return (
    <div className="p-6 min-h-screen ">
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-3 bg-DGXblue from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg font-semibold hover:scale-105"
        >
          {showForm ? "My Events" : "Add Event"}
          {showForm ? (
            <IoMdList className="size-6" />
          ) : (
            <MdAdd className="size-6" />
          )}
        </button>
      </div>

      {showForm ? (
        <EventForm events={props.events} setEvents={props.setEvents} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event.EventID}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="w-full h-48 bg-gray-100 overflow-hidden">
                  {event.EventImage ? (
                    <img
                      src={event.EventImage}
                      alt={event.EventTitle || "Event Image"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={images.Noimage}
                      alt="No Image Available"
                      className="w-full h-full object-contain p-4 opacity-80"
                    />
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {event.EventTitle || "Untitled"}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">
                    {stripHtmlTags(event.EventDescription) || "No description available"}
                  </p>

                  {/* Venue */}
                  <div className="text-xs text-gray-500 mb-2">
                    📍 {event.Venue || "Venue not specified"}
                  </div>

                  {/* Date & Time */}
                  <div className="text-xs text-gray-500 mb-3">
                    {event.StartDate ? (
                      <>
                        {moment(event.StartDate).format("MMMM D, YYYY")}
                        {event.StartDate && (
                          <span className="ml-2">
                            ⏰ {moment(event.StartDate).format("h:mm A")}
                          </span>
                        )}
                      </>
                    ) : (
                      "Date not available"
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        user?.isAdmin === 1
                          ? "bg-green-100 text-green-800"
                          : event.Status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : event.Status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user?.isAdmin === 1 ? "Approved" : event.Status}
                    </span>
                  </div>

                  {/* Admin Remarks (if rejected) */}
                  {event.Status === "Rejected" && event.AdminRemark && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-md border border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-1">
                        Admin Remark:
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {event.AdminRemark}
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => openModal(event)}
                    className="w-full bg-DGXblue hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 mt-auto"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center py-12">
              <p className="text-gray-500 text-lg font-medium">
                {loading ? "Loading..." : "No events found."}
              </p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && selectedEvent && (
        <DetailsEventModal
          selectedEvent={selectedEvent}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default AddUserEvent;
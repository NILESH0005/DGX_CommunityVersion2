import React, { useState, useEffect, useContext } from "react";
import { MdAdd } from "react-icons/md";
import { IoMdList } from "react-icons/io";
import EventForm from "../component/eventAndWorkshop/EventForm";
import LoadPage from "./LoadPage";
import ApiContext from "../context/ApiContext";
import DetailsEventModal from "./eventAndWorkshop/DetailsEventModal";



const AddUserEvent = (props) => {
  const [showForm, setShowForm] = useState(false);
  const { fetchData, user, userToken } = useContext(ApiContext);
  // const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };


  useEffect(() => {
    const fetchEvents = async () => {
      const endpoint = "eventandworkshop/getEvent";
      const method = "GET";
      const headers = {
        'Content-Type': 'application/json',
      };

      try {
        const result = await fetchData(endpoint, method, {}, headers);
        console.log("user events", result)
        if (result.success && Array.isArray(result.data)) {
     
          props.setEvents(result.data);
          console.log(result.data)
        } else {
          console.error("Invalid data format:", result);
          props.setEvents([]);
          console.error("Failed to fetch events. Please try again later.");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        props.setEvents([]);
        console.error("An error occurred while fetching events.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // console.log(typeof props.event);

  const filteredEvents = props.events.filter((event) => event.UserID === user.UserID);

  if (loading) {
    return <LoadPage />;
  }

  const updateEvents = (newBlog) => {
    props.setEvents((prevEvents) => [newEvent, ...prevEvents]);
  }

  return (
    <div className="w-full ">

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-3 bg-DGXblue from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-lg shadow-md hover:scale-105 transition-all duration-300 text-lg font-semibold"
        >
          {showForm ? "My Event" : "Add Event"}
          {showForm ? <IoMdList className="size-6" /> : <MdAdd className="size-6" />}
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        {showForm ? (
          // <EventForm />
<EventForm events={props.events} setEvents={props.setEvents}/>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.EventID}
                  className="p-5 rounded-xl shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col gap-3"
                >
                  {/* Date Section */}
                  <div className="text-center text-gray-600">
                    <span className="block text-4xl font-bold text-gray-800">
                      {new Date(event.StartDate).getDate()}
                      <span className="text-lg font-semibold p-2 fs-6">
                        {new Date(event.StartDate).toLocaleString("default", { month: "short" })}
                      </span>
                    </span>

                  </div>

                  {/* Poster */}
                  <div className="w-full h-44 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                    {event.EventImage ? (
                      <img
                        src={event.EventImage}
                        alt={event.EventTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">No Image Available</span>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-gray-900">{event.EventTitle}</h3>
                    <p className="text-gray-600 line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      {stripHtmlTags(event.EventDescription).split(" ").slice(0, 2).join(" ")}...
                       </p>
                    <div className="flex flex-col text-gray-600 text-sm">
                      <span>📍 {event.Venue}</span>
                      <span>
                        ⏰ {new Date(event.StartDate).toUTCString().split(" ")[4]}
                      </span>
                    </div>
                  </div>
                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full self-start ${event.Status === "Approved" ? "bg-green-100 text-green-700" :
                      event.Status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}
                  >
                    {event.Status}
                  </span>

                  {/* Admin Remark (Conditional Rendering) */}
                  {event.Status === "Rejected" && event.AdminRemark && (
                    <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
                      <span className="font-semibold">Admin Remark:</span> {event.AdminRemark}
                    </div>
                  )}

                  {/* View Button */}
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="w-full bg-DGXblue text-white py-2 text-lg rounded-md hover:bg-indigo-700 transition-all"
                  >
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center w-full">No events found.</p>
            )}
          </div>
        )}
      </div>
      {selectedEvent && (
        <DetailsEventModal
          selectedEvent={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );


};

export default AddUserEvent;
import React, { useRef, useState, useContext, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ApiContext from "../../context/ApiContext.jsx";
import { compressImage } from "../../utils/compressImage.js";
import Swal from "sweetalert2";
import LoadPage from "../../component/LoadPage";

const EventTable = () => {
  const localizer = momentLocalizer(moment);
  const { fetchData, userToken, user } = useContext(ApiContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    category: "Select one",
    companyCategory: "Select one",
    poster: null,
    venue: "",
    description: "",
    host: "",
    registerLink: "",
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const titleRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  const categoryRef = useRef(null);
  const companyCategoryRef = useRef(null);
  const venueRef = useRef(null);
  const hostRef = useRef(null);
  const descriptionRef = useRef(null);
  const registerLinkRef = useRef(null);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options = {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetchData(
          "/api/getEvents",
          "GET",
          {},
          {
            "Content-Type": "application/json",
            "auth-token": userToken,
          }
        );

        if (response && response.data) {
          setEvents(response.data);
          setFilteredEvents(response.data);
        } else {
          throw new Error("Failed to fetch events");
        }
      } catch (error) {
        setError(error.message);
        Swal.fire("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [fetchData, userToken]);

  useEffect(() => {
    const results = events.filter((event) => {
      return (
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.companyCategory
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDateTime(event.start)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        formatDateTime(event.end)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });
    setFilteredEvents(results);
  }, [searchTerm, events]);

  const handleDeleteEvent = async (eventId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const endpoint = "eventandworkshop/deleteEvent";
        const method = "POST";
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };
        const body = { eventId };

        const response = await fetchData(endpoint, method, body, headers);
        console.log('hello')
        if (response.success) {
          setEvents((prev) => prev.filter((event) => event._id !== eventId));
          setFilteredEvents((prev) =>
            prev.filter((event) => event._id !== eventId)
          );
          Swal.fire("Deleted!", "The event has been deleted.", "success");
        } else {
          throw new Error(response.message || "Failed to delete event");
        }
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  if (loading) return <LoadPage />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow w-full">
      {" "}
      {/* Added w-full here */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 w-full">
        {" "}
        {/* Added w-full here */}
        <input
          type="text"
          placeholder="Search by title, category, venue, etc..."
          className="p-2 border rounded w-full sm:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-DGXblue text-white font-semibold rounded-lg w-full sm:w-auto"
        >
          Add Eventddddd
        </button>
      </div>
      {filteredEvents.length > 0 ? (
        <div className="w-full overflow-x-auto">
          {" "}
          {/* Full width with horizontal scroll */}
          <div className="min-w-full">
            {" "}
            {/* Ensure table takes full width */}
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-DGXgreen text-white">
                  <th className="p-2 border text-center hidden sm:table-cell">
                    #
                  </th>
                  <th className="p-2 border text-center">Title</th>
                  <th className="p-2 border text-center hidden md:table-cell">
                    Category
                  </th>
                  <th className="p-2 border text-center hidden lg:table-cell">
                    Company
                  </th>
                  <th className="p-2 border text-center hidden lg:table-cell">
                    Venue
                  </th>
                  <th className="p-2 border text-center hidden md:table-cell">
                    Host
                  </th>
                  <th className="p-2 border text-center hidden xl:table-cell">
                    Start
                  </th>
                  <th className="p-2 border text-center hidden xl:table-cell">
                    End
                  </th>
                  <th className="p-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event, index) => (
                  <tr key={event._id} className="hover:bg-gray-50 group">
                    <td className="p-2 border text-center hidden sm:table-cell">
                      {index + 1}
                    </td>
                    <td className="p-2 border text-center font-medium">
                      <div className="block sm:hidden font-bold">
                        {event.title}
                      </div>
                      <div className="hidden sm:block">{event.title}</div>
                      <div className="block sm:hidden text-sm text-gray-600">
                        <div>Category: {event.category}</div>
                        <div>Host: {event.host}</div>
                        <div>Start: {formatDateTime(event.start)}</div>
                        <div>End: {formatDateTime(event.end)}</div>
                      </div>
                    </td>
                    <td className="p-2 border text-center hidden md:table-cell">
                      {event.category}
                    </td>
                    <td className="p-2 border text-center hidden lg:table-cell">
                      {event.companyCategory}
                    </td>
                    <td className="p-2 border text-center hidden lg:table-cell">
                      {event.venue}
                    </td>
                    <td className="p-2 border text-center hidden md:table-cell">
                      {event.host}
                    </td>
                    <td className="p-2 border text-center hidden xl:table-cell">
                      {formatDateTime(event.start)}
                    </td>
                    <td className="p-2 border text-center hidden xl:table-cell">
                      {formatDateTime(event.end)}
                    </td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          {searchTerm ? "No events match your search" : "No events found"}
        </p>
      )}
      {/* Responsive Modal - keep your existing modal code */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-screen max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Add New Event</h3>
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    ref={titleRef}
                    value={newEvent.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md ${
                      errors.title ? "border-red-500" : ""
                    }`}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="category"
                    ref={categoryRef}
                    value={newEvent.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md ${
                      errors.category ? "border-red-500" : ""
                    }`}
                  >
                    <option value="Select one">Select one</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Event">Event</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm">{errors.category}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Category
                  </label>
                  <select
                    name="companyCategory"
                    ref={companyCategoryRef}
                    value={newEvent.companyCategory}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md ${
                      errors.companyCategory ? "border-red-500" : ""
                    }`}
                  >
                    <option value="Select one">Select one</option>
                    <option value="DGX">DGX</option>
                    <option value="Partner">Partner</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.companyCategory && (
                    <p className="text-red-500 text-sm">
                      {errors.companyCategory}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    ref={venueRef}
                    value={newEvent.venue}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md ${
                      errors.venue ? "border-red-500" : ""
                    }`}
                  />
                  {errors.venue && (
                    <p className="text-red-500 text-sm">{errors.venue}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="start"
                    ref={startRef}
                    value={newEvent.start}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md ${
                      errors.start ? "border-red-500" : ""
                    }`}
                  />
                  {errors.start && (
                    <p className="text-red-500 text-sm">{errors.start}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="end"
                    ref={endRef}
                    value={newEvent.end}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md ${
                      errors.end ? "border-red-500" : ""
                    }`}
                  />
                  {errors.end && (
                    <p className="text-red-500 text-sm">{errors.end}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Host
                  </label>
                  <input
                    type="text"
                    name="host"
                    ref={hostRef}
                    value={newEvent.host}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md ${
                      errors.host ? "border-red-500" : ""
                    }`}
                  />
                  {errors.host && (
                    <p className="text-red-500 text-sm">{errors.host}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Register Link
                  </label>
                  <input
                    type="url"
                    name="registerLink"
                    ref={registerLinkRef}
                    value={newEvent.registerLink}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md ${
                      errors.registerLink ? "border-red-500" : ""
                    }`}
                  />
                  {errors.registerLink && (
                    <p className="text-red-500 text-sm">
                      {errors.registerLink}
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <ReactQuill
                  ref={descriptionRef}
                  value={newEvent.description}
                  onChange={handleDescriptionChange}
                  className={`h-40 mb-12 ${
                    errors.description ? "border border-red-500" : ""
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Poster
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-DGXblue text-white rounded-md hover:bg-blue-600 transition"
                >
                  Add Eventdddd
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTable;

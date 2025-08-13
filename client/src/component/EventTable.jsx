import React, { useRef, useState, useContext, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ApiContext from "../context/ApiContext.jsx";
import EventForm from "./eventAndWorkshop/EventForm.jsx";
import DetailsEventModal from "./eventAndWorkshop/DetailsEventModal.jsx";
import LoadPage from "./LoadPage.jsx";
import Swal from "sweetalert2";
import { FaEye, FaSearch, FaFilter, FaPlus } from "react-icons/fa";

const EventTable = (props) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);
  const [isTokenLoading, setIsTokenLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownData, setDropdownData] = useState({
    categoryOptions: [],
    companyCategoryOptions: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => {
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const adjustedDate = new Date(
        date.getTime() - 5 * 60 * 60 * 1000 - 30 * 60 * 1000
      );
      return adjustedDate
        .toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" at ", " ");
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid Date";
    }
  };

  const fetchDropdownValues = async (category) => {
    try {
      const endpoint = `dropdown/getDropdownValues?category=${category}`;
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const response = await fetchData(endpoint, method, {}, headers);
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Error fetching dropdown values:", error);
      return [];
    }
  };

  const fetchCategories = async () => {
    try {
      const eventTypeOptions = await fetchDropdownValues("eventType");
      const eventHostOptions = await fetchDropdownValues("eventHost");

      const eventTypeDropdown = [
        { idCode: "All", ddValue: "All", ddCategory: "eventType" },
        ...eventTypeOptions,
      ];

      setDropdownData({
        categoryOptions: eventTypeOptions,
        companyCategoryOptions: eventHostOptions,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load event categories",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    if (userToken) {
      setIsTokenLoading(false);
      fetchEvents();
      fetchCategories();
    } else {
      const timeoutId = setTimeout(() => {
        setIsTokenLoading(false);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [userToken]);

  const fetchEvents = async () => {
    const endpoint = "eventandworkshop/getEvent";
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const result = await fetchData(endpoint, method, {}, headers);
      if (result.success && Array.isArray(result.data)) {
        props.setEvents(result.data);
      } else {
        console.error("Invalid data format:", result);
        props.setEvents([]);
        Swal.fire({
          title: "Error",
          text: "Failed to load events data",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      props.setEvents([]);
      Swal.fire({
        title: "Error",
        text: "Failed to connect to server",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateSearchInput = (value) => {
    const errors = {};
    if (value.length > 100) {
      errors.searchTerm = "Search term must be less than 100 characters";
    }
    return errors;
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    const errors = validateSearchInput(value);
    setValidationErrors(errors);
    if (Object.keys(errors).length === 0) {
      setSearchTerm(value);
    }
  };

  const filteredEvents = props.events.filter((event) => {
    const matchesStatus = statusFilter === "" || event.Status === statusFilter;
    const matchesCategory =
      selectedCategory === "" || event.EventType === selectedCategory;
    const matchesSearch =
      event.EventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.Venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.Status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDateTime(event.StartDate)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      formatDateTime(event.EndDate)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-200 text-green-800";
      case "Rejected":
        return "bg-red-200 text-red-800";
      case "Pending":
        return "bg-yellow-200 text-yellow-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const renderMobileEventCard = (event, index) => (
    <div
      key={event.EventID}
      className={`p-4 mb-4 rounded-lg shadow ${getStatusClass(event.Status)}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{event.EventTitle}</h3>
          <p className="text-sm text-gray-600">By: {event.UserName}</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-semibold">
          {event.Status}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-gray-500">Start</p>
          <p className="text-sm">{formatDateTime(event.StartDate)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">End</p>
          <p className="text-sm">{formatDateTime(event.EndDate)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500">Venue</p>
          <p className="text-sm">{event.Venue}</p>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => setSelectedEvent(event)}
          className="bg-DGXblue text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm flex items-center gap-1"
        >
          <FaEye size={12} />
          <span>View</span>
        </button>
      </div>
    </div>
  );

  if (isTokenLoading || loading) {
    return <LoadPage />;
  }

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      {/* Only show search and filter section when form is not visible */}
      {!showForm && (
        <div className="flex flex-col gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="pl-10 p-2 border rounded w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {validationErrors.searchTerm && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.searchTerm}
              </p>
            )}
          </div>

          {isMobileView ? (
            <>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
              >
                <FaFilter />
                <span>Filters</span>
              </button>

              {showFilters && (
                <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg">
                  <select
                    className="border px-3 py-2 rounded-lg"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <select
                    className="border px-3 py-2 rounded-lg"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {dropdownData.categoryOptions.map((option) => (
                      <option key={option.idCode} value={option.ddValue}>
                        {option.ddValue}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                className="border px-3 py-2 rounded-lg flex-grow sm:flex-grow-0"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                className="border px-3 py-2 rounded-lg flex-grow sm:flex-grow-0"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Types</option>
                {dropdownData.categoryOptions.map((option) => (
                  <option key={option.idCode} value={option.ddValue}>
                    {option.ddValue}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          className="px-6 py-3 text-lg bg-DGXblue text-white font-semibold rounded-lg"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Show Table" : "Add Event"}
        </button>
      </div>

      {showForm ? (
        <EventForm
          updateEvents={props.setEvents}
          setEvents={props.setEvents}
          categoryOptions={dropdownData.categoryOptions}
          companyCategoryOptions={dropdownData.companyCategoryOptions}
          onCancel={() => setShowForm(false)}
        />
      ) : filteredEvents.length > 0 ? (
        isMobileView ? (
          <div className="space-y-3">
            {filteredEvents.map((event, index) =>
              renderMobileEventCard(event, index)
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <div className="overflow-auto" style={{ maxHeight: "600px" }}>
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-DGXgreen text-white">
                    <th className="p-2 border text-center w-12">#</th>
                    <th className="p-2 border text-center min-w-[150px]">
                      Title
                    </th>
                    <th className="p-2 border text-center min-w-[120px]">
                      Created By
                    </th>
                    <th className="p-2 border text-center min-w-[180px]">
                      Start Date & Time
                    </th>
                    <th className="p-2 border text-center min-w-[180px]">
                      End Date & Time
                    </th>
                    <th className="p-2 border text-center min-w-[100px]">
                      Status
                    </th>
                    <th className="p-2 border text-center min-w-[120px]">
                      Venue
                    </th>
                    <th className="p-2 border text-center min-w-[100px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event, index) => (
                    <tr
                      key={event.EventID}
                      className={`hover:bg-gray-50 ${getStatusClass(
                        event.Status
                      )}`}
                    >
                      <td className="p-2 border text-center">{index + 1}</td>
                      <td className="p-2 border text-center font-medium">
                        {event.EventTitle}
                      </td>
                      <td className="p-2 border text-center">
                        {event.UserName}
                      </td>
                      <td className="p-2 border text-center">
                        {formatDateTime(event.StartDate)}
                      </td>
                      <td className="p-2 border text-center">
                        {formatDateTime(event.EndDate)}
                      </td>
                      <td className="p-2 border text-center">{event.Status}</td>
                      <td className="p-2 border text-center">{event.Venue}</td>
                      <td className="p-2 border text-center">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="bg-DGXblue text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm flex items-center justify-center gap-1 mx-auto"
                        >
                          <FaEye size={12} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            {searchTerm || statusFilter || selectedCategory
              ? "No events match your criteria"
              : "No events found. Create your first event!"}
          </p>
          {!searchTerm && !statusFilter && !selectedCategory && (
            <button
              className="mt-4 px-6 py-2 bg-DGXblue text-white rounded-lg hover:bg-blue-600 transition"
              onClick={() => setShowForm(true)}
            >
              Create Event
            </button>
          )}
        </div>
      )}

      {selectedEvent && (
        <DetailsEventModal
          selectedEvent={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          handleEventStatusChange={(eventId, action) => {
            const statusMap = {
              approve: "Approved",
              reject: "Rejected",
              delete: "Deleted" // if you need this
            };
            const newStatus = statusMap[action] || action;

            if (action === "delete") {
              props.setEvents((prev) =>
                prev.filter((event) => event.EventID !== eventId)
              );
            } else {
              props.setEvents((prev) =>
                prev.map((event) =>
                  event.EventID === eventId
                    ? { ...event, Status: newStatus }
                    : event
                )
              );
            }
          }}
        />
      )}
    </div>
  );
};

export default EventTable;
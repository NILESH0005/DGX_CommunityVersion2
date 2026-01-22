import React, { useState, useContext, useEffect } from "react";
import ApiContext from "../context/ApiContext.jsx";
import EventForm from "./eventAndWorkshop/EventForm.jsx";
import DetailsEventModal from "./eventAndWorkshop/DetailsEventModal.jsx";
import LoadPage from "./LoadPage.jsx";
import Swal from "sweetalert2";
import {
  FaEye,
  FaSearch,
  FaFilter,
  FaTimes,
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaPlus,
} from "react-icons/fa";

const EventTable = ({ events, setEvents, reloadEvents, onAddEventClick }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);
  const [isTokenLoading, setIsTokenLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
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

  // const formatDateTime = (dateString) => {
  //   if (!dateString) return "N/A";

  //   const date = new Date(dateString);
  //   const year = date.getFullYear();
  //   const month = (date.getMonth() + 1).toString().padStart(2, "0");
  //   const day = date.getDate().toString().padStart(2, "0");
  //   const hours = date.getHours().toString().padStart(2, "0");
  //   const minutes = date.getMinutes().toString().padStart(2, "0");

  //   return `${year}-${month}-${day} ${hours}:${minutes}`;
  // };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        setEvents(result.data);
      } else {
        console.error("Invalid data format:", result);
        setEvents([]);
        Swal.fire({
          title: "Error",
          text: "Failed to load events data",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
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

  const filteredEvents = events.filter((event) => {
    const matchesStatus = statusFilter === "" || event.Status === statusFilter;
    const matchesCategory =
      selectedCategory === "" || event.EventType === selectedCategory;
    const matchesSearch =
      event.EventTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.UserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.Venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.Status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const renderMobileEventCard = (event, index) => (
    <div
      key={event.EventID}
      className="p-5 mb-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            {event.EventTitle}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaUser size={12} />
            <span>{event.UserName}</span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
            event.Status
          )}`}
        >
          {event.Status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Start Time</p>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" size={12} />
              <p className="text-sm text-gray-900 font-medium">
                {formatDateTime(event.StartDate)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">End Time</p>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" size={12} />
              <p className="text-sm text-gray-900 font-medium">
                {formatDateTime(event.EndDate)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Venue</p>
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-400" size={12} />
            <p className="text-sm text-gray-900">{event.Venue}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          onClick={() => setSelectedEvent(event)}
          className="flex items-center gap-2 px-4 py-2 bg-DGXblue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
        >
          <FaEye size={14} />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );

  // Loading skeleton
  if (isTokenLoading || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg mb-6 w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Event Management
          </h2>
          <p className="text-gray-600 text-sm">
            Total Events: <span className="font-semibold">{events.length}</span>
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 bg-DGXblue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
          onClick={onAddEventClick}
        >
          <FaPlus />
          Add Event
        </button>
      </div>

      {/* Only show search and filter section when form is not visible */}
      {!showForm && (
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by title, organizer, venue, status..."
              className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent placeholder-gray-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
            {validationErrors.searchTerm && (
              <p className="text-red-600 text-xs mt-2">
                {validationErrors.searchTerm}
              </p>
            )}
          </div>

          {/* Filters */}
          {isMobileView ? (
            <>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 font-medium w-full"
              >
                <FaFilter />
                <span>Filters</span>
              </button>

              {showFilters && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Filter
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent bg-white"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent bg-white"
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
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <select
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex-1">
                <select
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent bg-white"
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
            </div>
          )}
        </div>
      )}

      {/* Events Table/Cards */}
      {showForm ? (
        <EventForm
          events={events}
          setEvents={setEvents}
          categoryOptions={dropdownData.categoryOptions}
          companyCategoryOptions={dropdownData.companyCategoryOptions}
          onCancel={() => setShowForm(false)}
          reloadEvents={reloadEvents}
        />
      ) : filteredEvents.length > 0 ? (
        isMobileView ? (
          <div className="space-y-4">
            {filteredEvents.map((event, index) =>
              renderMobileEventCard(event, index)
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <div
              className="overflow-auto"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              <div className="min-w-full">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-DGXgreen">
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 sticky left-0 z-20">
                        #
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 min-w-[200px]">
                        Title
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Organizer
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Start Date & Time
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        End Date & Time
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Status
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Venue
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEvents.map((event, index) => (
                      <tr
                        key={event.EventID}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="p-4 text-sm text-gray-600 font-medium sticky left-0 bg-white z-10">
                          {index + 1}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-bold text-gray-900">
                            {event.EventTitle}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-gray-400" size={12} />
                            <span className="text-sm text-gray-700">
                              {event.UserName}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt
                              className="text-gray-400"
                              size={12}
                            />
                            <span className="text-sm text-gray-700 font-medium">
                              {formatDateTime(event.StartDate)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt
                              className="text-gray-400"
                              size={12}
                            />
                            <span className="text-sm text-gray-700 font-medium">
                              {formatDateTime(event.EndDate)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusClass(
                              event.Status
                            )}`}
                          >
                            {event.Status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt
                              className="text-gray-400"
                              size={12}
                            />
                            <span className="text-sm text-gray-700">
                              {event.Venue}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="flex items-center gap-2 px-4 py-2 bg-DGXblue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm shadow-sm"
                          >
                            <FaEye size={14} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-3">
            <FaSearch size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            {searchTerm || statusFilter || selectedCategory
              ? "No events match your criteria"
              : "No events found"}
          </p>
          {(searchTerm || statusFilter || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setSelectedCategory("");
              }}
              className="text-DGXblue hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          )}
          {!searchTerm && !statusFilter && !selectedCategory && (
            <button
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-DGXblue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium mx-auto shadow-sm"
              onClick={onAddEventClick}
            >
              <FaPlus />
              Create First Event
            </button>
          )}
        </div>
      )}

      {/* ✅ Fixed: Use the reloadEvents prop */}
      {selectedEvent && (
        <DetailsEventModal
          selectedEvent={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          reloadEvents={reloadEvents}
        />
      )}
    </div>
  );
};

export default EventTable;

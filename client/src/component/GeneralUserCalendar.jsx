import React, { useState, useEffect, useContext } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DetailsEventModal from "./eventAndWorkshop/DetailsEventModal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ApiContext from "../context/ApiContext";
import { FaCalendarAlt } from "react-icons/fa";

const localizer = momentLocalizer(moment);

const eventColors = {
  NVIDIA: "#013D54", // DGXblue
  "Global Infoventures Event": "#76B900", // DGXgreen
  PAST_EVENT: "#DC2626", // Red for past events
  UPCOMING_EVENT: "#F59E0B", // Yellow for upcoming events
};

const GeneralUserCalendar = (props) => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userToken } = useContext(ApiContext);
  const [isMobileView, setIsMobileView] = useState(false);

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

  useEffect(() => {
    console.log("Updated events list :");
    const loadEvents = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
    };
    loadEvents();
  }, [props.events]);

  const handleSelectEvent = (event) => {
    if (!userToken) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please sign in to view event details.",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Sign In",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          setTimeout(() => {
            navigate("/SignInn");
          }, 100);
        }
      });
      return;
    }

    setSelectedEvent(event);
    const eventDetailElement = document.getElementById("event-detail");
    if (eventDetailElement) {
      eventDetailElement.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn("Element with ID 'event-detail' not found");
    }
  };

  // Function to check if event is past, upcoming, or current
  const getEventStatus = (event) => {
    const now = moment();
    const start = moment(event.StartDate);
    const end = moment(event.EndDate);

    if (end.isBefore(now)) {
      return "PAST_EVENT";
    } else if (start.isAfter(now)) {
      return "UPCOMING_EVENT";
    } else {
      return "CURRENT_EVENT"; // Event is currently happening
    }
  };

  const eventStyleGetter = (event) => {
    // Determine event status (past or upcoming)
    const eventStatus = getEventStatus(event);

    // Get color based on category or status
    let backgroundColor;
    if (eventStatus === "PAST_EVENT") {
      backgroundColor = eventColors.PAST_EVENT; // Red for past events
    } else if (eventStatus === "UPCOMING_EVENT") {
      backgroundColor = eventColors.UPCOMING_EVENT; // Yellow for upcoming events
    } else {
      // For current events or if no status determined, use category colors
      backgroundColor = eventColors[event.Category] || "#C0C0C0";
    }

    // Add strikethrough for past events
    const textDecoration =
      eventStatus === "PAST_EVENT" ? "line-through" : "none";
    const opacity = eventStatus === "PAST_EVENT" ? 0.8 : 1;

    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        fontSize: "0.75rem",
        padding: "0.2rem",
        textDecoration: textDecoration,
        opacity: opacity,
        border: eventStatus === "UPCOMING_EVENT" ? "1px solid #D97706" : "none", // Darker yellow border for upcoming
      },
    };
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date
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

  const sortedEvents = props.events
    ?.filter((event) => event.Status === "Approved")
    .sort((a, b) => {
      const aStart = moment(a.StartDate);
      const bStart = moment(b.StartDate);
      const now = moment();

      // Both events are upcoming - sort by date ascending
      if (aStart.isAfter(now) && bStart.isAfter(now)) {
        return aStart.diff(bStart);
      }
      // Both events are past - sort by date descending (most recent first)
      if (aStart.isBefore(now) && bStart.isBefore(now)) {
        return bStart.diff(aStart);
      }
      // One upcoming, one past - upcoming comes first
      return aStart.isAfter(now) ? -1 : 1;
    })
    .map((event) => {
      const status = getEventStatus(event);
      return {
        ...event,
        start: moment.utc(event.StartDate).local().toDate(),
        end: moment.utc(event.EndDate).local().toDate(),
        title: event.EventTitle,
        status,
      };
    });

  const formats = {
    timeGutterFormat: (date, culture, localizer) =>
      localizer.format(date, "h:mm A", culture),

    eventTimeRangeFormat: ({ start, end }) =>
      `${moment(start).format("h:mm A")} - ${moment(end).format("h:mm A")}`,
  };

  const renderMobileEventCard = (event, index) => {
    const eventStatus = getEventStatus(event);
    const statusColor =
      eventStatus === "PAST_EVENT"
        ? eventColors.PAST_EVENT
        : eventStatus === "UPCOMING_EVENT"
        ? eventColors.UPCOMING_EVENT
        : eventColors[event.Category] || "#C0C0C0";

    const isPastEvent = eventStatus === "PAST_EVENT";

    return (
      <div
        key={event.EventID}
        className={`p-4 mb-4 rounded-lg shadow ${
          statusColor ? "border-t-4" : ""
        } ${isPastEvent ? "opacity-80" : ""}`}
        style={{
          borderTopColor: statusColor,
          borderTopWidth: "4px",
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3
              className={`font-bold text-lg ${
                isPastEvent ? "line-through" : ""
              }`}
              style={{ color: isPastEvent ? "#6B7280" : "inherit" }}
            >
              {event.EventTitle}
            </h3>
            <p className="text-sm text-gray-600">{event.Venue}</p>
            <div className="mt-1">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isPastEvent
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {eventStatus === "PAST_EVENT"
                  ? "Past Event"
                  : eventStatus === "UPCOMING_EVENT"
                  ? "Upcoming Event"
                  : "Current Event"}
              </span>
              {event.Category && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 ml-2">
                  {event.Category}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <FaCalendarAlt size={12} />
            <span>{moment(event.start).format("MMM D")}</span>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Start</p>
            <p className={`text-sm ${isPastEvent ? "text-gray-500" : ""}`}>
              {formatDateTime(event.StartDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">End</p>
            <p className={`text-sm ${isPastEvent ? "text-gray-500" : ""}`}>
              {formatDateTime(event.EndDate)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={() => handleSelectEvent(event)}
            className="bg-DGXblue text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  // Legend component for color coding
  const ColorLegend = () => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold mb-2 text-gray-700">
        Event Color Legend:
      </h3>
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded mr-2"
            style={{ backgroundColor: eventColors.UPCOMING_EVENT }}
          ></div>
          <span className="text-sm">Upcoming Events</span>
        </div>
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded mr-2"
            style={{ backgroundColor: eventColors.PAST_EVENT }}
          ></div>
          <span className="text-sm">Past Events</span>
        </div>
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded mr-2"
            style={{ backgroundColor: eventColors.NVIDIA }}
          ></div>
          <span className="text-sm">NVIDIA Events</span>
        </div>
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded mr-2"
            style={{
              backgroundColor: eventColors["Global Infoventures Event"],
            }}
          ></div>
          <span className="text-sm">Global Infoventures Events</span>
        </div>
        {/* <div className="flex items-center">
          <div className="w-4 h-4 rounded mr-2 bg-gray-400"></div>
          <span className="text-sm">Other Events</span>
        </div> */}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="mb-5">
        <h1 className="flex items-center justify-center text-2xl font-bold mb-4">
          Our Event and Workshop Calendar
        </h1>
      </div>

      {/* Color Legend */}
      <ColorLegend />

      {isLoading ? (
        <Skeleton height={600} className="bg-gray-200 rounded-lg mb-10" />
      ) : isMobileView ? (
        <div className="bg-white rounded-lg border-2 border-DGXgreen shadow-lg p-4 mb-10">
          {sortedEvents && sortedEvents.length > 0 ? (
            <div className="space-y-3">
              {sortedEvents.map((event, index) =>
                renderMobileEventCard(event, index)
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No upcoming events found
            </div>
          )}
        </div>
      ) : (
        <BigCalendar
          localizer={localizer}
          events={sortedEvents}
          formats={formats}
          eventPropGetter={eventStyleGetter}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="EventTitle"
          style={{ height: 600 }}
          className="bg-white rounded-lg border-2 border-DGXgreen shadow-lg p-5 mb-10"
          onSelectEvent={handleSelectEvent}
          timeslots={2}
          step={30}
          now={new Date()}
          showMultiDayTimes
          views={["month", "week"]} // Only show Month and Week views
         components={{
  event: ({ event }) => {
    const isPast = event.status === "PAST_EVENT";

    return (
      <div
        style={{
          fontSize: "0.85rem",
          fontWeight: 600,
          lineHeight: "1.3",
          padding: "4px 6px",
          borderRadius: "4px",
          opacity: isPast ? 0.7 : 1,
          whiteSpace: "normal",
        }}
      >
        <div>{event.title}</div>
        <div style={{ fontSize: "0.7rem", opacity: 0.9 }}>
          {moment(event.start).format("h:mm A")} –{" "}
          {moment(event.end).format("h:mm A")}
        </div>
      </div>
    );
  },
}}

        />
      )}

      {selectedEvent && (
        <DetailsEventModal
          selectedEvent={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          reloadEvents={props.reloadEvents} // ✔ This is the function
        />
      )}
    </div>
  );
};

export default GeneralUserCalendar;

import React, { useState, useEffect, useContext } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import DetailsEventModal from './eventAndWorkshop/DetailsEventModal';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import ApiContext from '../context/ApiContext';
import { FaCalendarAlt } from 'react-icons/fa';

const localizer = momentLocalizer(moment);

const eventColors = {
  "NVIDIA": '#013D54', // DGXblue
  "Global Infoventures Event": '#76B900', // DGXgreen
};

const GeneralUserCalendar = (props) => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const {userToken} = useContext(ApiContext);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  useEffect(() => {
    console.log("Updated events list :",);
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
        icon: 'warning',
        title: 'Login Required',
        text: 'Please sign in to view event details.',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Sign In',
        cancelButtonText: 'Cancel',
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
    const eventDetailElement = document.getElementById('event-detail');
    if (eventDetailElement) {
      eventDetailElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn("Element with ID 'event-detail' not found");
    }
  };

  const eventStyleGetter = (event) => {
    const backgroundColor = eventColors[event.Category] || '#C0C0C0';
    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontSize: '0.75rem',
        padding: '0.2rem',
      },
    };
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).replace(" at ", " ");
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid Date";
    }
  };

  const formattedEvents = props.events?.map(event => ({
    ...event,
    start: moment.utc(event.StartDate).local().toDate(),
    end: moment.utc(event.EndDate).local().toDate(),
    title: event.EventTitle,
  }));

  const formats = {
    timeGutterFormat: (date, culture, localizer) =>
      localizer.format(date, 'HH:mm', culture),
    eventTimeRangeFormat: ({ start, end }) =>
      `${moment(start).format("MMMM D, YYYY h:mm A")} - ${moment(end).format("MMMM D, YYYY h:mm A")}`,
  };

  const renderMobileEventCard = (event, index) => (
    <div
      key={event.EventID}
      className={`p-4 mb-4 rounded-lg shadow ${eventColors[event.Category] ? 'border-t-4' : ''}`}
      style={{ 
        borderTopColor: eventColors[event.Category] || 'transparent',
        borderTopWidth: '4px'
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{event.EventTitle}</h3>
          <p className="text-sm text-gray-600">{event.Venue}</p>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <FaCalendarAlt size={12} />
          <span>{moment(event.start).format('MMM D')}</span>
        </div>
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

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="mb-5">
        <h1 className="flex items-center justify-center text-2xl font-bold mb-4">
          Our Event and Workshop Calendar
        </h1>
      </div>

      {isLoading ? (
        <Skeleton height={600} className="bg-gray-200 rounded-lg mb-10" />
      ) : isMobileView ? (
        <div className="bg-white rounded-lg border-2 border-DGXgreen shadow-lg p-4 mb-10">
          {formattedEvents && formattedEvents.length > 0 ? (
            <div className="space-y-3">
              {formattedEvents.map((event, index) => renderMobileEventCard(event, index))}
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
          events={formattedEvents}
          formats={formats}
          eventPropGetter={eventStyleGetter}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="EventTitle"
          style={{ height: 600 }}
          className="bg-white rounded-lg border-2 border-DGXgreen shadow-lg p-5 mb-10"
          onSelectEvent={handleSelectEvent}
        />
      )}

      {selectedEvent && (
        <DetailsEventModal
          selectedEvent={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default GeneralUserCalendar;
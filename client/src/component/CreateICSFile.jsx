import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
// import { createEvent } from 'ics';

const localizer = momentLocalizer(moment);

const eventColors = {
  giEvent: '#013D54', // DGXblue
  nvidiaEvent: '#76B900', // DGXgreen
};

const GeneralUserCalendar = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
    };
    loadEvents();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    document.getElementById('event-detail').scrollIntoView({ behavior: 'smooth' });
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

  return (
    <div className="container mx-auto mt-10">
      <div className="mb-5">
        <h1 className="flex items-center justify-center text-2xl font-bold mb-4">
          Our Event and Workshop Calendar
        </h1>
      </div>

      {isLoading ? (
        <Skeleton height={600} className="bg-gray-200 rounded-lg mb-10" />
      ) : (
        <BigCalendar
          localizer={localizer}
          events={events}
          titleAccessor="EventTitle"
          startAccessor="StartDate"
          endAccessor="EndDate"
          style={{ height: 600 }}
          className="bg-white rounded-lg border-2 border-DGXgreen shadow-lg p-5 mb-10"
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
        />
      )}

      {selectedEvent && (
        <div id="event-detail" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-5 max-w-3xl w-full max-h-[90vh] overflow-y-auto z-50">
            <h2 className="text-4xl font-bold mb-10 flex justify-center">Event Details</h2>
            <div className="mb-4">
              <strong className="text-xl underline">Title:</strong> <span>{selectedEvent.EventTitle}</span>
            </div>
            <div className="mb-4">
              <strong className="text-xl underline">Date & Time:</strong>{' '}
              <span>
                {moment(selectedEvent.StartDate).format('MMMM D, YYYY h:mm A')} -{' '}
                {moment(selectedEvent.EndDate).format('MMMM D, YYYY h:mm A')}
              </span>
            </div>
            <div className="mb-4">
              <strong className="text-xl underline">Category:</strong> <span>{selectedEvent.Category}</span>
            </div>
            <div className="mb-4">
              <strong className="text-xl underline">Venue:</strong> <span>{selectedEvent.Venue}</span>
            </div>
            <div className="mb-4">
              <strong className="text-xl underline">Description:</strong>{' '}
              <div className="mt-4" dangerouslySetInnerHTML={{ __html: selectedEvent.EventDescription }} />
            </div>
            <div className="mb-4">
              <strong className="text-xl underline">Host:</strong> <span>{selectedEvent.host}</span>
            </div>
            {selectedEvent.EventImage && (
              <img src={selectedEvent.EventImage} alt="Event Poster" className="mb-4 w-full max-w-3xl object-cover" />
            )}
            <div className="flex justify-center gap-4 mt-4">
              {selectedEvent.RegistrationLink && (
                <a
                  href={selectedEvent.RegistrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-DGXblue text-white p-2 rounded"
                >
                  Register Here
                </a>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-DGXblue text-white p-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralUserCalendar;

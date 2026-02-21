import React, { useContext, useEffect, useState } from "react";
import GeneralUserCalendar from "../../component/GeneralUserCalendar";
import ApiContext from "../../context/ApiContext";
import EventTable from "../../component/EventTable";
import { MdTableChart } from "react-icons/md";
import { FaCalendarAlt, FaPlus } from "react-icons/fa";
import EventForm from "../../component/eventAndWorkshop/EventForm";

const Events = ({ events, setEvents }) => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [reloadEvents, setReloadEvents] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  const [showTable, setShowTable] = useState(() => {
    const storedValue = sessionStorage.getItem("showTable");
    return storedValue !== null ? storedValue === "true" : true;
  });

  const fetchEventData = async () => {
    try {
      if (!userToken) {
        console.log("No user token, skipping events fetch");
        return;
      }
      const endpoint = "eventandworkshop/getEvent";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };
      console.log("Fetching events...");
      const eventData = await fetchData(endpoint, "GET", null, headers);

      if (eventData?.success) {
        console.log("Events fetched successfully:", eventData.data?.length);
        setEvents(eventData.data || []);
      } else {
        console.error("Failed to fetch events:", eventData);
        setEvents([]);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [userToken, reloadEvents]);

  const toggleView = () => {
    const newView = !showTable;
    sessionStorage.setItem("showTable", newView);
    setShowTable(newView);
  };

  const handleReloadEvents = () => {
    console.log("Triggering events reload...");
    setReloadEvents((prev) => !prev);
  };

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={toggleView}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md"
        >
          {showTable ? "Show Calendar" : "Show Table"}
          {showTable ? <FaCalendarAlt /> : <MdTableChart />}
        </button>

        <button
          onClick={() => setShowEventForm(!showEventForm)}
          className="flex items-center gap-2 bg-DGXblue text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          {showEventForm ? "Cancel" : "Add New Event"}
          <FaPlus />
        </button>
      </div>

      {showEventForm ? (
        <EventForm
          events={events}
          setEvents={setEvents}
          reloadEvents={handleReloadEvents}
          onSuccess={() => {
            setShowEventForm(false);
            handleReloadEvents(); 
          }}
          onCancel={() => setShowEventForm(false)}
        />
      ) : showTable ? (
        <EventTable
          events={events}
          setEvents={setEvents}
          reloadEvents={handleReloadEvents}
          onAddEventClick={() => setShowEventForm(true)}
        />
      ) : (
        <GeneralUserCalendar
          events={events}
          setEvents={setEvents}
          reloadEvents={handleReloadEvents}
          onAddEventClick={() => setShowEventForm(true)}
        />
      )}
    </div>
  );
};

export default Events;

import React, { useContext, useEffect, useState } from "react";
import GeneralUserCalendar from "../../component/GeneralUserCalendar";
import ApiContext from "../../context/ApiContext";
import EventTable from "../../component/EventTable";
import { MdTableChart } from "react-icons/md";
import { FaCalendarAlt } from "react-icons/fa";

const Events = (props) => {
  const { fetchData } = useContext(ApiContext);
  const [showTable, setShowTable] = useState(() => {
    return sessionStorage.getItem("showTable") === "true";
  });

  const fetchEventData = async () => {
    const endpoint = "eventandworkshop/getEvent";
    const eventData = await fetchData(endpoint);
    props.setEvents(eventData.data || []);
  };

  useEffect(() => {
    fetchEventData();
  }, [showTable]);

  useEffect(() => {
    const scrollPosition = sessionStorage.getItem("scrollPosition");
    if (scrollPosition) {
      window.scrollTo(0, parseInt(scrollPosition, 10));
    }

    return () => {
      sessionStorage.setItem("scrollPosition", window.scrollY);
    };
  }, []);

  const handleToggleView = () => {
    const newShowTable = !showTable;
    sessionStorage.setItem("showTable", newShowTable);
    setShowTable(newShowTable);
  };

  return (
    <div className="p-4 w-full"> 
      {/* Toggle Button */}
      <button
        onClick={handleToggleView}
        className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition mb-4"
      >
        {showTable ? "Show Calendar" : "Show Table"}
        {showTable ? (
          <FaCalendarAlt className="size-5" />
        ) : (
          <MdTableChart className="size-5" />
        )}
      </button>

      {/* Display Event Table or Calendar */}
      <div className="w-full"> 
        {showTable ? (
          <div className="w-full bg-white rounded-lg shadow"> 
            <EventTable events={props.events} setEvents={props.setEvents} />
          </div>
        ) : (
          <GeneralUserCalendar
            events={props.events}
            setEvents={props.setEvents}
          />
        )}
      </div>
    </div>
  );
};

export default Events;
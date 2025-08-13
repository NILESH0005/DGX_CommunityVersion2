import { useState } from "react";
import Swal from "sweetalert2";
import { FaCalendarCheck, FaClock } from "react-icons/fa";

const UpcomingQuiz = () => {
  const [events, setEvents] = useState([
    { title: "Tech Conference 2025", date: "2025-03-10", time: "10:00 AM", image: "/public/AnimatedDGX.png" },
    { title: "AI Workshop", date: "2025-04-05", time: "2:00 PM", image: "/public/us4.jpeg" },
  ]);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", image: null });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewEvent((prev) => ({ ...prev, image: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateDateTime = () => {
    const selectedDate = new Date(`${newEvent.date}T${newEvent.time}`);
    const now = new Date();
    return selectedDate > now;
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      Swal.fire("Error", "Please fill in all fields for the event.", "error");
      return;
    }
    if (!validateDateTime()) {
      Swal.fire("Invalid Date", "You cannot select a past date or time.", "warning");
      return;
    }
    setEvents([...events, newEvent]);
    setNewEvent({ title: "", date: "", time: "", image: null });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Manage Upcoming Quizzes</h1>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={newEvent.title}
          onChange={handleInputChange}
          className="p-2 border rounded w-1/3"
        />
        <input
          type="date"
          name="date"
          min={new Date().toISOString().split("T")[0]}
          value={newEvent.date}
          onChange={handleInputChange}
          className="p-2 border rounded w-1/4"
        />
        <input
          type="time"
          name="time"
          value={newEvent.time}
          onChange={handleInputChange}
          className="p-2 border rounded w-1/4"
        />
        <input type="file" onChange={handleImageUpload} className="w-1/6" />
        <button onClick={addEvent} className="bg-blue-500 text-white p-2 rounded w-1/6">
          Add Event
        </button>
      </div>
      {newEvent.image && (
        <div className="mb-4">
          <img src={newEvent.image} alt="Preview" className="w-32 h-32 object-cover rounded" />
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden p-4">
            {event.image && <img src={event.image} alt="Event" className="w-full h-40 object-cover rounded mb-2" />}
            <div className="flex items-center gap-4">
              <FaCalendarCheck className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{event.title}</p>
                <div className="text-gray-600 text-sm flex items-center gap-2">
                  <FaClock className="h-5 w-5 text-gray-500" />
                  <span>{event.date}</span>
                  <span>{event.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingQuiz;

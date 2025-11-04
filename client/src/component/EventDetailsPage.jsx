// src/container/EventDetailsPage.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faMapMarkerAlt,
  faUserTie,
  faClock,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import ApiContext from "../context/ApiContext.jsx";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { fetchData, userToken } = useContext(ApiContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch event details
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchData(
        `eventandworkshop/getEventById/${eventId}`,
        "GET",
        {},
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        setEvent(response.data);
        // Record view if user is logged in
        if (userToken) {
          await recordEventView(eventId);
        }
      } else {
        setError("Event not found");
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const recordEventView = async (eventId) => {
    try {
      const viewData = {
        ProcessName: "Event",
        reference: eventId,
      };

      const response = await fetchData(
        "progressTrack/recordView",
        "POST",
        viewData,
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success && !response.data.alreadyViewed) {
        console.log("Event view recorded successfully");
      }
    } catch (error) {
      console.error("Error recording event view:", error);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const downloadICS = () => {
    // Implement ICS download functionality
    toast.info("ICS download functionality coming soon!");
  };

  const handleRegister = () => {
    if (event?.RegistrationLink) {
      window.open(event.RegistrationLink, "_blank", "noopener,noreferrer");
    } else {
      toast.info("Registration link not available");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-DGXgreen mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <motion.div
          className="text-center bg-white p-8 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-red-600 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The event you're looking for doesn't exist."}</p>
          <button
            onClick={handleBack}
            className="bg-DGXblue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Events
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <ToastContainer position="top-center" />
      
      {/* Header Section */}
      <section className="relative bg-gradient-to-r from-DGXblue to-DGXgreen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.button
            onClick={handleBack}
            className="flex items-center text-white hover:text-gray-200 mb-6 transition"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Events
          </motion.button>

          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {event.EventTitle}
            </h1>
            <p className="text-xl text-gray-200 italic">{event.Category}</p>
          </motion.div>
        </div>
      </section>

      {/* Event Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Event Image */}
            {event.EventImage && (
              <motion.img
                src={event.EventImage}
                alt={event.EventTitle}
                className="w-full h-64 md:h-80 object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              />
            )}

            <div className="p-6 md:p-8">
              {/* Event Details Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, staggerChildren: 0.1 }}
              >
                <motion.div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="text-DGXgreen mt-1 mr-3 text-lg"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Date & Time</p>
                    <p className="text-gray-700">
                      {moment.utc(event.StartDate).format("dddd, MMMM D, YYYY")}
                    </p>
                    <p className="text-gray-600">
                      {moment.utc(event.StartDate).format("h:mm A")} -{" "}
                      {moment.utc(event.EndDate).format("h:mm A")}
                    </p>
                  </div>
                </motion.div>

                <motion.div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-DGXgreen mt-1 mr-3 text-lg"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Venue</p>
                    <p className="text-gray-700">{event.Venue}</p>
                  </div>
                </motion.div>

                <motion.div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faUserTie}
                    className="text-DGXgreen mt-1 mr-3 text-lg"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Host</p>
                    <p className="text-gray-700">{event.Host}</p>
                  </div>
                </motion.div>

                {event.RegistrationLink && (
                  <motion.div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-DGXgreen mt-1 mr-3 text-lg"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Registration</p>
                      <button
                        onClick={handleRegister}
                        className="text-DGXblue hover:text-DGXgreen underline transition"
                      >
                        Register Here
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Event Description */}
              <motion.div
                className="border-t pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  About This Event
                </h3>
                <div
                  className="prose max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: event.EventDescription }}
                />
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="flex flex-wrap gap-4 mt-8 pt-6 border-t"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <button
                  onClick={downloadICS}
                  className="bg-DGXgreen text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium"
                >
                  Add to Calendar
                </button>
                
                <button
                  onClick={() => {
                    navigator.share?.({
                      title: event.EventTitle,
                      text: event.EventDescription.replace(/<[^>]+>/g, "").substring(0, 100),
                      url: window.location.href,
                    }).catch(console.error);
                  }}
                  className="border border-DGXblue text-DGXblue px-6 py-3 rounded-lg hover:bg-DGXblue hover:text-white transition font-medium"
                >
                  Share Event
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default EventDetailsPage;
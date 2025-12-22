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

const EventDetailsPage = ({ events = [events] }) => {
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
      setError(null);

      console.log("Fetching details for event ID:", eventId);

      if (events && events.length > 0) {
        const foundEvent = events.find((e) => e.EventID == eventId);
        if (foundEvent) {
          console.log("Event found in props:", foundEvent);
          setEvent(foundEvent);
          setLoading(false);

          // Record view if user is logged in
          if (userToken) {
            await recordEventView(eventId);
          }
          return;
        }
      }

      console.log("Event not found in props, fetching from API...");

      const endpoints = [`eventandworkshop/getEventById/${eventId}`];

      let response = null;

      for (const endpoint of endpoints) {
        try {
          response = await fetchData(
            endpoint,
            "GET",
            {},
            {
              "Content-Type": "application/json",
              "auth-token": userToken,
            }
          );

          if (response?.success) {
            console.log("Event data found using endpoint:", endpoint);
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed, trying next...`);
          continue;
        }
      }

      if (response?.success) {
        const eventData = response.data || response.event || response.result;

        if (eventData) {
          setEvent(eventData);
          if (userToken) {
            await recordEventView(eventId);
          }
        } else {
          setError("Event data not found in response");
        }
      } else {
        setError(response?.message || "Event not found");
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to load event details. Please try again.");
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

  const getBaseUrl = () => {
    return import.meta.env.VITE_CLIENT_BASE_URL || window.location.origin;
  };

  // Generate proper event URL
  const getEventUrl = () => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/event/${eventId}`;
  };

  // Safe clipboard function
  const safeCopyToClipboard = async (
    text,
    successMessage = "Event link copied to clipboard!"
  ) => {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(successMessage);
        return true;
      } catch (error) {
        console.error("Clipboard API failed:", error);
      }
    }

    // Fallback method
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        toast.success(successMessage);
        return true;
      }

      // Show manual copy prompt
      Swal.fire({
        title: "Copy Manually",
        html: `Please copy this URL:<br>
          <div class="bg-gray-100 p-2 rounded border break-all text-sm mt-2 font-mono">${text}</div>`,
        icon: "info",
        confirmButtonText: "OK",
        width: "500px",
      });
      return false;
    } catch (err) {
      console.error("Fallback copy failed:", err);
      Swal.fire({
        title: "Copy Manually",
        html: `Please copy this URL:<br>
          <div class="bg-gray-100 p-2 rounded border break-all text-sm mt-2 font-mono">${text}</div>`,
        icon: "info",
        confirmButtonText: "OK",
        width: "500px",
      });
      return false;
    }
  };

  useEffect(() => {
    if (events.length > 0) {
      const foundEvent = events.find((e) => e.EventID == eventId);
      if (foundEvent) {
        setEvent(foundEvent);
        setLoading(false);
        return;
      }
    }
    fetchEventDetails();
  }, [eventId, events]);

  const handleBack = () => {
    navigate(-1);
  };

  const downloadICS = () => {
    toast.info("ICS download functionality coming soon!");
  };

  const handleRegister = () => {
    if (event?.RegistrationLink) {
      let url = event.RegistrationLink.trim();

      // If URL does not start with http or https → add https://
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.info("Registration link not available");
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId, events]);

  useEffect(() => {
    if (event) {
      console.log("Current event data:", event);
    }
  }, [event]);

  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        toast.success("Event link copied to clipboard!");
      } else {
        toast.info("Please copy the URL manually: " + text);
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      toast.info("Please copy the URL manually: " + text);
    }

    document.body.removeChild(textArea);
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
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The event you're looking for doesn't exist."}
          </p>
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
              {event.EventTitle || "Untitled Event"}
            </h1>
            <p className="text-xl text-gray-200 italic">
              {event.Category || "General Event"}
            </p>
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
                onError={(e) => {
                  e.target.style.display = "none";
                }}
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
                      {event.StartDate
                        ? moment
                            .utc(event.StartDate)
                            .format("dddd, MMMM D, YYYY")
                        : "Date not specified"}
                    </p>
                    <p className="text-gray-600">
                      {event.StartDate && event.EndDate
                        ? `${moment(event.StartDate).format(
                            "h:mm A"
                          )} - ${moment(event.EndDate).format("h:mm A")}`
                        : "Time not specified"}
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
                    <p className="text-gray-700">
                      {event.Venue || "Venue not specified"}
                    </p>
                  </div>
                </motion.div>

                <motion.div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faUserTie}
                    className="text-DGXgreen mt-1 mr-3 text-lg"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Host</p>
                    <p className="text-gray-700">
                      {event.Host || "Host not specified"}
                    </p>
                  </div>
                </motion.div>

                {event.RegistrationLink && (
                  <motion.div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-DGXgreen mt-1 mr-3 text-lg"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Registration
                      </p>
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
                  dangerouslySetInnerHTML={{
                    __html:
                      event.EventDescription ||
                      "<p>No description available for this event.</p>",
                  }}
                />
              </motion.div>

              {/* Additional Event Information */}
              {(event.ApprovedBy || event.Status) && (
                <motion.div
                  className="border-t pt-6 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Event Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    {event.Status && (
                      <div>
                        <span className="font-medium">Status: </span>
                        <span
                          className={`px-2 py-1 rounded ${
                            event.Status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : event.Status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {event.Status}
                        </span>
                      </div>
                    )}
                    {event.ApprovedBy && (
                      <div>
                        <span className="font-medium">Approved By: </span>
                        {event.ApprovedBy}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                className="flex flex-wrap gap-4 mt-8 pt-6 border-t"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                {/* <button
                  onClick={downloadICS}
                  className="bg-DGXgreen text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium"
                >
                  Add to Calendar
                </button> */}
                <button
                  onClick={async () => {
                    const eventUrl = getEventUrl();

                    // Check if Web Share API is supported
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: event.EventTitle,
                          text: event.EventDescription
                            ? event.EventDescription.replace(
                                /<[^>]+>/g,
                                ""
                              ).substring(0, 100)
                            : "Check out this event!",
                          url: eventUrl,
                        });
                      } catch (error) {
                        if (error.name !== "AbortError") {
                          console.error("Error sharing:", error);
                          await safeCopyToClipboard(eventUrl);
                        }
                      }
                    } else {
                      await safeCopyToClipboard(eventUrl);
                    }
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

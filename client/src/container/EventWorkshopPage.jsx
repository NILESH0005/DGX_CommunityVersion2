import { useState, useEffect, useContext } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShare,
  faCalendarAlt,
  faMapMarkerAlt,
  faClock,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { ChevronDown, Shield, Users, Zap, Flag, ArrowRight } from "lucide-react";
import ApiContext from "../context/ApiContext.jsx";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment-timezone";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralUserCalendar from "../component/GeneralUserCalendar.jsx";

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0),
            opacity: 0
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0),
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  )
}

const FloatingOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-32 h-32 rounded-full blur-xl"
          style={{
            background: `rgba(${i % 2 ? '16, 185, 129' : '29, 78, 216'}, 0.1)`
          }}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0),
          }}
          transition={{
            duration: Math.random() * 30 + 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  )
}

const EventDetailsModal = ({ event, isOpen, onClose }) => {
  if (!isOpen || !event || event.Status !== "Approved") return null;

  const downloadICS = () => {
    alert("ICS download functionality will be implemented here");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-gradient-to-br from-DGXblue to-DGXgreen rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex justify-between items-center mb-6">
              <motion.h2 
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Event Details
              </motion.h2>
              <motion.button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl font-bold"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                &times;
              </motion.button>
            </div>

            <motion.div 
              className="bg-white bg-opacity-90 rounded-lg p-6 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {event.EventImage && (
                <motion.img
                  src={event.EventImage}
                  alt="Event Poster"
                  className="w-full h-64 object-cover rounded-lg mb-4 shadow-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                />
              )}

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-2xl font-bold text-DGXblue">
                    {event.EventTitle}
                  </h3>
                  <p className="text-gray-600 italic">{event.Category}</p>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, staggerChildren: 0.1 }}
                >
                  <motion.div 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="text-DGXgreen mt-1 mr-2"
                    />
                    <div>
                      <p className="font-semibold">Date & Time</p>
                      <p>
                        {moment.utc(event.StartDate).format("MMMM D, YYYY h:mm A")}{" "}
                        - {moment.utc(event.EndDate).format("h:mm A")}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-DGXgreen mt-1 mr-2"
                    />
                    <div>
                      <p className="font-semibold">Venue</p>
                      <p>{event.Venue}</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <FontAwesomeIcon
                      icon={faUserTie}
                      className="text-DGXgreen mt-1 mr-2"
                    />
                    <div>
                      <p className="font-semibold">Host</p>
                      <p>{event.Host}</p>
                    </div>
                  </motion.div>

                  {event.RegistrationLink && (
                    <motion.div 
                      className="flex items-start"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <FontAwesomeIcon
                        icon={faClock}
                        className="text-DGXgreen mt-1 mr-2"
                      />
                      <div>
                        <p className="font-semibold">Registration</p>
                        <a
                          href={event.RegistrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-DGXblue hover:underline"
                        >
                          Register Here
                        </a>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <h4 className="font-semibold text-lg">Description</h4>
                  <div
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: event.EventDescription }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EventWorkshopPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchData, userToken } = useContext(ApiContext);
  const [dbevents, setDbvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMoreInfoClick = (event) => {
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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleShare = async (event) => {
    const shareData = {
      title: event.EventTitle,
      text: `Check out this event: ${event.EventTitle}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {}
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(
          `${shareData.text} - ${shareData.url}`
        );
        alert("Link copied to clipboard!");
      } catch (error) {}
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  const handleViewDetails = (event) => {
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const endpoint = "eventandworkshop/getEvent";
        const eventData = await fetchData(endpoint);
        const approvedEvents = eventData.data.filter(
          (event) => event.Status === "Approved"
        );
        setDbvents(approvedEvents);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [fetchData]);

  const currentDate = new Date().toISOString();
  const upcomingEvents = dbevents.filter(
    (event) => event.StartDate > currentDate
  );
  const pastEvents = dbevents.filter((event) => event.EndDate < currentDate);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section */}
      <motion.section 
        style={{ y: headerY }}
        className="relative bg-gradient-to-r from-DGXblue to-DGXgreen py-20 px-4 sm:px-6 lg:px-8 text-center text-DGXgreen"

      >
        <ParticleBackground />
        <FloatingOrbs />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              DGX Events & 
              <span className="block text-green-300">Workshops</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover upcoming learning opportunities and networking events
            </p>
          </motion.div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 border border-white/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 border border-white/10 rounded-full"
          />
        </div>
      </motion.section>

     

      {/* Upcoming Events Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center px-4 py-2 bg-green-100 rounded-full mb-4">
              <span className="text-sm font-medium text-green-700">Coming Soon</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mark your calendar for these exciting learning opportunities
            </p>
          </motion.div>
          
          {isLoading ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    duration: 1.5
                  }}
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : upcomingEvents.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {upcomingEvents
                .filter((event) => event.Status === "Approved")
                .map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300"
                  >
                    <div className="relative">
                      <motion.img
                        src={event.EventImage}
                        alt={`Image for ${event.EventTitle}`}
                        className="w-full h-48 object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div 
                        className="absolute top-2 right-2 bg-DGXgreen text-white text-xs font-bold px-2 py-1 rounded"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Upcoming
                      </motion.div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {event.EventTitle}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="mr-2 text-DGXgreen"
                        />
                        <span>
                          {moment.utc(event.StartDate).format("MMMM D, YYYY")}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-4">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="mr-2 text-DGXgreen"
                        />
                        <span>{event.Venue}</span>
                      </div>
                      <motion.div 
                        className="flex justify-between space-x-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.button
                          onClick={() => handleViewDetails(event)}
                          className="flex-1 bg-DGXblue hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Details
                        </motion.button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12 bg-white rounded-xl shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl text-gray-600 mb-2">
                No upcoming events scheduled
              </h3>
              <p className="text-gray-500">Check back later for new events!</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Calendar Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-xl shadow-sm mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-DGXblue mb-4">
            Event Calendar
          </h2>
          <motion.div 
            className="w-24 h-1 bg-DGXgreen mx-auto"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8 }}
          />
          <motion.p
            className="mt-4 text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Browse all our events in an interactive calendar
          </motion.p>
        </div>
        <GeneralUserCalendar events={dbevents} />
      </motion.section>

      {/* Past Events Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-3xl font-bold text-DGXblue mb-4">Past Events</h2>
          <motion.div 
            className="w-24 h-1 bg-DGXgreen mx-auto"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8 }}
          />
          <motion.p 
            className="mt-4 text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Relive the knowledge and experiences from our previous events
          </motion.p>
        </motion.div>

        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {pastEvents.length > 0 ? (
            pastEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300"
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <motion.img
                      src={event.EventImage}
                      alt={event.EventTitle}
                      className="w-full h-64 md:h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {event.EventTitle}
                        </h3>
                        <p className="text-DGXgreen font-medium mb-2">
                          {event.Category}
                        </p>
                      </div>
                      <motion.span 
                        className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        Past Event
                      </motion.span>
                    </div>

                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="text-DGXgreen mr-2"
                        />
                        <span>
                          {moment.utc(event.StartDate).format("MMMM D, YYYY")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="text-DGXgreen mr-2"
                        />
                        <span>{event.Venue}</span>
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faUserTie}
                          className="text-DGXgreen mr-2"
                        />
                        <span>Hosted by {event.Host}</span>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="mt-4 line-clamp-3 text-gray-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {event.EventDescription.replace(/<[^>]+>/g, "").substring(
                        0,
                        200
                      )}
                      ...
                    </motion.div>

                    <motion.button
                      onClick={() => handleMoreInfoClick(event)}
                      className="mt-6 inline-flex items-center text-DGXblue hover:text-DGXgreen font-medium"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      View Event Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="text-center py-12 bg-white rounded-xl shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl text-gray-600 mb-2">
                No past events to display
              </h3>
              <p className="text-gray-500">
                Our event history will appear here
              </p>
            </motion.div>
          )}
        </motion.div>
      </section>
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default EventWorkshopPage;
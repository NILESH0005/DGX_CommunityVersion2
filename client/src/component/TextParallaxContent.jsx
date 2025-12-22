import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, BookOpen } from "lucide-react";
import moment from "moment";
import ApiContext from "../context/ApiContext";
import { FaHeart, FaUser, FaCalendarAlt } from "react-icons/fa";
import DiscussionModal from "../component/discussion/DiscussionModal";
import ParticleRing from "../component/ParticleRing/ParticleRing";

const TextParallaxContent = () => {
  const [homeData, setHomeData] = useState({
    events: [],
    blogs: [],
    discussions: [],
    modules: [], // Changed from 'lms' to 'modules' to match backend
  });
  const [loading, setLoading] = useState(true);
  const { fetchData, userToken, user } = useContext(ApiContext);

  // Get uploads base URL from environment variable (similar to DiscussionCard)
  const UPLOADS_BASE_URL = import.meta.env.VITE_API_UPLOADSURL || "";

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const endpoint = "home/getLogoutHomePageContent";
        const method = "GET";
        const body = {};
        const headers = {
          "Content-Type": "application/json",
        };

        setLoading(true);
        const result = await fetchData(endpoint, method, body, headers);

        function formatEventTime(startDate, endDate) {
          if (!startDate) return "Time not available";

          const start = new Date(startDate);
          const end = endDate ? new Date(endDate) : start;

          return (
            start.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }) +
            " - " +
            end.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }

        if (result?.success) {
          // Map backend response to frontend expected structure
          setHomeData({
            events: result.data?.upcomingEvents || [], // Changed from events to upcomingEvents
            blogs: result.data?.featuredBlogs || [], // Changed from blogs to featuredBlogs
            discussions: result.data?.recentDiscussions || [], // Changed from discussions to recentDiscussions
            modules: result.data?.featuredModules || [], // Changed from lms to featuredModules
          });
        } else {
          console.error("Failed to fetch home data:", result?.message);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching home data:", error);
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DGXgreen"></div>
      </div>
    );
  }

  const featuredEvent = homeData.events[0];
  const upcomingEvents = homeData.events.slice(1);

  return (
    <div className="bg-DGXwhite min-h-screen">
      {/* Featured Event Banner */}
      <div className="relative overflow-hidden">
        {featuredEvent ? (
          <div className="relative h-[50vh] w-full">
            <div className="absolute inset-0 bg-gradient-to-t from-DGXblack/80 via-DGXblack/50 to-transparent z-10" />
            <img
              src={featuredEvent.EventImage || "/No_Image_Available.jpg"}
              alt={featuredEvent.EventTitle || "Upcoming Event"}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute bottom-0 left-0 z-20 p-6 md:p-8 text-DGXwhite max-w-4xl"
            >
              <div className="flex gap-3 mb-3">
                {calculateCountdown(featuredEvent.StartDate).map(
                  (time, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-DGXwhite/20 backdrop-blur-sm rounded-lg px-3 py-1 text-center"
                    >
                      <span className="font-bold text-xl">{time.value}</span>
                      <span className="block text-xs opacity-80">
                        {time.unit}
                      </span>
                    </motion.div>
                  )
                )}
              </div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl font-bold mb-3"
              >
                {featuredEvent.EventTitle}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-3 mb-3 text-base"
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  {formatEventDate(
                    featuredEvent.StartDate,
                    featuredEvent.EndDate
                  )}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatEventTime(
                    featuredEvent.StartDate,
                    featuredEvent.EndDate
                  )}
                </span>
                {featuredEvent.Venue && (
                  <span className="flex items-center gap-2">
                    📍 {featuredEvent.Venue}
                  </span>
                )}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-base md:text-lg mb-4 opacity-90 max-w-2xl"
              >
                {stripHtmlTags(featuredEvent.EventDescription)}
              </motion.p>

              {featuredEvent.RegistrationLink && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-DGXgreen hover:bg-DGXgreen/90 text-DGXwhite font-semibold px-6 py-2 rounded-full transition-all duration-300 shadow-lg text-sm"
                  onClick={() =>
                    window.open(
                      featuredEvent.RegistrationLink.startsWith("http")
                        ? featuredEvent.RegistrationLink
                        : `https://${featuredEvent.RegistrationLink}`,
                      "_blank"
                    )
                  }
                >
                  Register Now
                </motion.button>
              )}
            </motion.div>
          </div>
        ) : (
          // Fallback when no featured event
          <div className="relative h-[30vh] w-full overflow-hidden">
            {/* BACKGROUND RING */}
            <div className="absolute inset-0 z-0">
              <ParticleRing />
            </div>

            {/* FOREGROUND TEXT */}
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  Welcome to Our Community
                </h1>

                <p className="text-xl text-white opacity-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                  Discover amazing events, blogs, and discussions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Sections */}
      <div className="relative overflow-hidden">
        {/* Modules Section - Only show if there are items */}
        {homeData.modules.length > 0 && (
          <Section
            title="Learning Modules"
            subtitle="Access courses, track progress, and achieve your learning goals"
            theme="DGXblue"
            items={homeData.modules}
            type="module"
            UPLOADS_BASE_URL={UPLOADS_BASE_URL}
          />
        )}

        {/* Discussions Section - Only show if there are items */}
        {homeData.discussions.length > 0 && (
          <Section
            title="Community Discussions"
            subtitle="Connect with peers, ask questions, and share knowledge"
            theme="DGXgreen"
            items={homeData.discussions}
            type="discussion"
            UPLOADS_BASE_URL={UPLOADS_BASE_URL}
          />
        )}

        {/* Blog Section - Only show if there are items */}
        {homeData.blogs.length > 0 && (
          <Section
            title="Featured Blog Posts"
            subtitle="Insights, tutorials, and industry news"
            theme="DGXblue"
            items={homeData.blogs}
            type="blog"
            icon={<BookOpen className="w-6 h-6" />}
            UPLOADS_BASE_URL={UPLOADS_BASE_URL}
          />
        )}

        {/* Additional Events Section - Only show if there are more events */}
        {upcomingEvents.length > 0 && (
          <Section
            title="More Upcoming Events"
            subtitle="Don't miss these exciting events"
            theme="DGXgreen"
            items={upcomingEvents}
            type="event"
            UPLOADS_BASE_URL={UPLOADS_BASE_URL}
          />
        )}

        {/* Fallback when no content */}
        {homeData.modules.length === 0 &&
          homeData.discussions.length === 0 &&
          homeData.blogs.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-DGXgray mb-4">
                No content available at the moment
              </h2>
              <p className="text-DGXgray">Check back later for updates!</p>
            </div>
          )}
      </div>
    </div>
  );
};

// Section Component
const Section = ({
  title,
  subtitle,
  theme,
  items,
  type,
  icon,
  AuthAdd,
  UPLOADS_BASE_URL,
}) => {
  const classes = {
    DGXgreen: {
      text: "text-DGXgreen",
      bg: "bg-DGXgreen",
      bgLight: "bg-DGXgreen/10",
      border: "border-DGXgreen",
      hover: "hover:bg-DGXgreen/90",
    },
    DGXblue: {
      text: "text-DGXblue",
      bg: "bg-DGXblue",
      bgLight: "bg-DGXblue/10",
      border: "border-DGXblue",
      hover: "hover:bg-DGXblue/90",
    },
  }[theme];

  return (
    <section className={`relative py-16 ${classes.bgLight}`}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            {icon && (
              <div
                className={`p-3 rounded-full ${classes.bg}/10 ${classes.text}`}
              >
                {icon}
              </div>
            )}
            <h2 className={`text-3xl md:text-4xl font-bold ${classes.text}`}>
              {title}
            </h2>
          </div>
          <p className="text-lg text-DGXgray max-w-3xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <Card
              key={
                item.EventID ||
                item.DiscussionID ||
                item.BlogID ||
                item.ModuleID ||
                index
              }
              item={item}
              type={type}
              theme={theme}
              AuthAdd={AuthAdd}
              UPLOADS_BASE_URL={UPLOADS_BASE_URL}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Updated Card Component with UserImage
const Card = ({ item, type, theme, UPLOADS_BASE_URL }) => {
  const classes = {
    DGXgreen: {
      text: "text-DGXgreen",
      bg: "bg-DGXgreen",
      bgLight: "bg-DGXgreen/10",
      border: "border-DGXgreen",
      hover: "hover:bg-DGXgreen/90",
    },
    DGXblue: {
      text: "text-DGXblue",
      bg: "bg-DGXblue",
      bgLight: "bg-DGXblue/10",
      border: "border-DGXblue",
      hover: "hover:bg-DGXblue/90",
    },
  }[theme];

  const getImageSrc = () => {
    let img =
      type === "event"
        ? item.EventImage
        : type === "discussion"
        ? item.Image || item.DiscussionImagePath
        : type === "blog"
        ? item.image || item.BlogImage
        : type === "module"
        ? item.ModuleImagePath || item.ModuleImage
        : null;

    return img && img.trim() !== "" ? img : "/No_Image_Available.jpg";
  };

  const getUserImage = () => {
    // Get user image from various possible field names
    const userImage =
      item.UserImage || item.userImage || item.authorImage || item.profileImage;

    // Return user image only if available and not empty
    return userImage && userImage.trim() !== "" ? userImage : null;
  };

  const getUserImageUrl = () => {
    const userImage = getUserImage();
    if (!userImage) return null;

    // Construct full URL using UPLOADS_BASE_URL (same as DiscussionCard)
    return `${UPLOADS_BASE_URL}/${userImage}`;
  };

  const getTitle = () => {
    return (
      item.EventTitle ||
      item.Title ||
      item.title ||
      item.ModuleName ||
      "Untitled"
    );
  };

  const getDescription = () => {
    return (
      item.EventDescription ||
      item.Content ||
      item.content ||
      item.ModuleDescription ||
      "No description available."
    );
  };

  const authorName =
    item.AuthAdd || item.Author || item.author || item.CreatedBy || "Anonymous";

  const getStatusInfo = () =>
    type === "discussion"
      ? {
          label: "Likes",
          value: item.Likes || 0,
          icon: <FaHeart className="text-red-500" />,
        }
      : null;

  const getDateInfo = () => {
    if (type === "event") return formatEventDate(item.StartDate, item.EndDate);
    if (type === "blog" || type === "discussion")
      return formatBlogDate(item.publishedDate || item.AddOnDt);
    return null;
  };

  const statusInfo = getStatusInfo();
  const dateInfo = getDateInfo();
  const userImageUrl = getUserImageUrl();

  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.01,
        boxShadow: "0 12px 20px -3px rgba(0,0,0,0.12)",
      }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-300`}
    >
      {/* 🖼️ Main Image */}
      {/* <div className="relative h-48 w-full overflow-hidden">
        <motion.img
          src={getImageSrc()}
          alt={getTitle()}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          loading="lazy"
          onError={(e) => (e.target.src = "/No_Image_Available.jpg")}
        />

        <div className={`absolute top-0 left-0 w-full h-1 ${classes.bg}`} />

        {(type === "blog" || type === "event") && dateInfo && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex items-center gap-1 text-white text-xs font-medium">
              <FaCalendarAlt className="text-[0.7rem]" />
              {dateInfo}
            </div>
          </div>
        )}
      </div> */}

      {/* 📄 Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3
          className={`text-lg font-semibold mb-2 leading-snug line-clamp-2 ${classes.text}`}
        >
          {getTitle()}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
          {stripHtmlTags(getDescription())}
        </p>

        {/* 📚 Metadata */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            {/* Left: Author with UserImage + Likes */}
            <div className="flex items-center gap-3">
              {/* Author with UserImage */}
              <div className="flex items-center gap-2">
                {userImageUrl ? (
                  <div className="relative">
                    <img
                      src={userImageUrl}
                      alt={authorName}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-user.png";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                    <FaUser className="text-gray-500 text-sm" />
                  </div>
                )}
                <div>
                  <div className="text-xs text-gray-700 font-medium">
                    {authorName}
                  </div>
                  {type === "blog" && item.Category && (
                    <div className="text-xs text-gray-500">{item.Category}</div>
                  )}
                </div>
              </div>

              {/* Likes / Status */}
              {statusInfo && (
                <div className="flex items-center gap-1 text-gray-700 ml-2">
                  {statusInfo.icon}
                  <span className="text-xs font-medium">
                    {statusInfo.value} {statusInfo.label.toLowerCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Date */}
            {dateInfo && (type === "discussion" || type === "module") && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <FaCalendarAlt className="text-gray-400" />
                <span>{dateInfo}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper functions
function calculateCountdown(eventDate) {
  if (!eventDate)
    return [
      { value: "00", unit: "DAYS" },
      { value: "00", unit: "HOURS" },
      { value: "00", unit: "MIN" },
    ];

  const startDate = new Date(eventDate);
  const now = new Date();
  const diff = startDate - now;

  if (diff < 0) {
    return [
      { value: "00", unit: "DAYS" },
      { value: "00", unit: "HOURS" },
      { value: "00", unit: "MIN" },
    ];
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return [
    { value: days.toString().padStart(2, "0"), unit: "DAYS" },
    { value: hours.toString().padStart(2, "0"), unit: "HOURS" },
    { value: minutes.toString().padStart(2, "0"), unit: "MIN" },
  ];
}

function formatEventDate(startDate, endDate) {
  if (!startDate) return "Date not available";

  const start = moment(startDate);
  const end = endDate ? moment(endDate) : start;

  if (start.format("YYYY-MM-DD") === end.format("YYYY-MM-DD")) {
    return start.format("MMMM D, YYYY");
  }

  return `${start.format("MMMM D, YYYY")} - ${end.format("MMMM D, YYYY")}`;
}

function formatEventTime(startDate, endDate) {
  if (!startDate) return "Time not available";

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;

  return (
    start.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }) +
    " - " +
    end.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

function formatBlogDate(dateString) {
  if (!dateString) return "Date not available";
  return moment(dateString).format("MMMM D, YYYY");
}

function stripHtmlTags(html) {
  if (!html) return "No description available";
  const plainText = html.replace(/<[^>]*>?/gm, "");
  return plainText.length > 150
    ? plainText.substring(0, 150) + "..."
    : plainText;
}

export default TextParallaxContent;

import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, BookOpen } from "lucide-react";
import ApiContext from "../context/ApiContext";

const TextParallaxContent = () => {
  const [homeData, setHomeData] = useState({
    events: [],
    blogs: [],
    discussions: [],
    modules: [], // Changed from 'lms' to 'modules' to match backend
  });
  const [loading, setLoading] = useState(true);
  const { fetchData, userToken, user } = useContext(ApiContext);

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
              src={featuredEvent.EventImage || "/default-event.jpg"}
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
                  {formatEventDate(featuredEvent.StartDate, featuredEvent.EndDate)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatEventTime(featuredEvent.StartDate, featuredEvent.EndDate)}
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
          <div className="relative h-[50vh] w-full bg-gradient-to-r from-DGXblue to-DGXgreen flex items-center justify-center">
            <div className="text-center text-DGXwhite z-20">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Our Community</h1>
              <p className="text-xl opacity-90">Discover amazing events, blogs, and discussions</p>
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
          />
        )}

        {/* Fallback when no content */}
        {homeData.modules.length === 0 && 
         homeData.discussions.length === 0 && 
         homeData.blogs.length === 0 && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-DGXgray mb-4">No content available at the moment</h2>
            <p className="text-DGXgray">Check back later for updates!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Section Component
const Section = ({ title, subtitle, theme, items, type, icon }) => {
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
              key={item.EventID || item.DiscussionID || item.BlogID || item.ModuleID || index}
              item={item}
              type={type}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Card Component
const Card = ({ item, type, theme }) => {
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

  // Get appropriate image based on item type
  const getImageSrc = () => {
    if (type === 'event') return item.EventImage;
    if (type === 'discussion') return item.Image || item.DiscussionImagePath;
    if (type === 'blog') return item.image;
    if (type === 'module') return item.ModuleImagePath || item.ModuleImage;
    return "/default-image.jpg";
  };

  // Get appropriate title based on item type
  const getTitle = () => {
    if (type === 'event') return item.EventTitle;
    if (type === 'discussion') return item.Title;
    if (type === 'blog') return item.title;
    if (type === 'module') return item.ModuleName;
    return "Default Title";
  };

  // Get appropriate description based on item type
  const getDescription = () => {
    if (type === 'event') return item.EventDescription;
    if (type === 'discussion') return item.Content;
    if (type === 'blog') return item.content;
    if (type === 'module') return item.ModuleDescription;
    return "Default description text";
  };

  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`rounded-xl overflow-hidden bg-DGXwhite border border-DGXgray hover:border-${theme} transition-all duration-300`}
    >
      <div className="h-48 overflow-hidden relative">
        <motion.img
          src={getImageSrc() || "/default-image.jpg"}
          alt={getTitle()}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          loading="lazy"
        />
        {(type === "blog" || type === "event") && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-DGXblack/60 to-transparent p-4">
            <span className="text-DGXwhite text-sm">
              {type === "blog" 
                ? formatBlogDate(item.publishedDate || item.AddOnDt)
                : formatEventDate(item.StartDate, item.EndDate)
              }
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className={`text-xl font-bold mb-2 ${classes.text}`}>
          {getTitle()}
        </h3>
        <p className="text-DGXgray mb-4 line-clamp-3">
          {stripHtmlTags(getDescription())}
        </p>
        
        {type === "blog" && (
          <div className="text-sm text-DGXgray">
            By {item.AuthAdd || "Admin"}
          </div>
        )}
        
        {type === "discussion" && (
          <div className="flex justify-between items-center text-sm text-DGXgray">
            <span>❤️ {item.Likes || 0} likes</span>
            <span>{formatBlogDate(item.AddOnDt)}</span>
          </div>
        )}
        
        {type === "event" && (
          <div className="text-sm text-DGXgray">
            {formatEventDate(item.StartDate, item.EndDate)}
          </div>
        )}
        
        {type === "module" && (
          <div className="text-sm text-DGXgray">
            By : {item.AuthAdd || "N/A"}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Helper functions
function calculateCountdown(eventDate) {
  if (!eventDate) return [{ value: "00", unit: "DAYS" }, { value: "00", unit: "HOURS" }, { value: "00", unit: "MIN" }];
  
  const startDate = new Date(eventDate);
  const now = new Date();
  const diff = startDate - now;

  if (diff < 0) {
    return [{ value: "00", unit: "DAYS" }, { value: "00", unit: "HOURS" }, { value: "00", unit: "MIN" }];
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
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  
  return (
    start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " - " +
    end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  );
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
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function stripHtmlTags(html) {
  if (!html) return "No description available";
  return html.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
}

export default TextParallaxContent;
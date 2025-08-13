import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const modules = [
  {
    title: "Learning Management System",
    description:
      "Access structured learning paths, track progress, and master new skills.",
    category: "LMS",
    image:
      "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    path: "/LearningPath",
  },
  {
    title: "Discussions",
    description:
      "Engage in meaningful conversations and share knowledge with the community.",
    category: "Discussion",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    path: "/Discussion",
  },
  {
    title: "Blogs",
    description:
      "Read insightful articles and stay updated with the latest trends.",
    category: "Blog",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    path: "/Blog",
  },
  {
    title: "Events",
    description:
      "Join exciting events, meet industry experts, and expand your network.",
    category: "Event",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1412&q=80",
    path: "/EventWorkshopPage",
  },
  {
    title: "Quiz",
    description:
      "Test your knowledge with interactive quizzes and improve your understanding.",
    category: "Quiz",
    image: "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    path: "/QuizInterface",
  },
];

const CommunityHighlights = () => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (scrollRef.current) {
        const isMobile = window.innerWidth <= 768;
        const scrollAmount = isMobile ? 300 : 420;
        
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        if (
          scrollRef.current.scrollLeft + scrollRef.current.clientWidth >=
          scrollRef.current.scrollWidth
        ) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, []);

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#060a1f] to-[#0a1128] text-white flex flex-col items-center py-8 px-4 sm:px-6 overflow-hidden">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full max-w-6xl mb-10 text-center md:text-left"
      >
        <h1 className="text-4xl sm:text-6xl py-4 md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-transparent bg-clip-text animate-pulse drop-shadow-lg">
          Community Highlights
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto md:mx-0">
          Explore the best parts of our platform — curated just for you!
        </p>
      </motion.div>
      
      {/* Scrolling Cards */}
      <motion.div
        ref={scrollRef}
        className="w-full max-w-7xl flex space-x-4 sm:space-x-8 py-6 overflow-x-auto px-4 sm:px-0"
        whileTap={{ cursor: "grabbing" }}
        style={{
          WebkitOverflowScrolling: 'touch', // for smooth scrolling on iOS
          scrollbarWidth: 'none', // hide scrollbar for Firefox
          msOverflowStyle: 'none' // hide scrollbar for IE/Edge
        }}
      >
        {modules.map((module, index) => (
          <motion.div
            key={index}
            className="relative w-[280px] sm:w-[350px] md:w-[400px] rounded-3xl overflow-hidden bg-[#0f172a]/80 backdrop-blur-lg border border-blue-800 shadow-[0_0_25px_#3b82f6aa] flex-shrink-0 cursor-pointer transition-all duration-300 hover:shadow-[0_0_40px_#60a5faaa] mx-1 sm:mx-0"
            whileHover={{
              scale: 1.05,
              y: -10,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            onClick={() => handleCardClick(module.path)}
          >
            {/* Image & Category */}
            <div className="relative">
              <img
                src={module.image}
                alt={module.title}
                className="w-full h-64 sm:h-80 md:h-96 object-cover"
                loading="lazy"
              />
              <span className="absolute top-4 left-4 bg-blue-700/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                {module.category}
              </span>
            </div>

            {/* Card Body */}
            <div className="p-4 sm:p-6 space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-white">{module.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {module.description}
              </p>

              <div className="mt-4 inline-flex items-center text-blue-400 text-sm font-semibold group">
                Find out more
                <span className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CommunityHighlights;
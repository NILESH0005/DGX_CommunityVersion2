import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Users from "./Components/Users";
import Discussions from "./Components/Discussions";
import Events from "./Components/Events";
import GuidelineManager from "./Components/GuidelineManager";
import Contact from "./Components/ContactEdit";
import BlogManager from "./Components/BlogManager";
import Home from "./Components/Home";
import QuizPanel from "./Components/Quiz/QuizPanel";
import QuestionBank from "./Components/Quiz/QuestionBank";
import QuizMapping from "./Components/Quiz/QuizMapping";
import {
  FaUsers,
  FaComments,
  FaCalendarAlt,
  FaBlog,
  FaQuestionCircle,
  FaList,
  FaBrain,
  FaChartPie,
  FaCog,
  FaBook,
  FaHome,
  FaEnvelope,
  FaAngleDown,
  FaAngleUp,
  FaBars,
  FaTimes,
  FaGraduationCap,
  FaLayerGroup,
} from "react-icons/fa";
import LearningMaterialManager from "./Components/LMS/LearningMaterialManager";
import LearningMaterialList from "./Components/LMS/LearningMaterialList";
import ModuleBuilder from "./Components/LMS/ModuleBuilder/ModuleBuilder";

const AdminDashboard = (props) => {
  const [activeComp, setActiveComp] = useState("users");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        sidebarOpen &&
        overlayRef.current &&
        overlayRef.current.contains(event.target) &&
        !event.target.closest(".sidebar-container")
      ) {
        setSidebarOpen(false);
      }
    };

    if (isMobile && sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMobile, sidebarOpen]);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const getComp = (comp) => {
    switch (comp) {
      case "users":
        return <Users />;
      case "discussions":
        return <Discussions />;
      case "events":
        return <Events events={props.events} setEvents={props.setEvents} />;
      case "blog_manager":
        return <BlogManager blogs={props.blogs} setBlogs={props.setBlogs} />;
      case "quizpanel":
        return <QuizPanel setActiveComp={setActiveComp} />;
      case "quiz_bank":
        return <QuestionBank />;
      case "quiz_mapping":
        return <QuizMapping />;
      case "guidelines":
        return <GuidelineManager />;
      case "Home":
        return <Home />;
      case "contact":
        return <Contact />;
      case "select_module":
        return <LearningMaterialManager />;
      case "edit_module":
        return <LearningMaterialList />;
      default:
        return <Home />;
    }
  };

  const handleMenuItemClick = (comp) => {
    setActiveComp(comp);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const dropdownVariants = {
    open: {
      opacity: 1,
      height: "auto",
      transition: { type: "spring", damping: 20, stiffness: 300 }
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3 }
    }
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="text-2xl font-bold">Admin Dashboard</div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 mt-16"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <motion.div
        className="sidebar-container fixed md:relative top-16 md:top-0 left-0 h-[calc(100vh-64px)] md:h-auto bg-black text-white w-full md:w-64 flex-shrink-0 z-30 md:z-0"
        initial={isMobile ? "closed" : "open"}
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "tween" }}
      >
        <nav className="overflow-y-auto h-full w-full md:w-64 pt-16 z-10 fixed md:static bg-black">
          <ul>
            {/* Home */}
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "Home" ? "bg-gray-700 text-yellow-300" : ""
                }`}
                onClick={() => handleMenuItemClick("Home")}
              >
                <FaHome className="mr-4" />
                Home
              </div>
            </li>
            
            {/* Users */}
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "users" ? "bg-gray-700 text-yellow-300" : ""
                }`}
                onClick={() => handleMenuItemClick("users")}
              >
                <FaUsers className="mr-4" />
                Users
              </div>
            </li>
            
            {/* LMS Section */}
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  ["select_module", "edit_module"].includes(activeComp)
                    ? "bg-gray-700 text-yellow-300"
                    : ""
                }`}
                onClick={() => toggleDropdown("lms")}
              >
                <FaGraduationCap className="mr-4" />
                LMS
                {openDropdown === "lms" ? (
                  <FaAngleUp className="ml-auto" />
                ) : (
                  <FaAngleDown className="ml-auto" />
                )}
              </div>
              
              <AnimatePresence>
                {openDropdown === "lms" && (
                  <motion.ul
                    className="bg-gray-800 overflow-hidden"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={dropdownVariants}
                  >
                    <li>
                      <div
                        className={`py-2 px-6 cursor-pointer flex items-center text-base md:text-lg ${
                          activeComp === "select_module"
                            ? "bg-gray-700 text-yellow-300"
                            : ""
                        }`}
                        onClick={() => handleMenuItemClick("select_module")}
                      >
                        <FaLayerGroup className="mr-4" />
                        Upload learning Kit
                      </div>
                    </li>
                    <li>
                      <div
                        className={`py-2 px-6 cursor-pointer flex items-center text-base md:text-lg ${
                          activeComp === "edit_module"
                            ? "bg-gray-700 text-yellow-300"
                            : ""
                        }`}
                        onClick={() => handleMenuItemClick("edit_module")}
                      >
                        <FaLayerGroup className="mr-4" />
                        Edit Existing Module
                      </div>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
            
            {/* Quiz Section */}
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  ["quizpanel", "quiz_bank", "quiz_mapping"].includes(activeComp)
                    ? "bg-gray-700 text-yellow-300"
                    : ""
                }`}
                onClick={() => toggleDropdown("quiz")}
              >
                <FaBrain className="mr-4" />
                Quiz
                {openDropdown === "quiz" ? (
                  <FaAngleUp className="ml-auto" />
                ) : (
                  <FaAngleDown className="ml-auto" />
                )}
              </div>
              
              <AnimatePresence>
                {openDropdown === "quiz" && (
                  <motion.ul
                    className="bg-gray-800 overflow-hidden"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={dropdownVariants}
                  >
                    <li>
                      <div
                        className={`py-2 px-6 cursor-pointer flex items-center text-base md:text-lg ${
                          activeComp === "quizpanel"
                            ? "bg-gray-700 text-yellow-300"
                            : ""
                        }`}
                        onClick={() => handleMenuItemClick("quizpanel")}
                      >
                        <FaQuestionCircle className="mr-4" />
                        Quiz Panel
                      </div>
                    </li>
                    <li>
                      <div
                        className={`py-2 px-6 cursor-pointer flex items-center text-base md:text-lg ${
                          activeComp === "quiz_bank"
                            ? "bg-gray-700 text-yellow-300"
                            : ""
                        }`}
                        onClick={() => handleMenuItemClick("quiz_bank")}
                      >
                        <FaList className="mr-4" />
                        Question Bank
                      </div>
                    </li>
                    <li>
                      <div
                        className={`py-2 px-6 cursor-pointer flex items-center text-base md:text-lg ${
                          activeComp === "quiz_mapping"
                            ? "bg-gray-700 text-yellow-300"
                            : ""
                        }`}
                        onClick={() => handleMenuItemClick("quiz_mapping")}
                      >
                        <FaChartPie className="mr-4" />
                        Quiz Mapping
                      </div>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
            
            {/* Discussions */}
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "discussions"
                    ? "bg-gray-700 text-yellow-300"
                    : ""
                }`}
                onClick={() => handleMenuItemClick("discussions")}
              >
                <FaComments className="mr-4" />
                Discussions
              </div>
            </li>
            
            {/* Blogs */}
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "blog_manager"
                    ? "bg-gray-700 text-yellow-300"
                    : ""
                }`}
                onClick={() => handleMenuItemClick("blog_manager")}
              >
                <FaBlog className="mr-4" />
                Blogs
              </div>
            </li>
            
            {/* Events */}
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "events" ? "bg-gray-700 text-yellow-300" : ""
                }`}
                onClick={() => handleMenuItemClick("events")}
              >
                <FaCalendarAlt className="mr-4" />
                Events
              </div>
            </li>
            
            {/* ContactUs */}
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "contact" ? "bg-gray-700 text-yellow-300" : ""
                }`}
                onClick={() => handleMenuItemClick("contact")}
              >
                <FaEnvelope className="mr-4" />
                Contact Us
              </div>
            </li>
          </ul>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div
        className={`flex-1 min-h-screen p-4 md:p-6 overflow-x-auto transition-all duration-300 mt-16 md:mt-0`}
      >
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          {getComp(activeComp)}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
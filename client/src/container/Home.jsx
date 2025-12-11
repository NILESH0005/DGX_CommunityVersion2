import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faUsers,
  faComment,
  faCalendarAlt,
  faComments, // for Discussions
  faPenNib, // for Blogs
  faGraduationCap, // for LMS
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import ApiContext from "../context/ApiContext";
import images from "../constant/images.js";
import Swal from "sweetalert2";
import TextParallaxContent from "../component/TextParallaxContent.jsx";
import ParallaxSection from "../component/ParallaxSection";
import ContentSection from "../component/ContentSection";
import CommunityHighlights from "../component/CommunityHighlights";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HeroModel from "./HeroModel.jsx";

const Home = () => {
  const { user, userToken, fetchData } = useContext(ApiContext);
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  // Add these missing variants
  const slideInFromLeft = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: 0.2,
      },
    },
  };

  const slideInFromRight = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: 0.2,
      },
    },
  };

  const features = [
    {
      icon: faComments,
      title: "Discussions",
      description:
        "Engage in meaningful conversations, share insights, and collaborate with peers and experts",
    },
    {
      icon: faPenNib,
      title: "Blogs",
      description:
        "Write, publish, and read blogs on AI/ML trends, breakthroughs, and personal experiences",
    },
    {
      icon: faGraduationCap,
      title: "LMS",
      description:
        "Access curated courses, research papers, and hands-on workbooks to sharpen your skills",
    },
    {
      icon: faTrophy,
      title: "Quizzes & Rankings",
      description:
        "Challenge yourself with quizzes and climb the leaderboard to showcase your expertise",
    },
  ];

  // Custom arrow components for react-slick
  const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} custom-arrow next-arrow`}
        style={{ ...style, display: "block", right: "10px", zIndex: 1 }}
        onClick={onClick}
      ></div>
    );
  };

  const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} custom-arrow prev-arrow`}
        style={{ ...style, display: "block", left: "10px", zIndex: 1 }}
        onClick={onClick}
      ></div>
    );
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: (dots) => (
      <div
        style={{
          borderRadius: "10px",
          padding: "10px",
          bottom: "-40px",
        }}
      >
        <ul style={{ margin: "0px" }}> {dots} </ul>
      </div>
    ),
    customPaging: (i) => (
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: "#3b82f6",
          opacity: "0.5",
        }}
      ></div>
    ),
  };

  // Community images array
  const communityImages = [
    images.us4,
    images.us10,
    images.us11,
    images.us12,
    images.us13,
    images.us14,
    images.us15,
    images.us16,
    images.us17,
  ];

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetchData(
          "home/getHomePageContent",
          "GET",
          {},
          { "Content-Type": "application/json" }
        );

        console.log("hoem page discussion", response);

        if (response?.success) {
          setHomeData(response.data);
        } else {
          const errorMsg = response?.message || "Please Reload the Page";
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load homepage";
        setError(errorMsg);
        Swal.fire("Error", errorMsg, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-blue-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-blue-500 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Error loading content</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userToken) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-black to-blue-500">
        <ParallaxSection data={homeData?.parallax} />
        <ContentSection data={homeData?.content} />
        <CommunityHighlights />
      </div>
    );
  }

  // SWAPPED: Show public landing page when user IS logged in (has token)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-DGXblue to-DGXgreen opacity-50"></div>
        </div>

        <div className="w-full px-6 md:py-32 lg:px-8 relative z-10 bg-DGXblue text-white">
          <motion.div
            className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <motion.p
                className="inline-block px-4 py-2 mb-4 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome to DGX Community
              </motion.p>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                variants={itemVariants}
              >
                Accelerate Your{" "}
                <span className="text-[#08B4E9]">AI Journey</span> With Us
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg"
                variants={itemVariants}
              >
                Your one-stop hub to connect, learn, and grow in AI & ML.
                Explore discussions, dive into resources, test your skills, and
                be part of a thriving innovation network.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={itemVariants}
              >
                {/* <Link 
                  to="/learn-more" 
                  className="px-6 py-3 bg-transparent border-2 border-white hover:bg-white/10 rounded-lg font-medium transition-colors duration-300 text-center"
                >
                  Learn More
                </Link> */}
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              {/* Use the 3D model here */}
              <HeroModel />

              {/* <motion.div
                className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0.4, 0.7],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut",
                }}
              /> */}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
              variants={itemVariants}
            >
              Explore What We Offer
            </motion.h2>
            <motion.p
              className="max-w-3xl mx-auto text-gray-600 text-lg"
              variants={itemVariants}
            >
              From learning to competing, find everything you need to accelerate
              your AI/ML journey
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.1, type: "spring" },
                  },
                }}
                whileHover={{ y: -5 }}
              >
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <FontAwesomeIcon
                    icon={feature.icon}
                    className="text-blue-600 text-xl"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Highlights */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="flex flex-col lg:flex-row items-center lg:items-start gap-12" // 👈 Image on top for mobile
          >
            {/* Image Section */}
            <motion.div className="w-full lg:w-1/2" variants={slideInFromLeft}>
              <div className="relative rounded-xl overflow-hidden shadow-xl">
                <Slider {...sliderSettings}>
                  {communityImages.map((image, index) => (
                    <div key={index} className="outline-none">
                      <img
                        src={image}
                        alt={`Community highlight ${index + 1}`}
                        className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-xl"
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            </motion.div>

            {/* Text Section */}
            <motion.div
              className="w-full lg:w-1/2 text-center lg:text-left px-1"
              variants={slideInFromRight}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-snug">
                Join Our{" "}
                <span className="text-blue-600">Growing Community</span>
              </h2>

              <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
                Connect with thousands of AI enthusiasts, researchers, and
                professionals.
              </p>

              <div className="space-y-6">
                {/* Feature 1 */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:text-left text-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0 self-center sm:self-start">
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="text-blue-600 text-xl"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Expert Network
                    </h3>
                    <p className="text-gray-600">
                      Connect with AI/ML professionals, mentors, and learners
                      worldwide.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:text-left text-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0 self-center sm:self-start">
                    <FontAwesomeIcon
                      icon={faComment}
                      className="text-blue-600 text-xl"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Discussion Forums
                    </h3>
                    <p className="text-gray-600">
                      Dive into topic-focused conversations that matter.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:text-left text-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0 self-center sm:self-start">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="text-blue-600 text-xl"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Regular Events
                    </h3>
                    <p className="text-gray-600">
                      Stay updated with workshops, webinars, and AI conferences.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Text Parallax Section */}
      <TextParallaxContent />
    </div>
  );
};

export default Home;

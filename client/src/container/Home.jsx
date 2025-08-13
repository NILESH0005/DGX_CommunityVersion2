import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowRight, 
  faLightbulb, 
  faUsers, 
  faRocket, 
  faChartLine,
  faComment,
  faCalendarAlt
} from "@fortawesome/free-solid-svg-icons";
import ApiContext from "../context/ApiContext";
import images from "../constant/images.js";
import Swal from "sweetalert2";
import { TextParallax } from "../component/TextParallax.jsx";
import ParallaxSection from "../component/ParallaxSection";
import ContentSection from "../component/ContentSection";
import CommunityHighlights from "../component/CommunityHighlights";

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
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
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
        delay: 0.2
      }
    }
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
        delay: 0.2
      }
    }
  };

  const features = [
    {
      icon: faLightbulb,
      title: "Innovative Solutions",
      description: "Cutting-edge AI tools and resources to power your projects"
    },
    {
      icon: faUsers,
      title: "Collaborative Community",
      description: "Connect with like-minded professionals and researchers"
    },
    {
      icon: faRocket,
      title: "Rapid Development",
      description: "Accelerate your AI projects with our powerful infrastructure"
    },
    {
      icon: faChartLine,
      title: "Performance Metrics",
      description: "Track and optimize your models with advanced analytics"
    }
  ];

  const testimonials = [
    {
      name: "Anubhav Patrick",
      role: "AI Researcher",
      quote: "The DGX community has transformed how I approach machine learning problems.",
      image: images.us1
    },
    {
      name: "Sugandh Gupta",
      role: "AI Researcher",
      quote: "The resources and support available through this platform have been instrumental.",
      image: images.us2
    },
    {
      name: "xyz",
      role: "PhD Candidate",
      quote: "Being part of this community has opened doors to research opportunities.",
      image: images.us3
    }
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

  if (userToken) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-black to-blue-500">
        
        <ParallaxSection data={homeData?.parallax} />
        <ContentSection data={homeData?.content} />
        <CommunityHighlights />
      </div>
    );
  }

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
                Welcome to the future of AI
              </motion.p>
              
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                variants={itemVariants}
              >
                Accelerate Your <span className="text-blue-300">AI Journey</span> With Us
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg"
                variants={itemVariants}
              >
                Join a vibrant community of researchers, developers, and innovators pushing the boundaries of artificial intelligence.
              </motion.p>
              
              <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
                <Link 
                  to="/SignInn" 
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors duration-300 text-center"
                >
                  Get Started <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </Link>
                <Link 
                  to="/learn-more" 
                  className="px-6 py-3 bg-transparent border-2 border-white hover:bg-white/10 rounded-lg font-medium transition-colors duration-300 text-center"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <img 
                src={images.HeroImg} 
                alt="AI Illustration" 
                className="w-full max-w-3xl h-[350px] mx-auto rounded-xl shadow-2xl"
              />
              <motion.div 
                className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0.4, 0.7]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut"
                }}
              />
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
            <motion.p 
              className="text-blue-600 font-semibold mb-4"
              variants={itemVariants}
            >
              WHY CHOOSE US
            </motion.p>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
              variants={itemVariants}
            >
              Powerful Features for <span className="text-blue-600">AI Innovation</span>
            </motion.h2>
            <motion.p 
              className="max-w-2xl mx-auto text-gray-600 text-lg"
              variants={itemVariants}
            >
              Our platform provides everything you need to develop, test, and deploy cutting-edge AI solutions.
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
                    transition: { delay: index * 0.1, type: "spring" }
                  }
                }}
                whileHover={{ y: -5 }}
              >
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={feature.icon} className="text-blue-600 text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Highlights */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="flex flex-col lg:flex-row items-center gap-12"
          >
            <motion.div 
              className="lg:w-1/2"
              variants={slideInFromLeft}
            >
              <img 
                src={images.us4} 
                alt="Community collaboration" 
                className="rounded-xl shadow-xl w-full"
              />
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              variants={slideInFromRight}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Join Our <span className="text-blue-600">Growing Community</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Connect with thousands of AI enthusiasts, researchers, and professionals from around the world.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Expert Network</h3>
                    <p className="text-gray-600">Access to leading AI researchers and professionals</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FontAwesomeIcon icon={faComment} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Discussion Forums</h3>
                    <p className="text-gray-600">Engage in meaningful conversations about AI</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Regular Events</h3>
                    <p className="text-gray-600">Workshops and networking events throughout the year</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Text Parallax Section */}
      <TextParallax />

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.p 
              className="text-blue-600 font-semibold mb-4"
              variants={itemVariants}
            >
              TESTIMONIALS
            </motion.p>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
              variants={itemVariants}
            >
              What Our <span className="text-blue-600">Community Says</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 rounded-xl p-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.2, type: "spring" }
                  }
                }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-blue-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
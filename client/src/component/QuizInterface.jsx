import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Brain,
  Trophy,
  Users,
  ArrowRight,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";
import ApiContext from "../context/ApiContext";
import Quiz from "./quiz/Quiz";
import images from "../../public/images.js";

const QuizInterface = () => {
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const navigate = useNavigate();
  const { userToken, user } = useContext(ApiContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Motivational quotes for carousel
  const motivationalQuotes = [
    {
      text: "Knowledge is power. Test yours and grow stronger!",
      author: "DGX Community",
      icon: Brain,
    },
    {
      text: "Every expert was once a beginner. Start your journey today!",
      author: "Learning Hub",
      icon: BookOpen,
    },
    {
      text: "Challenge yourself, compete with others, achieve greatness!",
      author: "Quiz Masters",
      icon: Trophy,
    },
    {
      text: "Join thousands of learners in our growing community!",
      author: "DGX Family",
      icon: Users,
    },
  ];

  useEffect(() => {
    if (userToken && user) {
      setIsLoggedIn(true);
      console.log(user);
    } else {
      setIsLoggedIn(false);
    }
  }, [user, userToken]);

  const handleStartQuiz = () => {
    if (!isLoggedIn) {
      Swal.fire({
        title: "Login Required",
        text: "Please log in to access quizzes and track your progress!",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Login Now",
        cancelButtonText: "Maybe Later",
        customClass: {
          popup: "rounded-xl",
          confirmButton: "rounded-lg px-6 py-2",
          cancelButton: "rounded-lg px-6 py-2",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/SignInn");
        }
      });
    } else {
      navigate("/QuizList");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Motivational Carousel Component
  const MotivationalCarousel = ({ quotes, autoPlayInterval = 4000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
      if (!isAutoPlaying) return;

      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }, [quotes.length, autoPlayInterval, isAutoPlaying]);

    const goToSlide = (index) => {
      setCurrentIndex(index);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const goToPrevious = () => {
      const newIndex =
        currentIndex === 0 ? quotes.length - 1 : currentIndex - 1;
      goToSlide(newIndex);
    };

    const goToNext = () => {
      const newIndex = (currentIndex + 1) % quotes.length;
      goToSlide(newIndex);
    };

    const slideVariants = {
      enter: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.9,
      }),
      center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
      },
      exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        scale: 0.9,
      }),
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset, velocity) => {
      return Math.abs(offset) * velocity;
    };

    return (
      <div className="relative max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait" custom={currentIndex}>
            <motion.div
              key={currentIndex}
              custom={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  goToNext();
                } else if (swipe > swipeConfidenceThreshold) {
                  goToPrevious();
                }
              }}
              className="py-12 px-8 cursor-grab active:cursor-grabbing"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-8 mx-4"
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="bg-gradient-to-r from-DGXgreen to-DGXblue p-4 rounded-full">
                    {(() => {
                      const IconComponent = quotes[currentIndex].icon;
                      return <IconComponent className="h-8 w-8 text-white" />;
                    })()}
                  </div>
                  <blockquote className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
                    "{quotes[currentIndex].text}"
                  </blockquote>
                  <cite className="text-sm text-gray-500 font-medium">
                    — {quotes[currentIndex].author}
                  </cite>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg border-0 z-10 rounded-full p-2"
          aria-label="Previous quote"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg border-0 z-10 rounded-full p-2"
          aria-label="Next quote"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="flex justify-center mt-8 space-x-2">
          {quotes.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-DGXgreen to-DGXblue scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to quote ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {showCreateQuiz ? (
        <Quiz onBack={() => setShowCreateQuiz(false)} />
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
            <div className="container mx-auto px-4 z-10">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20"
              >
                {/* Left Side - Text Content */}
                <motion.div
                  variants={itemVariants}
                  className="text-center lg:text-left space-y-8"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-4"
                  >
                    <motion.h1
                      className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-DGXgreen to-DGXblue bg-clip-text text-transparent leading-tight"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      WELCOME TO
                      <br />
                      <span className="text-6xl md:text-8xl text-DGXgreen">
                        QUIZ
                      </span>
                    </motion.h1>

                    <motion.p
                      variants={itemVariants}
                      className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                    >
                      Unlock your potential through interactive learning.
                      Challenge yourself, compete with peers, and master new
                      skills in our gamified quiz environment.
                    </motion.p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button
                        onClick={handleStartQuiz}
                        className="bg-gradient-to-r from-DGXgreen to-DGXblue hover:from-DGXgreen/90 hover:to-DGXblue/90 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group flex items-center"
                      >
                        <Play className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        Start a Quiz
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-500"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span>Interactive Learning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>Achievement System</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <span>Community Driven</span>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Right Side - Illustration */}
                <motion.div
                  variants={itemVariants}
                  className="flex justify-center lg:justify-end"
                >
                  <motion.div
                    variants={floatingVariants}
                    animate="animate"
                    className="relative"
                  >
                    <div className="relative ">
                      <img
                        src={images.quiz}
                        alt="Quiz learning illustration"
                        className="object-contain drop-shadow-2xl rounded-lg w-full h-auto"
                      />

                      {/* Floating Elements */}
                      <motion.div
                        className="absolute -top-4 -right-4 bg-DGXblue text-white p-3 rounded-full shadow-lg"
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Brain className="h-6 w-6" />
                      </motion.div>

                      <motion.div
                        className="absolute -bottom-4 -left-4 bg-yellow-500 text-white p-3 rounded-full shadow-lg"
                        animate={{
                          rotate: [360, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 2,
                        }}
                      >
                        <Trophy className="h-6 w-6" />
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
          </section>

          {/* Motivational Carousel Section */}
          <section className="py-20 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src={images.quiz}
                  alt="Learning background"
                  className="object-cover w-full h-full opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-DGXgreen/20 to-DGXblue/20 " />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-DGXblue-800 mt-20 mb-4">
                  Join the Learning Revolution
                </h2>
                <p className="text-2xl text-DGXgreen-700  mx-auto">
                  Be inspired by our community's journey towards knowledge and
                  excellence
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto"
              >
                <MotivationalCarousel quotes={motivationalQuotes} />
              </motion.div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default QuizInterface;

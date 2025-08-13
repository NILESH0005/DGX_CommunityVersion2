import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Map from "../constant/Map.jsx";
import Swal from "sweetalert2";
import { useContext } from "react";
import ApiContext from "../context/ApiContext.jsx";

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

const formFieldVariants = {
  focus: {
    scale: 1.02,
    boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
  },
};

const ContactUs = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);
  const [contactDetails, setContactDetails] = useState({
    address: "Loading...",
    email: "Loading...",
    phone: "Loading...",
    working_hours: "Loading...",
    map_embed_code: "",
  });
  const [hasFetched, setHasFetched] = useState(false); // New state to track if fetch has been attempted

  const [contactInfoRef, contactInfoInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [formRef, formInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [mapRef, mapInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchContactDetails = async () => {
      if (hasFetched) return; // Don't fetch if we've already attempted

      try {
        setLoading(true);
        setApiError(null);

        const endpoint = "contactUs/getContactDetails";
        const method = "GET";
        const headers = {
          "Content-Type": "application/json",
        };

        const response = await fetchData(endpoint, method, headers);

        if (!response) {
          throw new Error("No response received from server");
        }
        
        if (response.success) {
          const { data } = response;
          
          // Extract the iframe URL from the embed code
          let mapEmbedUrl = "";
          if (data.map_embed_code) {
            // Handle both iframe tag and direct URL
            if (data.map_embed_code.includes('<iframe')) {
              const srcMatch = data.map_embed_code.match(/src=['"]([^'"]*)['"]/);
              mapEmbedUrl = srcMatch ? srcMatch[1] : "";
            } else {
              // If it's already a URL, use it directly
              mapEmbedUrl = data.map_embed_code;
            }
          }
          
          setContactDetails({
            address: data.address || "Not available",
            email: data.email || "Not available",
            phone: data.phone || "Not available",
            working_hours: data.working_hours || "Not available",
            map_embed_code: mapEmbedUrl,
          });
        } else {
          throw new Error(
            response.message || "Failed to fetch contact details"
          );
        }
      } catch (error) {
        setApiError(error.message || "Failed to load contact information");
        setContactDetails({
          address: "Information not available",
          email: "Information not available",
          phone: "Information not available",
          working_hours: "Information not available",
          map_embed_code: "",
        });
      } finally {
        setLoading(false);
        setHasFetched(true); // Mark that we've attempted the fetch
      }
    };

    fetchContactDetails();
  }, [fetchData, userToken, hasFetched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = "user/sendContactEmail";
      const method = "POST";
      const body = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
      };
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken || "",
      };

      const data = await fetchData(endpoint, method, body, headers);

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Your message has been sent successfully!",
          showConfirmButton: false,
          timer: 2000,
          background: "#f8fafc",
          backdrop: `
                        rgba(0,0,0,0.4)
                        url("/images/nyan-cat.gif")
                        left top
                        no-repeat
                    `,
        });
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to send message",
        });
      }
    } catch (error) {
      // console.error("Error sending message:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      title: "Address",
      content: contactDetails.address,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-DGXgreen"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      title: "Email",
      content: contactDetails.email,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-DGXgreen"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Contact No",
      content: contactDetails.phone,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-DGXgreen"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
    },
    {
      title: "Working Hours",
      content: contactDetails.working_hours,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-DGXgreen"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

    return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <AnimatePresence>
        {loading ? (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-center h-screen"
          >
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="w-16 h-16 rounded-full border-4 border-DGXgreen border-t-transparent"
            />
          </motion.div>
        ) : (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg text-center"
              >
                {apiError}
              </motion.div>
            )}

            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Get in Touch
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Have questions or feedback? We'd love to hear from you. Reach
                out to us through any of the channels below.
              </p>
            </motion.div>

            <div className="container px-4 md:px-6">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="flex flex-wrap">
                  <motion.div
                    ref={formRef}
                    initial={{ x: -50, opacity: 0 }}
                    animate={formInView ? { x: 0, opacity: 1 } : {}}
                    transition={{ type: "spring", stiffness: 60 }}
                    className="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-white to-gray-50"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      Send us a message
                    </h2>
                    <form onSubmit={handleSubmit}>
                      {[
                        {
                          name: "name",
                          type: "text",
                          placeholder: "Your Name",
                        },
                        {
                          name: "email",
                          type: "email",
                          placeholder: "Your Email Address",
                        },
                        {
                          name: "message",
                          type: "textarea",
                          placeholder: "Your Message",
                        },
                      ].map((field, idx) => (
                        <motion.div
                          key={idx}
                          className="relative mb-6"
                          whileHover={{ scale: 1.01 }}
                        >
                          {field.type !== "textarea" ? (
                            <>
                              <motion.input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                variants={formFieldVariants}
                                whileFocus="focus"
                                className={`peer w-full rounded-lg border-2 bg-transparent py-3 px-4 outline-none transition-all duration-200 ${
                                  errors[field.name]
                                    ? "border-red-500"
                                    : "border-gray-200 focus:border-DGXgreen"
                                }`}
                                placeholder={field.placeholder}
                              />
                              {errors[field.name] && (
                                <motion.p
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-1 text-sm text-red-500"
                                >
                                  {errors[field.name]}
                                </motion.p>
                              )}
                            </>
                          ) : (
                            <>
                              <motion.textarea
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                variants={formFieldVariants}
                                whileFocus="focus"
                                className={`peer w-full rounded-lg border-2 bg-transparent py-3 px-4 outline-none transition-all duration-200 ${
                                  errors[field.name]
                                    ? "border-red-500"
                                    : "border-gray-200 focus:border-DGXgreen"
                                }`}
                                rows="4"
                                placeholder={field.placeholder}
                              ></motion.textarea>
                              {errors[field.name] && (
                                <motion.p
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-1 text-sm text-red-500"
                                >
                                  {errors[field.name]}
                                </motion.p>
                              )}
                            </>
                          )}
                        </motion.div>
                      ))}
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full rounded-lg bg-gradient-to-r from-DGXgreen to-DGXblue text-white px-6 py-3 font-medium uppercase text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Sending...
                          </span>
                        ) : (
                          <span>Send Message</span>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>

                  <motion.div
                    ref={contactInfoRef}
                    initial={{ x: 50, opacity: 0 }}
                    animate={contactInfoInView ? { x: 0, opacity: 1 } : {}}
                    transition={{ type: "spring", stiffness: 60 }}
                    className="w-full md:w-1/2 p-8 md:p-12 bg-gray-50"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      Contact Information
                    </h2>
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate={contactInfoInView ? "visible" : "hidden"}
                      className="space-y-8"
                    >
                      {contactInfo.map((info, idx) => (
                        <motion.div
                          key={idx}
                          variants={itemVariants}
                          whileHover={{ x: 5 }}
                          className="flex items-start"
                        >
                          <div className="flex-shrink-0 mr-4 mt-1">
                            {info.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {info.title}
                            </h3>
                            <p className="text-gray-600">{info.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>

            <motion.div
              ref={mapRef}
              initial={{ opacity: 0, y: 50 }}
              animate={mapInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="mt-16 px-4 md:px-6"
            >
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Find Us on Map
                  </h2>
                  <div className="relative h-96 w-full overflow-hidden rounded-lg border border-gray-200">
                    <Map 
                      mapEmbedUrl={contactDetails.map_embed_code} 
                      contactDetails={contactDetails}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactUs;
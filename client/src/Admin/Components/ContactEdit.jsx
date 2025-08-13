import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import ApiContext from "../../context/ApiContext.jsx";
import { useNavigate } from "react-router-dom";

const EditContactUs = () => {
  const [formData, setFormData] = useState({
    address: "",
    email: "",
    phone: "",
    working_hours: "",
    map_embed_code: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchData, userToken } = useContext(ApiContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const response = await fetchData(
          "contactUs/getContactDetails",
          "GET",
       
          {
            "Content-Type": "application/json",
            "auth-token": userToken || "",
          }
        );

        if (!response || typeof response !== "object") {
          throw new Error("Invalid response format");
        }

        if (response.success) {
          const latestContact = Array.isArray(response.data) 
            ? response.data[0] 
            : response.data;
            
          setFormData({
            address: latestContact?.address || "",
            email: latestContact?.email || "",
            phone: latestContact?.phone || "",
            working_hours: latestContact?.working_hours || "",
            map_embed_code: latestContact?.map_embed_code || "",
          });
        } else {
          throw new Error(response.message || "Failed to load contact details");
        }
      } catch (error) {
        // console.error("Error fetching contact details:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to load contact details",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactDetails();
  }, [fetchData, userToken]);

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

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.working_hours.trim()) {
      newErrors.working_hours = "Working hours are required";
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
      const endpoint = "contactUs/updateContactDetails";
      const method = "POST";
      const body = {
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        working_hours: formData.working_hours,
        map_embed_code: formData.map_embed_code,
      };
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken || "",
      };

      const response = await fetchData(endpoint, method, body, headers);

      if (!response) {
        throw new Error("No response received from server");
      }

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Contact details updated successfully!",
          showConfirmButton: false,
          timer: 2000,
          background: "#f8fafc",
        });
        // Removed the navigation here
      } else {
        throw new Error(response.message || "Failed to update contact details");
      }
    } catch (error) {
      // console.error("Error updating contact details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong. Please try again.",
        background: "#f8fafc",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Form Title */}
          <motion.div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Edit Contact Information
            </h1>
          </motion.div>

          {/* Form Container */}
          <motion.div className="bg-white rounded-xl shadow-2xl overflow-hidden p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Address Field */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 bg-transparent outline-none transition-all duration-200 ${
                      errors.address
                        ? "border-red-500"
                        : "border-gray-200 focus:border-DGXgreen"
                    }`}
                    required
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 bg-transparent outline-none transition-all duration-200 ${
                      errors.email
                        ? "border-red-500"
                        : "border-gray-200 focus:border-DGXgreen"
                    }`}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 bg-transparent outline-none transition-all duration-200 ${
                      errors.phone
                        ? "border-red-500"
                        : "border-gray-200 focus:border-DGXgreen"
                    }`}
                    required
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Working Hours Field */}
                <div>
                  <label
                    htmlFor="working_hours"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Working Hours *
                  </label>
                  <input
                    type="text"
                    id="working_hours"
                    name="working_hours"
                    value={formData.working_hours}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 bg-transparent outline-none transition-all duration-200 ${
                      errors.working_hours
                        ? "border-red-500"
                        : "border-gray-200 focus:border-DGXgreen"
                    }`}
                    required
                  />
                  {errors.working_hours && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.working_hours}
                    </p>
                  )}
                </div>

                {/* Map Embed Code Field */}
                <div>
                  <label
                    htmlFor="map_embed_code"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Map Embed Code (iframe)
                  </label>
                  <textarea
                    id="map_embed_code"
                    name="map_embed_code"
                    rows="6"
                    value={formData.map_embed_code}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 bg-transparent outline-none transition-all duration-200 font-mono text-sm ${
                      errors.map_embed_code
                        ? "border-red-500"
                        : "border-gray-200 focus:border-DGXgreen"
                    }`}
                    placeholder="Paste your iframe embed code here..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Paste the full iframe code from Google Maps or other
                    mapping service.
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6">
                  {/* <button
                    type="button"
                    onClick={() => navigate("/contact-us")}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button> */}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-DGXgreen to-DGXblue text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-70"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update Contact Details"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EditContactUs;
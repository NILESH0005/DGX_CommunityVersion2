/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  validateConfirmPassword as confirmPassword,
  validatePassword,
  validateRequired,
} from "../utils/formValidation.js";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";
import { FaEyeLowVision } from "react-icons/fa6";
import ApiContext from "../context/ApiContext.jsx";
import { decrypt } from "../utils/decrypt.js";
import LoadPage from "./LoadPage.jsx";
import Swal from "sweetalert2";
import { images } from '../../public/index.js'; // Added missing import

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(true);
  const { fetchData } = useContext(ApiContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [referCode, setReferCode] = useState("");

  // Validation states for real-time feedback
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    collegeName: "",
    contactNumber: "",
    designation: "",
    category: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [fieldTouched, setFieldTouched] = useState({
    username: false,
    collegeName: false,
    contactNumber: false,
    designation: false,
    category: false,
    newPassword: false,
    confirmPassword: false,
  });

  const urlExtract = async () => {
    const params = new URLSearchParams(location.search);
    const encryptedEmail = params.get("email");
    const encryptedReferCode = params.get("refercode");

    if (encryptedEmail && encryptedReferCode) {
      const decryptedEmail = await decrypt(encryptedEmail);
      console.log("decryptedEmail is", decryptedEmail);

      const decryptedReferCode = await decrypt(encryptedReferCode);

      if (decryptedEmail && decryptedReferCode) {
        setEmail(decryptedEmail);
        setReferCode(decryptedReferCode);
        setEmailLoading(false);
      } else {
        navigate("/404");
      }
    } else {
      navigate("/404");
    }
  };

  useEffect(() => {
    urlExtract();
  }, [location, navigate]);

  const [formData, setFormData] = useState({
    username: "",
    collegeName: "",
    contactNumber: "",
    designation: "",
    category: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [messages, setMessages] = useState({
    number: false,
    specialChar: false,
    uppercase: false,
    lowercase: false,
    length: false,
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "username":
        if (!value.trim()) {
          error = "Name is required";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters long";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "Name should only contain letters and spaces";
        }
        break;

      case "collegeName":
        if (!value.trim()) {
          error = "College name is required";
        } else if (value.trim().length < 3) {
          error = "College name must be at least 3 characters long";
        }
        break;

      case "contactNumber":
        if (!value.trim()) {
          error = "Contact number is required";
        } else if (!/^\d{10}$/.test(value.replace(/\D/g, ""))) {
          error = "Contact number must be 10 digits";
        }
        break;

      case "designation":
        if (!value.trim()) {
          error = "Designation is required";
        } else if (value.trim().length < 2) {
          error = "Designation must be at least 2 characters long";
        }
        break;

      case "category":
        if (!value) {
          error = "Please select a category";
        }
        break;

      case "newPassword":
        if (!value) {
          error = "Password is required";
        } else {
          const hasNumber = /\d/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
          const hasUppercase = /[A-Z]/.test(value);
          const hasLowercase = /[a-z]/.test(value);
          const hasValidLength = value.length >= 8;

          setMessages({
            number: !hasNumber,
            specialChar: !hasSpecialChar,
            uppercase: !hasUppercase,
            lowercase: !hasLowercase,
            length: !hasValidLength,
          });

          if (!hasValidLength) {
            error = "Password must be at least 8 characters long";
          } else if (!hasNumber || !hasSpecialChar || !hasUppercase || !hasLowercase) {
            error = "Password must meet all requirements";
          }
        }
        break;

      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== formData.newPassword) {
          error = "Passwords do not match";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Mark field as touched
    setFieldTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field in real-time
    const error = validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    // If confirming password, also revalidate confirm password
    if (name === "newPassword" && fieldTouched.confirmPassword) {
      const confirmError = validateField("confirmPassword", formData.confirmPassword);
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFieldTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    setFieldTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    const {
      newPassword,
      confirmPassword,
      username,
      collegeName,
      contactNumber,
      designation,
      category,
    } = formData;

    if (Object.values(messages).some((message) => message)) {
      Swal.fire({
        icon: "error",
        title: "Weak Password",
        text: "Password does not meet the required criteria.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Mismatch",
        text: "Passwords do not match.",
      });
      return;
    }

    const endpoint = "user/registration";
    const method = "POST";
    const body = {
      inviteCode: referCode,
      name: username,
      email: email,
      collegeName: collegeName,
      password: newPassword,
      phoneNumber: contactNumber,
      category: category,
      designation: designation,
    };

    setLoading(true);

    try {
      const data = await fetchData(endpoint, method, body);

      if (!data.success) {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Registration Error",
          text: data.message || "Error in Registration",
        });
        return;
      } else if (data.success) {
        setLoading(false);
        Swal.fire({
          icon: "success",
          title: "Registration Successful",
          text: "Registration done successfully. Go to login.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        setTimeout(() => {
          navigate("/SignInn");
        }, 3500);
      }
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong, try again.",
      });
      return;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  const errorVariants = {
    hidden: { opacity: 0, height: 0, y: -10 },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  const passwordRequirementVariants = {
    met: { color: "#10B981", scale: 1.05 },
    unmet: { color: "#EF4444", scale: 1 },
  };

  // Helper function to render input field with validation
  const renderInputField = (
    id,
    name,
    type,
    label,
    value,
    onChange,
    onBlur,
    placeholder = "",
    readOnly = false
  ) => {
    const hasError = fieldTouched[name] && validationErrors[name];
    const isValid = fieldTouched[name] && !validationErrors[name] && value;

    return (
      <motion.div variants={itemVariants} className="relative">
        <label className="text-DGXblack font-medium" htmlFor={id}>
          {label}
        </label>
        <div className="relative">
          <motion.input
            id={id}
            name={name}
            type={type}
            className={`block w-full px-4 py-3 mt-2 text-DGXgray bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
              hasError
                ? "border-red-500 focus:border-red-500"
                : isValid
                ? "border-green-500 focus:border-green-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            readOnly={readOnly}
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          {isValid && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-1"
            >
              <FaCheck className="text-green-500" />
            </motion.div>
          )}
          {hasError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-1"
            >
              <FaTimes className="text-red-500" />
            </motion.div>
          )}
        </div>
        <AnimatePresence>
          {hasError && (
            <motion.div
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-red-500 text-sm mt-1 font-medium"
            >
              {validationErrors[name]}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (emailLoading) {
    return <LoadPage />;
  }

  return loading ? (
    <LoadPage />
  ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="my-8 px-4"
    >
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl p-8 mx-auto bg-DGXwhite rounded-2xl shadow-2xl border border-DGXgreen"
      >
        <motion.h1
          variants={itemVariants}
          className="text-2xl md:text-3xl font-bold text-DGXblack capitalize text-center mb-8"
        >
          Welcome to the{" "}
          <motion.span
            className="text-DGXgreen"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            DGX Community
          </motion.span>
        </motion.h1>

        <form onSubmit={handleSubmit}>
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
          >
            {/* Left Column */}
            <motion.div variants={itemVariants} className="space-y-6">
              {renderInputField(
                "username",
                "username",
                "text",
                "Full Name",
                formData.username,
                handleChange,
                handleBlur,
                "Enter your full name"
              )}

              {renderInputField(
                "collegeName",
                "collegeName",
                "text",
                "College Name",
                formData.collegeName,
                handleChange,
                handleBlur,
                "Enter your college name"
              )}

              {renderInputField(
                "contactNumber",
                "contactNumber",
                "tel",
                "Contact Number",
                formData.contactNumber,
                handleChange,
                handleBlur,
                "Enter 10-digit mobile number"
              )}

              {renderInputField(
                "designation",
                "designation",
                "text",
                "Designation",
                formData.designation,
                handleChange,
                handleBlur,
                "Enter your designation"
              )}
            </motion.div>

            {/* Right Column */}
            <motion.div variants={itemVariants} className="space-y-6">
              {renderInputField(
                "email",
                "email",
                "email",
                "Email Address",
                email,
                () => {},
                () => {},
                "",
                true
              )}

              {/* Referral Code Field */}
              {renderInputField(
                "referralCode",
                "referralCode",
                "text",
                "Referral Code",
                referCode,
                () => {},
                () => {},
                "",
                true
              )}

              {/* Category Select */}
              <motion.div variants={itemVariants} className="relative">
                <label className="text-DGXblack font-medium" htmlFor="category">
                  Category
                </label>
                <motion.select
                  id="category"
                  name="category"
                  className={`block w-full px-4 py-3 mt-2 text-DGXgray bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                    fieldTouched.category && validationErrors.category
                      ? "border-red-500"
                      : fieldTouched.category && !validationErrors.category && formData.category
                      ? "border-green-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  value={formData.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="">Select a category</option>
                  <option value="S">Student</option>
                  <option value="F">Faculty</option>
                </motion.select>
                <AnimatePresence>
                  {fieldTouched.category && validationErrors.category && (
                    <motion.div
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="text-red-500 text-sm mt-1 font-medium"
                    >
                      {validationErrors.category}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants} className="relative">
                <label className="text-DGXblack font-medium" htmlFor="newPassword">
                  Create Password
                </label>
                <div className="relative">
                  <motion.input
                    id="newPassword"
                    name="newPassword"
                    type={passwordVisible ? "text" : "password"}
                    className={`block w-full px-4 py-3 pr-12 mt-2 text-DGXgray bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                      fieldTouched.newPassword && validationErrors.newPassword
                        ? "border-red-500"
                        : fieldTouched.newPassword && !validationErrors.newPassword && formData.newPassword
                        ? "border-green-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    value={formData.newPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Create a strong password"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-1 text-DGXgreen focus:outline-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {passwordVisible ? <FaEye /> : <FaEyeLowVision />}
                  </motion.button>
                </div>

                {/* Password Requirements */}
                {formData.newPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-xs space-y-1">
                      <motion.div
                        animate={messages.length ? "unmet" : "met"}
                        variants={passwordRequirementVariants}
                        className="flex items-center gap-2"
                      >
                        {messages.length ? <FaTimes /> : <FaCheck />}
                        At least 8 characters
                      </motion.div>
                      <motion.div
                        animate={messages.uppercase ? "unmet" : "met"}
                        variants={passwordRequirementVariants}
                        className="flex items-center gap-2"
                      >
                        {messages.uppercase ? <FaTimes /> : <FaCheck />}
                        One uppercase letter
                      </motion.div>
                      <motion.div
                        animate={messages.lowercase ? "unmet" : "met"}
                        variants={passwordRequirementVariants}
                        className="flex items-center gap-2"
                      >
                        {messages.lowercase ? <FaTimes /> : <FaCheck />}
                        One lowercase letter
                      </motion.div>
                      <motion.div
                        animate={messages.number ? "unmet" : "met"}
                        variants={passwordRequirementVariants}
                        className="flex items-center gap-2"
                      >
                        {messages.number ? <FaTimes /> : <FaCheck />}
                        One number
                      </motion.div>
                      <motion.div
                        animate={messages.specialChar ? "unmet" : "met"}
                        variants={passwordRequirementVariants}
                        className="flex items-center gap-2"
                      >
                        {messages.specialChar ? <FaTimes /> : <FaCheck />}
                        One special character
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                <AnimatePresence>
                  {fieldTouched.newPassword && validationErrors.newPassword && (
                    <motion.div
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="text-red-500 text-sm mt-1 font-medium"
                    >
                      {validationErrors.newPassword}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div variants={itemVariants} className="relative">
                <label className="text-DGXblack font-medium" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <motion.input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={confirmPasswordVisible ? "text" : "password"}
                    className={`block w-full px-4 py-3 pr-12 mt-2 text-DGXgray bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                      fieldTouched.confirmPassword && validationErrors.confirmPassword
                        ? "border-red-500"
                        : fieldTouched.confirmPassword && !validationErrors.confirmPassword && formData.confirmPassword
                        ? "border-green-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm your password"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-1 text-DGXgreen focus:outline-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {confirmPasswordVisible ? <FaEye /> : <FaEyeLowVision />}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {fieldTouched.confirmPassword && validationErrors.confirmPassword && (
                    <motion.div
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="text-red-500 text-sm mt-1 font-medium"
                    >
                      {validationErrors.confirmPassword}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex justify-center mt-8"
          >
            <motion.button
              type="submit"
              className="px-8 py-3 text-lg font-semibold text-white bg-DGXgreen rounded-lg shadow-lg hover:bg-DGXblue focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-200"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={Object.values(validationErrors).some((error) => error !== "")}
            >
              Register Now
            </motion.button>
          </motion.div>
        </form>
      </motion.section>
    </motion.div>
  );
};

export default Register;
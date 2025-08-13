import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import images from "../../public/images.js";
import { FaEye } from "react-icons/fa";
import { FaEyeLowVision } from "react-icons/fa6";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import ApiContext from "../context/ApiContext.jsx";
import LoadPage from "./LoadPage.jsx";
import { validateRequired } from "../utils/formValidation.js";
import { motion } from "framer-motion";

const SignIn = () => {
  const { fetchData, logIn, userToken } = useContext(ApiContext);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    if (id === "username") {
      setUserID(value);
      // Clear error when user types
      if (errors.email) {
        setErrors({ ...errors, email: "" });
      }
    }
    if (id === "password") {
      setPassword(value);
      // Clear error when user types
      if (errors.password) {
        setErrors({ ...errors, password: "" });
      }
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!userID.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(userID)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const showAutoCloseAlert = (icon, title, text) => {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    const endpoint = "user/login";
    const method = "POST";
    const body = {
      email: userID,
      password: password,
    };
    setLoading(true);
    try {
      const data = await fetchData(endpoint, method, body);
      console.log("login response", data);
      if (!data.success) {
        setLoading(false);
        showAutoCloseAlert("error", "Login", data.message);
      } else {
        logIn(data.data.authtoken);
        setLoading(false);
        if (data.data.flag === 0) {
          navigate("/ChangePassword");
        } else if (data.data.isAdmin) {
          navigate("/AdminDashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      setLoading(false);
      showAutoCloseAlert("error", "Oops...", "Something went wrong. Please try again later.");
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  useEffect(() => {
    // Redirect if already logged in
    if (userToken) {
      navigate("/");
    }
  }, [userToken, navigate]);

  if (loading) return <LoadPage />;

  return (
    <div className="flex flex-col min-h-[500px] bg-gray-50 overflow-auto">
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row items-center justify-center bg-DGXblue rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Left Section - Visual */}
            <motion.div
              className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-DGXgreen to-DGXblue p-8 md:p-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="flex flex-col justify-center h-full">
                <motion.h2
                  className="text-4xl font-bold text-white mb-6"
                  initial={{ x: -50 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  Welcome Back!
                </motion.h2>
                <motion.p
                  className="text-xl text-blue-100 mb-8"
                  initial={{ x: -50 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  Sign in to access your DGX Community account and explore all
                  the features.
                </motion.p>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  <img
                    src={images.secure}
                    alt="Secure Login"
                    className="max-w-full h-auto object-contain"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Right Section - Form */}
            <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-10 bg-white">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="w-full max-w-md mx-auto"
              >
                <motion.div
                  className="text-center mb-6"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h1 className="text-3xl font-bold text-DGXblue mb-2">
                    Sign In
                  </h1>
                  <p className="text-gray-600">
                    Welcome to{" "}
                    <span className="text-DGXgreen font-semibold">
                      DGX Community
                    </span>
                  </p>
                </motion.div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-DGXblue mb-1"
                    >
                      Email address
                    </label>
                    <input
                      id="username"
                      type="text"
                      className={`w-full px-4 py-2 border ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-DGXgreen focus:border-transparent transition-all`}
                      onChange={handleInputChange}
                      value={userID}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="relative"
                  >
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-DGXblue mb-1"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type={passwordVisible ? "text" : "password"}
                      className={`w-full px-4 py-2 border ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-DGXgreen focus:border-transparent transition-all`}
                      onChange={handleInputChange}
                      value={password}
                      placeholder="Enter your password"
                    />
                    {errors.password && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.password}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-8 text-DGXgreen hover:text-DGXblue transition-colors"
                    >
                      {passwordVisible ? <FaEye /> : <FaEyeLowVision />}
                    </button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="flex justify-end"
                  >
                    <Link
                      to="/ForgotPassword"
                      className="text-sm font-medium text-DGXgreen hover:text-DGXblue transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-DGXgreen hover:bg-DGXblue text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-DGXgreen focus:ring-opacity-50"
                    >
                      Sign in
                    </button>
                  </motion.div>
                </form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  className="mt-4 text-center"
                >
                  <p className="text-sm text-gray-600">
                    Signing in for the first time?{" "}
                    <Link
                      to="/VerifyEmail"
                      className="font-medium text-DGXgreen hover:text-DGXblue transition-colors"
                    >
                      Verify here
                    </Link>
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
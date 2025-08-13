import React, { useState, useEffect, useContext } from "react";
import { images } from "../../public/index.js";
import { IoRefreshCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import generateCaptcha from "../utils/generateCaptcha.js";
import ApiContext from "../context/ApiContext.jsx";
import LoadPage from "./LoadPage.jsx";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const VerifyEmail = () => {
  const { fetchData } = useContext(ApiContext);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const navigate = useNavigate();

  const resetForm = async () => {
    setEmail("");
    setUserCaptcha("");
    setEmailError("");
    setCaptchaError("");
    await refreshCaptcha();
  };

  const refreshCaptcha = async () => {
    const newCaptcha = await generateCaptcha(6);
    setCaptcha(newCaptcha);
    setUserCaptcha("");
    setCaptchaError("");
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setCaptchaError("");

    if (userCaptcha !== captcha) {
      setCaptchaError("Please enter the correct captcha");
      showAutoCloseAlert(
        "warning",
        "Invalid Captcha",
        "Please enter the correct captcha."
      );
      await resetForm(); // Reset form after showing alert
      return;
    }

    if (!email) {
      setEmailError("Email is required");
      showAutoCloseAlert(
        "error",
        "Email Required",
        "Please enter your email address."
      );
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      showAutoCloseAlert(
        "error",
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    const endpoint = "user/verify";
    const method = "POST";
    const headers = { "Content-Type": "application/json" };
    const body = { email: email };

    setLoading(true);

    try {
      const data = await fetchData(endpoint, method, body, headers);
      if (!data.success) {
        // Check for specific message from API
        if (data.message === "Credentials already generated, go to login") {
          Swal.fire({
            icon: "info",
            title: "Already Registered",
            text: "Your credentials have already been generated. Please proceed to login.",
            showConfirmButton: true,
            confirmButtonText: "Go to Login",
          }).then(() => {
            navigate("/SignInn");
          });
        } else {
          showAutoCloseAlert(
            "error",
            "Invalid Email Address",
            data.message ||
              "The provided email address is not registered in our database. Please check and try again."
          );
        }
        await resetForm();
      } else if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Email Sent Successfully",
          text: "Please check your email for further instructions.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        }).then(() => {
          navigate("/SignInn");
        });
      }
    } catch (error) {
      showAutoCloseAlert("error", "Something Went Wrong", "Please try again.");
      await resetForm();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadPage />;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl mx-auto"
      >
        <div className="flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-xl">
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
                Verify Your Email
              </motion.h2>
              <motion.p
                className="text-xl text-blue-100 mb-8"
                initial={{ x: -50 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                Enter your email address to verify your account and receive a
                verification link.
              </motion.p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                <img
                  src={images.verifyImg}
                  alt="Email Verification"
                  className="max-w-full h-auto object-contain"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Right Section - Form */}
          <div
            className="
  w-full max-w-[600px]
  min-h-[300px] md:min-h-[400px]
  bg-white p-6 mx-auto
"
          >
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
                  Verify Email
                </h1>
                <p className="text-gray-600">
                  Please enter your email to verify your account
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-DGXblue mb-1"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    className={`w-full px-4 py-2 border ${
                      emailError ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-DGXgreen focus:border-transparent transition-all`}
                    id="email"
                    value={email}
                    onChange={handleChangeEmail}
                    placeholder="Enter your email"
                  />
                  {emailError && (
                    <div className="text-red-500 text-sm mt-1">
                      {emailError}
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  <label
                    htmlFor="userCaptcha"
                    className="block text-sm font-medium text-DGXblue mb-1"
                  >
                    Enter Captcha
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border ${
                      captchaError ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-DGXgreen focus:border-transparent transition-all`}
                    id="userCaptcha"
                    value={userCaptcha}
                    onChange={(e) => {
                      setUserCaptcha(e.target.value);
                      if (captchaError) setCaptchaError("");
                    }}
                    placeholder="Enter captcha"
                  />
                  {captchaError && (
                    <div className="text-red-500 text-sm mt-1">
                      {captchaError}
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-center"
                >
                  <div className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg tracking-widest select-none">
                    {captcha}
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="ml-3 p-2 text-DGXgreen hover:text-DGXblue rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Refresh captcha"
                  >
                    <IoRefreshCircleSharp className="text-3xl" />
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                >
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-DGXgreen hover:bg-DGXblue text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-DGXgreen focus:ring-opacity-50"
                  >
                    Verify Email
                  </button>
                </motion.div>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/SignInn")}
                    className="font-medium text-DGXgreen hover:text-DGXblue transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;

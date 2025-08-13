import React, { useState, useContext } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import ApiContext from '../context/ApiContext.jsx';
import { images } from '../../public/index.js';
import LoadPage from './LoadPage.jsx';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchData } = useContext(ApiContext);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      showAutoCloseAlert('warning', 'Missing Email', 'Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      showAutoCloseAlert('error', 'Invalid Email Address', 'Please enter a valid email address before proceeding.');
      return;
    }

    const endpoint = "user/passwordrecovery";
    const method = "POST";
    const body = { "email": email };

    setLoading(true);

    try {
      const data = await fetchData(endpoint, method, body);
      setLoading(false);

      if (!data.success) {
        showAutoCloseAlert('warning', 'Invalid Email Address', 'The email address entered does not match our records. Please verify and try again.');
        return;
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Password reset mail has been sent to your email!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        }).then(() => {
          navigate('/SignInn');
        });
      }
    } catch (error) {
      setLoading(false);
      showAutoCloseAlert('warning', 'Invalid Email Address', 'The email address entered does not match our records. Please verify and try again.');
    }
  };

  if (loading) return <LoadPage />;

  return (
    <div className="h-[700px] bg-gray-50 flex items-center justify-center p-4">
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
                Reset Your Password
              </motion.h2>
              <motion.p
                className="text-xl text-blue-100 mb-8"
                initial={{ x: -50 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                Enter your email address and we'll send you a link to reset your password.
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
                  Forgot Password
                </h1>
                <p className="text-gray-600">
                  Enter your email to reset your password
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
                    id="email"
                    type="text"
                    className={`w-full px-4 py-2 border ${
                      emailError ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-DGXgreen focus:border-transparent transition-all`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="Enter your email"
                  />
                  {emailError && (
                    <div className="text-red-500 text-sm mt-1">
                      {emailError}
                    </div>
                  )}
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
                    Send Reset Link
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
                  Remember your password?{" "}
                  <button
                    onClick={() => navigate('/SignInn')}
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

export default ForgotPassword;
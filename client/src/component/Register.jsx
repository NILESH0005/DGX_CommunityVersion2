/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect } from "react";
import { images } from '../../public/index.js';
import { useLocation, useNavigate } from "react-router-dom";
import { validateConfirmPassword as confirmPassword, validatePassword, validateRequired } from "../utils/formValidation.js";
import { FaEye } from "react-icons/fa";
import { FaEyeLowVision } from "react-icons/fa6";
import ApiContext from '../context/ApiContext.jsx';
import { decrypt } from "../utils/decrypt.js";
import LoadPage from "./LoadPage.jsx";
import Swal from "sweetalert2";


const Register = () => {
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(true);
  const { fetchData } = useContext(ApiContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [referCode, setReferCode] = useState('');

  const urlExtract = async () => {
    const params = new URLSearchParams(location.search);
    const encryptedEmail = params.get('email');
    const encryptedReferCode = params.get('refercode');

    if (encryptedEmail && encryptedReferCode) {
      const decryptedEmail = await decrypt(encryptedEmail);
      console.log("decryptedEmail is", decryptedEmail);

      const decryptedReferCode = await decrypt(encryptedReferCode);

      if (decryptedEmail && decryptedReferCode) {
        setEmail(decryptedEmail);
        // console.log(email)
        // console.log(decryptedEmail)
        setReferCode(decryptedReferCode);
        setEmailLoading(false);
        // console.log(referCode)
        // console.log(decryptedReferCode)
      } else {
        navigate('/404');
      }
    } else {
      navigate('/404');
    }
  }
  useEffect(() => {
    urlExtract()
  }, [location, navigate])

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
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);

  }

  const handleConfirmPassword = (e) => {
    const { id, name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // console.log(formData.confirmPassword);
    formData.confirmPassword = e.target.value
    confirmPassword(formData.newPassword, e.target.value, e.target)
  }

  const validateForm = (elements) => {
    const inputAndSelectElements = elements.filter(element =>
      element.tagName === 'INPUT' || element.tagName === 'SELECT'
    );
    inputAndSelectElements.forEach((formElemment) => {
      validateRequired(formElemment.id);
    })
    return document.querySelector('.is-invalid') === null;
  }

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "newPassword") {
      const inputValue = value;
      const passwordInput = document.getElementById(id);
      validatePassword(passwordInput, inputValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formElements = Array.from(e.target.elements);
    const isValid = validateForm(formElements);
    if (!isValid) {
      return
    }
    const { newPassword,
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

    // Add further form submission logic here (e.g., API call)

    const endpoint = "user/registration";
    const method = "POST"
    const body = {
      "inviteCode": referCode,
      "name": username,
      "email": email,
      "collegeName": collegeName,
      "password": newPassword,
      "phoneNumber": contactNumber,
      "category": category,
      "designation": designation
    }

    setLoading(true)

    try {

      const data = await fetchData(endpoint, method, body);

      if (!data.success) {
        setLoading(false)
        Swal.fire({
          icon: "error",
          title: "Registration Error",
          text: "Error in Registration",
        });
        return
      } else if (data.success) {
        setLoading(false)
        Swal.fire({
          icon: "success",
          title: "Registration Successful",
          text: "Registration done successfully. Go to login.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        setTimeout(() => {
          navigate('/SignInn');
        }, 3500);
      }
    } catch (error) {
      setLoading(false)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong, try again.",
      });
      return
    }

  };
  if (emailLoading) {
    return <LoadPage />; // Show loading indicator while email is being extracted
  }
  return (
    loading ? <LoadPage /> : <div className="my-8">
      <section className="max-w-4xl p-6 mx-auto bg-DGXwhite rounded-md shadow-2xl border border-DGXgreen ">
        <h1 className="text-xl font-bold text-DGXblack capitalize text-center ">
          Welcome to the <span className="text-DGXgreen">DGX Community</span>
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 sm:grid-cols-2">
            <div className="">
              <div>
                <label
                  className="text-DGXblack "
                  htmlFor="username"
                >
                  Name
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="block w-full px-4 py-2 mt-2 text-DGXgray bg-white border border-gray-300 rounded-md  focus:border-blue-500  focus:outline-none focus:ring"
                  value={formData.username}
                  onChange={handleChange}
                />
                <div id="usernameVerify" className="invalid-feedback"></div>
              </div>

              <div>
                <label
                  className="text-DGXblack "
                  htmlFor="collegeName"
                >
                  College Name
                </label>
                <input
                  id="collegeName"
                  name="collegeName"
                  type="text"
                  className="block w-full px-4 py-2 mt-2 text-DGXgray bg-white border border-gray-300 rounded-md  focus:border-blue-500  focus:outline-none focus:ring"
                  value={formData.collegeName}
                  onChange={handleChange}
                />
                <div id="collegeNameVerify" className="invalid-feedback"></div>
              </div>

            </div>

            <div className="flex justify-center items-center order-first md:order-none">
              <img src={images.robo} className="w-28" alt="robot" />
            </div>

            <div>
              <div>
                <label
                  className="text-DGXblack "
                  htmlFor="contactNumber"
                >
                  Contact Number
                </label>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="text"
                  className="block w-full px-4 py-2 mt-2 text-DGXgray bg-white border border-gray-300 rounded-md  focus:border-blue-500  focus:outline-none focus:ring"
                  value={formData.contactNumber}
                  onChange={handleChange}
                />
                <div id="contactNumberVerify" className="invalid-feedback"></div>
              </div>

              <div>
                <label
                  className="text-DGXblack "
                  htmlFor="designation"
                >
                  Designation
                </label>
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  className="block w-full px-4 py-2 mt-2 text-DGXgray bg-white border border-gray-300 rounded-md  focus:border-blue-500  focus:outline-none focus:ring"
                  value={formData.designation}
                  onChange={handleChange}
                />
                <div id="designationVerify" className="invalid-feedback"></div>
              </div>
              <div className="mt-4 relative">
                <label
                  className="text-DGXblack "
                  htmlFor="newPassword"
                >
                  Create Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  className="block w-full px-4 py-2 mt-2 text-DGXgray bg-white border border-gray-300 rounded-md  focus:border-blue-500  focus:outline-none focus:ring"
                  value={formData.newPassword}
                  onChange={handleChange}
                  type={passwordVisible ? "text" : "password"}
                />

                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex   items-center px-4 text-DGXgreen focus:outline-none mt-8">
                  {passwordVisible ? <FaEye />
                    : <FaEyeLowVision />}

                </button>


              </div>
              <div id="newPasswordVerify" className="invalid-feedback"></div>
            </div>

            <div>
              <div>
                <label
                  className="text-DGXblack "
                  htmlFor="email"
                >
                  Email Id
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="block w-full px-4 py-2 mt-2 text-DGXgray bg-white border border-gray-300 rounded-md  focus:border-blue-500  focus:outline-none focus:ring"
                  value={email}
                  readOnly
                // onChange={handleChange}
                />
                <div id="emailVerify"></div>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-row mb-4 space-x-2">
                  <div className="w-1/2">
                    <label className="text-DGXblack " htmlFor="category">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="block w-full px-4 py-2 mt-2 text-DGXgray bg-white border border-gray-300 rounded-md  focus:border-blue-500  focus:outline-none focus:ring"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select a category</option>
                      <option value="S">Student</option>
                      <option value="F">Faculty</option>
                      =
                    </select>
                    <div id="categoryVerify" className="invalid-feedback"></div>
                  </div>
                  <div className="w-1/2">
                    <label className="text-DGXblack " htmlFor="refralCode">
                      Refral Code
                    </label>
                    <input
                      id="refralCode"
                      name="refralCode"
                      type="text"
                      className="block w-full px-4 py-2 mt-2 text-DGXgray bg-white border border-gray-300 rounded-md  focus:border-blue-500  focus:outline-none focus:ring"
                      value={referCode}
                      // onChange={handleChange}
                      readOnly
                    />
                    <div id="refralCodeVerify" className="invalid-feedback"></div>
                  </div>
                </div>
              </div>

              <div className="  relative">
                <label
                  className="text-DGXblack "
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={confirmPasswordVisible ? "text" : "password"}
                  className="block w-full px-4 py-2 mt-2 text-DGXgray bg-white border border-gray-300 rounded-md  focus:border-blue-500  focus:outline-none focus:ring"
                  value={formData.confirmPassword}
                  // onChange={handleChange}
                  onChange={handleConfirmPassword}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex   items-center px-4 text-DGXgreen focus:outline-none mt-8">
                  {confirmPasswordVisible ? <FaEye />
                    : <FaEyeLowVision />}
                </button>
              </div>
              <div id="confirmPasswordVerify" className="invalid-feedback"></div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform  rounded-md hover:bg-DGXblue focus:outline-none bg-DGXgreen focus:bg-gray-600"
            >
              Register
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Register

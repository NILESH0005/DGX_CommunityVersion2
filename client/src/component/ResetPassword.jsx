import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ApiContext from "../context/ApiContext.jsx";
import { decrypt } from "../utils/decrypt.js";
import { images } from "../../public/index.js";
import Cookies from "js-cookie";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  validateConfirmPassword,
  validatePassword,
  validateRequired,
} from "../utils/formValidation.js";
import LoadPage from "./LoadPage.jsx";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const { fetchData, userToken, setUserToken } = useContext(ApiContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [email, setEmail] = useState("");
  const [signature, setSignature] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    number: false,
    specialChar: false,
    uppercase: false,
    lowercase: false,
  });
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (userToken != null && userToken !== undefined) {
      setIsLoggedIn(true);
      Cookies.remove("userToken");
      setUserToken(null);
    } else {
      setIsLoggedIn(false);
    }
  }, [userToken, setUserToken]);

  const urlExtract = async () => {
    const params = new URLSearchParams(location.search);
    const encryptedEmail = params.get("email");
    const encryptedReferCode = params.get("signature");

    if (encryptedEmail && encryptedReferCode) {
      const decryptedEmail = await decrypt(encryptedEmail);
      const decryptedSignature = await decrypt(encryptedReferCode);

      if (decryptedEmail && decryptedSignature) {
        setEmail(decryptedEmail);
        setSignature(decryptedSignature);
      } else {
        navigate("/404");
      }
    } else {
      navigate("/404");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setIsTyping(true);

    // Update password requirements state
    const requirements = {
      length: value.length >= 8,
      number: /\d/.test(value),
      specialChar: /[!@#$%^&*()_+={}\[\]:;<>,.?/~]/.test(value),
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
    };
    setPasswordRequirements(requirements);

    // Validate without showing duplicate message
    validatePassword(e.target, value);
  };

  const handleConfirmPassword = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    const match = newPassword === value;
    setPasswordsMatch(match);

    // Only show inline validation if passwords don't match
    if (value && !match) {
      validateConfirmPassword(newPassword, value, e.target);
    } else {
      const confirmPasswordVerify = document.getElementById(
        "confirmPasswordVerify"
      );
      if (confirmPasswordVerify) {
        confirmPasswordVerify.textContent = "";
      }
    }
  };

  const validateForm = (elements) => {
    const inputElements = elements.filter(
      (element) => element.tagName === "INPUT"
    );
    let isValid = true;

    inputElements.forEach((formElement) => {
      if (formElement.id === "password") {
        if (!Object.values(passwordRequirements).every(Boolean)) {
          validatePassword(formElement, formElement.value);
          isValid = false;
        }
      } else if (formElement.id === "confirmPassword") {
        if (formElement.value !== newPassword) {
          validateConfirmPassword(newPassword, formElement.value, formElement);
          isValid = false;
        }
      } else {
        validateRequired(formElement.id);
        if (formElement.classList.contains("is-invalid")) {
          isValid = false;
        }
      }
    });

    return isValid;
  };

  useEffect(() => {
    urlExtract();
  }, [location, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValid = validateForm(Array.from(event.target.elements));
    if (!isValid) {
      return;
    }

    const endpoint = "user/resetpassword";
    const method = "POST";
    const body = {
      email: email,
      signature: signature,
      password: newPassword,
    };

    setLoading(true);

    try {
      const data = await fetchData(endpoint, method, body);

      if (!data.success) {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error in Password Reset",
          text: "Something went wrong, please try again.",
        });
        return;
      } else if (data.success) {
        setLoading(false);
        Swal.fire({
          icon: "success",
          title: "Password Reset Successful",
          text: "Your password has been reset successfully. Please log in.",
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

  return loading ? (
    <LoadPage />
  ) : (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center relative">
      <div className="w-full lg:w-1/2 min-h-screen py-20 px-8 lg:rounded-r-3xl bg-DGXblue flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-xl mx-auto shadow-lg overflow-hidden bg-DGXwhite shadow-DGXgreen p-8">
            <h1 className="text-DGXblue text-3xl mb-6 font-bold text-center">
              Reset Password
            </h1>
            <form onSubmit={handleSubmit} className="w-full">
              <div className="mb-4 relative">
                <input
                  id="password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="border border-DGXgreen py-2 px-3 w-full rounded pr-10"
                  value={newPassword}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-[#4b5563]"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
                <div
                  id="passwordVerify"
                  className="text-sm mt-1 text-red-500"
                ></div>

                {/* Password Requirements List */}
                {isTyping && (
                  <div className="mt-2 text-sm">
                    <p className="font-medium">Password must contain:</p>
                    <ul className="space-y-1">
                      <li
                        className={
                          passwordRequirements.length
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {passwordRequirements.length ? "✓" : "✗"} At least 8
                        characters
                      </li>
                      <li
                        className={
                          passwordRequirements.number
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {passwordRequirements.number ? "✓" : "✗"} At least one
                        number
                      </li>
                      <li
                        className={
                          passwordRequirements.specialChar
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {passwordRequirements.specialChar ? "✓" : "✗"} At least
                        one special character
                      </li>
                      <li
                        className={
                          passwordRequirements.uppercase
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {passwordRequirements.uppercase ? "✓" : "✗"} At least
                        one uppercase letter
                      </li>
                      <li
                        className={
                          passwordRequirements.lowercase
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {passwordRequirements.lowercase ? "✓" : "✗"} At least
                        one lowercase letter
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="mb-4 relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className={`border ${
                    passwordsMatch ? "border-DGXgreen" : "border-red-500"
                  } py-2 px-3 w-full rounded pr-10`}
                  value={confirmPassword}
                  onChange={handleConfirmPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-[#4b5563]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
                <div
                  id="confirmPasswordVerify"
                  className="text-sm mt-1 text-red-500"
                ></div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full text-lg bg-DGXgreen rounded-full py-3 text-center font-medium text-DGXwhite"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="lg:w-1/2 hidden lg:flex justify-center items-center lg:pl-1">
        <img
          src={images.secure}
          alt="Background"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};

export default ResetPassword;

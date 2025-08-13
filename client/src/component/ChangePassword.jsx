import React, { useState, useContext } from 'react';
import { validatePassword, validateConfirmPassword } from "../utils/formValidation.js";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import ApiContext from '../context/ApiContext.jsx';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import LoadPage from './LoadPage.jsx';

const ChangePassword = () => {
    const { fetchData, userToken, setUserToken } = useContext(ApiContext);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [messages, setMessages] = useState({
        number: false,
        specialChar: false,
        uppercase: false,
        lowercase: false,
        length: false,
    });

    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const toggleOldPasswordVisibility = () => {
        setOldPasswordVisible(!oldPasswordVisible);
    };

    const toggleNewPasswordVisibility = () => {
        setNewPasswordVisible(!newPasswordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { oldPassword, newPassword, confirmPassword } = formData;

        const passwordValid =
            newPassword.length >= 8 &&
            /\d/.test(newPassword) &&
            /[!@#$%^&*()_+={}\[\]:;<>,.?/~]/.test(newPassword) &&
            /[A-Z]/.test(newPassword) &&
            /[a-z]/.test(newPassword);

        if (!passwordValid) {
            Swal.fire({
                icon: "error",
                title: "Weak Password",
                text: "Password does not meet the required criteria.",
                background: '#f3f4f6',
                confirmButtonColor: '#3b82f6',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Mismatch",
                text: "Passwords do not match.",
                background: '#f3f4f6',
                confirmButtonColor: '#3b82f6',
            });
            return;
        }

        const endpoint = "user/changePassword";
        const method = "POST";
        const body = {
            "currentPassword": oldPassword,
            "newPassword": newPassword
        };
        const headers = {
            'Content-Type': 'application/json',
            'auth-token': userToken
        };
        setLoading(true);

        try {
            const data = await fetchData(endpoint, method, body, headers);
            if (!data.success) {
                setLoading(false);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `Error in password change: ${data.message}`,
                    background: '#f3f4f6',
                    confirmButtonColor: '#3b82f6',
                });
            } else if (data.success) {
                setLoading(false);
                Swal.fire({
                    icon: "success",
                    title: "Password Changed",
                    text: "Password changed successfully. Log in again with new credentials.",
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    background: '#f3f4f6',
                });
                setTimeout(() => {
                    Cookies.remove('userToken');
                    setUserToken(null);
                    navigate('/SignInn');
                }, 3500);
            }
        } catch (error) {
            setLoading(false);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong, try again.",
                background: '#f3f4f6',
                confirmButtonColor: '#3b82f6',
            });
        }
    };

    const handleChange = (e) => {
        const { name, value, id } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));

        if (name === "newPassword") {
            setIsTyping(true);
            
            setMessages({
                number: /\d/.test(value),
                specialChar: /[!@#$%^&*()_+={}\[\]:;<>,.?/~]/.test(value),
                uppercase: /[A-Z]/.test(value),
                lowercase: /[a-z]/.test(value),
                length: value.length >= 8,
            });
            
            const passwordInput = document.getElementById(id);
            if (passwordInput) {
                validatePassword(passwordInput, value);
            }
        } else if (name === "confirmPassword") {
            const confirmPasswordInput = document.getElementById("confirmPassword");
            if (confirmPasswordInput) {
                validateConfirmPassword(formData.newPassword, value, confirmPasswordInput);
            }
        }
    };

    return (
        loading ? <LoadPage /> : 
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
                            <p className="text-gray-600 mt-2">Enter your current and new password</p>
                        </div>
                        
                        <form className="space-y-4">
                            {/* Current Password */}
                            <div className="relative">
                                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={oldPasswordVisible ? "text" : "password"}
                                        id="oldPassword"
                                        name="oldPassword"
                                        value={formData.oldPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleOldPasswordVisibility}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        aria-label={oldPasswordVisible ? "Hide password" : "Show password"}
                                    >
                                        {oldPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                                    </button>
                                </div>
                            </div>
                            
                            {/* New Password */}
                            <div className="relative">
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={newPasswordVisible ? "text" : "password"}
                                        id="newPassword"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleNewPasswordVisibility}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        aria-label={newPasswordVisible ? "Hide password" : "Show password"}
                                    >
                                        {newPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Confirm Password */}
                            <div className="relative">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={confirmPasswordVisible ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleConfirmPasswordVisibility}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        aria-label={confirmPasswordVisible ? "Hide password" : "Show password"}
                                    >
                                        {confirmPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Password Requirements */}
                            {isTyping && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Password must contain:</h4>
                                    <ul className="space-y-1 text-sm">
                                        <li className={`flex items-center ${messages.length ? 'text-green-500' : 'text-red-500'}`}>
                                            {messages.length ? '✓' : '✗'} At least 8 characters
                                        </li>
                                        <li className={`flex items-center ${messages.number ? 'text-green-500' : 'text-red-500'}`}>
                                            {messages.number ? '✓' : '✗'} At least one number
                                        </li>
                                        <li className={`flex items-center ${messages.specialChar ? 'text-green-500' : 'text-red-500'}`}>
                                            {messages.specialChar ? '✓' : '✗'} At least one special character
                                        </li>
                                        <li className={`flex items-center ${messages.uppercase ? 'text-green-500' : 'text-red-500'}`}>
                                            {messages.uppercase ? '✓' : '✗'} At least one uppercase letter
                                        </li>
                                        <li className={`flex items-center ${messages.lowercase ? 'text-green-500' : 'text-red-500'}`}>
                                            {messages.lowercase ? '✓' : '✗'} At least one lowercase letter
                                        </li>
                                    </ul>
                                </div>
                            )}
                            
                            {/* Submit Button */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="w-full py-2.5 px-4 bg-DGXblue hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Change Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
       
    );
};

export default ChangePassword;
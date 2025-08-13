import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";


const PersonalInfoSection = ({ user, userToken, fetchData }) => {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    Name: "",
    MobileNumber: "",
    EmailId: "",
    Designation: "",
    CollegeName: ""
  });

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setEditedData({
        Name: user.Name || "",
        MobileNumber: user.MobileNumber || "",
        EmailId: user.EmailId || "",
        Designation: user.Designation || "",
        CollegeName: user.CollegeName || ""
      });
    }
  }, [user]);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validateMobile = (mobile) => {
    return /^\d{10}$/.test(mobile);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData({
      Name: user.Name || "",
      MobileNumber: user.MobileNumber || "",
      EmailId: user.EmailId || "",
      Designation: user.Designation || "",
      CollegeName: user.CollegeName || ""
    });
  };

  const handleSaveChanges = async () => {
    // Validate required fields
    if (!editedData.Name || !editedData.EmailId || !editedData.MobileNumber || 
        !editedData.Designation || !editedData.CollegeName) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "All fields are required",
      });
      return;
    }

    // Validate email format
    if (!validateEmail(editedData.EmailId)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter a valid email address",
      });
      return;
    }

    // Validate mobile number
    if (!validateMobile(editedData.MobileNumber)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Mobile number must be 10 digits",
      });
      return;
    }

    const endpoint = "userprofile/updateUserDetails";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const response = await fetchData(endpoint, method, editedData, headers);
      
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.message || "Profile updated successfully!",
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          setIsEditing(false);
          // You might want to add a callback here to refresh user data
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to update profile",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong, try again.",
      });
    }
  };

  const handleReferralSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("Invalid email address");
      return;
    }

    setEmailError("");
    const endpoint = "user/sendinvite";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const response = await fetchData(endpoint, method, { email }, headers);
      
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Invite sent successfully!",
          timer: 2000,
          showConfirmButton: false
        });
        setEmail("");
        setShowEmailInput(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to send invite",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong, try again.",
      });
    }
  };

  const renderField = (label, fieldName) => {
    return (
      <div className="flex flex-col sm:flex-row justify-between py-2 border-b">
        <label className="font-bold sm:w-24">{label}</label>
        {isEditing ? (
          <input
            type={fieldName === "EmailId" ? "email" : "text"}
            name={fieldName}
            value={editedData[fieldName]}
            onChange={handleInputChange}
            className="flex-1 p-1 border border-DGXgreen rounded"
            required
          />
        ) : (
          <span className="text-DGXgray">{editedData[fieldName]}</span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-DGXwhite rounded-lg shadow-xl p-4 border border-DGXgreen">
      <div className="flex justify-between items-center">
        <h4 className="text-base md:text-lg lg:text-xl text-DGXblack font-bold">
          Personal Info
        </h4>
        {!isEditing ? (
          <button
            onClick={handleEditClick}
            className="px-3 py-1 bg-DGXgreen text-white rounded hover:bg-DGXdarkgreen transition-colors text-sm"
          >
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-3 py-1 bg-DGXgreen text-white rounded hover:bg-DGXdarkgreen transition-colors text-sm"
            >
              Save
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-3 space-y-2 text-sm text-DGXgray">
        {renderField("Full name", "Name")}
        {user.AddOnDt && (
          <div className="flex flex-col sm:flex-row justify-between py-2 border-b">
            <span className="font-bold sm:w-24">Joined</span>
            <span className="text-DGXgray">
              {new Date(user.AddOnDt).toLocaleDateString()}
            </span>
          </div>
        )}
        {renderField("Mobile", "MobileNumber")}
        {renderField("Email", "EmailId")}
        {renderField("Designation", "Designation")}
        {renderField("College Name", "CollegeName")}
        {user.ReferalNumberCount != null && (
          <div className="flex flex-col sm:flex-row justify-between py-2 border-b">
            <span className="font-bold sm:w-24">Refer Count Remaining</span>
            <span className="text-DGXgray">{user.ReferalNumberCount}</span>
          </div>
        )}
      </div>

      {/* Referral Section */}
      {!isEditing && (
        <div className="mt-4">
          <button
            className={`w-full px-4 py-2 bg-DGXgreen text-white rounded hover:bg-DGXdarkgreen transition-colors ${
              user.ReferalNumberCount === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => setShowEmailInput(true)}
            disabled={user.ReferalNumberCount === 0}
          >
            Refer
          </button>
          
          {showEmailInput && (
            <form onSubmit={handleReferralSubmit} className="mt-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 p-2 border border-DGXgreen rounded"
                  placeholder="Enter email address"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-DGXgreen text-white rounded hover:bg-DGXdarkgreen transition-colors"
                >
                  Submit
                </button>
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-500">{emailError}</p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalInfoSection;
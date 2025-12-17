import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const PersonalInfoSection = ({ user, userToken, fetchData, onProfileUpdate, setLocalUser }) => {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    Name: "",
    UserDescription: "",
    MobileNumber: "",
    EmailId: "",
    Designation: "",
    CollegeName: "",
  });

  useEffect(() => {
    if (user) {
      setEditedData({
        Name: user.Name || "",
        UserDescription: user.UserDescription || "",
        MobileNumber: user.MobileNumber || "",
        EmailId: user.EmailId || "",
        Designation: user.Designation || "",
        CollegeName: user.CollegeName || "",
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
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData({
      Name: user.Name || "",
      UserDescription: user.UserDescription || "",
      MobileNumber: user.MobileNumber || "",
      EmailId: user.EmailId || "",
      Designation: user.Designation || "",
      CollegeName: user.CollegeName || "",
    });
  };

  const handleSaveChanges = async () => {
    // Validate required fields
    if (
      !editedData.Name ||
      !editedData.EmailId ||
      !editedData.MobileNumber ||
      !editedData.Designation ||
      !editedData.CollegeName
    ) {
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

    const endpoint = "userProfile/updateUserDetails";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const response = await fetchData(
        endpoint,
        method,
        { ...editedData },
        headers
      );

      console.log("EditedData:", editedData);
      console.log("Response:", response);
      if (response.success) {
        // Update local user state immediately
        if (setLocalUser && user) {
          setLocalUser(prev => ({
            ...prev,
            ...editedData
          }));
        }
        
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.message || "Profile updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          setIsEditing(false);
          
          // Call the update function to refresh user data from server
          if (onProfileUpdate) {
            onProfileUpdate();
          }
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
          showConfirmButton: false,
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

  const renderField = (label, fieldName, type = "text") => {
    return (
      <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-gray-200">
        <label className="font-bold text-DGXblack sm:w-32">{label}</label>
        {isEditing ? (
          <div className="flex-1">
            <input
              type={type}
              name={fieldName}
              value={editedData[fieldName]}
              onChange={handleInputChange}
              className="w-full p-2 border border-DGXgreen rounded focus:outline-none focus:ring-2 focus:ring-DGXgreen"
              required={[
                "Name",
                "MobileNumber",
                "EmailId",
                "Designation",
                "CollegeName",
              ].includes(fieldName)}
            />
          </div>
        ) : (
          <span className="text-DGXgray flex-1 break-words">
            {editedData[fieldName] || "Not provided"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-bold text-DGXblack">
          Personal Information
        </h4>
      </div>

      <div className="mt-4 space-y-1 text-sm">
        {renderField("Full Name", "Name")}

        {user.AddOnDt && (
          <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-gray-200">
            <span className="font-bold text-DGXblack sm:w-32">Joined Date</span>
            <span className="text-DGXgray flex-1">
              {new Date(user.AddOnDt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}

        {renderField("Mobile", "MobileNumber", "tel")}
        {renderField("Email", "EmailId", "email")}
        {renderField("Designation", "Designation")}
        {renderField("College/Institution", "CollegeName")}

        {/* Enhanced Description field */}
        <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-gray-200">
          <label className="font-bold text-DGXblack sm:w-32">About Me</label>
          {isEditing ? (
            <div className="flex-1">
              <textarea
                name="UserDescription"
                value={editedData.UserDescription}
                onChange={handleInputChange}
                className="w-full p-2 border border-DGXgreen rounded focus:outline-none focus:ring-2 focus:ring-DGXgreen"
                rows={4}
                placeholder="Tell us about yourself, your background, interests, and expertise..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Share your professional background, research interests, teaching
                philosophy, or any other information you'd like others to know
                about you.
              </p>
            </div>
          ) : (
            <div className="flex-1">
              <p className="text-DGXgray whitespace-pre-wrap">
                {editedData.UserDescription ||
                  "No description provided yet. Click 'Edit Profile' to add information about yourself."}
              </p>
            </div>
          )}
        </div>

        {user.ReferalNumberCount != null && (
          <div className="flex flex-col sm:flex-row justify-between py-3 border-b border-gray-200">
            <span className="font-bold text-DGXblack sm:w-32">
              Referrals Remaining
            </span>
            <span className="text-DGXgray flex-1">
              {user.ReferalNumberCount}
            </span>
          </div>
        )}

        <div className="flex justify-end pt-3">
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="px-4 py-2 bg-DGXgreen  text-white rounded-md hover:bg-DGXdarkgreen transition-colors text-sm font-medium"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-DGXgreen text-white rounded-md hover:bg-DGXdarkgreen transition-colors text-sm font-medium"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Referral Section */}
      {!isEditing && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h5 className="font-medium text-DGXblack mb-2">Refer a Colleague</h5>
          <p className="text-sm text-DGXgray mb-3">
            Invite fellow educators or researchers to join our platform and
            expand our academic community.
          </p>

          <button
            className={`w-full px-4 py-2 bg-DGXgreen text-white rounded-md hover:bg-DGXdarkgreen transition-colors font-medium ${
              user.ReferalNumberCount === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={() => setShowEmailInput(true)}
            disabled={user.ReferalNumberCount === 0}
          >
            Send Invitation
          </button>

          {showEmailInput && (
            <form
              onSubmit={handleReferralSubmit}
              className="mt-4 p-3 bg-gray-50 rounded-md"
            >
              <label className="block text-sm font-medium text-DGXblack mb-1">
                Colleague's Email Address
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-DGXgreen"
                  placeholder="Enter email address"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-DGXgreen text-white rounded-md hover:bg-DGXdarkgreen transition-colors font-medium"
                >
                  Send
                </button>
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-500">{emailError}</p>
              )}
              <button
                type="button"
                onClick={() => setShowEmailInput(false)}
                className="mt-2 text-sm text-DGXgray hover:text-DGXblack"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalInfoSection;
import React, { useState, useContext, useEffect, useCallback } from "react";
import { images } from "../../public/index.js";
import { FaCamera, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import ApiContext from "../context/ApiContext.jsx";
import Swal from "sweetalert2";
import FileUploader from "../container/FileUploader";

const UserAvatar = ({ user, onImageUpdate, refreshUserData }) => {
  const { userToken, setUser } = useContext(ApiContext);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState(null);
  const [currentProfileImage, setCurrentProfileImage] = useState("");

  // Initialize current profile image
  const initializeProfileImage = useCallback(() => {
    if (user?.ProfilePicture) {
      if (user.ProfilePicture.startsWith("http")) {
        setCurrentProfileImage(user.ProfilePicture);
      } else {
        const baseUrl = import.meta.env.VITE_API_UPLOADSURL;
        // Check if the ProfilePicture already has the base URL
        if (user.ProfilePicture.includes(baseUrl)) {
          setCurrentProfileImage(user.ProfilePicture);
        } else {
          setCurrentProfileImage(`${baseUrl}/${user.ProfilePicture}`);
        }
      }
    } else {
      setCurrentProfileImage(images.defaultProfile);
    }
  }, [user]);

  useEffect(() => {
    initializeProfileImage();
  }, [initializeProfileImage]);

  // Get the image URL to display
  const getProfileImageUrl = () => {
    if (previewImage) return previewImage;

    return currentProfileImage;
  };

  const handleImageUpload = (result) => {
    setIsUploading(false);
    console.log("FileUploader Result:", result);

    if (!result?.success) {
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        text: result?.message || "Failed to upload image",
      });
      return;
    }

    if (result.filePath) {
      setUploadedFilePath(result.filePath);

      // Create preview URL
      const previewUrl = `${import.meta.env.VITE_API_UPLOADSURL}/${
        result.filePath
      }`;

      // Update preview immediately
      setPreviewImage(previewUrl);
      setImageFile(result.filePath);
    } else {
      Swal.fire({
        icon: "error",
        title: "Upload Error",
        text: "No file path received from upload",
      });
    }
  };

  const saveAvatar = async () => {
    if (!uploadedFilePath) {
      Swal.fire({
        icon: "warning",
        title: "No Image",
        text: "Please upload an image first",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}userprofile/updateProfilePicture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": userToken,
          },
          body: JSON.stringify({
            email: user.EmailId,
            avatar: uploadedFilePath,
          }),
        }
      );

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("JSON parse error:", error);
        throw new Error("Invalid response from server");
      }

      console.log("Parsed data:", data);

      if (response.ok && data.success) {
        const updatedProfilePic = `${
          import.meta.env.VITE_API_UPLOADSURL
        }/${uploadedFilePath}`;

        // Update local state immediately
        setCurrentProfileImage(updatedProfilePic);

        // Clear preview since it's now the current image
        setPreviewImage(null);

        // Call parent callback if provided
        if (onImageUpdate) {
          onImageUpdate(updatedProfilePic);
        }

        // Also call refreshUserData to get updated user data from server
        if (refreshUserData) {
          await refreshUserData();
        }

        // Update context user if available
        if (setUser && user) {
          setUser((prev) => ({
            ...prev,
            ProfilePicture: uploadedFilePath,
          }));
        }

        // Clear upload states
        setUploadedFilePath(null);
        setImageFile(null);

        // Show success message and reload page after modal closes
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: data.message || "Profile image updated successfully",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to update profile image",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update profile image",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelUpload = () => {
    // Only clear preview, keep current profile image
    setPreviewImage(null);
    setImageFile(null);
    setUploadedFilePath(null);
    setIsUploading(false);
  };

  const triggerFileUpload = () => {
    setIsUploading(true);
  };

  // Check if we have an unsaved preview
  const hasUnsavedChanges = previewImage && !isLoading;

  return (
    <div className="bg-DGXwhite w-full rounded-lg shadow-xl pb-6 border border-DGXgreen transition-all duration-300 hover:shadow-lg">
      {/* Background Image */}
      <div className="w-full h-[150px] md:h-[200px] lg:h-[250px] rounded-t-lg overflow-hidden relative">
        <img
          src={images.NvidiaBackground}
          className="w-full h-full object-cover"
          alt="Profile background"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      {/* Profile Content */}
      <div className="flex flex-col items-center px-4 -mt-16 md:-mt-20">
        {/* Profile Image Container */}
        <div className="relative group mb-4">
          <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-white rounded-full overflow-hidden bg-gray-100 shadow-lg relative">
            <img
              src={getProfileImageUrl()}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              alt="User profile"
              onError={(e) => {
                e.target.src = images.defaultProfile;
                setCurrentProfileImage(images.defaultProfile);
              }}
            />

            {/* Camera Overlay */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full transition-all duration-300 ${
                isUploading || hasUnsavedChanges
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              } cursor-pointer`}
              onClick={triggerFileUpload}
            >
              <FaCamera className="text-xl md:text-2xl text-white mb-1" />
              <span className="text-white text-xs md:text-sm font-medium">
                {hasUnsavedChanges ? "Change Photo" : "Upload Photo"}
              </span>
            </div>
          </div>

          {/* File Uploader (only when triggered) */}
          {isUploading && (
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 md:w-48 lg:w-56">
              <FileUploader
                moduleName="USER_PROFILE"
                folderName={`profile-pictures/${user?.EmailId || "user"}`}
                onUploadComplete={handleImageUpload}
                accept="image/jpeg, image/png, image/webp"
                maxSize={5 * 1024 * 1024}
                label="Select Image"
                showPreview={false}
                customClassName="rounded-full"
                onCancel={() => setIsUploading(false)}
              />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="text-center mb-4 md:mb-6 w-full">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 truncate px-2">
            {user?.Name || "User"}
          </h2>
          <p className="text-DGXgray font-medium text-sm md:text-base truncate px-2">
            {user?.Designation || ""}
          </p>
          <p className="text-xs md:text-sm text-gray-500 truncate px-2">
            {user?.EmailId || ""}
          </p>
        </div>

        {/* Save/Cancel Buttons (only show when there are unsaved changes) */}
        {hasUnsavedChanges && (
          <div className="w-full max-w-xs md:max-w-md">
            <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200">
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm md:text-base text-gray-700 font-medium text-center">
                  Save this as your new profile picture?
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3 w-full">
                  <button
                    onClick={cancelUpload}
                    disabled={isLoading}
                    className="px-4 py-2 md:px-6 md:py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 flex items-center justify-center disabled:opacity-50 transition-colors flex-1 max-w-xs"
                  >
                    <FaTimes className="mr-2" />
                    <span className="text-sm md:text-base">Cancel</span>
                  </button>
                  <button
                    onClick={saveAvatar}
                    disabled={isLoading}
                    className="px-4 py-2 md:px-6 md:py-2 bg-DGXgreen text-white rounded-full hover:bg-DGXdarkgreen flex items-center justify-center disabled:opacity-50 transition-colors flex-1 max-w-xs shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="mr-2 animate-spin" />
                        <span className="text-sm md:text-base">Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" />
                        <span className="text-sm md:text-base">
                          Save Changes
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAvatar;

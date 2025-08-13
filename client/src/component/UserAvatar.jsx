import React, { useState, useContext, useRef, useEffect } from 'react';
import { images } from '../../public/index.js';
import { FaCamera, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import ApiContext from '../context/ApiContext.jsx';
import Swal from 'sweetalert2';
import { compressImage } from '../utils/compressImage.js';

const UserAvatar = ({ user, onImageUpdate }) => {
  const { userToken, fetchData, setUser } = useContext(ApiContext);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const getProfileImageUrl = () => {
    if (previewImage) return previewImage;
    return user?.ProfilePicture || images.defaultProfile;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Only JPG, PNG, and WEBP images are allowed',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Image size should be less than 5MB',
      });
      return;
    }

    setIsLoading(true);

    try {
      const compressedDataURL = await compressImage(file);
      setPreviewImage(compressedDataURL);
    } catch (error) {
      console.error('Error processing image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to process the image',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAvatar = async () => {
    if (isLoading || !previewImage) return;

    setIsLoading(true);

    try {
      if (setUser) {
        setUser(prev => ({
          ...prev,
          ProfilePicture: previewImage // Use the compressed preview image
        }));
      }

      const response = await fetchData('userprofile/updateProfilePicture', 'POST', {
        profileImage: previewImage
      }, {
        'Content-Type': 'application/json',
        'auth-token': userToken
      });

      if (!response) {
        throw new Error('No response from server');
      }

      if (response.success) {
        if (setUser) {
          setUser(prev => ({
            ...prev,
            ProfilePicture: response.data.imageUrl
          }));
        }

        setPreviewImage(null);

        if (onImageUpdate) {
          onImageUpdate(response.data.imageUrl);
        }

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Profile image updated successfully!',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error(response.message || 'Failed to update profile image');
      }
    } catch (error) {
      console.error('Error saving profile image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update profile image',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-DGXwhite w-full rounded-lg shadow-xl pb-6 border border-DGXgreen transition-all duration-300 hover:shadow-lg">
      <div className="w-full h-[250px] rounded-t-lg overflow-hidden relative">
        <img
          src={images.NvidiaBackground}
          className="w-full h-full object-cover"
          alt="Profile background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      <div className="flex flex-col items-center -mt-20 px-4">
        <div className="relative group mb-4">
          <div className="w-40 h-40 border-4 border-white rounded-full overflow-hidden bg-gray-100 shadow-lg relative">
            <img
              src={getProfileImageUrl()}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              alt="User profile"
              onError={(e) => {
                e.target.src = images.defaultProfile;
              }}
            />

            <div
              className={`absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full transition-all duration-300 ${previewImage ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} cursor-pointer`}
              onClick={triggerFileInput}
            >
              <FaCamera className="text-2xl text-white mb-1" />
              <span className="text-white text-sm font-medium">
                {previewImage ? 'Change Photo' : 'Upload Photo'}
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{user?.Name || 'User'}</h2>
          <p className="text-DGXgray font-medium">{user?.Designation || ''}</p>
          <p className="text-sm text-gray-500">{user?.EmailId || ''}</p>
        </div>

        <div className="w-full max-w-md space-y-4">
          {previewImage && (
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setPreviewImage(null)}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 flex items-center disabled:opacity-50 transition-colors"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
              <button
                onClick={saveAvatar}
                disabled={isLoading}
                className="px-6 py-2 bg-DGXgreen text-white rounded-full hover:bg-DGXdarkgreen flex items-center disabled:opacity-50 transition-colors shadow-md"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAvatar;
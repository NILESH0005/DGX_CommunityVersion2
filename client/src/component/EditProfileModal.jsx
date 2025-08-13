import React, { useState } from 'react';

const EditProfileModal = ({ isOpen, closeModal, userProfile }) => {
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [address, setAddress] = useState(userProfile.address);
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber);
  const [aboutMe, setAboutMe] = useState(userProfile.aboutMe || '');
  const [profilePicture, setProfilePicture] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    // Here you can handle saving the updated profile data
    console.log({ name, email, address, phoneNumber, aboutMe, profilePicture });
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg max-w-lg w-full">
          <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 p-2 w-full border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">About Me</label>
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              className="mt-1 p-2 w-full border rounded-md"
              rows="4"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Profile Picture</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="mt-1 p-2 w-full border rounded-md"
            />
            {profilePicture && (
              <div className="mt-2">
                <img src={profilePicture} alt="Profile Preview" className="w-24 h-24 object-cover rounded-full" />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default EditProfileModal;

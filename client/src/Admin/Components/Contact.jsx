import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const EditContactUs = () => {
  // Initial state with default values
  const [contactInfo, setContactInfo] = useState({
    address: 'Department of CSE, UIET, Chhatrapati Shahu Ji Maharaj University, Kalyanpur, Kanpur, Uttar Pradesh - 208012',
    email: 'sandesh@csjmu.ac.in',
    phone: '+91 98305 30450',
    workingHours: 'Monday - Saturday: 10:00 AM - 5:00 PM',
    mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5927.574457554718!2d80.27738333388517!3d26.492152116377788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399c37ea522f9c0d%3A0xc0670941a068aea2!2sChhatrapati%20Shahu%20Ji%20Maharaj%20University%2C%20Kanpur!5e0!3m2!1sen!2sin!4v1752470275679!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
  });

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!contactInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!contactInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(contactInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!contactInfo.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!contactInfo.workingHours.trim()) {
      newErrors.workingHours = 'Working hours are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsEditing(false);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Contact information has been updated successfully.',
        showConfirmButton: false,
        timer: 2000
      });
    }, 1500);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Reset errors when toggling edit mode
    if (isEditing) {
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Edit Contact Information</h1>
              <button
                onClick={toggleEdit}
                className={`px-4 py-2 rounded-md text-sm font-medium ${isEditing ? 'bg-white text-blue-700 hover:bg-gray-100' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {isEditing ? (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      value={contactInfo.address}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactInfo.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  {/* Working Hours */}
                  <div>
                    <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700 mb-1">
                      Working Hours
                    </label>
                    <input
                      type="text"
                      id="workingHours"
                      name="workingHours"
                      value={contactInfo.workingHours}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.workingHours ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.workingHours && (
                      <p className="mt-1 text-sm text-red-600">{errors.workingHours}</p>
                    )}
                  </div>

                  {/* Map Embed Code */}
                  <div>
                    <label htmlFor="mapEmbed" className="block text-sm font-medium text-gray-700 mb-1">
                      Google Maps Embed Code
                    </label>
                    <textarea
                      id="mapEmbed"
                      name="mapEmbed"
                      rows="5"
                      value={contactInfo.mapEmbed}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="Paste your Google Maps iframe code here"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Paste the entire iframe code from Google Maps share/embed option
                    </p>
                  </div>

                  {/* Preview of the Map */}
                  {contactInfo.mapEmbed && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Map Preview</h3>
                      <div 
                        className="w-full h-64 border border-gray-200 rounded-md overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: contactInfo.mapEmbed }}
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                      className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  {/* Display View */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Address</h3>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{contactInfo.address}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1 text-sm text-gray-900">{contactInfo.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                        <p className="mt-1 text-sm text-gray-900">{contactInfo.phone}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Working Hours</h3>
                        <p className="mt-1 text-sm text-gray-900">{contactInfo.workingHours}</p>
                      </div>
                    </div>
                  </div>

                  {/* Map Display */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Location Map</h3>
                    <div 
                      className="w-full h-64 md:h-80 border border-gray-200 rounded-md overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: contactInfo.mapEmbed }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditContactUs;
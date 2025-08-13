import React, { useState } from 'react';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';

const EventRegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    userPhoto: null,
    birthYear: '',
    college: '',
    gender: '',
    phoneNumber: '',
    emailAddress: '',
    specialRequirements: '',
    numberOfAttendees: '',
    idProof: '',
    idProofPhoto: null,
    termsAgreed: false,
    privacyConsented: false,
    otherIdProof: '', // State for "Other" ID proof
  });

  const [errors, setErrors] = useState({});

  const handlePhoneChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      phoneNumber: value,
    }));
    if (value) {
      setErrors((prevErrors) => ({ ...prevErrors, phoneNumber: '' })); // Clear error on valid input
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
    if (type !== 'checkbox') {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' })); // Clear error on input change
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required.';
    if (!formData.emailAddress) newErrors.emailAddress = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) newErrors.emailAddress = 'Email address is invalid.';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required.';
    else if (!isValidPhoneNumber(formData.phoneNumber)) newErrors.phoneNumber = 'Phone number is invalid.';
    if (!formData.termsAgreed) newErrors.termsAgreed = 'You must agree to the terms and conditions.';
    if (!formData.privacyConsented) newErrors.privacyConsented = 'You must consent to the privacy policy.';
    if (formData.numberOfAttendees && formData.numberOfAttendees <= 0) newErrors.numberOfAttendees = 'Number of attendees must be a positive number.';
    if (!formData.birthYear) newErrors.birthYear = 'Birth year is required.';
    if (!formData.college) newErrors.college = 'College is required.';
    if (!formData.gender) newErrors.gender = 'Gender is required.';
    if (!formData.idProof) newErrors.idProof = 'ID proof is required.';
    if (!formData.idProofPhoto) newErrors.idProofPhoto = 'ID proof photo is required.';
    if (formData.idProof === 'other' && !formData.otherIdProof) newErrors.otherIdProof = 'Please specify your ID proof.';

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      console.log('Form submitted:', formData);
      // Add your form submission logic here
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-DGXblue">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-screen">
        <h1 className="text-2xl font-semibold mb-4 flex items-center justify-center">Register for Event</h1>
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="fullName">Full Name:</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              required
              aria-describedby="fullNameError"
            />
            {errors.fullName && <p id="fullNameError" role="alert" className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          {/* User Photo */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="userPhoto">User Photo:</label>
            <input
              type="file"
              id="userPhoto"
              name="userPhoto"
              accept="image/*"
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.userPhoto ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            />
            {errors.userPhoto && <p className="text-red-500 text-sm mt-1">{errors.userPhoto}</p>}
          </div>

          {/* Birth Year */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="birthYear">Birth Year:</label>
            <input
              type="number"
              id="birthYear"
              name="birthYear"
              value={formData.birthYear}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.birthYear ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              required
              aria-describedby="birthYearError"
            />
            {errors.birthYear && <p id="birthYearError" role="alert" className="text-red-500 text-sm mt-1">{errors.birthYear}</p>}
          </div>

          {/* College */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="college">College:</label>
            <input
              type="text"
              id="college"
              name="college"
              value={formData.college}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.college ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              required
              aria-describedby="collegeError"
            />
            {errors.college && <p id="collegeError" role="alert" className="text-red-500 text-sm mt-1">{errors.college}</p>}
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Gender:</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              required
              aria-describedby="genderError"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p id="genderError" role="alert" className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>

          {formData.gender === 'other' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="otherGender">Please specify:</label>
              <input
                type="text"
                id="otherGender"
                name="otherGender"
                value={formData.otherGender}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.otherGender ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                aria-describedby="otherGenderError"
              />
              {errors.otherGender && <p id="otherGenderError" role="alert" className="text-red-500 text-sm mt-1">{errors.otherGender}</p>}
            </div>
          )}

          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="phoneNumber">Phone Number:</label>
            <PhoneInput
              international
              defaultCountry="IN"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              className={`w-full px-3 py-2 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              required
              aria-describedby="phoneNumberError"
            />
            {errors.phoneNumber && <p id="phoneNumberError" role="alert" className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Email Address */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="emailAddress">Email Address:</label>
            <input
              type="email"
              id="emailAddress"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.emailAddress ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              required
              aria-describedby="emailError"
            />
            {errors.emailAddress && <p id="emailError" role="alert" className="text-red-500 text-sm mt-1">{errors.emailAddress}</p>}
          </div>

          {/* Special Requirements */}
          {/* <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="specialRequirements">Special Requirements:</label>
            <textarea
              id="specialRequirements"
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.specialRequirements ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              rows="3"
            ></textarea>
            {errors.specialRequirements && <p className="text-red-500 text-sm mt-1">{errors.specialRequirements}</p>}
          </div> */}

          {/* Number of Attendees */}
          {/* <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="numberOfAttendees">Number of Attendees:</label>
            <input
              type="number"
              id="numberOfAttendees"
              name="numberOfAttendees"
              value={formData.numberOfAttendees}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.numberOfAttendees ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            />
            {errors.numberOfAttendees && <p className="text-red-500 text-sm mt-1">{errors.numberOfAttendees}</p>}
          </div> */}

          {/* ID Proof */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">ID Proof:</label>
            <select
              name="idProof"
              value={formData.idProof}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.idProof ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              required
              aria-describedby="idProofError"
            >
              <option value="">Select ID Proof</option>
              <option value="aadhaar">Aadhaar</option>
              <option value="passport">Passport</option>
              <option value="voter_id">Voter ID</option>
              <option value="other">Other</option>
            </select>
            {errors.idProof && <p id="idProofError" role="alert" className="text-red-500 text-sm mt-1">{errors.idProof}</p>}
          </div>

          {/* Other ID Proof Input */}
          {formData.idProof === 'other' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="otherIdProof">Please specify your ID proof:</label>
              <input
                type="text"
                id="otherIdProof"
                name="otherIdProof"
                value={formData.otherIdProof}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.otherIdProof ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                aria-describedby="otherIdProofError"
              />
              {errors.otherIdProof && <p id="otherIdProofError" role="alert" className="text-red-500 text-sm mt-1">{errors.otherIdProof}</p>}
            </div>
          )}

          {/* ID Proof Photo */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="idProofPhoto">ID Proof Photo:</label>
            <input
              type="file"
              id="idProofPhoto"
              name="idProofPhoto"
              accept="image/*"
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.idProofPhoto ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              required
              aria-describedby="idProofPhotoError"
            />
            {errors.idProofPhoto && <p id="idProofPhotoError" role="alert" className="text-red-500 text-sm mt-1">{errors.idProofPhoto}</p>}
          </div>

          {/* Terms and Conditions */}
          {/* <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="termsAgreed"
              name="termsAgreed"
              checked={formData.termsAgreed}
              onChange={handleChange}
              className="mr-2"
              required
            />
            <label htmlFor="termsAgreed" className="text-gray-700">
              I agree to the terms and conditions
            </label>
            {errors.termsAgreed && <p className="text-red-500 text-sm mt-1">{errors.termsAgreed}</p>}
          </div> */}

          {/* Privacy Policy */}
          {/* <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="privacyConsented"
              name="privacyConsented"
              checked={formData.privacyConsented}
              onChange={handleChange}
              className="mr-2"
              required
            />
            <label htmlFor="privacyConsented" className="text-gray-700">
              I consent to the privacy policy
            </label>
            {errors.privacyConsented && <p className="text-red-500 text-sm mt-1">{errors.privacyConsented}</p>}
          </div> */}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button type="submit" className="bg-DGXgreen text-white px-4 py-2 rounded-md hover:bg-DGXblue hover:text-DGXwhite">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventRegistrationForm;

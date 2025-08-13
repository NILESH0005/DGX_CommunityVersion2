import React, { useState } from "react";
import Swal from 'sweetalert2';

const AddUnitModal = ({ isOpen, onClose, onAddUnit, submodule, fetchData, userToken }) => {
    const [unitData, setUnitData] = useState({
        UnitName: '',
        UnitDescription: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUnitData(prev => ({
            ...prev,
            [name]: value
        }));
        setIsDirty(true);

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!unitData.UnitName?.trim()) {
            newErrors.UnitName = "Unit name is required";
        } else if (unitData.UnitName.trim().length > 100) {
            newErrors.UnitName = "Name must be less than 100 characters";
        }

        if (unitData.UnitDescription.length > 500) {
            newErrors.UnitDescription = "Description must be less than 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsDirty(true);

        if (!validateForm()) {
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey) {
                document.querySelector(`[name="${firstErrorKey}"]`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                ...unitData,
                SubModuleID: submodule.SubModuleID
            };
            // console.log("Payload:", payload);

            const response = await fetchData(
                `lmsEdit/addUnit`,
                "POST",
                payload,
                {
                    'Content-Type': 'application/json',
                    'auth-token': userToken
                }
            );

            // console.log("API Response:", response); // Debug the response structure

            if (response?.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Unit added successfully',
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                    didClose: () => {
                        // Check different possible response structures
                        const unitId = response.data?.UnitID ||
                            response.UnitID ||
                            response.data?.unitID ||
                            response.id;

                        if (!unitId) {
                            // console.error("UnitID not found in response:", response);
                            throw new Error("UnitID not received from server");
                        }

                        const completeUnit = {
                            UnitID: unitId,
                            UnitName: unitData.UnitName,
                            UnitDescription: unitData.UnitDescription,
                            SubModuleID: submodule.SubModuleID,
                            files: [],
                            delStatus: 0
                        };

                        // console.log("Complete unit data:", completeUnit);
                        onAddUnit(completeUnit);
                        onClose();
                        setUnitData({ UnitName: '', UnitDescription: '' });
                        setIsDirty(false);
                    }
                });
            } else {
                throw new Error(response?.message || "Failed to add unit");
            }
        } catch (err) {
            // console.error("Error:", err);
            setError(err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to add unit',
                confirmButtonColor: '#3085d6',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate__animated animate__fadeInUp">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Add New Unit</h2>
                            <div className="text-sm opacity-90 mt-1">
                                Submodule: {submodule?.SubModuleName || 'N/A'}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Unit Name Field */}
                    <div className="space-y-1">
                        <label htmlFor="UnitName" className="block text-sm font-medium text-gray-700">
                            Unit Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="UnitName"
                            name="UnitName"
                            value={unitData.UnitName}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                                ${errors.UnitName ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter unit name"
                        />
                        {errors.UnitName && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.UnitName}
                            </p>
                        )}
                    </div>

                    {/* Description Field */}
                    <div className="space-y-1">
                        <label htmlFor="UnitDescription" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="UnitDescription"
                            name="UnitDescription"
                            value={unitData.UnitDescription}
                            onChange={handleInputChange}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                                ${errors.UnitDescription ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter description (optional)"
                        />
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <div>
                                {errors.UnitDescription && (
                                    <span className="text-red-500 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.UnitDescription}
                                    </span>
                                )}
                            </div>
                            <span>{unitData.UnitDescription.length}/500</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all
                                ${isSubmitting
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </span>
                            ) : 'Add Unit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUnitModal;
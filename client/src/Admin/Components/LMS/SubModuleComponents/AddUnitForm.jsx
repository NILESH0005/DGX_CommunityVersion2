import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Image, X, Check, Upload, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const AddUnitForm = ({ onAddUnit, errors: propErrors, setErrors: setPropErrors }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newUnit, setNewUnit] = useState({ 
        UnitName: '', 
        UnitDescription: '', 
        UnitImg: null,
        UnitImgPreview: null
    });
    
    const [localErrors, setLocalErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validation rules
    const validationRules = {
        UnitName: {
            required: true,
            minLength: 3,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\s\-_&@.,!?()]+$/,
            message: {
                required: 'Unit name is required',
                minLength: 'Unit name must be at least 3 characters',
                maxLength: 'Unit name cannot exceed 100 characters',
                pattern: 'Unit name contains invalid characters',
            },
        },
        UnitDescription: {
            required: true,
            minLength: 10,
            maxLength: 1000,
            message: {
                required: 'Description is required',
                minLength: 'Description must be at least 10 characters',
                maxLength: 'Description cannot exceed 1000 characters',
            },
        },
    };

    // Validate a single field
    const validateField = (name, value) => {
        const rules = validationRules[name];
        if (!rules) return '';

        const errors = [];

        if (rules.required && (!value || value.trim() === '')) {
            errors.push(rules.message.required);
        }

        if (rules.minLength && value && value.trim().length < rules.minLength) {
            errors.push(rules.message.minLength);
        }

        if (rules.maxLength && value && value.trim().length > rules.maxLength) {
            errors.push(rules.message.maxLength);
        }

        if (rules.pattern && value && !rules.pattern.test(value)) {
            errors.push(rules.message.pattern);
        }

        return errors.length > 0 ? errors[0] : '';
    };

    // Validate entire form
    const validateForm = () => {
        const newErrors = {};

        // Validate UnitName
        const nameError = validateField('UnitName', newUnit.UnitName);
        if (nameError) newErrors.UnitName = nameError;

        // Validate UnitDescription
        const descError = validateField('UnitDescription', newUnit.UnitDescription);
        if (descError) newErrors.UnitDescription = descError;

        setLocalErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Check if form is valid
    const isFormValid = () => {
        return (
            newUnit.UnitName.trim().length >= 3 &&
            newUnit.UnitDescription.trim().length >= 10
        );
    };

    // Auto-validate when form changes
    useEffect(() => {
        if (Object.keys(touched).length > 0) {
            validateForm();
        }
    }, [newUnit, touched]);

    const handleUnitImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setLocalErrors(prev => ({ 
                    ...prev, 
                    UnitImg: 'Image size should be less than 10MB' 
                }));
                if (setPropErrors) setPropErrors(prev => ({ 
                    ...prev, 
                    UnitImg: 'Image size should be less than 10MB' 
                }));
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                setNewUnit({
                    ...newUnit,
                    UnitImg: file,
                    UnitImgPreview: reader.result
                });
                // Clear image error if any
                setLocalErrors(prev => ({ ...prev, UnitImg: null }));
                if (setPropErrors) setPropErrors(prev => ({ ...prev, UnitImg: null }));
            };
            reader.readAsDataURL(file);
        }
    };

    const resetImage = () => {
        setNewUnit(prev => ({
            ...prev,
            UnitImg: null,
            UnitImgPreview: null
        }));
    };

    const handleSubmit = () => {
        // Mark all fields as touched
        const allTouched = {
            UnitName: true,
            UnitDescription: true,
        };
        setTouched(allTouched);

        // Validate form
        const isValid = validateForm();

        if (!isValid) {
            // Find first error field and scroll to it
            const firstErrorField = Object.keys(localErrors)[0];
            if (firstErrorField) {
                const errorElement = document.getElementById(`${firstErrorField}-error`);
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return;
        }

        // Call the parent handler to add the unit
        onAddUnit({
            ...newUnit,
            UnitName: newUnit.UnitName.trim(),
            UnitDescription: newUnit.UnitDescription.trim(),
        });
        
        // Reset the form after successful addition
        resetForm();
        
        // Collapse the form after submission
        setIsExpanded(false);
    };

    const resetForm = () => {
        setNewUnit({
            UnitName: '',
            UnitDescription: '',
            UnitImg: null,
            UnitImgPreview: null
        });
        setLocalErrors({});
        setTouched({});
        if (setPropErrors) setPropErrors({});
    };

    const handleCancel = () => {
        resetForm();
        setIsExpanded(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUnit(prev => ({ ...prev, [name]: value }));
        
        // Mark field as touched
        if (!touched[name]) {
            setTouched(prev => ({ ...prev, [name]: true }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        if (!touched[name]) {
            setTouched(prev => ({ ...prev, [name]: true }));
        }
    };

    // Character counter component
    const CharacterCounter = ({ value, maxLength, fieldName }) => {
        if (!maxLength) return null;
        
        const currentLength = value?.trim().length || 0;
        const isNearLimit = currentLength > maxLength * 0.8;
        const isExceeding = currentLength > maxLength;
        
        return (
            <div className={`text-xs mt-1 ${isExceeding ? 'text-red-500 font-semibold' : isNearLimit ? 'text-yellow-500' : 'text-gray-500'}`}>
                {currentLength}/{maxLength} characters
                {isExceeding && <span className="ml-2">(Exceeds limit!)</span>}
            </div>
        );
    };

    // Render validation error
    const renderError = (fieldName) => {
        const error = localErrors[fieldName] || propErrors?.[fieldName];
        const isTouched = touched[fieldName];
        
        if (error && isTouched) {
            return (
                <motion.div
                    id={`${fieldName}-error`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </motion.div>
            );
        }
        return null;
    };

    const hasContent = newUnit.UnitName.trim() || newUnit.UnitDescription.trim() || newUnit.UnitImgPreview;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-DGXwhite rounded-xl shadow-lg border border-DGXgray/20 overflow-hidden"
        >
            {/* Header - Always Visible */}
            <motion.div
                className={`p-6 cursor-pointer transition-colors duration-200 ${
                    isExpanded ? 'bg-DGXgreen/5 border-b border-DGXgray/20' : 'hover:bg-DGXgray/5'
                }`}
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ backgroundColor: hasContent ? 'rgba(118, 185, 0, 0.08)' : 'rgba(0, 0, 0, 0.02)' }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ rotate: isExpanded ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-2 rounded-full bg-DGXgreen/10"
                        >
                            <PlusCircle className="w-5 h-5 text-DGXgreen" />
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-bold text-DGXblue">Add New Unit</h3>
                            <p className="text-sm text-DGXgray mt-1">
                                {isExpanded ? 'Fill in the unit details below' : 'Click to expand and add a new unit'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {hasContent && !isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="px-3 py-1 bg-DGXgreen/10 rounded-full"
                            >
                                <span className="text-sm font-medium text-DGXgreen">Draft</span>
                            </motion.div>
                        )}
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-2 rounded-lg hover:bg-DGXgray/10 transition-colors"
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-DGXgray" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-DGXgray" />
                            )}
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Collapsible Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 border-t border-DGXgray/20">
                            <div className="space-y-6">
                                {/* Unit Name Field */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-DGXblue">
                                        Unit Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <motion.input
                                            whileFocus={{ borderColor: '#76B900' }}
                                            type="text"
                                            name="UnitName"
                                            placeholder="e.g., Introduction to Components"
                                            className={`w-full px-4 py-3 rounded-lg border ${
                                                (localErrors.UnitName && touched.UnitName) || (propErrors?.UnitName)
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                                                    : 'border-DGXgray/30 focus:ring-2 focus:ring-DGXgreen focus:border-DGXgreen'
                                            } bg-DGXwhite text-DGXblack transition duration-200`}
                                            value={newUnit.UnitName}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            autoFocus
                                        />
                                        {renderError("UnitName")}
                                        <CharacterCounter 
                                            value={newUnit.UnitName} 
                                            maxLength={validationRules.UnitName.maxLength} 
                                            fieldName="UnitName" 
                                        />
                                    </div>
                                </div>

                                {/* Description Field */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-DGXblue">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <motion.textarea
                                        whileFocus={{ borderColor: '#76B900' }}
                                        name="UnitDescription"
                                        placeholder="What will students learn in this unit?"
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            (localErrors.UnitDescription && touched.UnitDescription) || (propErrors?.UnitDescription)
                                                ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                                                : 'border-DGXgray/30 focus:ring-2 focus:ring-DGXgreen focus:border-DGXgreen'
                                        } bg-DGXwhite text-DGXblack transition duration-200`}
                                        rows={4}
                                        value={newUnit.UnitDescription}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                    />
                                    {renderError("UnitDescription")}
                                    <CharacterCounter 
                                        value={newUnit.UnitDescription} 
                                        maxLength={validationRules.UnitDescription.maxLength} 
                                        fieldName="UnitDescription" 
                                    />
                                </div>

                                {/* Image Upload Section */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-DGXblue">
                                        Unit Image
                                    </label>
                                    
                                    {newUnit.UnitImgPreview ? (
                                        <div className="relative">
                                            <img 
                                                src={newUnit.UnitImgPreview} 
                                                alt="Unit preview" 
                                                className="w-full h-48 object-cover rounded-lg border border-DGXgray/30"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={resetImage}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <div className={`rounded-lg border-2 ${
                                            (localErrors.UnitImg && touched.UnitImg) || (propErrors?.UnitImg)
                                                ? "border-red-500"
                                                : "border-DGXgray/30 border-dashed"
                                        }`}>
                                            <motion.label
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex flex-col items-center justify-center w-full h-32 cursor-pointer hover:border-DGXgreen transition-colors duration-200 bg-DGXgray/5"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-2 text-DGXgray" />
                                                    <p className="text-sm text-DGXgray">
                                                        <span className="font-medium text-DGXgreen">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-DGXgray mt-1">
                                                        PNG, JPG, GIF up to 10MB
                                                    </p>
                                                </div>
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={handleUnitImageChange}
                                                />
                                            </motion.label>
                                        </div>
                                    )}
                                    {renderError("UnitImg")}
                                </div>

                                {/* Validation Summary */}
                                {Object.keys(localErrors).length > 0 && Object.keys(touched).length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-red-50 border border-red-200 rounded-lg"
                                    >
                                        <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Please fix the following issues:
                                        </h4>
                                        <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                                            {localErrors.UnitName && touched.UnitName && (
                                                <li>Unit Name: {localErrors.UnitName}</li>
                                            )}
                                            {localErrors.UnitDescription && touched.UnitDescription && (
                                                <li>Description: {localErrors.UnitDescription}</li>
                                            )}
                                            {localErrors.UnitImg && touched.UnitImg && (
                                                <li>Unit Image: {localErrors.UnitImg}</li>
                                            )}
                                        </ul>
                                    </motion.div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCancel}
                                        className="flex-1 py-3 rounded-lg font-medium border border-DGXgray/30 text-DGXgray hover:bg-DGXgray/5 transition duration-200"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmit}
                                        disabled={!isFormValid()}
                                        className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                                            !isFormValid() 
                                                ? 'bg-DGXgray/30 text-DGXgray cursor-not-allowed' 
                                                : 'bg-DGXgreen hover:bg-[#68a600] text-DGXwhite'
                                        } transition duration-200`}
                                    >
                                        <Check className="w-5 h-5" />
                                        Add Unit
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AddUnitForm;
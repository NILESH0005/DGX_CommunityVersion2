import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Image, X, Check, Upload, ChevronDown, ChevronUp } from 'lucide-react';

const AddUnitForm = ({ onAddUnit, errors, setErrors }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newUnit, setNewUnit] = useState({ 
        UnitName: '', 
        UnitDescription: '', 
        UnitImg: null,
        UnitImgPreview: null
    });

    const handleUnitImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setNewUnit({
                    ...newUnit,
                    UnitImg: file,
                    UnitImgPreview: reader.result
                });
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
        if (!newUnit.UnitName.trim()) {
            setErrors({ UnitName: 'Unit name is required' });
            return;
        }

        // Call the parent handler to add the unit
        onAddUnit(newUnit);
        
        // Reset the form after successful addition
        setNewUnit({
            UnitName: '',
            UnitDescription: '',
            UnitImg: null,
            UnitImgPreview: null
        });
        
        // Clear any errors
        setErrors({ ...errors, UnitName: null });
        
        // Collapse the form after submission
        setIsExpanded(false);
    };

    const handleCancel = () => {
        setNewUnit({
            UnitName: '',
            UnitDescription: '',
            UnitImg: null,
            UnitImgPreview: null
        });
        setErrors({ ...errors, UnitName: null });
        setIsExpanded(false);
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
                                            placeholder="e.g., Introduction to Components"
                                            className={`w-full px-4 py-3 rounded-lg border ${
                                                errors.UnitName 
                                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                                    : 'border-DGXgray/30 focus:ring-DGXgreen focus:border-DGXgreen'
                                            } bg-DGXwhite text-DGXblack transition duration-200`}
                                            value={newUnit.UnitName}
                                            onChange={(e) => {
                                                setNewUnit({ ...newUnit, UnitName: e.target.value });
                                                if (errors.UnitName) setErrors({ ...errors, UnitName: null });
                                            }}
                                            autoFocus
                                        />
                                        {errors.UnitName && (
                                            <motion.p 
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-1 text-sm text-red-600 flex items-center gap-1"
                                            >
                                                <X className="w-4 h-4" />
                                                {errors.UnitName}
                                            </motion.p>
                                        )}
                                    </div>
                                </div>

                                {/* Description Field */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-DGXblue">
                                        Description
                                    </label>
                                    <motion.textarea
                                        whileFocus={{ borderColor: '#76B900' }}
                                        placeholder="What will students learn in this unit?"
                                        className="w-full px-4 py-3 rounded-lg border border-DGXgray/30 focus:ring-DGXgreen focus:border-DGXgreen bg-DGXwhite text-DGXblack transition duration-200"
                                        rows={4}
                                        value={newUnit.UnitDescription}
                                        onChange={(e) => setNewUnit({ ...newUnit, UnitDescription: e.target.value })}
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
                                        <motion.label
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-DGXgray/30 rounded-lg cursor-pointer hover:border-DGXgreen transition-colors duration-200 bg-DGXgray/5"
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
                                    )}
                                </div>

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
                                        disabled={!newUnit.UnitName.trim()}
                                        className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                                            !newUnit.UnitName.trim() 
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
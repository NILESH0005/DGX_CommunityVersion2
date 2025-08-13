import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Image, X, Check, Upload } from 'lucide-react';

const AddUnitForm = ({ onAddUnit, errors, setErrors }) => {
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
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-DGXwhite rounded-xl shadow-lg border border-DGXgray/20 overflow-hidden"
        >
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <PlusCircle className="w-6 h-6 text-DGXgreen" />
                    <h3 className="text-2xl font-bold text-DGXblue">Add New Unit</h3>
                </div>

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

                    {/* Submit Button */}
                    <div className="pt-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={!newUnit.UnitName.trim()}
                            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
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
    );
};

export default AddUnitForm;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, FileText, Loader2 } from 'lucide-react';
import FileUploader from '../FileUploader';

const FileUploadModal = ({ 
    show, 
    onClose, 
    unitName, 
    onFileSelect, 
    onSubmit, 
    isSubmitting, 
    uploadedFile 
}) => {
    const [customFileName, setCustomFileName] = useState('');
    const [errors, setErrors] = useState({});

    const handleSubmit = () => {
        if (!uploadedFile) {
            setErrors({ file: 'Please select a file to upload' });
            return;
        }
        
        if (!customFileName.trim()) {
            setErrors({ fileName: 'Please enter a file name' });
            return;
        }
        
        // Pass both the file and custom name to the parent component
        onSubmit(uploadedFile, customFileName.trim());
    };

    const handleFileSelected = (file) => {
        onFileSelect(file);
        // Set initial file name (without extension) as default
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setCustomFileName(fileNameWithoutExt);
        setErrors({ ...errors, file: null });
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-DGXblack/50 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl bg-DGXwhite rounded-xl shadow-xl border border-DGXgray/20 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-DGXblue flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-DGXgreen" />
                                        Upload Material for: <span className="text-DGXgreen">{unitName}</span>
                                    </h3>
                                    <p className="text-sm text-DGXgray mt-1">
                                        Supported formats: PDF, DOCX, PPT, JPG, PNG
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="text-DGXgray hover:text-DGXblue transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5" />
                                </motion.button>
                            </div>

                            <div className="mb-6">
                                <FileUploader
                                    selectedFile={uploadedFile}
                                    onFileSelect={handleFileSelected}
                                />
                                {errors.file && (
                                    <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                                )}
                            </div>

                            {uploadedFile && (
                                <div className="mb-6">
                                    <label htmlFor="fileName" className="block text-sm font-medium text-DGXgray mb-1">
                                        File Display Name
                                    </label>
                                    <input
                                        type="text"
                                        id="fileName"
                                        value={customFileName}
                                        onChange={(e) => {
                                            setCustomFileName(e.target.value);
                                            setErrors({ ...errors, fileName: null });
                                        }}
                                        className="w-full px-3 py-2 border border-DGXgray/30 rounded-lg focus:ring-DGXgreen focus:border-DGXgreen"
                                        placeholder="Enter a display name for the file"
                                    />
                                    {errors.fileName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.fileName}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-DGXgray/20">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-lg border border-DGXgray/30 text-DGXblue hover:bg-DGXgray/10 transition-colors font-medium"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmit}
                                    disabled={!uploadedFile || isSubmitting}
                                    className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                                        !uploadedFile || isSubmitting
                                            ? 'bg-DGXgray/30 text-DGXgray cursor-not-allowed'
                                            : 'bg-DGXgreen hover:bg-[#68a600] text-DGXwhite'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-5 h-5" />
                                            Upload File
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FileUploadModal;
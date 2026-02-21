import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const FileUploader = ({
  selectedFile,
  onFileSelect,
  onClearFile,
  moduleId,
  submoduleId,
  unitId,
  onTimeSelect,
  selectedTime = 30, // Default 30 minutes
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState(selectedTime);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedFiles = localStorage.getItem("pendingUploads");
    if (storedFiles) {
      try {
        setLocalFiles(JSON.parse(storedFiles));
      } catch (error) {
        console.error("Error parsing stored files:", error);
      }
    }
  }, []);

  useEffect(() => {
    setEstimatedTime(selectedTime);
  }, [selectedTime]);

  // Validate time input
  const validateTime = (time) => {
    const errors = {};
    if (time < 30) {
      errors.time = "Estimated time must be at least 30 minutes";
    }
    if (time > 10080) { // 7 days in minutes
      errors.time = "Estimated time cannot exceed 7 days (10080 minutes)";
    }
    if (!time || time.toString().trim() === "") {
      errors.time = "Estimated time is required";
    }
    return errors;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) handleFiles(e.target.files);
  };

  const handleTimeChange = (e) => {
    const time = parseInt(e.target.value) || 0;
    setEstimatedTime(time);
    
    // Validate time
    const timeErrors = validateTime(time);
    setErrors(prev => ({ ...prev, ...timeErrors }));
    
    onTimeSelect?.(time);
  };

  const handleTimeBlur = () => {
    // Ensure minimum 30 minutes when field loses focus
    if (estimatedTime < 30) {
      setEstimatedTime(30);
      onTimeSelect?.(30);
      setErrors(prev => ({ ...prev, time: null }));
    }
  };

  const handleFiles = (files) => {
    const newFile = files[0];
    
    // Validate file
    const fileErrors = validateFile(newFile);
    if (Object.keys(fileErrors).length > 0) {
      setErrors(fileErrors);
      return;
    }
    
    onFileSelect(newFile);
    setErrors(prev => ({ ...prev, file: null }));
    
    const uploadData = {
      file: {
        name: newFile.name,
        size: newFile.size,
        type: newFile.type,
        lastModified: newFile.lastModified,
      },
      estimatedTime,
      moduleId,
      submoduleId,
      unitId,
      timestamp: new Date().toISOString(),
    };

    const updatedFiles = [...localFiles, uploadData];
    localStorage.setItem("learningMaterials", JSON.stringify(updatedFiles));
    setLocalFiles(updatedFiles);
  };

  // File validation
  const validateFile = (file) => {
    const errors = {};
    
    if (!file) {
      errors.file = "File is required";
      return errors;
    }
    
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'video/quicktime',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      errors.file = "File type not supported. Please upload PDF, PPT, DOC, MP4, MOV, JPG, or PNG files";
    }
    
    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      errors.file = "File size exceeds 100MB limit";
    }
    
    return errors;
  };

  const removeFile = () => {
    onClearFile();
    const newFiles = localFiles.filter(
      (file) =>
        !(
          file.moduleId === moduleId &&
          file.submoduleId === submoduleId &&
          file.unitId === unitId
        )
    );
    localStorage.setItem("pendingUploads", JSON.stringify(newFiles));
    setLocalFiles(newFiles);
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return null;
    const extension = fileName.split(".").pop().toLowerCase();
    const iconClass = "w-6 h-6";
    const icons = {
      pdf: { color: "text-red-500", icon: pdfIcon },
      doc: { color: "text-blue-500", icon: docIcon },
      docx: { color: "text-blue-500", icon: docIcon },
      ppt: { color: "text-orange-500", icon: pptIcon },
      pptx: { color: "text-orange-500", icon: pptIcon },
      mp4: { color: "text-purple-500", icon: videoIcon },
      mov: { color: "text-purple-500", icon: videoIcon },
      jpg: { color: "text-green-500", icon: imageIcon },
      jpeg: { color: "text-green-500", icon: imageIcon },
      png: { color: "text-green-500", icon: imageIcon },
    };
    const fileConfig =
      icons[extension] || { color: "text-gray-500", icon: defaultIcon };
    return <div className={`${iconClass} ${fileConfig.color}`}>{fileConfig.icon}</div>;
  };

  const formatFileSize = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      <div className="flex flex-row overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex flex-row min-w-full lg:min-w-0 lg:flex-row p-6 gap-8 snap-center">
          {/* Left side - Drag & Drop */}
          <div
            className={`flex-1 min-w-[90%] lg:min-w-0 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 flex flex-col justify-center items-center ${
              isDragging
                ? "border-blue-500 bg-blue-50 scale-[1.02]"
                : errors.file
                ? "border-red-500 bg-red-50"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UploadIcon />
            </div>
            <p className="mb-2 text-gray-700 font-medium">
              {isDragging ? "Drop your file here" : "Drag & drop your file here"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supported: PDF, PPT, DOC, MP4, MOV, JPG, PNG (Max 100MB)
            </p>
            
            <input
              type="file"
              className="hidden"
              id="file-upload"
              onChange={handleFileChange}
              accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.mov,.jpg,.jpeg,.png"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors cursor-pointer font-medium"
            >
              Browse Files
            </label>
            
            {errors.file && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.file}
                </p>
              </div>
            )}
          </div>

          {/* Right side - Details */}
          <div className="flex-1 min-w-[90%] lg:min-w-0 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Upload Details
              </h3>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">
                    Estimated Time <span className="text-red-500">*</span>
                  </h4>
                  <span className="text-sm text-gray-500">Minimum: 30 minutes</span>
                </div>
                
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="number"
                    min="30"
                    max="10080"
                    value={estimatedTime}
                    onChange={handleTimeChange}
                    onBlur={handleTimeBlur}
                    className={`w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.time
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    placeholder="Enter minutes"
                  />
                  <span className="text-gray-600">minutes</span>
                </div>
                
                {errors.time && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.time}
                  </p>
                )}
                
                <p className="text-sm text-gray-500 mt-2">
                  Set estimated reading/watching time (30 minutes minimum)
                </p>
              </div>
            </div>

            {/* Selected File */}
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(selectedFile.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)} MB
                      </p>
                      {estimatedTime > 0 && (
                        <p className={`text-sm font-medium mt-1 ${
                          estimatedTime < 30 ? "text-red-600" : "text-blue-600"
                        }`}>
                          Estimated time: {estimatedTime} minute
                          {estimatedTime !== 1 ? "s" : ""}
                          {estimatedTime < 30 && " (Minimum 30 required)"}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    aria-label="Remove file"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// SVG Icons (keep the same as before)
const UploadIcon = () => (
  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const pdfIcon = (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);
const docIcon = pdfIcon;
const pptIcon = pdfIcon;
const videoIcon = (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
  </svg>
);
const imageIcon = (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
  </svg>
);
const defaultIcon = pdfIcon;

export default FileUploader;
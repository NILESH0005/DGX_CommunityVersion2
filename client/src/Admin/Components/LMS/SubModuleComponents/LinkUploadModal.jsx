import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Loader2, Clock } from 'lucide-react';

const LinkUploadModal = ({
  show,
  onClose,
  unitName,
  onSubmit,
  isSubmitting
}) => {
  const [fileLink, setFileLink] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    // Validate inputs
    const newErrors = {};
    
    if (!fileLink.trim()) {
      newErrors.fileLink = 'Please enter a URL';
    } else if (!isValidUrl(fileLink)) {
      newErrors.fileLink = 'Please enter a valid URL';
    }
    
    if (!linkName.trim()) {
      newErrors.linkName = 'Please enter a link name';
    }
    
    if (estimatedTime <= 0) {
      newErrors.estimatedTime = 'Please enter a valid estimated time';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Submit the link data
    onSubmit(fileLink.trim(), linkName.trim(), linkDescription.trim(), estimatedTime);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleClose = () => {
    // Reset form state
    setFileLink('');
    setLinkName('');
    setLinkDescription('');
    setEstimatedTime(0);
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-DGXblack/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
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
                    <LinkIcon className="w-5 h-5 text-DGXgreen" />
                    Add Link for: <span className="text-DGXgreen">{unitName}</span>
                  </h3>
                  <p className="text-sm text-DGXgray mt-1">
                    Add external resources, videos, documents, or web pages
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="text-DGXgray hover:text-DGXblue transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-DGXgray mb-2">
                    Link URL
                  </label>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-DGXgray" />
                    <input
                      type="text"
                      value={fileLink}
                      onChange={(e) => {
                        setFileLink(e.target.value);
                        setErrors({ ...errors, fileLink: null });
                      }}
                      placeholder="Enter URL (https://...)"
                      className="flex-1 px-3 py-2 border border-DGXgray/30 rounded-lg focus:ring-DGXgreen focus:border-DGXgreen"
                    />
                  </div>
                  {errors.fileLink && (
                    <p className="mt-1 text-sm text-red-600">{errors.fileLink}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-DGXgray mb-2">
                    Link Title
                  </label>
                  <input
                    type="text"
                    value={linkName}
                    onChange={(e) => {
                      setLinkName(e.target.value);
                      setErrors({ ...errors, linkName: null });
                    }}
                    placeholder="Enter a title for the link"
                    className="w-full px-3 py-2 border border-DGXgray/30 rounded-lg focus:ring-DGXgreen focus:border-DGXgreen"
                  />
                  {errors.linkName && (
                    <p className="mt-1 text-sm text-red-600">{errors.linkName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-DGXgray mb-2">
                    Link Description 
                  </label>
                  <textarea
                    value={linkDescription}
                    onChange={(e) => setLinkDescription(e.target.value)}
                    placeholder="Enter a description of what this link contains"
                    rows={3}
                    className="w-full px-3 py-2 border border-DGXgray/30 rounded-lg focus:ring-DGXgreen focus:border-DGXgreen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-DGXgray mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Estimated Viewing Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={estimatedTime}
                    onChange={(e) => {
                      setEstimatedTime(parseInt(e.target.value) || 0);
                      setErrors({ ...errors, estimatedTime: null });
                    }}
                    className="w-32 px-3 py-2 border border-DGXgray/30 rounded-lg focus:ring-DGXgreen focus:border-DGXgreen"
                    placeholder="e.g., 15"
                  />
                  {errors.estimatedTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimatedTime}</p>
                  )}
                  <p className="text-xs text-DGXgray mt-1">
                    Set the estimated time needed to view this content
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-DGXgray/20">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-lg border border-DGXgray/30 text-DGXblue hover:bg-DGXgray/10 transition-colors font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${isSubmitting
                    ? 'bg-DGXgray/30 text-DGXgray cursor-not-allowed'
                    : 'bg-DGXblue hover:bg-blue-700 text-DGXwhite'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-5 h-5" />
                      Add Link
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

export default LinkUploadModal;
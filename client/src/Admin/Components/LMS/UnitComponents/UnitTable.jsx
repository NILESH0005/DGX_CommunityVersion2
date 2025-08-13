import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import FileUploader from '../FileUploader';
import ApiContext from '../../../context/ApiContext';

const UnitTable = ({ 
  units = [], 
  subModuleId,
  moduleId,
  onUnitsUpdated,
  onCancel 
}) => {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchData } = useContext(ApiContext);

  useEffect(() => {
    if (selectedUnit) {
      const pendingUploads = JSON.parse(localStorage.getItem('pendingUploads') || '[]');
      const pendingUpload = pendingUploads.find(
        upload => upload.unitId === selectedUnit.id && 
                 upload.submoduleId === subModuleId && 
                 upload.moduleId === moduleId
      );
      
      if (pendingUpload) {
        Swal.fire({
          title: 'Pending Upload Found',
          text: `You have a pending upload for this unit (${pendingUpload.file.name}). Would you like to continue with this file?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, use this file',
          cancelButtonText: 'No, upload new file',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
        }).then((result) => {
          if (result.isConfirmed) {
            const file = new File(
              [''], 
              pendingUpload.file.name,
              {
                type: pendingUpload.file.type,
                lastModified: new Date(pendingUpload.file.lastModified)
              }
            );
            setSelectedFile(file);
          }
        });
      }
    }
  }, [selectedUnit, subModuleId, moduleId]);

  const handleSubmitFile = async () => {
    if (!selectedUnit || !selectedFile) {
      Swal.fire('Error', 'Please select a unit and upload a file', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Upload',
      html: `You are about to upload <strong>${selectedFile.name}</strong> to <strong>${selectedUnit.name}</strong>. Continue?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, upload now',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('unitId', selectedUnit.id);
      formData.append('moduleId', moduleId);
      formData.append('subModuleId', subModuleId);

      const response = await fetchData(
        'lms/upload-learning-material',
        'POST',
        formData,
        {},
        true
      );

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Learning material uploaded successfully',
          showConfirmButton: false,
          timer: 1500
        });
        
        // Clear pending upload from localStorage
        const pendingUploads = JSON.parse(localStorage.getItem('pendingUploads') || '[]');
        const newPendingUploads = pendingUploads.filter(
          upload => !(upload.unitId === selectedUnit.id && 
                      upload.submoduleId === subModuleId && 
                      upload.moduleId === moduleId)
        );
        localStorage.setItem('pendingUploads', JSON.stringify(newPendingUploads));
        
        // Update units list
        if (onUnitsUpdated) {
          onUnitsUpdated();
        }
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      // console.error('Upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.message || 'Failed to upload file',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUnitsList = () => (
    <div className="space-y-3">
      {units.map(unit => (
        <motion.div 
          key={unit.id}
          whileHover={{ scale: 1.01 }}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedUnit?.id === unit.id ? 'bg-blue-50 border-DGXblue' : 'border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setSelectedUnit(unit)}
        >
          <div className="flex items-start justify-between">
            <div>
              <h5 className="font-medium text-gray-800">{unit.name}</h5>
              <p className="text-sm text-gray-600 mt-1">
                {unit.description || 'No description'}
              </p>
            </div>
            {unit.contentUrl && (
              <div className="flex-shrink-0 ml-4">
                <div className="badge badge-success gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Content uploaded
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {!selectedUnit ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Select a Unit</h4>
            <button 
              onClick={onCancel}
              className="btn btn-outline border-DGXblue text-DGXblue hover:bg-DGXblue hover:text-white"
            >
              Back to Submodules
            </button>
          </div>
          {renderUnitsList()}
        </>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="p-4 bg-blue-50 rounded-lg border border-DGXblue">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-DGXblue">
                    Selected: {selectedUnit.name}
                  </h5>
                  <p className="text-sm text-blue-600 mt-1">
                    {selectedUnit.description || 'No description'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="btn btn-sm btn-ghost text-DGXblue"
                >
                  Change Selection
                </button>
              </div>
            </div>

            <FileUploader
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              moduleId={moduleId}
              submoduleId={subModuleId}
              unitId={selectedUnit.id}
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedUnit(null);
                  setSelectedFile(null);
                }}
                className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFile}
                className="btn bg-DGXblue text-white hover:bg-blue-600"
                disabled={!selectedFile || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Uploading...
                  </>
                ) : 'Upload File'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default UnitTable;
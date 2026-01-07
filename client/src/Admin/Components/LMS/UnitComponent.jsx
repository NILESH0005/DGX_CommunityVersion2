import React from 'react';
import FileUploader from './FileUploader';
import UnitManager from './UnitComponents/UnitManager';

const UnitComponent = ({ 
  mode, 
  subModule, 
  unit, 
  fileData, 
  onUnitsUpdated, 
  onBack, 
  onSelectUnit, 
  onFileSelect 
}) => {
  if (mode === 'upload') {
    return (
      <div className="bg-white p-6 rounded-lg shadow border-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            Upload Content for: {unit.name}
          </h3>
          <button
            onClick={onBack}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          >
            Back to Units
          </button>
        </div>

        <div className="relative pt-4">
          <label className="block text-sm font-medium mb-2">Upload Learning Material</label>
          <div className="text-xs text-DGXblue mb-2">
            <span>Supported formats: PDF, PPT, DOC, MP4</span>
          </div>
          <FileUploader
            selectedFile={fileData}
            onFileSelect={onFileSelect}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border-2">
      <UnitManager
        subModule={subModule}
        onUnitsUpdated={onUnitsUpdated}
        onBack={onBack}
        onSelectUnit={onSelectUnit}
      />
    </div>
  );
};

export default UnitComponent;
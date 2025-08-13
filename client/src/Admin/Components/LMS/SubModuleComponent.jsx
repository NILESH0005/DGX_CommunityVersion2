import React from 'react';
import SubModuleManager from './SubModuleComponents/SubModuleManager';

const SubModuleComponent = ({ module, onSave, onCancel, onSelectSubmodule }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow border-2">
      <SubModuleManager
        module={module}
        onSave={onSave}
        onCancel={onCancel}
        onSelectSubmodule={onSelectSubmodule}
      />
    </div>
  );
};

export default SubModuleComponent;

import React, { useState } from 'react';
import ModuleForm from './ModuleForm';
import SubmoduleForm from './SubmoduleForm';
import UnitForm from './UnitForm';

export default function ModuleBuilder() {
  const [step, setStep] = useState(1);
  const [moduleData, setModuleData] = useState(null);
  const [submodule, setSubmodule] = useState(null);
  const [submoduleData, setSubmoduleData] = useState(null);
  const [savedSteps, setSavedSteps] = useState({
    1: false,
    2: false,
    3: false
  });

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>

      {step === 1 && (
        <ModuleForm
          onSuccess={(data, isServerSave) => {
            setModuleData(data);
            if (isServerSave) setSavedSteps(prev => ({...prev, 1: true}));
            handleNext();
          }}
          onBack={handleBack}
          editData={moduleData}
          isSaved={savedSteps[1]}
        />
      )}

      {step === 2 && (
        <SubmoduleForm
          moduleId={moduleData?.id}
          onSuccess={(data, isServerSave) => {
            setSubmoduleData(data);
            if (isServerSave) setSavedSteps(prev => ({...prev, 2: true}));
            handleNext();
          }}
          setSubmodule={setSubmodule}
          onBack={handleBack}
          editData={submoduleData}
          isSaved={savedSteps[2]}
        />
      )}

      {step === 3 && (
        <UnitForm
          submodule={submodule}
          moduleId={moduleData?.id}
          onBack={handleBack}
          isSaved={savedSteps[3]}
          onSuccess={(isServerSave) => {
            if (isServerSave) setSavedSteps(prev => ({...prev, 3: true}));
          }}
        />
      )}
    </div>
  );
}
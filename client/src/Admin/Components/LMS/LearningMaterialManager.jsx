import React, { useState, useReducer, useContext, useEffect } from 'react';
import ApiContext from '../../../context/ApiContext';
import Swal from "sweetalert2";
import ModuleComponent from './ModuleComponent';
import SubModuleComponent from './SubModuleComponent';
import UnitComponent from './UnitComponent';
import { v4 as uuidv4 } from 'uuid';
import { compressImage } from '../../../utils/compressImage';


const initialState = {
  module: null,
  subModule: null,
  unit: null,
  fileData: null,
  isCreatingModule: false,
  isEditingSubmodules: false,
  isEditingUnits: false
};

const calculateFilePercentages = (files) => {
  if (!files || files.length === 0) return [];
  const equalPercentage = 100 / files.length;
  return files.map(file => ({
    ...file,
    percentage: equalPercentage
  }));
};

const hasUploadedFiles = (module) => {
  if (!module || !module.subModules) return false;

  return module.subModules.some(subModule =>
    subModule.units?.some(unit =>
      unit.files && unit.files.length > 0
    )
  );
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'START_CREATING_MODULE':
      return {
        ...state,
        isCreatingModule: true,
        isEditingSubmodules: false,
        isEditingUnits: false
      };

    case 'SET_MODULE':
      return {
        ...state,
        module: action.payload ? {
          ...action.payload,
          subModules: action.payload.subModules || []
        } : null,
        isCreatingModule: false,
        isEditingSubmodules: !!action.payload,
        isEditingUnits: false,
        subModule: null,
        unit: null,
        fileData: null
      };

    case 'UPDATE_MODULE_WITH_SUBMODULES':
      return {
        ...state,
        module: {
          ...state.module,
          subModules: action.payload
        },
        isEditingSubmodules: false
      };

    case 'SET_SUBMODULE':
      return {
        ...state,
        subModule: action.payload,
        isEditingSubmodules: false,
        isEditingUnits: false,
        unit: null,
        fileData: null
      };

    case 'START_EDITING_UNITS':
      return {
        ...state,
        subModule: action.payload,
        isEditingUnits: true,
        isEditingSubmodules: false,
        unit: null
      };

    case 'UPDATE_SUBMODULE_UNITS':
      return {
        ...state,
        module: {
          ...state.module,
          subModules: state.module.subModules.map(subModule =>
            subModule.id === action.payload.subModuleId
              ? { ...subModule, units: action.payload.units }
              : subModule
          )
        },
        isEditingUnits: false
      };

    case 'SET_UNIT':
      return {
        ...state,
        unit: action.payload,
        fileData: null
      };

    case 'SET_FILE':
      return {
        ...state,
        fileData: action.payload
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

const LearningMaterialManager = () => {
  const { fetchData, user, userToken } = useContext(ApiContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [error, setError] = useState(null);


  const getCurrentDateTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
  const transformForBackend = async (moduleData) => {
    const currentUser = user?.username || 'system';
    const now = getCurrentDateTime();

    if (!moduleData?.ModuleName || !moduleData?.subModules) {
      throw new Error("Module name and at least one submodule are required");
    }

    // No need to compress images since we're storing paths
    return {
      ModuleName: moduleData.ModuleName,
      ModuleImage: moduleData.ModuleImage, // Keep as is if you still want to store binary
      ModuleImagePath: moduleData.ModuleImage, // Path from the original data
      ModuleDescription: moduleData.ModuleDescription || "",
      AuthAdd: currentUser,
      AddOnDt: now,
      editOnDt: now,
      delStatus: 0,
      subModules: moduleData.subModules.map(subModule => ({
        SubModuleName: subModule.SubModuleName,
        SubModuleImage: subModule.SubModuleImage, // Binary data if needed
        SubModuleImagePath: subModule.SubModuleImage, // Path from original data
        SubModuleDescription: subModule.SubModuleDescription || "",
        AuthAdd: currentUser,
        AddOnDt: now,
        delStatus: 0,
        Units: (subModule.units || []).map(unit => ({
          UnitName: unit.UnitName,
          UnitDescription: unit.UnitDescription || "",
          AuthAdd: currentUser,
          AddOnDt: now,
          delStatus: 0,
          Files: (unit.files || []).map(file => ({
            FilesName: file.originalName || `file_${Date.now()}`,
            FilePath: file.filePath || '',
            FileType: file.fileType || '',
            Percentage: file.percentage || 0,
            AuthAdd: currentUser,
            AddOnDt: now,
            delStatus: 0
          }))
        }))
      }))
    };
  };

  useEffect(() => {
    const savedData = localStorage.getItem('learningMaterials');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.module) {
          // Calculate percentages for all files when loading
          const moduleWithPercentages = {
            ...parsedData.module,
            subModules: parsedData.module.subModules.map(subModule => ({
              ...subModule,
              units: subModule.units.map(unit => ({
                ...unit,
                files: calculateFilePercentages(unit.files || [])
              }))
            }))
          };

          dispatch({
            type: 'SET_MODULE',
            payload: moduleWithPercentages
          });
        }
      } catch (error) {
        // console.error("Error parsing saved data:", error);
      }
    }
  }, []);

  const saveToLocalStorage = (moduleData) => {
    const dataToSave = {
      module: {
        id: moduleData.id || uuidv4(),
        ModuleName: moduleData.ModuleName,
        ModuleImage: moduleData.ModuleImage,
        ModuleDescription: moduleData.ModuleDescription,
        subModules: moduleData.subModules.map(subModule => ({
          id: subModule.id || uuidv4(),
          SubModuleName: subModule.SubModuleName,
          SubModuleImage: subModule.SubModuleImage,
          SubModuleDescription: subModule.SubModuleDescription,
          units: subModule.units.map(unit => ({
            id: unit.id || uuidv4(),
            UnitName: unit.UnitName,
            // UnitImg: unit.UnitImg,
            UnitDescription: unit.UnitDescription,
            files: calculateFilePercentages(unit.files || []).map(file => ({
              id: file.id,
              originalName: file.originalName,
              fileType: file.fileType,
              fileSize: file.fileSize,
              uploadedAt: file.uploadedAt,
              filePath: file.filePath,
              downloadUrl: file.downloadUrl,
              percentage: file.percentage

            }))
          }))
        }))
      }
    };
    localStorage.setItem('learningMaterials', JSON.stringify(dataToSave));


  };


  // const saveToLocalStorage = (moduleData) => {
  //   localStorage.setItem(
  //     'learningMaterials',
  //     JSON.stringify({ module: moduleData })
  //   );
  // };

  const handleSubmit = async () => {
    if (!formState.unit || !formState.fileData) {
      Swal.fire('Error', 'Please select a unit and upload a file', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', formState.fileData);
      formData.append('unitId', formState.unit.id);
      formData.append('moduleId', formState.module.id);

      if (formState.subModule) {
        formData.append('subModuleId', formState.subModule.id);
      }

      // Add auth info
      formData.append('authUser', user?.username || 'system');

      const uploadResponse = await fetchData(
        'lms/upload-learning-material',
        'POST',
        formData,
        {},
        true
      );

      if (uploadResponse.success) {
        const updatedModule = {
          ...formState.module,
          subModules: formState.module.subModules.map(subModule => {
            if (formState.subModule && subModule.id === formState.subModule.id) {
              return {
                ...subModule,
                units: subModule.units.map(unit => {
                  if (unit.id === formState.unit.id) {
                    // Create new files array with the uploaded file
                    const newFiles = [
                      ...(unit.files || []),
                      {
                        id: uuidv4(),
                        originalName: formState.fileData.name,
                        filePath: uploadResponse.file.filePath,
                        fileType: formState.fileData.type,
                        fileSize: formState.fileData.size,
                        uploadedAt: new Date().toISOString(),
                        serverName: uploadResponse.file.storedName,
                        storagePath: uploadResponse.file.storagePath,
                        percentage: 0 // Will be recalculated

                      }
                    ];

                    // Calculate equal percentages for all files
                    const filesWithPercentages = calculateFilePercentages(newFiles);

                    return {
                      ...unit,
                      files: filesWithPercentages
                    };
                  }
                  return unit;
                })
              };
            }
            return subModule;
          })
        };

        saveToLocalStorage(updatedModule);
        dispatch({ type: 'SET_MODULE', payload: updatedModule });

        Swal.fire('Success', 'Learning material uploaded successfully', 'success');
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to upload file', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAllData = async () => {
    if (!formState.module) {
      Swal.fire('Error', 'No module data to submit', 'error');
      return;
    }

    if (!userToken) {
      Swal.fire('Error', 'Authentication token missing. Please log in again.', 'error');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // console.log('🏁 handleSubmitAllData firing, reading from LS…');
      const savedData = JSON.parse(localStorage.getItem('learningMaterials'));
      // console.log('📦 savedData.module =', savedData.module);
      if (!savedData?.module) {
        throw new Error("No module data found in local storage");
      }

      const payload = await transformForBackend(savedData.module);
      // console.log("Processed payload for submission:", payload);

      const requestBody = JSON.stringify({ module: payload });
      // console.log("Request body being sent:", requestBody);
      const response = await fetchData(
        'lms/save-learning-materials',
        'POST',
        { module: payload },
        {
          'Content-Type': 'application/json',
          'auth-token': userToken
        }
      );

      if (!response) {
        throw new Error("No response received from server");
      }

      if (response.success) {
        Swal.fire('Success', 'All learning materials submitted successfully', 'success');
        localStorage.removeItem('learningMaterials');
        dispatch({ type: 'RESET' });
      } else {
        throw new Error(response.message || "Submission failed");
      }
    } catch (error) {
      // console.error("Detailed submission error:", error);
      setError(error.message);
      Swal.fire('Error', error.message || 'Failed to submit learning materials', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModuleCreated = (newModule) => {
    const learningData = {
      ...newModule,
      subModules: newModule.subModules || []
    };
    const currentModules = JSON.parse(localStorage.getItem("learningMaterials")) || {};
    localStorage.setItem("learningMaterials", JSON.stringify({
      ...currentModules,
      module: learningData
    }));
    dispatch({ type: 'SET_MODULE', payload: learningData });
  };

  const handleSubmoduleCreated = (updatedModule) => {
    const currentData = JSON.parse(localStorage.getItem("learningMaterials")) || {};
    localStorage.setItem("learningMaterials", JSON.stringify({
      ...currentData,
      module: updatedModule
    }));

    dispatch({ type: 'SET_MODULE', payload: updatedModule });
  };

  const handleUnitsUpdated = (subModuleId, units) => {
    dispatch({
      type: 'UPDATE_SUBMODULE_UNITS',
      payload: { subModuleId, units }
    });
    saveToLocalStorage({
      ...formState.module,
      subModules: formState.module.subModules.map(subModule =>
        subModule.id === subModuleId
          ? { ...subModule, units }
          : subModule
      )
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Learning Management System</h2>
        <p className="text-gray-600">Create and organize your educational content</p>
      </div>

      <div className="space-y-6">
        {formState.isCreatingModule ? (
          <ModuleComponent
            mode="create"
            onCancel={() => dispatch({ type: 'RESET' })}
            onCreate={handleModuleCreated}
          />
        ) : !formState.module ? (
          <ModuleComponent
            mode="empty"
            onCreateModule={() => dispatch({ type: 'START_CREATING_MODULE' })}
          />
        ) : formState.isEditingSubmodules ? (
          <SubModuleComponent
            module={formState.module}
            onSave={handleSubmoduleCreated}
            onCancel={() => dispatch({ type: 'SET_MODULE', payload: formState.module })}
            onSelectSubmodule={(subModule) => dispatch({
              type: 'START_EDITING_UNITS',
              payload: subModule
            })}
          />
        ) : formState.isEditingUnits ? (
          <UnitComponent
            subModule={formState.subModule}
            onUnitsUpdated={(units) => handleUnitsUpdated(formState.subModule.id, units)}
            onBack={() => dispatch({ type: 'SET_MODULE', payload: formState.module })}
            onSelectUnit={(unit) => dispatch({ type: 'SET_UNIT', payload: unit })}
          />
        ) : formState.unit ? (
          <UnitComponent
            mode="upload"
            unit={formState.unit}
            fileData={formState.fileData}
            onFileSelect={(file) => dispatch({ type: 'SET_FILE', payload: file })}
            onBack={() => dispatch({ type: 'SET_UNIT', payload: null })}
          />
        ) : (
          <ModuleComponent
            mode="view"
            module={formState.module}
            onManageSubmodules={() => dispatch({ type: 'SET_MODULE', payload: formState.module })}
          />
        )}

        <div className="flex justify-between pt-6 border-t">
          <div>
            {formState.module && (
              <button
                onClick={() => {
                  if (formState.unit) {
                    dispatch({ type: 'SET_UNIT', payload: null });
                  } else if (formState.isEditingUnits) {
                    dispatch({ type: 'SET_MODULE', payload: formState.module });
                  } else if (formState.isEditingSubmodules) {
                    dispatch({ type: 'RESET' });
                  }
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              >
                <svg className="w-5 h-5 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              disabled={isSubmitting}
            >
              Start Over
            </button>

            {/* Show different buttons based on state */}
            {formState.unit && formState.fileData ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Uploading...' : 'Upload File'}
              </button>
            ) : formState.module && hasUploadedFiles(formState.module) ? (
              <button
                onClick={handleSubmitAllData}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit All Content'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningMaterialManager;
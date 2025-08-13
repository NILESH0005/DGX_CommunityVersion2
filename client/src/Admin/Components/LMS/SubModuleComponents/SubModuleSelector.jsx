// SubModuleSelector.js
import React, { useState, useEffect, useContext } from 'react';
import SubModuleCreator from './SubModuleCreator';
import ApiContext from '../../../../context/ApiContext';
import Swal from 'sweetalert2';

const SubModuleSelector = ({ module, selectedSubModule, onSelectSubModule }) => {
  const [subModules, setSubModules] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { fetchData } = useContext(ApiContext);

  // Fetch sub-modules when module changes
  useEffect(() => {
    const fetchSubModules = async () => {
      if (!module?.id) return;
      
      try {
        setIsLoading(true);
        setErrors({});
        
        const response = await fetchData(
          `lms/sub-modules?moduleId=${module.id}`, // Updated endpoint
          'GET',
          { 'Content-Type': 'application/json' }
        );

        if (!response) {
          throw new Error('No response received from server');
        }

        if (response.success && Array.isArray(response.data)) {
          setSubModules(response.data.map(subMod => ({
            id: subMod.id, // Note: using the renamed fields from API
            name: subMod.name,
            description: subMod.description,
            image: subMod.image,
            moduleId: subMod.moduleId
          })));
        } else {
          throw new Error(response.message || 'Invalid data format received');
        }
      } catch (error) {
        // console.error('Error fetching sub-modules:', error);
        setErrors({ fetch: error.message || 'Failed to load sub-modules' });
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to load sub-modules'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubModules();
  }, [module?.id, fetchData]);

  // ... rest of your component remains the same ...
   const handleSubModuleCreated = (newSubModule) => {
    const createdSubModule = {
      id: newSubModule.id || Date.now(),
      name: newSubModule.name,
      description: newSubModule.description,
      image: newSubModule.image,
      moduleId: module.id,
      units: [] // Initialize with empty units array
    };
    
    // Call parent handler
    onSelectSubModule(createdSubModule);
    setIsCreating(false);
  };

  return (
    <div className="card bg-base-100 shadow">
        <div className="card-body">
        <h3 className="card-title text-lg">2. Select Sub-Module</h3>
        
        {errors.fetch && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errors.fetch}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : !isCreating ? (
          <>
            {subModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subModules.map(subMod => (
                  <div
                    key={subMod.id}
                    className={`card bg-base-100 shadow-md cursor-pointer transition-all hover:shadow-lg ${
                      selectedSubModule?.id === subMod.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onSelectSubModule(subMod)}
                  >
                    <figure className="px-4 pt-4">
                      {subMod.image ? (
                        <img 
                          src={`data:image/jpeg;base64,${subMod.image}`} 
                          alt={subMod.name}
                          className="rounded-xl h-32 w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-32 w-full bg-gray-200 rounded-xl">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </figure>
                    <div className="card-body p-4">
                      <h4 className="card-title text-lg">{subMod.name}</h4>
                      {subMod.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {subMod.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No sub-modules available for this module.</p>
                <button
                  className="btn btn-primary mt-4"
                  onClick={() => setIsCreating(true)}
                >
                  + Create First Sub-Module
                </button>
              </div>
            )}

            {subModules.length > 0 && (
              <button
                className="btn btn-outline w-full mt-4"
                onClick={() => setIsCreating(true)}
              >
                + Create New Sub-Module
              </button>
            )}
          </>
        ) : (
          <SubModuleCreator
            moduleId={module.id}
            onCancel={() => setIsCreating(false)}
            onCreate={handleSubModuleCreated}
          />
        )}
      </div>
    </div>
  );
};

export default SubModuleSelector;
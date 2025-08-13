import React, { useState, useEffect, useContext } from 'react';
import ModuleCreator from './ModuleCreator';
import Swal from 'sweetalert2';
import ApiContext from '../../../../context/ApiContext';

const ModuleSelector = ({ selectedModule, onSelectModule }) => {
  const [modules, setModules] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const { fetchData } = useContext(ApiContext);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setIsLoading(true);
        setErrors({});
        
        const response = await fetchData(
          'dropdown/getModules', 
          'GET',
          { 'Content-Type': 'application/json' }
        );
        
        if (!response) {
          throw new Error('No response received from server');
        }

        if (response.success && Array.isArray(response.data)) {
          setModules(response.data.map(module => ({
            id: module.ModuleID,
            name: module.ModuleName,
            description: module.ModuleDescription,
            image: module.ModuleImage
          })));
        } else {
          throw new Error(response.message || 'Invalid data format received');
        }
      } catch (error) {
        // console.error('Error fetching modules:', error);
        setErrors({ fetch: error.message || 'Failed to load modules' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [fetchData]);

  const handleModuleCreated = (newModule) => {
    const createdModule = {
      id: newModule.ModuleID || Date.now(),
      name: newModule.name,
      description: newModule.description,
      image: newModule.image
    };
    setModules(prev => [...prev, createdModule]);
    onSelectModule(createdModule);
    setIsCreating(false);
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title text-lg">1. Select Module</h3>
        
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
            <select
              className="select select-bordered w-full"
              onChange={(e) => {
                const selected = modules.find(mod => mod.id.toString() === e.target.value);
                onSelectModule(selected || null);
              }}
              value={selectedModule?.id || ''}
              disabled={isLoading}
            >
              <option value="">-- Select Existing Module --</option>
              {modules.map(mod => (
                <option key={mod.id} value={mod.id}>
                  {mod.name}
                </option>
              ))}
            </select>

            <button
              className="btn btn-outline w-full mt-2"
              onClick={() => setIsCreating(true)}
              disabled={isLoading}
            >
              + Create New Module
            </button>
          </>
        ) : (
          <ModuleCreator
            onCancel={() => setIsCreating(false)}
            onCreate={handleModuleCreated}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default ModuleSelector;
// UnitSelector.js
import React, { useState, useEffect, useContext } from 'react';
// import UnitCreator from './UnitCreator'; // You'll need to create this similar to SubModuleCreator
import ApiContext from '../../../../context/ApiContext';
import Swal from 'sweetalert2';

const UnitSelector = ({ subModule, selectedUnit, onSelectUnit }) => {
  // const [units, setUnits] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { fetchData } = useContext(ApiContext);
    const units = subModule?.units || [];


  // Fetch units when subModule changes
  // useEffect(() => {
  //   const fetchUnits = async () => {
  //     if (!subModule?.id) return;
      
  //     try {
  //       setIsLoading(true);
  //       setErrors({});
        
  //       const response = await fetchData(
  //         `lms/units?subModuleId=${subModule.id}`,
  //         'GET',
  //         { 'Content-Type': 'application/json' }
  //       );

  //       if (!response) {
  //         throw new Error('No response received from server');
  //       }

  //       if (response.success && Array.isArray(response.data)) {
  //         setUnits(response.data.map(unit => ({
  //           id: unit.id,
  //           name: unit.name,
  //           description: unit.description,
  //           image: unit.image,
  //           subModuleId: unit.subModuleId
  //         })));
  //       } else {
  //         throw new Error(response.message || 'Invalid data format received');
  //       }
  //     } catch (error) {
  //       // console.error('Error fetching units:', error);
  //       setErrors({ fetch: error.message || 'Failed to load units' });
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Error',
  //         text: error.message || 'Failed to load units'
  //       });
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchUnits();
  // }, [subModule?.id, fetchData]);

  const handleUnitCreated = (newUnit) => {
    const createdUnit = {
      id: newUnit.id || Date.now(),
      name: newUnit.name,
      description: newUnit.description,
      image: newUnit.image,
      subModuleId: subModule.id
    };
    
    // Call parent handler with the subModuleId and new unit
    onSelectUnit(subModule.id, createdUnit);
    setIsCreating(false);
  };
  
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title text-lg">3. Select Unit</h3>
        
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
            {units.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map(unit => (
                  <div
                    key={unit.id}
                    className={`card bg-base-100 shadow-md cursor-pointer transition-all hover:shadow-lg ${
                      selectedUnit?.id === unit.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onSelectUnit(unit)}
                  >
                    <figure className="px-4 pt-4">
                      {unit.image ? (
                        <img 
                          src={`data:image/jpeg;base64,${unit.image}`} 
                          alt={unit.name}
                          className="rounded-xl h-32 w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-32 w-full bg-gray-200 rounded-xl">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </figure>
                    <div className="card-body p-4">
                      <h4 className="card-title text-lg">{unit.name}</h4>
                      {unit.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {unit.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No units available for this sub-module.</p>
                <button
                  className="btn btn-primary mt-4"
                  onClick={() => setIsCreating(true)}
                >
                  + Create First Unit
                </button>
              </div>
            )}

            {units.length > 0 && (
              <button
                className="btn btn-outline w-full mt-4"
                onClick={() => setIsCreating(true)}
              >
                + Create New Unit
              </button>
            )}
          </>
        ) : (
          <UnitCreator
            subModuleId={subModule.id}
            onCancel={() => setIsCreating(false)}
            onCreate={handleUnitCreated}
          />
        )}
      </div>
    </div>
  );
};

export default UnitSelector;
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Swal from 'sweetalert2';

const SubmoduleOrder = ({ submodules, onClose, onSave }) => {
  const [orderedSubmodules, setOrderedSubmodules] = useState([...submodules]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(orderedSubmodules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedSubmodules(items);
  };

  const handleSave = () => {
    const simplifiedSubmodules = orderedSubmodules.map((submodule, index) => ({
      SubModuleID: submodule.SubModuleID,
      SortingOrder: index + 1
    }));
    onSave(orderedSubmodules);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md md:max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Manage Submodule Order</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 sm:h-6 sm:w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="submodules">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-2 max-h-[60vh] overflow-y-auto"
              >
                {orderedSubmodules.map((submodule, index) => (
                  <Draggable key={submodule.SubModuleID} draggableId={submodule.SubModuleID.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center p-2 sm:p-3 border border-gray-200 rounded-lg bg-white"
                      >
                        <span className="text-gray-500 mr-2 sm:mr-3 flex-shrink-0 text-sm sm:text-base">
                          {index + 1}
                        </span>
                        <span className="font-medium flex-grow min-w-0 break-words text-sm sm:text-base">
                          {submodule.SubModuleName}
                        </span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 ml-1 sm:ml-2" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm sm:text-base"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmoduleOrder;
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaFile, FaLink } from "react-icons/fa";

const FilesOrder = ({ files, onClose, onSave }) => {
  const [orderedFiles, setOrderedFiles] = useState([]);

  useEffect(() => {
    if (files && Array.isArray(files)) {
      setOrderedFiles([...files].sort((a, b) => (a.SortingOrder || 0) - (b.SortingOrder || 0)));
    }
  }, [files]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(orderedFiles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedFiles(items);
  };

  const handleSave = () => {
    if (!orderedFiles || orderedFiles.length === 0) {
      Swal.fire('Warning', 'No files to reorder', 'warning');
      return;
    }
    onSave(orderedFiles);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 sm:w-full md:w-3/4 lg:w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Manage Files Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {orderedFiles.length > 0 ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="files">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 max-h-96 overflow-y-auto"
                >
                  {orderedFiles.map((file, index) => (
                    <Draggable 
                      key={file.FileID} 
                      draggableId={file.FileID.toString()} 
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center p-3 border border-gray-200 rounded-lg bg-white"
                        >
                          <span className="text-gray-500 mr-3 sm:mr-4 flex-shrink-0">{index + 1}</span>
                          <div className="flex items-center flex-grow min-w-0">
                            {file.FileType === 'link' ? (
                              <FaLink className="text-blue-500 mr-2 flex-shrink-0" />
                            ) : (
                              <FaFile className="text-gray-500 mr-2 flex-shrink-0" />
                            )}
                            <span className="font-medium truncate overflow-hidden text-ellipsis break-words">
                              {file.FilesName}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                            {file.Percentage}%
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No files available to reorder
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={orderedFiles.length === 0}
            className={`px-4 py-2 rounded-md ${
              orderedFiles.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilesOrder;
import React from 'react';
import ModuleCreator from './ModuleComponents/ModuleCreator';

const ModuleComponent = ({ mode, module, onCreateModule, onManageSubmodules, onCreate, onCancel }) => {
  if (mode === 'empty') {
    return (
      <div className="text-center py-8 bg-white p-6 rounded-lg shadow border-2">
        <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Start by creating a module</h3>
        <p className="text-gray-600 mb-4">Modules help organize your learning materials</p>
        <button
          onClick={onCreateModule}
          className="px-4 py-2 bg-DGXblue text-white rounded-md hover:bg-blue-600 transition"
        >
          Create New Module
        </button>
      </div>
    );
  }

  if (mode === 'create') {
    return (
        <ModuleCreator
          onCancel={onCancel}
          onCreate={onCreate}
        />
    );
  }

  // if (mode === 'view') {
  //   return (
  //     // <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
  //     //   <div className="flex items-start justify-between gap-4">
  //     //     <div className="flex-1 min-w-0">
  //     //       <div className="flex items-center gap-2 mb-2">
  //     //         <h3 className="text-xl font-semibold text-gray-900 truncate">{module.name}</h3>
  //     //         {module.badge && (
  //     //           <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
  //     //             {module.badge}
  //     //           </span>
  //     //         )}
  //     //       </div>
  //     //       {module.description && (
  //     //         <p className="text-gray-600 line-clamp-2">{module.description}</p>
  //     //       )}
  //     //     </div>

  //     //     {module.banner && (
  //     //       <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
  //     //         <img
  //     //           src={module.banner}
  //     //           alt="Module banner"
  //     //           className="w-full h-full object-cover"
  //     //         />
  //     //       </div>
  //     //     )}
  //     //   </div>

  //     //   <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
  //     //     <div className="text-sm text-gray-500">
  //     //       {module.meta && (
  //     //         <span>{module.meta}</span>
  //     //       )}
  //     //     </div>

  //     //     <button
  //     //       onClick={onManageSubmodules}
  //     //       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
  //     //     >
  //     //       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
  //     //         <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
  //     //         <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  //     //       </svg>
  //     //       Manage Submodules
  //     //     </button>
  //     //   </div>
  //     // </div>
  //   );
  // }

  return null;
};

export default ModuleComponent;
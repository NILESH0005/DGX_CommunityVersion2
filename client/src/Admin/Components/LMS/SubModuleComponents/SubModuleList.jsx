import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, PlusCircle } from 'lucide-react';

const SubModuleList = ({ subModules, selectedSubModule, onSelectSubModule, onRemoveSubModule }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-DGXwhite rounded-xl shadow-sm border border-DGXgray/20 overflow-hidden w-full"
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-DGXblue flex items-center gap-2">
                        <FileText className="w-5 h-5 text-DGXgreen" />
                        Submodules
                    </h3>
                </div>

                {subModules.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center justify-center py-10 bg-DGXgray/5 rounded-lg border border-dashed border-DGXgray/20"
                    >
                        <PlusCircle className="w-12 h-12 text-DGXgray mb-4" />
                        <p className="text-DGXgray">No submodules added yet</p>
                        <p className="text-sm text-DGXgray mt-1">Add your first submodule to get started</p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {subModules.map((subModule, index) => (
                            <motion.div
                                key={subModule.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                whileHover={{ 
                                    scale: 1.01,
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                whileTap={{ scale: 0.99 }}
                                className={`p-4 rounded-lg cursor-pointer transition-all border ${
                                    selectedSubModule?.id === subModule.id 
                                        ? 'border-DGXgreen bg-DGXgreen/10' 
                                        : 'border-DGXgray/20 hover:border-DGXgreen/50'
                                }`}
                                onClick={() => onSelectSubModule(subModule)}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-medium truncate ${
                                            selectedSubModule?.id === subModule.id 
                                                ? 'text-DGXgreen' 
                                                : 'text-DGXblue'
                                        }`}>
                                            {subModule.SubModuleName}
                                        </h4>
                                        <p className={`text-sm mt-1 ${
                                            selectedSubModule?.id === subModule.id 
                                                ? 'text-DGXgreen/80' 
                                                : 'text-DGXgray'
                                        } line-clamp-2`}>
                                            {subModule.SubModuleDescription || 'No description provided'}
                                        </p>
                                        <div className={`inline-flex items-center mt-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            selectedSubModule?.id === subModule.id 
                                                ? 'bg-DGXgreen/20 text-DGXgreen' 
                                                : 'bg-DGXgray/10 text-DGXblue'
                                        }`}>
                                            {subModule.units.length} {subModule.units.length === 1 ? 'unit' : 'units'}
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveSubModule(subModule.id);
                                        }}
                                        className={`p-2 rounded-full ${
                                            selectedSubModule?.id === subModule.id 
                                                ? 'text-DGXgreen hover:bg-DGXgreen/20' 
                                                : 'text-DGXgray hover:bg-DGXgray/10'
                                        }`}
                                        aria-label="Remove submodule"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SubModuleList;
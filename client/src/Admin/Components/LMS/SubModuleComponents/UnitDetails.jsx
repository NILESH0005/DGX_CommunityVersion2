import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Image as ImageIcon } from 'lucide-react';

const UnitDetails = ({ subModule }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-DGXwhite rounded-xl shadow-sm border border-DGXgray/20 overflow-hidden w-full"
        >
            <div className="p-6">
                <div className="flex justify-between items-start gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-5 h-5 text-DGXgreen" />
                            <motion.h3 
                                whileHover={{ color: '#76B900' }}
                                className="text-2xl font-bold text-DGXblue truncate"
                            >
                                {subModule.SubModuleName}
                            </motion.h3>
                        </div>
                        
                        {subModule.SubModuleDescription && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-DGXgray mt-2 leading-relaxed"
                            >
                                {subModule.SubModuleDescription}
                            </motion.p>
                        )}
                    </div>

                    {subModule.SubModuleImage && (
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            className="relative group"
                        >
                            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-DGXgray/20 group-hover:border-DGXgreen transition-all">
                                <img 
                                    src={subModule.SubModuleImage} 
                                    alt="Submodule banner" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ImageIcon className="w-6 h-6 text-DGXwhite" />
                            </div>
                        </motion.div>
                    )}
                </div>

                {subModule.units && subModule.units.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 pt-4 border-t border-DGXgray/20"
                    >
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-DGXgreen/10 text-DGXgreen text-sm font-medium">
                            {subModule.units.length} {subModule.units.length === 1 ? 'Unit' : 'Units'}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default UnitDetails;
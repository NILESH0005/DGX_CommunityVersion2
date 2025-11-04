import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    File, 
    Image, 
    Download, 
    Eye, 
    AlertCircle, 
    Link as LinkIcon, 
    ChevronDown,
    ChevronUp,
    Smartphone
} from 'lucide-react';

const FilesTable = ({ files = [], onImageClick }) => {
    const [expandedFile, setExpandedFile] = useState(null);

    const toggleFileExpansion = (fileId) => {
        setExpandedFile(expandedFile === fileId ? null : fileId);
    };

    if (!files || files.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center p-6 rounded-lg bg-DGXgray/10 border border-DGXgray/20 mt-6"
            >
                <AlertCircle className="w-6 h-6 text-DGXblue mr-3" />
                <span className="text-DGXblue">No files uploaded yet</span>
            </motion.div>
        );
    }

    // Mobile Card View Component
    const MobileFileCard = ({ file, index }) => {
        const isLink = file.FileType === 'link' || file.FileType === 'text/uri-list' || file.isLink;
        const fileName = file.FilesName || file.originalName || 'Untitled';
        const filePath = file.FilePath || file.filePath;
        const fileType = file.FileType || file.fileType || 'application/octet-stream';
        const isImage = fileType.startsWith('image/');
        const uploadDate = file.AddOnDt || file.uploadedAt;
        const fileSize = Math.round((file.size || 0) / 1024);
        const isExpanded = expandedFile === file.id;

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(118, 185, 0, 0.05)' }}
                className="bg-DGXwhite rounded-xl border border-DGXgray/20 shadow-sm p-4 mb-3 transition-colors duration-150"
            >
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-DGXgray/10 mt-1">
                            {isLink ? (
                                <LinkIcon className="w-6 h-6 text-DGXblue" />
                            ) : isImage ? (
                                <Image className="w-6 h-6 text-DGXgreen" />
                            ) : (
                                <File className="w-6 h-6 text-DGXblue" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-DGXblack truncate">
                                {fileName}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-DGXblue bg-DGXgray/10 px-2 py-1 rounded-full capitalize">
                                    {isLink ? 'Link' : fileType.split('/')[1] || fileType}
                                </span>
                                {!isLink && (
                                    <span className="text-xs text-DGXgray">
                                        {fileSize} KB
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleFileExpansion(file.id)}
                        className="flex-shrink-0 ml-2 p-2 text-DGXgray hover:text-DGXblue transition-colors"
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </motion.button>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 pt-4 border-t border-DGXgray/20"
                        >
                            {/* File Details */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-DGXgray">Upload Date:</span>
                                    <span className="text-sm text-DGXblue font-medium">
                                        {uploadDate ? new Date(uploadDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                
                                {isLink && (
                                    <div className="flex flex-col space-y-2">
                                        <span className="text-sm text-DGXgray">URL:</span>
                                        <a
                                            href={filePath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-DGXblue hover:underline break-all truncate"
                                            title={filePath}
                                        >
                                            {filePath}
                                        </a>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex space-x-2 pt-2">
                                    {isLink ? (
                                        <motion.a
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            href={filePath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center p-3 rounded-xl text-DGXwhite bg-DGXgreen hover:bg-[#68a600] transition-colors space-x-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span className="text-sm font-medium">Open Link</span>
                                        </motion.a>
                                    ) : (
                                        <>
                                            {filePath && isImage && onImageClick ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => onImageClick(filePath)}
                                                    className="flex-1 flex items-center justify-center p-3 rounded-xl text-DGXwhite bg-DGXgreen hover:bg-[#68a600] transition-colors space-x-2"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span className="text-sm font-medium">View</span>
                                                </motion.button>
                                            ) : filePath && !isImage ? (
                                                <>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => window.open(filePath, '_blank')}
                                                        className="flex-1 flex items-center justify-center p-3 rounded-xl text-DGXwhite bg-DGXgreen hover:bg-[#68a600] transition-colors space-x-2"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span className="text-sm font-medium">View</span>
                                                    </motion.button>
                                                    <motion.a
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        href={filePath}
                                                        download={fileName}
                                                        className="flex-1 flex items-center justify-center p-3 rounded-xl border border-DGXgray/30 hover:bg-DGXgray/10 text-DGXblue transition-colors space-x-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Download</span>
                                                    </motion.a>
                                                </>
                                            ) : null}
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    // Desktop Table View
    const DesktopTableView = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-6 w-full hidden lg:block"
        >
            <div className="overflow-hidden rounded-xl border border-DGXgray/20 shadow-sm">
                <table className="min-w-full divide-y divide-DGXgray/20">
                    <thead className="bg-DGXgray/5">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-DGXblue uppercase tracking-wider">
                                File Name
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-DGXblue uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-DGXblue uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-4 text-right text-sm font-medium text-DGXblue uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-DGXwhite divide-y divide-DGXgray/20">
                        {files.map((file, index) => {
                            const isLink = file.FileType === 'link' || file.FileType === 'text/uri-list' || file.isLink;
                            const fileName = file.FilesName || file.originalName || 'Untitled';
                            const filePath = file.FilePath || file.filePath;
                            const fileType = file.FileType || file.fileType || 'application/octet-stream';
                            const isImage = fileType.startsWith('image/');
                            const uploadDate = file.AddOnDt || file.uploadedAt;

                            return (
                                <motion.tr
                                    key={file.id || uuidv4()}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    whileHover={{ backgroundColor: 'rgba(118, 185, 0, 0.05)' }}
                                    className="transition-colors duration-150"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-DGXgray/10">
                                                {isLink ? (
                                                    <LinkIcon className="w-5 h-5 text-DGXblue" />
                                                ) : isImage ? (
                                                    <Image className="w-5 h-5 text-DGXgreen" />
                                                ) : (
                                                    <File className="w-5 h-5 text-DGXblue" />
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-DGXblack truncate max-w-xs">
                                                    {fileName}
                                                </div>
                                                {isLink ? (
                                                    <a
                                                        href={filePath}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-DGXgray hover:underline truncate max-w-xs block"
                                                        title={filePath}
                                                    >
                                                        {filePath}
                                                    </a>
                                                ) : (
                                                    <div className="text-xs text-DGXgray">
                                                        {Math.round((file.size || 0) / 1024)} KB
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-DGXblue capitalize">
                                            {isLink ? 'Link' : fileType.split('/')[1] || fileType}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-DGXgray">
                                            {uploadDate ? new Date(uploadDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {isLink ? (
                                                <motion.a
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    href={filePath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg text-DGXwhite bg-DGXgreen hover:bg-[#68a600] transition-colors"
                                                    title="Open link"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </motion.a>
                                            ) : (
                                                <>
                                                    {filePath && isImage && onImageClick ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => onImageClick(filePath)}
                                                            className="p-2 rounded-lg text-DGXwhite bg-DGXgreen hover:bg-[#68a600] transition-colors"
                                                            title="View image"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </motion.button>
                                                    ) : filePath && !isImage ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => window.open(filePath, '_blank')}
                                                            className="p-2 rounded-lg text-DGXwhite bg-DGXgreen hover:bg-[#68a600] transition-colors"
                                                            title="View file"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </motion.button>
                                                    ) : null}
                                                    {filePath && !isImage && (
                                                        <motion.a
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            href={filePath}
                                                            download={fileName}
                                                            className="p-2 rounded-lg border border-DGXgray/30 hover:bg-DGXgray/10 text-DGXblue transition-colors"
                                                            title="Download file"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </motion.a>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    // Mobile Grid View
    const MobileGridView = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-6 lg:hidden"
        >
            <div className="space-y-3">
                {files.map((file, index) => (
                    <MobileFileCard key={file.id || uuidv4()} file={file} index={index} />
                ))}
            </div>
        </motion.div>
    );

    return (
        <div className="w-full">
            {/* Responsive Indicator (optional - can remove) */}
            <div className="lg:hidden flex items-center justify-center mb-4">
                <div className="flex items-center space-x-2 text-xs text-DGXgray bg-DGXgray/10 px-3 py-1 rounded-full">
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile View</span>
                </div>
            </div>

            {/* Desktop Table */}
            <DesktopTableView />
            
            {/* Mobile Cards */}
            <MobileGridView />
        </div>
    );
};

export default FilesTable;
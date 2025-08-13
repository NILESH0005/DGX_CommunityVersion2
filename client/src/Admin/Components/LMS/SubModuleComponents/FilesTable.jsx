import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { File, Image, Download, Eye, AlertCircle } from 'lucide-react';

const FilesTable = ({ files = [] }) => {
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-6 w-full"
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
                            const isLink = file.FileType === 'link' || file.FileType === 'text/uri-list';
                            const fileName = file.FilesName || 'Untitled';
                            const filePath = file.FilePath;
                            const fileType = file.FileType || 'application/octet-stream';
                            const isImage = fileType.startsWith('image/');

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
                                                    <FaLink className="w-5 h-5 text-DGXblue" />
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
                                                        className="text-xs text-DGXgray hover:underline"
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
                                            {new Date(file.AddOnDt).toLocaleDateString()}
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
                                                    {filePath && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => window.open(filePath, '_blank')}
                                                            className="p-2 rounded-lg text-DGXwhite bg-DGXgreen hover:bg-[#68a600] transition-colors"
                                                            title="View file"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </motion.button>
                                                    )}
                                                    {filePath && (
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
};

export default FilesTable;
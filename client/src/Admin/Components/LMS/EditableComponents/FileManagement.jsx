import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaFolder, FaSave, FaTimes, FaUpload, FaFile, FaLink } from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";
import FilesOrder from "./FilesOrder";


const FileManagement = ({ selectedUnit, fetchData, userToken }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [fileLink, setFileLink] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editedFileData, setEditedFileData] = useState({
    fileName: "",
    description: "",
    link: "",
  });
  const [showFilesOrder, setShowFilesOrder] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!selectedUnit) return;

      try {
        setLoading(true);
        const response = await fetchData(
          `lms/getFiles?unitId=${selectedUnit.UnitID}`,
          "GET",
          null,
          { "auth-token": userToken }
        );

        if (response?.success) {
          setFiles(response.data);
        } else {
          setFiles([]);
        }
      } catch (err) {
        // console.error("Error fetching files:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [selectedUnit?.UnitID, selectedUnit, fetchData, userToken]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).map((file) => ({
      file,
      name: file.name,
      customName: file.name,
    }));
    setNewFiles((prev) => [...prev, ...selected]);
  };

  const handleUploadFiles = async () => {
    if (newFiles.length === 0 && fileLink.trim() === "") {
      Swal.fire("Error!", "Please select files or enter a link", "error");
      return;
    }

    setIsUploading(true);
    const uploadToast = Swal.fire({
      title: "Uploading...",
      html: `Uploading ${newFiles.length} file(s)...`,
      allowOutsideClick: false,
      showConfirmButton: false,
    });

    try {
      // Upload files sequentially
      for (const fileObj of newFiles) {
        const formData = new FormData();
        formData.append('file', fileObj.file);
        formData.append('moduleId', selectedUnit.ModuleID);
        formData.append('subModuleId', selectedUnit.SubModuleID);
        formData.append('unitId', selectedUnit.UnitID);
        formData.append('customFileName', fileObj.customName || fileObj.file.name);

        await fetch(`${import.meta.env.VITE_API_BASEURL}lms/upload-learning-material-update`, {
          method: 'POST',
          body: formData,
          headers: { 'auth-token': userToken }
        });
      }

      // Handle link upload if exists
      if (fileLink.trim()) {
        await fetchData(
          "lms/uploadLink",
          "POST",
          {
            unitId: selectedUnit.UnitID,
            link: fileLink,
            fileName: linkName || "Link",
            description: linkDescription || "",
            fileType: "link",
          },
          { "Content-Type": "application/json", "auth-token": userToken }
        );
      }

      // Refresh files
      const response = await fetchData(
        `lms/getFiles?unitId=${selectedUnit.UnitID}`,
        "GET",
        null,
        { "auth-token": userToken }
      );
      if (response?.success) setFiles(response.data);

      Swal.fire("Success!", "Files uploaded successfully", "success");
      resetForm();
    } catch (err) {
      // console.error("Upload error:", err);
      Swal.fire("Error!", err.message || "Upload failed", "error");
    } finally {
      setIsUploading(false);
      uploadToast.close();
    }
  };

  const resetForm = () => {
    setNewFiles([]);
    setFileLink("");
    setLinkName("");
    setLinkDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteFile = async (fileId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetchData(
        "lmsEdit/deleteFile",
        "POST",
        { fileId },
        { "Content-Type": "application/json", "auth-token": userToken }
      );

      if (response?.success) {
        setFiles(prev => prev.filter(file => file.FileID !== fileId));
        Swal.fire("Deleted!", "File has been deleted.", "success");
      }
    } catch (err) {
      // console.error("Delete error:", err);
      Swal.fire("Error!", "Failed to delete file", "error");
    }
  };

  const handleDeleteMultipleFiles = async (fileIds) => {
    const result = await Swal.fire({
      title: `Are you sure you want to delete ${fileIds.length} files?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete them!",
    });

    if (!result.isConfirmed) return;

    try {
      await fetchData(
        "lmsEdit/deleteMultipleFiles",
        "POST",
        { fileIds },
        { "Content-Type": "application/json", "auth-token": userToken }
      );

      setFiles(prev => prev.filter(file => !fileIds.includes(file.FileID)));
      setSelectedFiles([]);
      Swal.fire("Deleted!", `${fileIds.length} files have been deleted.`, "success");
    } catch (err) {
      // console.error("Delete error:", err);
      Swal.fire("Error!", `Failed to delete files: ${err.message}`, "error");
    }
  };

  const handleEditFile = (file) => {
    setEditingFile(file);
    setEditedFileData({
      fileName: file.FilesName,
      description: file.Description || "",
      link: file.FileType === "link" ? file.FilePath : "",
    });
  };

  const handleCancelEditFile = () => {
    setEditingFile(null);
    setEditedFileData({ fileName: "", description: "", link: "" });
  };

  const handleUpdateFile = async () => {
    if (!editingFile) return;

    try {
      setIsUploading(true);
      const payload = {
        fileId: editingFile.FileID,
        fileName: editedFileData.fileName,
        description: editedFileData.description,
        ...(editingFile.FileType === "link" && { link: editedFileData.link })
      };

      const response = await fetchData("lmsEdit/updateFile", "POST", payload, {
        "Content-Type": "application/json",
        "auth-token": userToken,
      });

      if (response?.success) {
        setFiles(prev => prev.map(file =>
          file.FileID === editingFile.FileID ? {
            ...file,
            FilesName: editedFileData.fileName,
            Description: editedFileData.description,
            ...(editingFile.FileType === "link" && { FilePath: editedFileData.link }),
          } : file
        ));
        handleCancelEditFile();
        Swal.fire("Success!", "File updated successfully", "success");
      } else {
        throw new Error(response?.message || "Failed to update file");
      }
    } catch (err) {
      // console.error("Error updating file:", err);
      Swal.fire("Error!", err.message || "Failed to update file", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveFilesOrder = async (orderedFiles) => {
    try {
      const filesWithOrder = orderedFiles.map((file, index) => ({
        FileID: file.FileID,
        Percentage: (100 / orderedFiles.length).toFixed(2),
        SortingOrder: index + 1,
      }));

      const response = await fetchData(
        "lmsEdit/updateFilesOrder",
        "POST",
        { files: filesWithOrder },
        { "Content-Type": "application/json", "auth-token": userToken }
      );

      if (response?.success) {
        const updatedFiles = files.map(file => {
          const updatedFile = filesWithOrder.find(f => f.FileID === file.FileID);
          return updatedFile ? {
            ...file,
            SortingOrder: updatedFile.SortingOrder,
            Percentage: updatedFile.Percentage,
          } : file;
        }).sort((a, b) => (a.SortingOrder || 0) - (b.SortingOrder || 0));

        setFiles(updatedFiles);
        setShowFilesOrder(false);
        Swal.fire("Success!", "Files order updated", "success");
      } else {
        throw new Error(response?.message || "Failed to update files order");
      }
    } catch (err) {
      // console.error("Error updating files order:", err);
      Swal.fire("Error!", err.message || "Failed to update files order", "error");
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  if (!selectedUnit) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Select a unit to view files
        </p>
      </div>
    );
  }

  if (loading) return <div className="text-center py-10">Loading files...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      {selectedUnit && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {selectedUnit.UnitName}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {selectedUnit.UnitDescription}
          </p>
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Files</h3>
          <button
            onClick={() => setShowFilesOrder(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={files.length === 0}
          >
            Reorder Files
          </button>
        </div>

        {/* File Upload Form */}
        <div className="mb-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Files
              </label>
              <div
                onClick={() => fileInputRef.current.click()}
                className="p-8 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center"
              >
                <FaUpload className="text-3xl text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Click to browse or drag and drop files here
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or Add Link
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FaLink className="text-gray-500 dark:text-gray-400" />
                  <input
                    type="text"
                    value={fileLink}
                    onChange={(e) => setFileLink(e.target.value)}
                    placeholder="Enter URL/link"
                    className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded"
                  />
                </div>
                <input
                  type="text"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="Link name/title"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded"
                />
                <textarea
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  placeholder="Link description"
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded"
                />
              </div>
            </div>

            {newFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected Files:
                </h4>
                <div className="max-h-40 overflow-y-auto border rounded divide-y divide-gray-200 dark:divide-gray-700">
                  {newFiles.map((fileObj, index) => (
                    <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                      <div className="flex items-center truncate">
                        <FaFile className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="truncate">{fileObj.name}</span>
                      </div>
                      <button
                        onClick={() => setNewFiles(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleUploadFiles}
              disabled={(newFiles.length === 0 && fileLink.trim() === "") || isUploading}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                "Upload Content"
              )}
            </button>
          </div>
        </div>

        {/* Files Table */}
        {selectedFiles.length > 0 && (
          <button
            onClick={() => handleDeleteMultipleFiles(selectedFiles)}
            className="mb-4 flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <FaTrash />
            Delete Selected ({selectedFiles.length})
          </button>
        )}

        {files.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === files.length && files.length > 0}
                      onChange={() => {
                        setSelectedFiles(selectedFiles.length === files.length ? [] : files.map(f => f.FileID));
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {files.map((file) => (
                  <React.Fragment key={file.FileID}>
                    {editingFile?.FileID === file.FileID ? (
                      <tr className="bg-blue-50 dark:bg-gray-700">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  {file.FileType === "link" ? "Link Title" : "File Name"}
                                </label>
                                <input
                                  type="text"
                                  value={editedFileData.fileName}
                                  onChange={(e) => setEditedFileData({ ...editedFileData, fileName: e.target.value })}
                                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded"
                                />
                              </div>
                              {file.FileType === "link" && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Link URL
                                  </label>
                                  <input
                                    type="url"
                                    value={editedFileData.link}
                                    onChange={(e) => setEditedFileData({ ...editedFileData, link: e.target.value })}
                                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded"
                                  />
                                </div>
                              )}
                            </div>

                            {file.FileType === "link" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Description
                                </label>
                                <textarea
                                  value={editedFileData.description}
                                  onChange={(e) => setEditedFileData({ ...editedFileData, description: e.target.value })}
                                  rows={3}
                                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded"
                                />
                              </div>
                            )}

                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={handleCancelEditFile}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleUpdateFile}
                                disabled={isUploading}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                              >
                                {isUploading ? "Saving..." : "Save Changes"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.FileID)}
                            onChange={() => toggleFileSelection(file.FileID)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.FilesName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {file.FileType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {file.AuthAdd}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEditFile(file)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              data-tooltip-id="edit-file-tooltip"
                              data-tooltip-content="Edit File"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.FileID)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              data-tooltip-id="delete-file-tooltip"
                              data-tooltip-content="Delete File"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No files uploaded yet
          </div>
        )}
      </div>

      {showFilesOrder && (
        <FilesOrder
          files={files}
          onClose={() => setShowFilesOrder(false)}
          onSave={handleSaveFilesOrder}
        />
      )}

      <ReactTooltip id="edit-file-tooltip" place="top" effect="solid" />
      <ReactTooltip id="delete-file-tooltip" place="top" effect="solid" />
    </div>
  );
};

export default FileManagement;
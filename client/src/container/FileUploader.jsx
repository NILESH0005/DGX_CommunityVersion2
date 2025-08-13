import React, { useState, useContext } from "react";
import axios from "axios";
import ApiContext from "../context/ApiContext";

const FileUploader = ({
  moduleName = "general",
  folderName = "misc",
  onUploadComplete,
  accept = "image/*",
  maxSize = 200 * 1024,
  label = "Upload File",
  previewType = "image",
}) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [error, setError] = useState(null);
  const { userToken } = useContext(ApiContext);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > maxSize) {
      setError(`File size must be < ${maxSize / 1024}KB`);
      return;
    }
    if (previewType === "image" && selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selectedFile);
    }

    setFile(selectedFile);
    setError(null);
    setIsUploaded(false);
  };

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = `${
        import.meta.env.VITE_API_BASEURL
      }lms/upload-learning-material?module=${moduleName}&folder=${folderName}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        headers: {
          "auth-token": userToken,
        },
      });
      const result = await response.json();
      console.log("Upload response:", result);

      if (response.ok && result.success) {
        onUploadComplete(result);
        setIsUploaded(true);
      } else {
        setError(result.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    onUploadComplete(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
        {previewUrl ? (
          <>
            {previewType === "image" ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-32 object-contain mb-3 rounded"
              />
            ) : (
              <div className="p-4 bg-gray-200 rounded mb-3">
                <span className="text-gray-700">{file.name}</span>
              </div>
            )}
            <button
              onClick={removeFile}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Remove File
            </button>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center w-full cursor-pointer">
            <svg
              className="w-10 h-10 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-xs text-gray-400">
              {accept === "image/*" ? "PNG, JPG" : "Any file"} up to{" "}
              {maxSize / 1024}KB
            </p>
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>

      {file && !previewUrl && (
        <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
          <span className="text-sm text-gray-700 truncate">{file.name}</span>
          <button
            onClick={removeFile}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      )}

      {file && (
        <button
          onClick={uploadFile}
          disabled={isUploading || isUploaded}
          className={`px-3 py-1 rounded text-sm transition ${
            isUploaded
              ? "bg-green-500 text-white cursor-default"
              : isUploading
              ? "bg-blue-400 text-white opacity-70"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isUploaded ? "✅ Uploaded" : isUploading ? "Uploading..." : "Upload"}
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FileUploader;

import React, { useState, useEffect, useContext, useRef } from "react";
import ApiContext from "../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ViewContent from "./ViewContent";
import AddSubmodulePopup from "./AddSubmodulePopup";
import {
  FaEdit,
  FaTrash,
  FaFolder,
  FaSave,
  FaTimes,
  FaUpload,
  FaImage,
  FaChevronRight,
  FaPlus,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";
import SubmoduleOrder from "./SubmoduleOrder";
import CreateQuiz from "../../Quiz/CreateQuiz";
import ByteArrayImage from "../../../../utils/ByteArrayImage";
import FileUploader from "../../../../container/FileUploader";

const MAX_FILE_SIZE_KB = 200; // 200KB maximum file size

const EditSubModule = ({ module, onBack }) => {
  const [submodules, setSubmodules] = useState([]);
  const [showSubmoduleOrder, setShowSubmoduleOrder] = useState(false);
  const [viewingContent, setViewingContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSubmodule, setEditingSubmodule] = useState(null);
  const [showAddSubmodulePopup, setShowAddSubmodulePopup] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizSubmodule, setQuizSubmodule] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const descriptionRef = useRef(null);
  const [isDescriptionClamped, setIsDescriptionClamped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isImageEditing, setIsImageEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);
  const [editedData, setEditedData] = useState({
    SubModuleName: "",
    SubModuleDescription: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmodules = async () => {
      try {
        setLoading(true);
        const response = await fetchData(
          `dropdown/getSubModules?moduleId=${module.ModuleID}`,
          "GET",
          { "auth-token": userToken }
        );
        if (response?.success) {
          setSubmodules(
            response.data.filter((sub) => sub.ModuleID === module.ModuleID)
          );
        } else {
          setError(response?.message || "Failed to fetch submodules");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmodules();
  }, [module.ModuleID, fetchData, userToken]);

  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight,
        100
      )}px`;
    }
  }, [editedData.SubModuleDescription, isEditing]);

  useEffect(() => {
    if (descriptionRef.current && !isEditing) {
      const element = descriptionRef.current;
      setIsDescriptionClamped(element.scrollHeight > element.clientHeight);
    }
  }, [editedData.SubModuleDescription, isEditing]);

  const handleEditSubmoduleInit = (submodule) => {
    if (!isEditing || editingSubmodule?.SubModuleID !== submodule.SubModuleID) {
      setEditingSubmodule(submodule);
      setEditedData({
        SubModuleName: submodule.SubModuleName,
        SubModuleDescription: submodule.SubModuleDescription || "",
      });

      if (submodule.SubModuleImageUrl) {
        setImagePreview(submodule.SubModuleImageUrl);
      } else if (submodule.SubModuleImage?.data) {
        setImagePreview(
          `data:${submodule.SubModuleImage.contentType || "image/jpeg"}`
        );
      } else if (submodule.SubModuleImagePath) {
        setImagePreview(
          `${window.location.origin}/${submodule.SubModuleImagePath}`
        );
      } else {
        setImagePreview(null);
      }

      setIsEditing(true);
      setIsImageEditing(false);
    }
  };

  const handleDeleteSubmodule = async (SubModuleID) => {
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
        "lmsEdit/deleteSubModule",
        "POST",
        { subModuleId: Number(SubModuleID) },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        setSubmodules((prev) =>
          prev.filter((sub) => sub.SubModuleID !== SubModuleID)
        );
        Swal.fire("Deleted!", "Submodule has been deleted.", "success");
      } else {
        throw new Error(response?.message || "Failed to delete submodule");
      }
    } catch (err) {
      Swal.fire(
        "Error!",
        `Failed to delete submodule: ${err.message}`,
        "error"
      );
    }
  };

  const handleSaveSubmoduleOrder = async (orderedSubmodules) => {
    try {
      const simplifiedSubmodules = orderedSubmodules.map(
        (submodule, index) => ({
          SubModuleID: submodule.SubModuleID,
          ModuleID: submodule.ModuleID,
          SortingOrder: index + 1,
        })
      );

      const response = await fetchData(
        "lmsEdit/updateSubmoduleOrder",
        "POST",
        { submodules: simplifiedSubmodules },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        const updatedSubmodules = [...submodules]
          .map((submodule) => {
            const updated = simplifiedSubmodules.find(
              (s) => s.SubModuleID === submodule.SubModuleID
            );
            return updated
              ? { ...submodule, SortingOrder: updated.SortingOrder }
              : submodule;
          })
          .sort((a, b) => {
            const orderA = a.SortingOrder || Number.MAX_SAFE_INTEGER;
            const orderB = b.SortingOrder || Number.MAX_SAFE_INTEGER;
            return orderA - orderB || a.SubModuleID - b.SubModuleID;
          });

        setSubmodules(updatedSubmodules);
        setShowSubmoduleOrder(false);
        Swal.fire("Success!", "Submodule order updated!", "success");
      } else {
        throw new Error(
          response?.message || "Failed to update submodule order"
        );
      }
    } catch (err) {
      Swal.fire("Error!", err.message, "error");
    }
  };

  const handleAddSubmodule = () => {
    setShowAddSubmodulePopup(true);
  };

  const handleSaveSubmodule = async (moduleId, formData) => {
    try {
      const headers = { "auth-token": userToken };
      let payload;
      let isMultipart = false;

      if (formData.SubModuleImage) {
        const formDataPayload = new FormData();
        formDataPayload.append("ModuleID", moduleId);
        formDataPayload.append("SubModuleName", formData.SubModuleName);
        formDataPayload.append(
          "SubModuleDescription",
          formData.SubModuleDescription || ""
        );
        formDataPayload.append("SubModuleImage", formData.SubModuleImage);
        if (formData.SubModuleImagePath) {
          formDataPayload.append(
            "SubModuleImagePath",
            formData.SubModuleImagePath
          );
        }
        payload = formDataPayload;
        isMultipart = true;
      } else {
        headers["Content-Type"] = "application/json";
        payload = {
          ModuleID: moduleId,
          SubModuleName: formData.SubModuleName,
          SubModuleDescription: formData.SubModuleDescription || "",
          SubModuleImagePath: formData.SubModuleImagePath || null,
        };
      }

      const response = await fetchData(
        "lmsEdit/addSubModule",
        "POST",
        payload,
        headers,
        isMultipart
      );

      if (response?.success) {
        const newSubmodule = response.data;
        if (formData.SubModuleImagePath) {
          newSubmodule.SubModuleImageUrl = `${
            import.meta.env.VITE_API_UPLOADSURL
          }/${formData.SubModuleImagePath}`;
        }
        setSubmodules((prev) => [...prev, newSubmodule]);
        return newSubmodule;
      } else {
        throw new Error(response?.message || "Failed to add submodule");
      }
    } catch (err) {
      throw err;
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (!file.type.match("image.*")) {
        Swal.fire({
          title: "Invalid File Type",
          text: "Only image files are allowed",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE_KB * 1024) {
        Swal.fire({
          title: "File Too Large",
          text: `Image size exceeds ${MAX_FILE_SIZE_KB}KB limit`,
          icon: "error",
          confirmButtonText: "OK",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setIsCompressing(true);
      setError(null);

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          resolve(dataUrl);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      setNewImageFile({
        data: base64String.split(",")[1],
        contentType: file.type,
        fullDataUrl: base64String,
      });
    } catch (error) {
      setError("Failed to process image");
      setImagePreview(null);
      setNewImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsCompressing(false);
    }
  };

  const handleImageUpload = (uploadResult) => {
    const { filePath } = uploadResult;
    const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;
    const newImageUrl = `${baseUploadsUrl}/${filePath}`;

    setImagePreview(newImageUrl);
    setIsImageEditing(false);

    setEditingSubmodule((prev) => ({
      ...prev,
      SubModuleImagePath: filePath,
      SubModuleImageUrl: newImageUrl,
      SubModuleImage: null,
    }));
  };

  const handleCancelImageEdit = () => {
    setIsImageEditing(false);
    if (editingSubmodule?.SubModuleImageUrl) {
      setImagePreview(editingSubmodule.SubModuleImageUrl);
    } else if (editingSubmodule?.SubModuleImage?.data) {
      setImagePreview(
        `data:${
          editingSubmodule.SubModuleImage.contentType || "image/jpeg"
        };base64,${
          typeof editingSubmodule.SubModuleImage.data === "string"
            ? editingSubmodule.SubModuleImage.data
            : btoa(
                String.fromCharCode(
                  ...new Uint8Array(editingSubmodule.SubModuleImage.data)
                )
              )
        }`
      );
    } else {
      setImagePreview(null);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetchData(
        `lmsEdit/updateSubModule/${editingSubmodule.SubModuleID}`,
        "POST",
        {
          SubModuleName: editingSubmodule.SubModuleName,
          SubModuleDescription: editingSubmodule.SubModuleDescription,
          SubModuleImageUrl: editingSubmodule.SubModuleImageUrl,
          SubModuleImagePath: editingSubmodule.SubModuleImagePath,
          SortingOrder: editingSubmodule.SortingOrder || 1,
        },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        setSubmodules((prev) =>
          prev.map((sub) =>
            sub.SubModuleID === editingSubmodule.SubModuleID
              ? { ...sub, ...response.data }
              : sub
          )
        );
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSubmodule(null);
    setEditedData({});
    setImagePreview(null);
    setNewImageFile(null);
    setIsImageEditing(false);
    setShowFullDescription(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteImage = () => {
    setNewImageFile(null);
    setImagePreview(null);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (!editedData.SubModuleName?.trim()) {
        throw new Error("Submodule name is required");
      }
      if (newImageFile) {
        const base64Length = newImageFile.data.length;
        const padding = newImageFile.data.endsWith("==")
          ? 2
          : newImageFile.data.endsWith("=")
          ? 1
          : 0;
        const fileSizeBytes = Math.floor(base64Length * 0.75) - padding;

        if (fileSizeBytes > MAX_FILE_SIZE_KB * 1024) {
          throw new Error(`Image size exceeds ${MAX_FILE_SIZE_KB}KB limit`);
        }
      }

      const confirmResult = await Swal.fire({
        title: "Confirm Update",
        text: "Are you sure you want to update this submodule?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
      });

      if (!confirmResult.isConfirmed) {
        setIsSaving(false);
        return;
      }

      const payload = {
        SubModuleID: editingSubmodule.SubModuleID,
        ModuleID: editingSubmodule.ModuleID,
        SubModuleName: editedData.SubModuleName.trim(),
        SubModuleDescription: editedData.SubModuleDescription?.trim() || "",
        SubModuleImageUrl: editingSubmodule.SubModuleImageUrl,
        SubModuleImagePath: editingSubmodule.SubModuleImagePath,
      };

      if (newImageFile) {
        payload.SubModuleImagePath = {
          data: newImageFile.data,
          contentType: newImageFile.contentType,
        };
      } else if (imagePreview === null) {
        payload.SubModuleImagePath = null;
      }

      const response = await fetchData(
        `lmsEdit/updateSubModule/${editingSubmodule.SubModuleID}`,
        "POST",
        payload,
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        const updatedSubmodule = {
          ...editingSubmodule,
          ...response.data,
          SubModuleImagePath: newImageFile
            ? {
                data: newImageFile.data,
                contentType: newImageFile.contentType,
              }
            : imagePreview === null
            ? null
            : editingSubmodule.SubModuleImage,
        };

        setSubmodules((prev) =>
          prev.map((sub) =>
            sub.SubModuleID === updatedSubmodule.SubModuleID
              ? updatedSubmodule
              : sub
          )
        );

        Swal.fire({
          title: "Success",
          text: "Submodule updated successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        setIsEditing(false);
        setEditingSubmodule(null);
        setNewImageFile(null);
        setShowFullDescription(false);
      } else {
        throw new Error(response?.message || "Failed to update submodule");
      }
    } catch (err) {
      setError(err.message);
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateQuiz = (submoduleId, submoduleName) => {
    setQuizSubmodule({ id: submoduleId, name: submoduleName });
    setShowCreateQuiz(true);
  };

  const handleBackFromQuiz = () => {
    setShowCreateQuiz(false);
    setQuizSubmodule(null);
  };

  const navigateToQuizTable = () => {
    handleBackFromQuiz();
  };

  const handleViewContent = (submodule) => {
    setViewingContent(submodule);
  };

  const handleBackToSubmodules = () => {
    setViewingContent(null);
  };

  const renderImageSection = (submodule) => {
    if (
      isImageEditing &&
      editingSubmodule?.SubModuleID === submodule.SubModuleID
    ) {
      return (
        <div className="h-40 sm:h-48 flex flex-col items-center justify-center p-4 bg-black bg-opacity-70">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-32 object-contain mb-4 transition-opacity duration-300"
            />
          ) : (
            <p className="text-gray-200">No Image Available</p>
          )}

          <FileUploader
            moduleName="LMS"
            folderName="submodule-banners"
            onUploadComplete={handleImageUpload}
            accept="image/*"
            maxSize={200 * 1024}
            label="Upload Banner Image"
          />

          <div className="flex gap-2 flex-wrap justify-center mt-2">
            <button
              type="button"
              onClick={handleCancelImageEdit}
              className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-xs transition-colors duration-200 flex items-center"
            >
              <FaTimes className="mr-1" />
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (submodule.SubModuleImageUrl) {
      return (
        <div className="h-40 sm:h-48 relative">
          <img
            src={submodule.SubModuleImageUrl}
            alt={submodule.SubModuleName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            }}
          />
          {isEditing &&
            editingSubmodule?.SubModuleID === submodule.SubModuleID && (
              <button
                onClick={() => setIsImageEditing(true)}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow transition-all duration-200 hover:scale-110"
                data-tooltip-id="edit-image-tooltip"
                data-tooltip-content="Edit Image"
              >
                <FaEdit size={14} />
              </button>
            )}
        </div>
      );
    }

    if (submodule.SubModuleImage?.data) {
      return (
        <div className="h-40 sm:h-48 relative">
          <ByteArrayImage
            byteArray={submodule.SubModuleImage.data}
            contentType={submodule.SubModuleImage.contentType}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {isEditing &&
            editingSubmodule?.SubModuleID === submodule.SubModuleID && (
              <button
                onClick={() => setIsImageEditing(true)}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow transition-all duration-200 hover:scale-110"
                data-tooltip-id="edit-image-tooltip"
                data-tooltip-content="Edit Image"
              >
                <FaEdit size={14} />
              </button>
            )}
        </div>
      );
    }

    if (submodule.SubModuleImagePath) {
      const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;
      const imageUrl = submodule.SubModuleImagePath.startsWith("http")
        ? submodule.SubModuleImagePath
        : `${baseUploadsUrl}/${submodule.SubModuleImagePath}`;
      return (
        <div className="h-40 sm:h-48 relative">
          <img
            src={imageUrl}
            alt={submodule.SubModuleName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            }}
          />
          {isEditing &&
            editingSubmodule?.SubModuleID === submodule.SubModuleID && (
              <button
                onClick={() => setIsImageEditing(true)}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow transition-all duration-200 hover:scale-110"
                data-tooltip-id="edit-image-tooltip"
                data-tooltip-content="Edit Image"
              >
                <FaEdit size={14} />
              </button>
            )}
        </div>
      );
    }

    return (
      <div className="h-40 sm:h-48 flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
        {isEditing &&
        editingSubmodule?.SubModuleID === submodule.SubModuleID ? (
          <div className="text-center p-4">
            <p className="text-gray-200 mb-3 text-sm">No Image Available</p>
            <button
              onClick={() => setIsImageEditing(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200 shadow-md hover:shadow-lg flex items-center mx-auto"
            >
              <FaImage className="mr-1" />
              Add Image
            </button>
          </div>
        ) : (
          <p className="text-gray-200">No Image Available</p>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-10">Loading submodules...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Back to Modules
        </button>
      </div>
    );
  }

  if (viewingContent) {
    return (
      <ViewContent submodule={viewingContent} onBack={handleBackToSubmodules} />
    );
  }

  if (showCreateQuiz && quizSubmodule) {
    return (
      <CreateQuiz
        moduleId={quizSubmodule.id}
        moduleName={quizSubmodule.name}
        navigateToQuizTable={navigateToQuizTable}
        onBack={handleBackFromQuiz}
        isSubmodule={true}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              {module.ModuleName} Submodules
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
              Manage all submodules
            </p>
          </div>
          <button
            onClick={() => setShowSubmoduleOrder(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 w-full sm:w-auto text-sm sm:text-base"
          >
            Manage Submodule Order
          </button>
        </div>

        {showSubmoduleOrder && (
          <SubmoduleOrder
            submodules={submodules}
            onClose={() => setShowSubmoduleOrder(false)}
            onSave={handleSaveSubmoduleOrder}
          />
        )}

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <button
                onClick={onBack}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                <FaChevronRight className="mr-1 text-xs transform rotate-180" />
                Back to {module.ModuleName}
              </button>
            </div>
            <button
              onClick={handleAddSubmodule}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center w-full sm:w-auto text-sm sm:text-base"
            >
              <FaPlus className="mr-2" />
              Add New Submodule
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {submodules.length > 0 ? (
              submodules.map((submodule) => (
                <div
                  key={submodule.SubModuleID}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 w-full border border-gray-200 dark:border-gray-700"
                >
                  {renderImageSection(submodule)}

                  <div className="p-4 sm:p-6">
                    {isEditing &&
                    editingSubmodule?.SubModuleID === submodule.SubModuleID ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label
                            htmlFor="SubModuleName"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Submodule Name
                          </label>
                          <input
                            type="text"
                            id="SubModuleName"
                            name="SubModuleName"
                            value={editedData.SubModuleName || ""}
                            onChange={handleChange}
                            className="w-full border border-DGXgreen dark:border-DGXgreen dark:bg-DGXblue dark:text-DGXwhite p-2 rounded-md focus:ring-2 focus:ring-DGXgreen focus:border-DGXgreen transition-all duration-200 text-sm sm:text-base"
                            placeholder="Submodule Name"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="SubModuleDescription"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Description
                          </label>
                          <textarea
                            ref={textareaRef}
                            id="SubModuleDescription"
                            name="SubModuleDescription"
                            value={editedData.SubModuleDescription || ""}
                            onChange={handleChange}
                            className="w-full border border-DGXgreen dark:border-DGXgreen dark:bg-DGXblue dark:text-DGXwhite p-2 rounded-md focus:ring-2 focus:ring-DGXgreen focus:border-DGXgreen transition-all duration-200 text-sm sm:text-base"
                            placeholder="Submodule Description"
                            style={{ minHeight: "100px" }}
                          />
                        </div>
                        {error && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-md text-sm animate-fade-in border border-red-200 dark:border-red-700">
                            <strong>Error:</strong> {error}
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <button
                            type="submit"
                            disabled={isSaving || isCompressing}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center min-w-32 disabled:opacity-50 text-sm sm:text-base flex-1"
                          >
                            {isSaving ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              <>
                                <FaSave className="mr-2" />
                                Save Changes
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center justify-center flex-1 text-sm sm:text-base"
                          >
                            <FaTimes className="mr-2" />
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                          {submodule.SubModuleName}
                        </h3>
                        <div className="prose dark:prose-invert max-w-none mb-2">
                          <div
                            ref={descriptionRef}
                            className={`text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm sm:text-base ${
                              !showFullDescription ? "line-clamp-3" : ""
                            }`}
                          >
                            {submodule.SubModuleDescription ||
                              "No description provided"}
                          </div>
                          {(isDescriptionClamped || showFullDescription) && (
                            <button
                              onClick={toggleDescription}
                              className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm mt-1 flex items-center"
                            >
                              {showFullDescription ? (
                                <>
                                  <FaAngleUp className="mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <FaAngleDown className="mr-1" />
                                  Read More
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="flex justify-end gap-2 mt-4 sm:mt-6">
                          <button
                            onClick={() =>
                              handleCreateQuiz(
                                submodule.SubModuleID,
                                submodule.SubModuleName
                              )
                            }
                            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-200"
                            data-tooltip-id="create-quiz-tooltip"
                            data-tooltip-content="Create Quiz"
                          >
                            <FaPlus size={14} />
                          </button>
                          <button
                            onClick={() => handleEditSubmoduleInit(submodule)}
                            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
                            data-tooltip-id="edit-tooltip"
                            data-tooltip-content="Edit Submodule"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteSubmodule(submodule.SubModuleID)
                            }
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                            data-tooltip-id="delete-tooltip"
                            data-tooltip-content="Delete Submodule"
                          >
                            <FaTrash size={14} />
                          </button>
                          <button
                            onClick={() => handleViewContent(submodule)}
                            className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors duration-200"
                            data-tooltip-id="view-content-tooltip"
                            data-tooltip-content="View Content"
                          >
                            <FaFolder size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300">
                  No submodules found for this module
                </p>
                <button
                  onClick={handleAddSubmodule}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center mx-auto text-sm sm:text-base"
                >
                  <FaPlus className="mr-2" />
                  Add New Submodule
                </button>
              </div>
            )}
          </div>
        </div>

        <ReactTooltip id="create-quiz-tooltip" place="top" effect="solid" />
        <ReactTooltip id="edit-tooltip" place="top" effect="solid" />
        <ReactTooltip id="edit-image-tooltip" place="top" effect="solid" />
        <ReactTooltip id="delete-tooltip" place="top" effect="solid" />
        <ReactTooltip id="view-content-tooltip" place="top" effect="solid" />

        {showAddSubmodulePopup && (
          <AddSubmodulePopup
            moduleId={module.ModuleID}
            onClose={() => setShowAddSubmodulePopup(false)}
            onSave={handleSaveSubmodule}
          />
        )}
      </div>
    </div>
  );
};

export default EditSubModule;
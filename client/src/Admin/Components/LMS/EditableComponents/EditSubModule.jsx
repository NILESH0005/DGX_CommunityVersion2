import React, { useState, useEffect, useContext, useRef } from "react";
import ApiContext from "../../../../context/ApiContext";
import Swal from "sweetalert2";
import ViewContent from "./ViewContent";
import AddSubmodulePopup from "./AddSubmodulePopup";
import {
  FaEdit,
  FaTrash,
  FaFolder,
  FaSave,
  FaTimes,
  FaImage,
  FaPlus,
  FaAngleDown,
  FaAngleUp,
  FaExclamationTriangle,
  FaPlusCircle,
  FaListOl,
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaExclamationCircle,
} from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";
import SubmoduleOrder from "./SubmoduleOrder";
import CreateQuiz from "../../Quiz/CreateQuiz";
import FileUploader from "../../../../container/FileUploader";

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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubmodules, setFilteredSubmodules] = useState([]);
  const textareaRef = useRef(null);
  const descriptionRef = useRef(null);
  const [isDescriptionClamped, setIsDescriptionClamped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isImageEditing, setIsImageEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [editedData, setEditedData] = useState({
    SubModuleName: "",
    SubModuleDescription: "",
  });

  // Validation rules
  const validationRules = {
    SubModuleName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_&@.,!?()]+$/,
      message: {
        required: "Submodule name is required",
        minLength: "Must be at least 2 characters",
        maxLength: "Cannot exceed 100 characters",
        pattern: "Contains invalid characters",
      },
    },
    SubModuleDescription: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      pattern: /^[a-zA-Z0-9\s\-_&@.,!?()\n\r]*$/,
      message: {
        required: "Description is required",
        minLength: "Must be at least 10 characters",
        maxLength: "Cannot exceed 1000 characters",
        pattern: "Contains invalid characters",
      },
    },
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    if (rules.required && (!value || value.trim() === "")) {
      return rules.message.required;
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      return rules.message.minLength;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return rules.message.maxLength;
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.message.pattern;
    }

    return "";
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, editedData[field] || "");
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

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
          const filtered = response.data.filter(
            (sub) => sub.ModuleID === module.ModuleID
          );
          setSubmodules(filtered);
          setFilteredSubmodules(filtered);
        } else {
          setError(response?.message || "Failed to fetch submodules");
          setSubmodules([]);
          setFilteredSubmodules([]);
        }
      } catch (err) {
        setError(err.message);
        setSubmodules([]);
        setFilteredSubmodules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmodules();
  }, [module.ModuleID, fetchData, userToken]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSubmodules(submodules);
    } else {
      const filtered = submodules.filter(
        (sub) =>
          sub.SubModuleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.SubModuleDescription?.toLowerCase().includes(
            searchTerm.toLowerCase()
          )
      );
      setFilteredSubmodules(filtered);
    }
  }, [searchTerm, submodules]);

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

      setValidationErrors({});
      if (submodule.SubModuleImageUrl) {
        setImagePreview(submodule.SubModuleImageUrl);
      } else if (submodule.SubModuleImage?.data) {
        setImagePreview(
          `data:${
            submodule.SubModuleImage.contentType || "image/jpeg"
          };base64,${
            typeof submodule.SubModuleImage.data === "string"
              ? submodule.SubModuleImage.data
              : btoa(
                  String.fromCharCode(
                    ...new Uint8Array(submodule.SubModuleImage.data)
                  )
                )
          }`
        );
      } else if (submodule.SubModuleImagePath) {
        const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;
        const imageUrl = submodule.SubModuleImagePath.startsWith("http")
          ? submodule.SubModuleImagePath
          : `${baseUploadsUrl}/${submodule.SubModuleImagePath}`;
        setImagePreview(imageUrl);
      } else {
        setImagePreview(null);
      }

      setIsEditing(true);
      setIsImageEditing(false);
    }
  };

  const handleDeleteSubmodule = async (SubModuleID) => {
    const result = await Swal.fire({
      title: "Delete Submodule?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
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
        Swal.fire({
          title: "Deleted!",
          text: "Submodule deleted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(response?.message || "Failed to delete submodule");
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: `Failed to delete: ${err.message}`,
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
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
        Swal.fire({
          title: "Success!",
          text: "Order updated successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(response?.message || "Failed to update order");
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
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
        Swal.fire({
          title: "Success!",
          text: "Submodule added successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        return newSubmodule;
      } else {
        throw new Error(response?.message || "Failed to add submodule");
      }
    } catch (err) {
      throw err;
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
    } else if (editingSubmodule?.SubModuleImagePath) {
      const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;
      const imageUrl = editingSubmodule.SubModuleImagePath.startsWith("http")
        ? editingSubmodule.SubModuleImagePath
        : `${baseUploadsUrl}/${editingSubmodule.SubModuleImagePath}`;
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleCancelEdit = () => {
    Swal.fire({
      title: "Discard Changes?",
      text: "Are you sure you want to discard your changes?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Discard",
      cancelButtonText: "Continue",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsEditing(false);
        setEditingSubmodule(null);
        setEditedData({});
        setImagePreview(null);
        setIsImageEditing(false);
        setShowFullDescription(false);
        setValidationErrors({});
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      const error = validateField(name, value);
      setValidationErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fix the errors before saving.",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Update Submodule",
      text: "Are you sure you want to update this submodule?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        SubModuleID: editingSubmodule.SubModuleID,
        ModuleID: editingSubmodule.ModuleID,
        SubModuleName: editedData.SubModuleName.trim(),
        SubModuleDescription: editedData.SubModuleDescription?.trim() || "",
        SubModuleImageUrl: editingSubmodule.SubModuleImageUrl,
        SubModuleImagePath: editingSubmodule.SubModuleImagePath,
      };

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
          SubModuleName: editedData.SubModuleName.trim(),
          SubModuleDescription: editedData.SubModuleDescription?.trim() || "",
        };

        setSubmodules((prev) =>
          prev.map((sub) =>
            sub.SubModuleID === updatedSubmodule.SubModuleID
              ? updatedSubmodule
              : sub
          )
        );

        Swal.fire({
          title: "Success!",
          text: "Submodule updated successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        setIsEditing(false);
        setEditingSubmodule(null);
        setShowFullDescription(false);
        setValidationErrors({});
      } else {
        throw new Error(response?.message || "Failed to update submodule");
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({
        title: "Error",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
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

  const handleViewContent = (submodule) => {
    setViewingContent(submodule);
  };

  const handleBackToSubmodules = () => {
    setViewingContent(null);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const CharacterCounter = ({ value, maxLength, fieldName }) => {
    if (!maxLength) return null;

    const currentLength = value?.length || 0;
    const isExceeding = currentLength > maxLength;

    return (
      <div
        className={`text-xs mt-1 ${
          isExceeding ? "text-red-500" : "text-gray-500"
        }`}
      >
        {currentLength}/{maxLength}
      </div>
    );
  };

  const renderImageSection = (submodule) => {
    if (
      isImageEditing &&
      editingSubmodule?.SubModuleID === submodule.SubModuleID
    ) {
      return (
        <div className="min-h-40 sm:min-h-48 flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 space-y-4">
          <div className="flex-1 flex items-center justify-center w-full">
            {imagePreview ? (
              <div className="relative w-full h-40 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-40 max-w-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center">
                <FaImage className="text-gray-400 text-4xl" />
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  No Image
                </p>
              </div>
            )}
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-3">
            <FileUploader
              moduleName="LMS"
              folderName="submodule-banners"
              onUploadComplete={handleImageUpload}
              accept="image/*"
              maxSize={200 * 1024}
              label="Upload Image"
              className="w-full"
            />

            <button
              type="button"
              onClick={handleCancelImageEdit}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 text-sm flex items-center justify-center"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (submodule.SubModuleImageUrl) {
      return (
        <div className="h-40 sm:h-48 relative group">
          <img
            src={submodule.SubModuleImageUrl}
            alt={submodule.SubModuleName}
            className="w-full h-full object-cover"
          />
          {isEditing &&
            editingSubmodule?.SubModuleID === submodule.SubModuleID && (
              <button
                onClick={() => setIsImageEditing(true)}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-lg hover:scale-110 transition-all"
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
          <div className="text-center">
            <FaImage className="text-gray-300 text-4xl mx-auto mb-3" />
            <button
              onClick={() => setIsImageEditing(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm flex items-center mx-auto"
            >
              <FaImage className="mr-2" />
              Add Image
            </button>
          </div>
        ) : (
          <FaImage className="text-gray-300 text-4xl" />
        )}
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="col-span-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <FaFolder className="text-4xl text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
          No Submodules Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Start by adding your first submodule.
        </p>
        <button
          onClick={handleAddSubmodule}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all flex items-center justify-center mx-auto shadow-lg hover:shadow-xl"
        >
          <FaPlusCircle className="mr-3" />
          <span className="font-semibold">Add First Submodule</span>
        </button>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="col-span-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-red-200 dark:border-red-800">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <FaExclamationTriangle className="text-4xl text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
          Unable to Load
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
        <button
          onClick={handleAddSubmodule}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all flex items-center justify-center mx-auto"
        >
          <FaPlusCircle className="mr-3" />
          <span className="font-semibold">Add New Submodule</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
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
        navigateToQuizTable={handleBackFromQuiz}
        onBack={handleBackFromQuiz}
        isSubmodule={true}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  data-tooltip-id="back-tooltip"
                  data-tooltip-content="Back to Modules"
                >
                  <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                    {module.ModuleName} - Submodules
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Manage your submodules
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <FaFolder className="text-blue-500" />
                <span>{submodules.length} Submodules</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowSubmoduleOrder(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all flex items-center justify-center"
              >
                <FaListOl className="mr-2" />
                Manage Order
              </button>
              <button
                onClick={handleAddSubmodule}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all flex items-center justify-center"
              >
                <FaPlus className="mr-2" />
                Add Submodule
              </button>
            </div>
          </div>

          {submodules.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search submodules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-colors flex items-center"
                >
                  <FaFilter className="mr-2" />
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {showSubmoduleOrder && (
          <SubmoduleOrder
            submodules={submodules}
            onClose={() => setShowSubmoduleOrder(false)}
            onSave={handleSaveSubmoduleOrder}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {error ? (
            renderErrorState()
          ) : filteredSubmodules.length === 0 && submodules.length === 0 ? (
            renderEmptyState()
          ) : filteredSubmodules.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                <FaSearch className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No Results
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  No submodules match your search.
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            filteredSubmodules.map((submodule) => (
              <div
                key={submodule.SubModuleID}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                {renderImageSection(submodule)}

                <div className="p-6">
                  {isEditing &&
                  editingSubmodule?.SubModuleID === submodule.SubModuleID ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Submodule Name *
                        </label>
                        <input
                          type="text"
                          name="SubModuleName"
                          value={editedData.SubModuleName || ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            validationErrors.SubModuleName
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="Enter submodule name"
                        />
                        {validationErrors.SubModuleName && (
                          <div className="flex items-center mt-1 text-red-500 text-xs">
                            <FaExclamationCircle className="mr-1" size={10} />
                            {validationErrors.SubModuleName}
                          </div>
                        )}
                        <CharacterCounter
                          value={editedData.SubModuleName}
                          maxLength={validationRules.SubModuleName.maxLength}
                          fieldName="SubModuleName"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Description *
                        </label>
                        <textarea
                          ref={textareaRef}
                          name="SubModuleDescription"
                          value={editedData.SubModuleDescription || ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            validationErrors.SubModuleDescription
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="Enter description"
                          rows="3"
                        />
                        {validationErrors.SubModuleDescription && (
                          <div className="flex items-center mt-1 text-red-500 text-xs">
                            <FaExclamationCircle className="mr-1" size={10} />
                            {validationErrors.SubModuleDescription}
                          </div>
                        )}
                        <CharacterCounter
                          value={editedData.SubModuleDescription}
                          maxLength={
                            validationRules.SubModuleDescription.maxLength
                          }
                          fieldName="SubModuleDescription"
                        />
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-700">
                          <strong>Error:</strong> {error}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={
                            isSaving ||
                            Object.keys(validationErrors).some(
                              (key) => validationErrors[key]
                            )
                          }
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave className="mr-2" />
                              Save
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl transition-all flex items-center justify-center"
                        >
                          <FaTimes className="mr-2" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2">
                        {submodule.SubModuleName}
                      </h3>
                      <div className="mb-4">
                        <div
                          ref={descriptionRef}
                          className={`text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm sm:text-base ${
                            !showFullDescription ? "line-clamp-3" : ""
                          }`}
                        >
                          {submodule.SubModuleDescription || "No description"}
                        </div>
                        {(isDescriptionClamped || showFullDescription) && (
                          <button
                            onClick={toggleDescription}
                            className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm mt-2 flex items-center"
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

                      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() =>
                            handleCreateQuiz(
                              submodule.SubModuleID,
                              submodule.SubModuleName
                            )
                          }
                          className="p-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow hover:shadow-lg"
                          data-tooltip-id="create-quiz-tooltip"
                          data-tooltip-content="Create Quiz"
                        >
                          <FaPlus size={16} />
                        </button>
                        <button
                          onClick={() => handleEditSubmoduleInit(submodule)}
                          className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow hover:shadow-lg"
                          data-tooltip-id="edit-tooltip"
                          data-tooltip-content="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteSubmodule(submodule.SubModuleID)
                          }
                          className="p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow hover:shadow-lg"
                          data-tooltip-id="delete-tooltip"
                          data-tooltip-content="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                        <button
                          onClick={() => handleViewContent(submodule)}
                          className="p-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow hover:shadow-lg"
                          data-tooltip-id="view-content-tooltip"
                          data-tooltip-content="View Content"
                        >
                          <FaFolder size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <ReactTooltip id="create-quiz-tooltip" place="top" effect="solid" />
        <ReactTooltip id="edit-tooltip" place="top" effect="solid" />
        <ReactTooltip id="edit-image-tooltip" place="top" effect="solid" />
        <ReactTooltip id="delete-tooltip" place="top" effect="solid" />
        <ReactTooltip id="view-content-tooltip" place="top" effect="solid" />
        <ReactTooltip id="back-tooltip" place="top" effect="solid" />

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

import React, { useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText,
  X,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import { compressImage } from "../../../../utils/compressImage";
import ApiContext from "../../../../context/ApiContext";
import Swal from "sweetalert2";
import AddSubModuleForm from "./AddSubModuleForm";
import SubModuleList from "./SubModuleList";
import SubModuleDetails from "./SubModuleDetails";

const SubModuleManager = ({ module = {}, onSave, onCancel }) => {
  const { userToken } = useContext(ApiContext);

  const [hasUploadedFiles, setHasUploadedFiles] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetForm, setResetForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const calculateFilePercentages = (files) => {
    if (!files || files.length === 0) return [];
    const equalPercentage = 100 / files.length;
    return files.map((file) => ({
      ...file,
      percentage: equalPercentage,
    }));
  };

  const [subModules, setSubModules] = useState(
    module.subModules?.map((subModule) => ({
      ...subModule,
      units: subModule.units?.map((unit) => ({
        ...unit,
        files: calculateFilePercentages(unit.files),
      })),
    })) || []
  );

  const [selectedSubModule, setSelectedSubModule] = useState(null);
  const [showSubModuleList, setShowSubModuleList] = useState(true);

  // Toggle submodule list on mobile
  const toggleSubModuleList = () => {
    setShowSubModuleList(!showSubModuleList);
  };

  // Handler functions
  const handleRemoveSubModule = (id) => {
    Swal.fire({
      title: "Delete Submodule",
      text: "Are you sure you want to delete this submodule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      color: "#1f2937",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedSubModules = subModules.filter((sub) => sub.id !== id);
        setSubModules(updatedSubModules);
        if (selectedSubModule?.id === id) {
          setSelectedSubModule(null);
        }

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Submodule has been deleted",
          timer: 1500,
          showConfirmButton: false,
          background: "#fff",
          color: "#1f2937",
        });
      }
    });
  };

  const handleRemoveUnit = (subModuleId, unitId) => {
    Swal.fire({
      title: "Delete Unit",
      text: "Are you sure you want to delete this unit?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes",
      background: "#fff",
      color: "#1f2937",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedSubModules = subModules.map((sub) => {
          if (sub.id === subModuleId) {
            const updatedUnits = sub.units.filter((unit) => unit.id !== unitId);

            // Trigger animation by updating the state which will re-render with animations
            return {
              ...sub,
              units: updatedUnits,
            };
          }
          return sub;
        });
        setSubModules(updatedSubModules);

        // Update selected submodule if it's the one being modified
        if (selectedSubModule?.id === subModuleId) {
          setSelectedSubModule(
            updatedSubModules.find((sub) => sub.id === subModuleId)
          );
        }

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Unit has been deleted",
          timer: 1500,
          showConfirmButton: false,
          background: "#fff",
          color: "#1f2937",
        });
      }
    });
  };

  useEffect(() => {
    const filesExist = subModules.some((subModule) =>
      subModule.units?.some((unit) => unit.files?.length > 0)
    );
    setHasUploadedFiles(filesExist);
  }, [subModules]);

  const handleAddSubModule = async (newSubModule) => {
    if (!newSubModule.SubModuleName.trim()) {
      setErrors({ SubModuleName: "Submodule name is required" });
      return;
    }

    try {
      const subModuleToAdd = {
        id: uuidv4(),
        SubModuleName: newSubModule.SubModuleName.trim(),
        SubModuleDescription: newSubModule.SubModuleDescription.trim(),
        SubModuleImage: newSubModule.SubModuleImagePath,
        units: [],
      };

      const updatedSubModules = [...subModules, subModuleToAdd];
      setSubModules(updatedSubModules);
      setResetForm((prev) => !prev);

      // On mobile, automatically select the new submodule and hide the list
      if (isMobile) {
        setSelectedSubModule(subModuleToAdd);
        setShowSubModuleList(false);
      }

      const updatedModule = {
        ...module,
        subModules: updatedSubModules,
      };
      onSave(updatedModule);

      Swal.fire({
        icon: "success",
        title: "Submodule Added",
        text: "New submodule has been created successfully",
        timer: 1500,
        showConfirmButton: false,
        background: "#fff",
        color: "#1f2937",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add submodule",
        timer: 1500,
        showConfirmButton: false,
        background: "#fff",
        color: "#1f2937",
      });
    }
  };

  const handleAddUnit = (newUnit) => {
    if (!newUnit.UnitName.trim()) {
      setErrors({ UnitName: "Unit name is required" });
      return;
    }

    const updatedSubModules = subModules.map((sub) => {
      if (sub.id === selectedSubModule.id) {
        const newUnitWithId = {
          id: uuidv4(),
          UnitName: newUnit.UnitName.trim(),
          UnitDescription: newUnit.UnitDescription.trim(),
          files: [],
        };

        const updatedUnits = [...sub.units, newUnitWithId];

        // This update will trigger the animation in SubModuleList
        return {
          ...sub,
          units: updatedUnits,
        };
      }
      return sub;
    });

    setSubModules(updatedSubModules);
    setErrors({ ...errors, UnitName: null });

    // Update the selected submodule to reflect the new unit
    setSelectedSubModule(
      updatedSubModules.find((sub) => sub.id === selectedSubModule.id)
    );

    Swal.fire({
      icon: "success",
      title: "Unit Added",
      text: "New unit has been created successfully",
      timer: 1500,
      showConfirmButton: false,
      background: "#fff",
      color: "#1f2937",
    });
  };

  const handleUploadFile = async (
    subModuleId,
    unitId,
    file,
    customFileName,
    estimatedTime = 0,
    description = "",
    url = null
  ) => {
    console.log("DEBUG - Upload parameters:", {
      unitId, // This is the unit ID UUID
      customFileName, // Should be "TEST"
      estimatedTime, // Should be 1
      typeOfEstimatedTime: typeof estimatedTime,
    });
    if (!userToken) {
      Swal.fire(
        "Error",
        "Authentication token missing. Please log in again.",
        "error"
      );
      return false;
    }

    if (!file && !url) {
      Swal.fire("Error", "Either file or URL must be provided", "error");
      return false;
    }

    if (file) {
      const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".pdf",
        ".doc",
        ".docx",
        ".ppt",
        ".pptx",
        ".mp4",
        ".mov",
        ".ipynb",
        ".py",
      ];

      const fileExt = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(`.${fileExt}`)) {
        Swal.fire("Error", "File type not allowed", "error");
        return false;
      }
    }

    const tempId = uuidv4();
    const equalPercentage = 100;

    const tempFile = {
      id: tempId,
      originalName: customFileName || (file ? file.name : "Link"),
      filePath: file ? URL.createObjectURL(file) : url,
      fileType: file ? file.type : "link",
      uploadedAt: new Date().toISOString(),
      percentage: equalPercentage,
      fileSize: file ? file.size : 0,
      estimatedTime: estimatedTime,
      description: description,
      isLink: !!url,
    };

    setSubModules((prev) => {
      return prev.map((subModule) => {
        if (subModule.id !== subModuleId) return subModule;

        const updatedUnits = (subModule.units || []).map((unit) => {
          if (unit.id !== unitId) return unit;

          const updatedFiles = [...(unit.files || []), tempFile];
          return { ...unit, files: updatedFiles };
        });

        return { ...subModule, units: updatedUnits };
      });
    });

    try {
      const uploadToast = Swal.fire({
        title: file ? "Uploading file..." : "Adding link...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        background: "#fff",
        color: "#1f2937",
      });

      const formData = new FormData();
      formData.append("moduleId", module.id);
      formData.append("subModuleId", subModuleId);
      formData.append("unitId", unitId);
      formData.append("percentage", equalPercentage);
      formData.append(
        "customFileName",
        customFileName || (file ? file.name : "Link")
      );
      formData.append("estimatedTime", estimatedTime.toString());

      if (file) {
        formData.append("file", file);
        formData.append("type", "file");
      } else if (url) {
        formData.append("url", url);
        formData.append("description", description);
        formData.append("type", "link");
        formData.append("isLink", "true");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}lms/upload-learning-material`,
        {
          method: "POST",
          body: formData,
          headers: {
            "auth-token": userToken,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      await uploadToast.close();

      const finalFile = {
        id: uuidv4(),
        originalName:
          customFileName || result.fileName || (file ? file.name : "Link"),
        filePath: result.filePath || url,
        fileType: result.mimeType || (file ? file.type : "link"),
        uploadedAt: new Date().toISOString(),
        percentage: equalPercentage,
        fileSize: result.fileSize || (file ? file.size : 0),
        estimatedTime: estimatedTime,
        description: description,
        isLink: !!url,
      };

      console.log("DEBUG - API Response:", {
        result,
        fileName: result.fileName, // What is this?
        filePath: result.filePath,
      });

      const updated = subModules.map((subModule) => {
        if (subModule.id !== subModuleId) return subModule;

        const updatedUnits = (subModule.units || []).map((unit) => {
          if (unit.id !== unitId) return unit;

          const files = (unit.files || []).filter((f) => f.id !== tempId);
          return { ...unit, files: [...files, finalFile] };
        });

        return { ...subModule, units: updatedUnits };
      });

      setSubModules(updated);

      const updatedModule = {
        ...module,
        subModules: updated,
      };

      if (onSave) onSave(updatedModule);

      Swal.fire(
        "Success",
        file ? "File uploaded successfully" : "Link added successfully",
        "success"
      );
      return true;
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", error.message || "Upload failed", "error");

      setSubModules((prev) => {
        return prev.map((subModule) => {
          if (subModule.id !== subModuleId) return subModule;

          const updatedUnits = (subModule.units || []).map((unit) => {
            if (unit.id !== unitId) return unit;

            const filteredFiles = (unit.files || []).filter(
              (f) => f.id !== tempId
            );
            return { ...unit, files: filteredFiles };
          });

          return { ...subModule, units: updatedUnits };
        });
      });

      return false;
    }
  };

  const handleUploadLink = async (
    unitId, url, linkName, description, estimatedTime
  ) => {
    if (!userToken) {
      Swal.fire(
        "Error",
        "Authentication token missing. Please log in again.",
        "error"
      );
      return false;
    }

    if (!selectedSubModule) {
      Swal.fire("Error", "Please select a submodule first", "error");
      return false;
    }

    let updatedSubModules = [...subModules];

    if (selectedSubModule.units.length === 0) {
      const newUnit = {
        id: uuidv4(),
        UnitName: "Resources",
        UnitDescription: "External resources and links",
        files: [],
      };

      updatedSubModules = subModules.map((sub) => {
        if (sub.id === selectedSubModule.id) {
          return {
            ...sub,
            units: [...sub.units, newUnit],
          };
        }
        return sub;
      });

      setSubModules(updatedSubModules);
      unitId = newUnit.id;
    } else {
      unitId = selectedSubModule.units[0].id;
    }

    return await handleUploadFile(
      selectedSubModule.id,
      unitId,
      null,
      linkName,
      estimatedTime,
      description,
      url
    );
  };

  const handleSaveAll = () => {
    if (subModules.length === 0) {
      setErrors({ subModules: "Please add at least one submodule" });
      return;
    }

    Swal.fire({
      title: "Confirm Save",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#76B900",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes",
      background: "#fff",
      color: "#1f2937",
    }).then((result) => {
      if (result.isConfirmed) {
        setSubModules((currentSubModules) => {
          const updatedModule = {
            ...module,
            subModules: currentSubModules,
          };

          onSave(updatedModule);

          Swal.fire({
            icon: "success",
            title: "Saved!",
            text: "All changes have been saved",
            timer: 1500,
            showConfirmButton: false,
            background: "#fff",
            color: "#1f2937",
          });

          return currentSubModules;
        });
      }
    });
  };

  // Mobile back button handler
  const handleMobileBack = () => {
    if (isMobile && selectedSubModule) {
      setSelectedSubModule(null);
      setShowSubModuleList(true);
    } else {
      Swal.fire({
        title: "Cancel Changes?",
        text: "Are you sure you want to cancel? All unsaved changes will be lost.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, cancel!",
        background: "#fff",
        color: "#1f2937",
      }).then((result) => {
        if (result.isConfirmed) {
          onCancel();
        }
      });
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="flex-1 mb-4 lg:mb-0">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            {module.ModuleName}
          </h2>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Manage submodules and their units
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            {subModules.length}{" "}
            {subModules.length === 1 ? "Submodule" : "Submodules"}
          </div>

          {/* Mobile toggle button */}
          {isMobile && selectedSubModule && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleSubModuleList}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <Plus
                className={`w-5 h-5 transition-transform ${
                  showSubModuleList ? "rotate-45" : ""
                }`}
              />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {errors.subModules && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-3"
          >
            <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{errors.subModules}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Submodule Form */}
      <AddSubModuleForm
        key={resetForm ? "reset" : "normal"}
        onAddSubModule={handleAddSubModule}
        errors={errors}
        setErrors={setErrors}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Submodule List - Conditionally rendered for mobile */}
        <AnimatePresence>
          {(!isMobile || showSubModuleList) && (
            <motion.div
              initial={isMobile ? { x: -300, opacity: 0 } : { opacity: 0 }}
              animate={isMobile ? { x: 0, opacity: 1 } : { opacity: 1 }}
              exit={isMobile ? { x: -300, opacity: 0 } : { opacity: 0 }}
              className={`lg:col-span-1 ${
                isMobile
                  ? "fixed inset-0 z-50 bg-white p-4 overflow-y-auto"
                  : ""
              }`}
            >
              {isMobile && (
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Submodules
                  </h3>
                  <button
                    onClick={toggleSubModuleList}
                    className="p-1 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <SubModuleList
                subModules={subModules}
                selectedSubModule={selectedSubModule}
                onSelectSubModule={(subModule) => {
                  setSelectedSubModule(subModule);
                  if (isMobile) setShowSubModuleList(false);
                }}
                onRemoveSubModule={handleRemoveSubModule}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Panel */}
        <div
          className={`${
            isMobile && !showSubModuleList
              ? "block"
              : isMobile
              ? "hidden"
              : "block"
          } lg:col-span-2 space-y-4 lg:space-y-6`}
        >
          {selectedSubModule ? (
            <SubModuleDetails
              key={selectedSubModule.id}
              subModule={selectedSubModule}
              onAddUnit={handleAddUnit}
              onRemoveUnit={handleRemoveUnit}
              onUploadFile={handleUploadFile}
              onUploadLink={handleUploadLink}
              errors={errors}
              setErrors={setErrors}
              onBack={isMobile ? () => setShowSubModuleList(true) : null}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 lg:py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
            >
              <BookOpen className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-700 text-center">
                Select a submodule
              </h4>
              <p className="text-gray-500 mt-2 text-center max-w-md text-sm px-4">
                Choose a submodule from the list to view details and manage
                units
              </p>
              {isMobile && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleSubModuleList}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  Browse Submodules
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <motion.div
        className="flex flex-col-reverse lg:flex-row justify-between gap-3 pt-4 lg:pt-6 mt-4 lg:mt-6 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleMobileBack}
          className="px-4 lg:px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm lg:text-base"
        >
          <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          {isMobile && selectedSubModule ? "Back to List" : "Cancel"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveAll}
          disabled={subModules.length === 0}
          className={`px-4 lg:px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm lg:text-base ${
            subModules.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white shadow-sm"
          }`}
        >
          <Save className="w-4 h-4 lg:w-5 lg:h-5" />
          Save & Continue
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SubModuleManager;

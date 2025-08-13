import React, { useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { BookOpen, FileText, X, ArrowLeft, Save } from "lucide-react";
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

  // Handler functions defined at the top
  const handleRemoveSubModule = (id) => {
    Swal.fire({
      title: "Delete Submodule",
      text: "Are you sure you want to delete this submodule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
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
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedSubModules = subModules.map((sub) => {
          if (sub.id === subModuleId) {
            return {
              ...sub,
              units: sub.units.filter((unit) => unit.id !== unitId),
            };
          }
          return sub;
        });
        setSubModules(updatedSubModules);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Unit has been deleted",
          timer: 1500,
          showConfirmButton: false,
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
        SubModuleImage: newSubModule.SubModuleImagePath, // Use path directly
        units: [],
      };

      // Update local state
      const updatedSubModules = [...subModules, subModuleToAdd];
      setSubModules(updatedSubModules);
      setResetForm((prev) => !prev);

      // Update parent component and localStorage
      const updatedModule = {
        ...module,
        subModules: updatedSubModules,
      };
      onSave(updatedModule); // This will trigger handleSubmoduleCreated in parent

      Swal.fire({
        icon: "success",
        title: "Submodule Added",
        text: "New submodule has been created successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      // console.error('Error adding submodule:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add submodule",
        timer: 1500,
        showConfirmButton: false,
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
        return {
          ...sub,
          units: [
            ...sub.units,
            {
              id: uuidv4(),
              UnitName: newUnit.UnitName.trim(),
              UnitDescription: newUnit.UnitDescription.trim(),
              // UnitImg: newUnit.UnitImg,
              files: [],
            },
          ],
        };
      }
      return sub;
    });

    setSubModules(updatedSubModules);
    setErrors({ ...errors, UnitName: null });

    Swal.fire({
      icon: "success",
      title: "Unit Added",
      text: "New unit has been created successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleUploadFile = async (
    subModuleId,
    unitId,
    file,
    customFileName,
    description,
    url = null
  ) => {
    if (!file) {
      Swal.fire("Error", "No file selected", "error");
      return false;
    }

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

    const tempId = uuidv4();
    const equalPercentage = 100;
    const tempFile = {
      id: tempId,
      originalName: customFileName || file.name,
      filePath: URL.createObjectURL(file),
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      percentage: equalPercentage,
      fileSize: file.size,
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
        title: "Uploading file...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const formData = new FormData();

      if (file) {
        formData.append("file", file);
        formData.append("moduleId", module.id);
        formData.append("subModuleId", subModuleId);
        formData.append("unitId", unitId);
        formData.append("percentage", equalPercentage);
        formData.append("customFileName", customFileName || file.name);
      } else if (url) {
        formData.append("url", url);
        formData.append("name", customFileName || file.name);
        formData.append("description", description);
        formData.append("subModuleId", subModuleId);
        formData.append("unitId", unitId);
        formData.append("type", "link");
      } else {
        throw new Error("Either file or URL must be provided");
      }

      if (!userToken) throw new Error("Authentication token missing");

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

      console.log("result after the upload", result);
      await uploadToast.close();

      const finalFile = {
        id: uuidv4(),
        originalName: customFileName || result.fileName || file.name,
        filePath: result.filePath, // Directly use the response path
        fileType: result.mimeType || file.type,
        uploadedAt: new Date().toISOString(),
        percentage: equalPercentage,
        fileSize: result.fileSize || file.size,
      };

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

      localStorage.setItem(
        "learningMaterials",
        JSON.stringify({ module: updatedModule })
      );
      if (onSave) onSave(updatedModule);

      Swal.fire("Success", "File uploaded successfully", "success");
      return true;
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", error.message || "Upload failed", "error");

      // Remove the temp file on failure
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
      confirmButtonText: "Yes, save it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Get the latest state
        setSubModules((currentSubModules) => {
          const updatedModule = {
            ...module,
            subModules: currentSubModules,
          };

          // Save to localStorage
          localStorage.setItem(
            "learningMaterials",
            JSON.stringify({ module: updatedModule })
          );

          // Call parent's save function
          onSave(updatedModule);

          Swal.fire({
            icon: "success",
            title: "Saved!",
            text: "All changes have been saved",
            timer: 1500,
            showConfirmButton: false,
          });

          return currentSubModules; // Return unchanged state
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 p-4 bg-DGXgray/5 rounded-xl"
      >
        <div>
          <h2 className="text-2xl font-bold text-DGXblue flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-DGXgreen" />
            {module.ModuleName}
          </h2>
          <p className="text-DGXgray mt-1">Manage submodules and their units</p>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-DGXgreen/10 text-DGXgreen text-sm font-medium">
          {subModules.length}{" "}
          {subModules.length === 1 ? "Submodule" : "Submodules"}
        </div>
      </motion.div>

      {/* Error Message */}
      {errors.subModules && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-red-100 border border-red-200 text-red-700 flex items-start gap-3"
        >
          <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{errors.subModules}</span>
        </motion.div>
      )}

      {/* Add Submodule Form */}
      <AddSubModuleForm
        key={resetForm ? "reset" : "normal"}
        onAddSubModule={handleAddSubModule}
        errors={errors}
        setErrors={setErrors}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SubModuleList
            subModules={subModules}
            selectedSubModule={selectedSubModule}
            onSelectSubModule={setSelectedSubModule}
            onRemoveSubModule={handleRemoveSubModule}
          />
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSubModule ? (
            <SubModuleDetails
              key={selectedSubModule.id}
              subModule={selectedSubModule}
              onAddUnit={handleAddUnit}
              onRemoveUnit={handleRemoveUnit}
              onUploadFile={handleUploadFile}
              errors={errors}
              setErrors={setErrors}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 bg-DGXgray/5 rounded-xl"
            >
              <BookOpen className="w-16 h-16 text-DGXgray mb-4" />
              <h4 className="text-lg font-medium text-DGXblue">
                Select a submodule
              </h4>
              <p className="text-DGXgray mt-2 text-center max-w-md">
                Choose a submodule from the list to view details and manage
                units
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <motion.div
        className="flex justify-between pt-6 mt-6 border-t border-DGXgray/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            Swal.fire({
              title: "Cancel Changes?",
              text: "Are you sure you want to cancel? All unsaved changes will be lost.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#d33",
              cancelButtonColor: "#6b7280",
              confirmButtonText: "Yes, cancel!",
            }).then((result) => {
              if (result.isConfirmed) {
                onCancel();
              }
            });
          }}
          className="px-6 py-2.5 rounded-lg border border-DGXgray/30 text-DGXblue hover:bg-DGXgray/10 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveAll}
          disabled={subModules.length === 0}
          className={`px-6 py-2.5 rounded-lg flex items-center gap-2 ${
            subModules.length === 0
              ? "bg-DGXgray/30 text-DGXgray cursor-not-allowed"
              : "bg-DGXgreen hover:bg-[#68a600] text-DGXwhite"
          }`}
        >
          <Save className="w-5 h-5" />
          Save & Continue
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SubModuleManager;

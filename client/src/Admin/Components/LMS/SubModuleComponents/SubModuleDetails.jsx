import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import AddUnitForm from "./AddUnitForm";
import UnitDetails from "./UnitDetails";
import FilesTable from "./FilesTable";
import FileUploadModal from "./FileUploadModal";

const SubModuleDetails = ({
  subModule,
  onAddUnit,
  onRemoveUnit,
  onUploadFile,
  errors,
  setErrors,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [uploadedFile, setUploadedFile] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const showImagePreview = (imageUrl) => {
    setImagePreview(imageUrl);
    Swal.fire({
      imageUrl: imageUrl,
      imageAlt: "Preview",
      showConfirmButton: false,
      background: "transparent",
      backdrop: `
                rgba(0,0,0,0.8)
                url("/images/zoom-in-cursor.png")
                center
                no-repeat
            `,
      width: "80%",
      padding: "0",
      showCloseButton: true,
      customClass: {
        closeButton: "text-white text-2xl hover:text-DGXgreen",
      },
    });
  };

  const handleOpenUploadModal = (unit) => {
    setCurrentUnit(unit);
    setShowUploadModal(true);
  };

  const handleFileSelect = (file) => {
    setUploadedFile(file);
  };

  const handleUploadSubmit = async (file, customFileName) => {
    if (!file) {
      setErrors({ file: "Please select a file to upload" });
      return;
    }

    if (!customFileName) {
      setErrors({ fileName: "Please enter a file name" });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onUploadFile(
        subModule.id,
        currentUnit.id,
        file,
        customFileName
      );

      if (success) {
        Swal.fire({
          title: "Success!",
          text: "File uploaded successfully",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-DGXgreen hover:bg-[#68a600]",
          },
        }).then(() => {
          setUploadedFile(null);
          setShowUploadModal(false);
          const fileInput = document.querySelector("#file-upload");
          if (fileInput) fileInput.value = "";
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      Swal.fire({
        title: "Upload Failed",
        text: error.message.includes("Failed to fetch")
          ? "Network error: Could not connect to server"
          : error.message,
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-DGXgreen hover:bg-[#68a600]",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Unit Details */}
      <UnitDetails subModule={subModule} onImageClick={showImagePreview} />

      {/* Add Unit Form */}
      <AddUnitForm
        onAddUnit={onAddUnit}
        errors={errors}
        setErrors={setErrors}
      />

      {/* Units List */}
      {subModule.units.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-DGXwhite rounded-xl shadow-sm border border-DGXgray/20 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-DGXblue flex items-center gap-2">
                <FileText className="w-5 h-5 text-DGXgreen" />
                Units ({subModule.units.length})
              </h3>
              <div className="text-sm text-DGXgray">
                Click on a unit to manage content
              </div>
            </div>
            <div className="space-y-4">
              {subModule.units.map((unit, index) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.005 }}
                  className="bg-DGXwhite rounded-lg border border-DGXgray/20 p-4 hover:border-DGXgreen/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-lg text-DGXblue">
                        {unit.UnitName}
                      </h4>
                      {unit.UnitDescription && (
                        <p className="text-DGXgray mt-1 text-sm">
                          {unit.UnitDescription}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenUploadModal(unit)}
                        className="p-2 rounded-lg bg-DGXgreen hover:bg-[#68a600] text-DGXwhite flex items-center gap-1 text-sm"
                      >
                        <UploadCloud className="w-4 h-4" />
                        Upload
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveUnit(subModule.id, unit.id);
                        }}
                        className="p-2 rounded-lg border border-DGXgray/30 hover:bg-red-50 text-red-600 flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </motion.button>
                    </div>
                  </div>
                  <FilesTable
                    files={unit.files}
                    onImageClick={showImagePreview}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 bg-DGXgray/5 rounded-xl border border-dashed border-DGXgray/30"
        >
          <FileText className="w-12 h-12 text-DGXgray mb-4" />
          <p className="text-DGXgray">No units added yet</p>
          <p className="text-sm text-DGXgray mt-1">Add your first unit above</p>
        </motion.div>
      )}

      {/* File Upload Modal */}
      {/* <FileUploadModal
        show={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadedFile(null);
        }}
        unitName={currentUnit?.UnitName}
        onFileSelect={handleFileSelect}
        onSubmit={handleUploadSubmit}
        isSubmitting={isSubmitting}
        uploadedFile={uploadedFile}
      /> */}
      <FileUploadModal
        show={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadedFile(null);
        }}
        unitName={currentUnit?.UnitName}
        onFileSelect={handleFileSelect}
        onSubmit={handleUploadSubmit}
        isSubmitting={isSubmitting}
        uploadedFile={uploadedFile}
      />
    </>
  );
};

export default SubModuleDetails;

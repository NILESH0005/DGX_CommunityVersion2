import React, { useEffect, useState, useContext } from "react";
import ApiContext from "../../../context/ApiContext";
import EditModule from "./EditableComponents/EditModule.jsx";
import EditSubModule from "./EditableComponents/EditSubModule.jsx";
import Swal from "sweetalert2";
import ModuleOrder from "./EditableComponents/ModuleOrder.jsx";

const LearningMaterialList = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showModuleOrder, setShowModuleOrder] = useState(false);
  const { fetchData, userToken } = useContext(ApiContext);
  const [reloadKey, setReloadKey] = useState(0); // Add this line
  const [submodules, setSubmodules] = useState([]); // Add this line

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await fetchData("dropdown/getModules", "GET");
        if (response?.success) {
          // Sort modules by SortingOrder then by ModuleID
          const sortedModules = [...response.data].sort((a, b) => {
            const orderA = a.SortingOrder || Number.MAX_SAFE_INTEGER;
            const orderB = b.SortingOrder || Number.MAX_SAFE_INTEGER;
            return orderA - orderB || a.ModuleID - b.ModuleID;
          });
          setModules(sortedModules);
        } else {
          setError(response?.message || "Failed to fetch modules");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching modules");
        // console.error("Error fetching modules:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [fetchData, reloadKey]);

  const handleViewSubmodules = (moduleId) => {
    const module = modules.find((mod) => mod.ModuleID === moduleId);
    if (module) {
      setSelectedModule(module);
    }
    console.log("id ?", moduleId);
  };

  const handleSubmoduleUpdated = (updatedSubmodule) => {
    setSubmodules((prev) =>
      prev.map((sub) =>
        sub.SubModuleID === updatedSubmodule.SubModuleID
          ? updatedSubmodule
          : sub
      )
    );
  };

  const handleBackToList = () => {
    setSelectedModule(null);
  };

  const handleDeleteModule = async (moduleId) => {
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
      // console.log("Deleting module with ID:", moduleId, typeof moduleId);

      const response = await fetchData(
        "lmsEdit/deleteModule",
        "POST",
        { moduleId },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        setModules((prev) => prev.filter((mod) => mod.ModuleID !== moduleId));
        Swal.fire("Deleted!", "Module has been deleted.", "success");
      } else {
        throw new Error(response?.message || "Failed to delete module");
      }
    } catch (err) {
      // console.error("Full error details:", err);
      Swal.fire("Error!", `Failed to delete module: ${err.message}`, "error");
    }
  };

  const handleModuleUpdated = (updatedModule) => {
    setModules((prevModules) =>
      prevModules.map((mod) =>
        mod.ModuleID === updatedModule.ModuleID ? updatedModule : mod
      )
    );
    setReloadKey((prev) => prev + 1);
  };

  const handleSaveModuleOrder = async (orderedModules) => {
    try {
      // Prepare modules with their new order positions
      const modulesWithOrder = orderedModules.map((module, index) => ({
        ModuleID: module.ModuleID,
        SortingOrder: index + 1,
      }));

      const response = await fetchData(
        "lmsEdit/updateModuleOrder",
        "POST",
        { modules: modulesWithOrder },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        const updatedModules = [...modules]
          .map((module) => {
            const updatedModule = modulesWithOrder.find(
              (m) => m.ModuleID === module.ModuleID
            );
            return updatedModule
              ? { ...module, SortingOrder: updatedModule.SortingOrder }
              : module;
          })
          .sort((a, b) => (a.SortingOrder || 0) - (b.SortingOrder || 0));

        setModules(updatedModules);
        setShowModuleOrder(false);
        Swal.fire("Success!", "Module order has been updated.", "success");
      } else {
        throw new Error(response?.message || "Failed to update module order");
      }
    } catch (err) {
      // console.error("Error updating module order:", err);
      Swal.fire(
        "Error!",
        `Failed to update module order: ${err.message}`,
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 text-center">Error: {error}</div>;
  }

  if (selectedModule) {
    return (
      <EditSubModule
        module={selectedModule}
        submodules={submodules}
        setSubmodules={setSubmodules} // Pass the setter
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Module Details Header */}
      <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Module Details</h1>
          <p className="text-gray-600 mt-1">Manage all learning modules</p>
        </div>
        <button
          onClick={() => setShowModuleOrder(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Manage Module Order
        </button>
      </div>

      {/* Module Order Modal */}
      {showModuleOrder && (
        <ModuleOrder
          modules={modules}
          onClose={() => setShowModuleOrder(false)}
          onSave={handleSaveModuleOrder}
        />
      )}
      {modules.length === 0 ? (
        <div className="text-gray-500 text-center">
          No modules found. Create your first module to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
            <EditModule
              key={module.ModuleID + reloadKey}
              module={module}
              onDelete={handleDeleteModule}
              onViewSubmodules={handleViewSubmodules}
              onUpdateSuccess={handleModuleUpdated} // Add this new prop
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningMaterialList;

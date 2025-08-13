import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaChevronRight } from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";
import AddUnitModal from "./AddUnitModal";
import UnitOrder from "./UnitOrder";
import FileManagement from "./FileManagement";


const UnitManagement = ({ submodule, onBack, fetchData, userToken }) => {
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editedUnitData, setEditedUnitData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showUnitOrder, setShowUnitOrder] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null); // Add selectedUnit state


  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const response = await fetchData(
          `dropdown/getUnitsWithFiles/${submodule.SubModuleID}`,
          "GET",
          { "auth-token": userToken }
        );

        if (response?.success) {
          const validUnits = response.data.filter((unit) => unit);
          setUnits(validUnits);
          setFilteredUnits(validUnits.filter(
            (unit) => unit.SubModuleID === submodule.SubModuleID
          ));
        }
      } catch (err) {
        // console.error("Error refetching units:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [submodule.SubModuleID, fetchData, userToken]);

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
  };

  const handleBackToUnits = () => {
    setSelectedUnit(null);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setEditedUnitData({
      UnitName: unit.UnitName,
      UnitDescription: unit.UnitDescription,
    });
  };

  const handleCancelEditUnit = () => {
    setEditingUnit(null);
    setEditedUnitData({});
  };

  const handleUpdateUnit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        UnitName: editedUnitData.UnitName,
        UnitDescription: editedUnitData.UnitDescription,
        SubModuleID: submodule.SubModuleID,
      };

      const response = await fetchData(
        `lmsEdit/updateUnit/${editingUnit.UnitID}`,
        "POST",
        payload,
        { "Content-Type": "application/json", "auth-token": userToken }
      );

      if (response?.success) {
        setUnits(prev => prev.map(unit =>
          unit.UnitID === editingUnit.UnitID ? { ...unit, ...response.data } : unit
        ));
        setFilteredUnits(prev => prev.map(unit =>
          unit.UnitID === editingUnit.UnitID ? { ...unit, ...response.data } : unit
        ));
        handleCancelEditUnit();
        Swal.fire("Success!", "Unit updated successfully", "success");
      } else {
        throw new Error(response?.message || "Failed to update unit");
      }
    } catch (err) {
      // console.error("Error:", err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
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
        "lmsEdit/deleteUnit",
        "POST",
        { unitId },
        { "Content-Type": "application/json", "auth-token": userToken }
      );

      if (response?.success) {
        setUnits(prev => prev.filter(unit => unit.UnitID !== unitId));
        setFilteredUnits(prev => prev.filter(unit => unit.UnitID !== unitId));
        Swal.fire("Deleted!", "Unit has been deleted.", "success");
      } else {
        throw new Error(response?.message || "Failed to delete unit");
      }
    } catch (err) {
      // console.error("Delete error:", err);
      Swal.fire("Error!", `Failed to delete unit: ${err.message}`, "error");
    }
  };

  const handleSaveUnitOrder = async (orderedUnits) => {
    try {
      const unitsWithOrder = orderedUnits.map((unit, index) => ({
        UnitID: unit.UnitID,
        SortingOrder: index + 1,
      }));

      const response = await fetchData(
        "lmsEdit/updateUnitOrder",
        "POST",
        { units: unitsWithOrder },
        { "Content-Type": "application/json", "auth-token": userToken }
      );

      if (response?.success) {
        const updatedUnits = [...units].map(unit => {
          const updatedUnit = unitsWithOrder.find(u => u.UnitID === unit.UnitID);
          return updatedUnit ? { ...unit, SortingOrder: updatedUnit.SortingOrder } : unit;
        }).sort((a, b) => {
          const orderA = a.SortingOrder || Number.MAX_SAFE_INTEGER;
          const orderB = b.SortingOrder || Number.MAX_SAFE_INTEGER;
          return orderA - orderB || a.UnitID - b.UnitID;
        });

        setUnits(updatedUnits);
        setFilteredUnits(updatedUnits.filter(
          unit => unit.SubModuleID === submodule.SubModuleID
        ));
        setShowUnitOrder(false);
        Swal.fire("Success!", "Unit order has been updated.", "success");
      } else {
        throw new Error(response?.message || "Failed to update unit order");
      }
    } catch (err) {
      // console.error("Error updating unit order:", err);
      Swal.fire("Error!", `Failed to update unit order: ${err.message}`, "error");
    }
  };

  const handleAddUnitSuccess = (newUnit) => {
    setUnits(prev => [...prev, newUnit]);
    if (newUnit.SubModuleID === submodule.SubModuleID) {
      setFilteredUnits(prev => [...prev, newUnit]);
    }
    setShowAddUnitModal(false);
  };

  if (loading) return <div className="text-center py-10">Loading units...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Units</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddUnitModal(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center"
            >
              Add Unit
            </button>
            <button
              onClick={() => setShowUnitOrder(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Reorder
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[calc(100vh-300px)] overflow-y-auto">
        {filteredUnits.length > 0 ? (
          filteredUnits.map((unit) => (
            <div
              key={unit.UnitID}
              className={`p-4 cursor-pointer transition-colors duration-200 ${editingUnit?.UnitID === unit.UnitID
                ? "bg-blue-50 dark:bg-gray-700"
                : selectedUnit?.UnitID === unit.UnitID
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              onClick={() => handleUnitSelect(unit)}
            >
              {editingUnit?.UnitID === unit.UnitID ? (
                <form onSubmit={handleUpdateUnit} className="space-y-3">
                  <input
                    type="text"
                    value={editedUnitData.UnitName || ""}
                    onChange={(e) => setEditedUnitData({ ...editedUnitData, UnitName: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md"
                    required
                  />
                  <textarea
                    value={editedUnitData.UnitDescription || ""}
                    onChange={(e) => setEditedUnitData({ ...editedUnitData, UnitDescription: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditUnit}
                      className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      {unit.UnitName}
                    </h3>
                    {unit.UnitDescription && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {unit.UnitDescription}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditUnit(unit);
                      }}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      data-tooltip-id="edit-unit-tooltip"
                      data-tooltip-content="Edit Unit"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUnit(unit.UnitID);
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                      data-tooltip-id="delete-unit-tooltip"
                      data-tooltip-content="Delete Unit"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No units found
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 flex-1">
        {selectedUnit ? (
          <FileManagement
            selectedUnit={selectedUnit}
            fetchData={fetchData}
            userToken={userToken}
            onBack={handleBackToUnits}
          />
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Select a unit to view files
            </p>
          </div>
        )}
      </div>

      <AddUnitModal
        isOpen={showAddUnitModal}
        onClose={() => setShowAddUnitModal(false)}
        onAddUnit={handleAddUnitSuccess}
        submodule={submodule}
        fetchData={fetchData}
        userToken={userToken}
      />

      {showUnitOrder && (
        <UnitOrder
          units={filteredUnits}
          onClose={() => setShowUnitOrder(false)}
          onSave={handleSaveUnitOrder}
        />
      )}

      <ReactTooltip id="edit-unit-tooltip" place="top" effect="solid" />
      <ReactTooltip id="delete-unit-tooltip" place="top" effect="solid" />
    </div>
  );
};

export default UnitManagement;
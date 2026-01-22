import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaTimes, FaCheck, FaUserTag } from "react-icons/fa";

const ManageUserRolesModal = ({
  isOpen,
  onClose,
  user,
  availableRoles,
  userToken,
  fetchData,
  onSaveSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Fetch user's existing roles when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchUserRoles();
    }
  }, [isOpen, user]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedRole(null);
      setLoading(false);
      setLoadingRoles(false);
      setCurrentUserRole(null);
    }
  }, [isOpen]);

  const fetchUserRoles = async () => {
    if (!user?.UserID) return;

    setLoadingRoles(true);
    
    // Note: You need to check the correct API endpoint
    // If the endpoint returns 404, you might need to use a different endpoint
    const endpoint = `user/getUserRoles?userId=${user.UserID}`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const result = await fetchData(endpoint, method, {}, headers);
      
      // Check if result exists and has success property
      if (result && result.success) {
        // Assuming result.data is the role ID
        const roleId = result.data;
        setSelectedRole(roleId);
        setCurrentUserRole(roleId);
      } else {
        console.error("Failed to fetch user role:", result?.message || "Unknown error");
        setSelectedRole(null);
        setCurrentUserRole(null);
        
        // If API returns 404, check for alternative endpoints or data structure
        // You might need to modify this based on your actual API response
        Swal.fire({
          icon: "error",
          title: "Failed to load user role",
          text: result?.message || "API endpoint not found or user has no role assigned",
        });
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setSelectedRole(null);
      setCurrentUserRole(null);
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load user role. Please check if the API endpoint is correct.",
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleSaveRoles = async () => {
    if (!user?.UserID) return;

    if (!selectedRole && selectedRole !== 0) {
      Swal.fire({
        icon: "warning",
        title: "No Role Selected",
        text: "Please select a role for the user",
      });
      return;
    }

    setLoading(true);
    const endpoint = "user/assignRoles";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = {
      userId: user.UserID,
      roleId: selectedRole,
    };

    try {
      const result = await fetchData(endpoint, method, body, headers);
      if (result && result.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "User role updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

        if (onSaveSuccess) {
          await onSaveSuccess();
        }

        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        throw new Error(result?.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Error saving role:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Failed to update role",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (selectedRole !== currentUserRole) {
      Swal.fire({
        title: "Discard Changes?",
        text: "You have unsaved changes that will be lost.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Discard",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Manage Role
              </h3>
              <p className="text-sm text-gray-600">
                {user.Name} • {user.EmailId}
              </p>
              {currentUserRole && (
                <p className="text-xs text-gray-500 mt-1">
                  Current Role ID: {currentUserRole}
                </p>
              )}
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <FaTimes size={24} />
            </button>
          </div>

          {loadingRoles ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-DGXblue"></div>
              <p className="mt-3 text-gray-600">Loading user role...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-700">
                    Available Roles ({availableRoles.length})
                  </p>
                  <span className="text-xs text-gray-500">
                    Click to select single role
                  </span>
                </div>

                {availableRoles && availableRoles.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {availableRoles.map((role) => {
                      const isSelected = selectedRole === role.RoleID;
                      return (
                        <div
                          key={role.RoleID}
                          onClick={() => handleRoleSelect(role.RoleID)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "border-DGXgreen bg-green-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isSelected
                                    ? "bg-DGXgreen text-white"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {isSelected ? (
                                  <FaCheck size={18} />
                                ) : (
                                  <span className="font-bold">
                                    {role.RoleName.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {role.RoleName}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  ID: {role.RoleID}
                                  {currentUserRole === role.RoleID && (
                                    <span className="ml-2 text-green-600 font-medium">
                                      (Current)
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? "border-DGXgreen bg-DGXgreen"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <FaCheck size={10} className="text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 bg-gray-50 rounded-lg text-center">
                    <div className="text-gray-400 mb-3">
                      <FaUserTag size={32} className="mx-auto" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      No roles available
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Add roles first using the "Add Role" button
                    </p>
                  </div>
                )}
              </div>

              {selectedRole !== null && selectedRole !== undefined && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-medium text-purple-800 mb-2">
                    Selected Role:
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                      {availableRoles.find(r => r.RoleID === selectedRole)?.RoleName.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">
                        {availableRoles.find(r => r.RoleID === selectedRole)?.RoleName || 'Unknown Role'}
                      </p>
                      <p className="text-xs text-purple-700">
                        ID: {selectedRole}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoles}
                  disabled={loading || loadingRoles || selectedRole === currentUserRole}
                  className="px-5 py-2.5 bg-DGXgreen text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Save Role
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUserRolesModal;
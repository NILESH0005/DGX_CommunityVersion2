// components/AddRoleModal.jsx - UPDATED VERSION
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FaTimes,
  FaCheck,
  FaInfoCircle,
  FaArrowLeft,
  FaPlus,
  FaUserTag,
  FaEdit,
} from "react-icons/fa";

const AddRoleModal = ({
  isOpen,
  onClose,
  availableRoles,
  onAddRole,
  userToken,
  fetchData,
}) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [step, setStep] = useState(1);
  const [newRoleName, setNewRoleName] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);
  const [actionType, setActionType] = useState("select");

  const handleCancelRole = () => {
    if (selectedRole || step === 2 || newRoleName.trim()) {
      Swal.fire({
        title: "Are you sure?",
        text: "All your selections will be lost!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "OK",
      }).then((result) => {
        if (result.isConfirmed) {
          resetModal();
          onClose();
        }
      });
    } else {
      resetModal();
      onClose();
    }
  };

  const resetModal = () => {
    setSelectedRole(null);
    setSelectedPages([]);
    setStep(1);
    setNewRoleName("");
    setCreatingRole(false);
    setActionType("select");
  };

  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setActionType("select");
    setStep(2);

    // Fetch pages and existing access for this role
    await fetchPagesForRole(role.RoleID);
  };

  const handleCreateNewRole = () => {
    setActionType("create");
    setSelectedRole(null);
  };

  const handleSaveNewRole = async () => {
    if (!newRoleName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Role Name Required",
        text: "Please enter a role name",
      });
      return;
    }

    setCreatingRole(true);

    try {
      const result = await fetchData(
        "user/addRole",
        "POST",
        { name: newRoleName.trim() },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        },
      );

      if (result.success) {
        const newRole = result.data;

        Swal.fire({
          icon: "success",
          title: "Role Created!",
          html: `
            <div class="text-center">
              <p><strong>${newRoleName.trim()}</strong> role created successfully!</p>
              <p class="text-sm text-gray-600">Role ID: ${newRole.RoleID}</p>
              <p class="text-sm mt-2">Now you can assign pages to this role.</p>
            </div>
          `,
          showConfirmButton: true,
          confirmButtonText: "Assign Pages",
        }).then(() => {
          setSelectedRole({
            RoleID: newRole.RoleID,
            RoleName: newRole.RoleName,
            isNew: true,
          });
          setStep(2);
          // Fetch pages but don't try to load existing access for new role
          fetchPages();
        });

        if (onAddRole) {
          await onAddRole();
        }
      } else {
        throw new Error(result.message || "Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Failed to create role. Please try again.",
      });
    } finally {
      setCreatingRole(false);
    }
  };

  // Fetch all pages without role-specific access
  const fetchPages = async () => {
    setLoadingPages(true);
    try {
      const pagesResult = await fetchData(
        "user/getPages",
        "GET",
        {},
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        },
      );

      if (pagesResult.success) {
        const allPages = pagesResult.data || [];
        console.log("All pages loaded:", allPages);
        setPages(allPages);

        // For new roles, start with no pages selected
        if (selectedRole?.isNew) {
          setSelectedPages([]);
        }
      } else {
        throw new Error(pagesResult.message || "Failed to fetch pages");
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to load pages. Please try again.",
      });
      setStep(1);
    } finally {
      setLoadingPages(false);
    }
  };

  const fetchPagesForRole = async (roleId) => {
    setLoadingPages(true);
    try {
      // First, fetch all pages
      const pagesResult = await fetchData(
        "user/getPages",
        "GET",
        {},
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        },
      );

      if (!pagesResult.success) {
        throw new Error(pagesResult.message || "Failed to fetch pages");
      }

      const allPages = pagesResult.data || [];
      console.log("All pages:", allPages);
      setPages(allPages);

      // Fetch role access data
      try {
        const roleAccessResult = await fetchData(
          `user/rolePageAccess`,
          "GET",
          {},
          {
            "Content-Type": "application/json",
            "auth-token": userToken,
          },
        );

        console.log("Full role access response:", roleAccessResult);

        if (roleAccessResult.success && roleAccessResult.data) {
          // The response.data is an array of role objects
          const rolesData = roleAccessResult.data;

          // Find the specific role we're looking for
          const selectedRoleData = rolesData.find(
            (role) => role.RoleID === roleId,
          );

          console.log("Selected role data:", selectedRoleData);

          if (selectedRoleData && selectedRoleData.Pages) {
            // Get page IDs where Access === 1
            const accessiblePageIds = selectedRoleData.Pages.filter(
              (page) => page.Access === 1,
            ).map((page) => page.PageID);

            console.log(
              "Accessible page IDs for role",
              roleId,
              ":",
              accessiblePageIds,
            );
            setSelectedPages(accessiblePageIds);
          } else {
            console.log("No page access data found for role ID:", roleId);
            console.log(
              "Available roles in response:",
              rolesData.map((r) => ({
                RoleID: r.RoleID,
                RoleName: r.RoleName,
              })),
            );
            setSelectedPages([]);
          }
        } else {
          console.log("No role access data returned from API");
          setSelectedPages([]);
        }
      } catch (accessError) {
        console.error("Error fetching role-specific access:", accessError);
        setSelectedPages([]);
      }
    } catch (error) {
      console.error("Error in fetchPagesForRole:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to load data. Please try again.",
      });
      setStep(1);
    } finally {
      setLoadingPages(false);
    }
  };

  const handlePageToggle = (pageId) => {
    setSelectedPages((prev) => {
      if (prev.includes(pageId)) {
        return prev.filter((id) => id !== pageId);
      } else {
        return [...prev, pageId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPages.length === pages.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(pages.map((page) => page.PageID || page.id));
    }
  };

  const goBackToRoleSelection = () => {
    Swal.fire({
      title: "Go Back?",
      text:
        actionType === "create"
          ? "You will lose the role name you entered"
          : "You will lose your page selections",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Go Back",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedPages([]);
        setNewRoleName("");
        setActionType("select");
        setStep(1);
      }
    });
  };

  const handleConfirmRoleAssignment = async () => {
    if (!selectedRole) {
      Swal.fire({
        icon: "warning",
        title: "No Role Selected",
        text: "Please select a role to continue",
      });
      return;
    }

    if (selectedPages.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Pages Selected",
        text: "Please select at least one page to assign",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: selectedRole.isNew
        ? "Confirm New Role Setup"
        : "Confirm Role Assignment",
      html: `
        <div class="text-left">
          <p><strong>Role:</strong> ${selectedRole.RoleName} ${
            selectedRole.isNew ? "(New)" : ""
          }</p>
          <p><strong>Pages Selected:</strong> ${selectedPages.length} of ${
            pages.length
          }</p>
          <p>Are you sure you want to assign these pages to this role?</p>
        </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Assign",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);

    try {
      const result = await fetchData(
        "user/assignPagesToRole",
        "POST",
        {
          roleId: selectedRole.RoleID,
          pageIds: selectedPages,
        },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        },
      );

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          html: `
            <div class="text-center">
              <p><strong>${selectedRole.RoleName}</strong> role ${
                selectedRole.isNew ? "created and " : ""
              }configured successfully!</p>
              <p class="text-sm text-gray-600">${
                selectedPages.length
              } pages enabled</p>
            </div>
          `,
          timer: 2000,
          showConfirmButton: false,
        });

        if (onAddRole) {
          await onAddRole();
        }

        setTimeout(() => {
          resetModal();
          onClose();
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to assign pages to role");
      }
    } catch (error) {
      console.error("Error assigning pages to role:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Failed to assign pages to role",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              {step === 2 && (
                <button
                  onClick={goBackToRoleSelection}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={loading || creatingRole}
                >
                  <FaArrowLeft size={20} />
                </button>
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {step === 1
                    ? actionType === "select"
                      ? "Assign Pages to Role"
                      : "Create New Role"
                    : `Assign Pages for ${selectedRole?.RoleName}`}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {step === 1
                    ? actionType === "select"
                      ? "Select an existing role or create a new one"
                      : "Enter details for the new role"
                    : "Select pages that will be accessible for this role"}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelRole}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading || creatingRole}
            >
              <FaTimes size={24} />
            </button>
          </div>

          {step === 1 && (
            <>
              <div className="mb-6">
                {/* Action Type Toggle */}
                <div className="flex border border-gray-200 rounded-lg p-1 mb-6">
                  <button
                    onClick={() => setActionType("select")}
                    className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                      actionType === "select"
                        ? "bg-DGXgreen text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <FaUserTag />
                    Select Existing Role
                  </button>
                  <button
                    onClick={handleCreateNewRole}
                    className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                      actionType === "create"
                        ? "bg-DGXgreen text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <FaPlus />
                    Create New Role
                  </button>
                </div>

                {actionType === "select" ? (
                  <>
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <FaInfoCircle className="text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            How it works
                          </p>
                          <p className="text-xs text-blue-700">
                            Select an existing role to assign page permissions.
                            Existing page access will be pre-checked.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-gray-700">
                          Available Roles ({availableRoles.length})
                        </p>
                        <span className="text-xs text-gray-500">
                          Click to select a role
                        </span>
                      </div>

                      {availableRoles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {availableRoles.map((role) => {
                            const isLocked = role.CanRoleEdit === 1;

                            return (
                              <div
                                key={role.RoleID}
                                onClick={() => {
                                  if (isLocked) return;
                                  handleRoleSelect(role);
                                }}
                                title={
                                  isLocked
                                    ? "This role is managed by the system and cannot be edited"
                                    : "Click to edit this role"
                                }
                                className={`p-4 border rounded-lg transition-all duration-200 group relative
            ${
              isLocked
                ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-70"
                : "border-gray-200 cursor-pointer hover:border-DGXgreen hover:bg-gray-50"
            }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-200
                  ${
                    isLocked
                      ? "bg-gray-300 text-gray-600"
                      : "bg-DGXgreen/10 text-DGXgreen group-hover:bg-DGXgreen group-hover:text-white"
                  }`}
                                    >
                                      {role.RoleName.charAt(0)}
                                    </div>

                                    <div>
                                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                        {role.RoleName}

                                        {isLocked && (
                                          <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-medium">
                                            Locked
                                          </span>
                                        )}
                                      </h4>
                                      <p className="text-xs text-gray-500 mt-1">
                                        ID: {role.RoleID}
                                      </p>
                                    </div>
                                  </div>

                                  {!isLocked && (
                                    <div className="text-DGXgreen opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <FaCheck size={16} />
                                    </div>
                                  )}
                                </div>

                                {isLocked && (
                                  <div className="mt-3 text-xs text-gray-600 flex items-center gap-2">
                                    <FaInfoCircle className="text-gray-500" />
                                    This role is locked by the system and cannot
                                    be modified.
                                  </div>
                                )}
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
                            Click "Create New Role" to add a role
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <FaInfoCircle className="text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800 mb-1">
                            Create a New Role
                          </p>
                          <p className="text-xs text-green-700">
                            Enter a unique role name. After creating the role,
                            you'll be able to assign page permissions to it.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role Name *
                          </label>
                          <input
                            type="text"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-DGXgreen focus:border-DGXgreen outline-none transition-all duration-200"
                            placeholder="Enter role name (e.g., Manager, Supervisor, etc.)"
                            maxLength={50}
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Role names must be unique and descriptive
                          </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <FaEdit className="text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                What happens next?
                              </p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                <li>
                                  • Role will be created with the name you
                                  provide
                                </li>
                                <li>
                                  • You'll be taken to page assignment screen
                                </li>
                                <li>
                                  • You can assign permissions immediately
                                </li>
                                <li>
                                  • Role will appear in available roles list
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveNewRole}
                        disabled={!newRoleName.trim() || creatingRole}
                        className="px-5 py-2.5 bg-DGXgreen text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creatingRole ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <FaCheck />
                            Create Role & Continue
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Available Pages ({pages.length})
                    </p>
                    <p className="text-xs text-gray-500">
                      Select pages to enable for this role
                    </p>
                    {selectedRole && !selectedRole.isNew && (
                      <p className="text-xs text-blue-600 mt-1">
                        ✓ Existing page access is pre-checked
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-DGXgreen hover:text-green-700 font-medium"
                  >
                    {selectedPages.length === pages.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                {loadingPages ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-DGXgreen"></div>
                    <p className="text-gray-600 mt-3">
                      Loading {selectedRole?.isNew ? "pages" : "page access"}...
                    </p>
                  </div>
                ) : pages.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {pages.map((page) => {
                      const pageId = page.PageID || page.id;
                      const isChecked = selectedPages.includes(pageId);

                      return (
                        <div
                          key={pageId}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <input
                                type="checkbox"
                                id={`page-${pageId}`}
                                checked={isChecked}
                                onChange={() => handlePageToggle(pageId)}
                                className="sr-only"
                              />
                              <label
                                htmlFor={`page-${pageId}`}
                                className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-colors duration-200 ${
                                  isChecked
                                    ? "bg-DGXgreen border-DGXgreen"
                                    : "border-gray-300 hover:border-DGXgreen"
                                }`}
                              >
                                {isChecked && (
                                  <FaCheck size={10} className="text-white" />
                                )}
                              </label>
                            </div>
                            <div>
                              <label
                                htmlFor={`page-${pageId}`}
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                {page.PageName || page.name}
                              </label>
                              <p className="text-xs text-gray-500 mt-1">
                                ID: {pageId}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 bg-gray-50 rounded-lg text-center">
                    <div className="text-gray-400 mb-3">
                      <FaInfoCircle size={32} className="mx-auto" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      No pages available
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Contact your administrator to add pages
                    </p>
                  </div>
                )}
              </div>

              {selectedPages.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-1">
                        Selected Pages: {selectedPages.length} of {pages.length}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pages
                          .filter((page) => {
                            const pageId = page.PageID || page.id;
                            return selectedPages.includes(pageId);
                          })
                          .slice(0, 3)
                          .map((page) => (
                            <span
                              key={page.PageID || page.id}
                              className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium"
                            >
                              {page.PageName || page.name}
                            </span>
                          ))}
                        {selectedPages.length > 3 && (
                          <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                            +{selectedPages.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelRole}
              disabled={loading || creatingRole || loadingPages}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            {step === 2 ? (
              <button
                type="button"
                onClick={handleConfirmRoleAssignment}
                disabled={loading || loadingPages || selectedPages.length === 0}
                className="px-5 py-2.5 bg-DGXgreen text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    {selectedRole?.isNew
                      ? "Create & Assign Pages"
                      : "Assign Pages to Role"}
                  </>
                )}
              </button>
            ) : (
              actionType === "select" && (
                <button
                  type="button"
                  onClick={() => {}}
                  disabled={true}
                  className="px-5 py-2.5 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                >
                  Select a Role
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRoleModal;

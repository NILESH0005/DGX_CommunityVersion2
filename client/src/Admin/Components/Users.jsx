import { useState, useContext, useEffect } from "react";
import ApiContext from "../../context/ApiContext";
import LoadPage from "../../component/LoadPage";
import Swal from "sweetalert2";
import {
  FaTrash,
  FaSearch,
  FaTimes,
  FaUserTag,
  FaUserCog,
  FaKey,
  FaInfoCircle,
  FaCheck,
} from "react-icons/fa";
import AddRoleModal from "./AddRoleModal"; // Import the new component
import ManageUserRolesModal from "./ManageUserRolesModal";

const AdminUsers = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  // const [showRoleModal, setShowRoleModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [roles, setRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  
  // const [selectedUserForRole, setSelectedUserForRole] = useState(null);

  const [newUser, setNewUser] = useState({
    Name: "",
    EmailId: "",
    CollegeName: "",
    Designation: "",
    MobileNumber: "",
    Category: "",
    roleId: null,
  });

  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => {
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAvailableRoles();
  }, []);

  const handleRoleToggleForNewUser = (roleId) => {
    setSelectedRoleId((prev) => (prev === roleId ? null : roleId));

    // Remove validation error when user selects a role
    if (formErrors.roleId) {
      setFormErrors((prev) => ({
        ...prev,
        roleId: "",
      }));
    }
  };

  const fetchAvailableRoles = async () => {
    setLoadingRoles(true);
    const endpoint = "user/getRoles";
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const result = await fetchData(endpoint, method, {}, headers);
      console.log("Parent - API Response for getRoles:", result);

      if (result.success) {
        console.log("Parent - Setting availableRoles:", result.data);
        setAvailableRoles(result.data || []);
      } else {
        console.error("Parent - Failed to fetch roles:", result.message);
        setAvailableRoles([]);
      }
    } catch (error) {
      console.error("Parent - Error fetching roles:", error);
      setAvailableRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    const results = users.filter((user) => {
      return (
        user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.EmailId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.CollegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.MobileNumber.toString().includes(searchTerm) ||
        user.Category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    const endpoint = "user/users";
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const result = await fetchData(endpoint, method, {}, headers);
      if (result.success) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      } else {
        setError(result.message || "Failed to fetch user data");
      }
    } catch (error) {
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will lose all unsaved changes!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
    }).then((result) => {
      if (result.isConfirmed) {
        setNewUser({
          Name: "",
          EmailId: "",
          CollegeName: "",
          Designation: "",
          MobileNumber: "",
          Category: "",
        });
        setSelectedRoleId(null);
        setFormErrors({});
        setShowAddUserModal(false);
      }
    });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = () => {
    const errors = {};
    if (!newUser.Name) errors.Name = "Name is required";
    if (!newUser.EmailId || !validateEmail(newUser.EmailId))
      errors.EmailId = "Enter a valid email address";
    if (!newUser.CollegeName) errors.CollegeName = "College name is required";
    if (!newUser.Designation) errors.Designation = "Designation is required";
    if (!newUser.MobileNumber || !/^\d{10}$/.test(newUser.MobileNumber))
      errors.MobileNumber = "Enter a valid 10-digit mobile number";
    if (!newUser.Category) errors.Category = "Category is required";
    if (!selectedRoleId) {
      errors.roleId = "Please select a role for the user";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    handleAddUser();
  };

  const handleAddUser = async () => {
    const endpoint = "user/addUser";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = { ...newUser, roleId: selectedRoleId };

    try {
      const result = await fetchData(endpoint, method, body, headers);
      if (result && result.success) {
        const selectedRoleName =
          availableRoles.find((r) => r.RoleID === selectedRoleId)?.RoleName ||
          "selected";

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "User added successfully!",
        });

        await fetchUsers();
        setShowAddUserModal(false);
        setNewUser({
          Name: "",
          EmailId: "",
          CollegeName: "",
          Designation: "",
          MobileNumber: "",
          Category: "",
          roleId: null,
        });
        setSelectedRoleId(null);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Fields can not be Empty!",
          text: result?.message || "Failed to add user",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add user",
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
    });

    if (result.isConfirmed) {
      try {
        const endpoint = "user/deleteUser";
        const method = "POST";
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };
        const body = { userId };

        const response = await fetchData(endpoint, method, body, headers);

        if (response.success) {
          Swal.fire("Deleted!", "User has been deleted.", "success");
          await fetchUsers();
        } else {
          Swal.fire(
            "Error!",
            response.message || "Failed to delete user",
            "error"
          );
        }
      } catch (error) {
        Swal.fire("Error!", "Failed to delete user", "error");
      }
    }
  };

  const handleRoleSaveSuccess = async () => {
    await fetchUsers(); // Refresh user list to show updated roles
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUserForRole(user);

    fetchUserRoles(user.UserID);
    setShowRoleModal(true);
  };

  const fetchUserRoles = async (userId) => {
    const endpoint = `user/getUserRoles?userId=${userId}`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    try {
      const result = await fetchData(endpoint, method, {}, headers);
      if (result.success) {
        setSelectedRoles(result.data || []);
        setRoles(result.data || []);
      } else {
        setSelectedRoles([]);
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
      setSelectedRoles([]);
      setRoles([]);
    }
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  // Save user roles
  const handleSaveRoles = async () => {
    if (!selectedUserForRole) return;

    const endpoint = "user/assignRoles";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = {
      userId: selectedUserForRole.UserID,
      roleIds: selectedRoles,
    };

    try {
      const result = await fetchData(endpoint, method, body, headers);
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "User roles updated successfully!",
        });
        setShowRoleModal(false);
        setSelectedUserForRole(null);
        setSelectedRoles([]);
        fetchUsers(); // Refresh user list to show updated roles
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: result.message || "Failed to update roles",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to update roles",
      });
    }
  };

  const renderMobileUserCard = (user, index) => (
    <div
      key={user.UserID}
      className="p-5 mb-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{user.Name}</h3>
          <p className="text-sm text-gray-600 mt-1">{user.EmailId}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.Category === "Faculty"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {user.Category}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Organization</p>
          <p className="text-sm text-gray-900">{user.CollegeName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Designation</p>
          <p className="text-sm text-gray-900">{user.Designation}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Mobile</p>
          <p className="text-sm text-gray-900">{user.MobileNumber}</p>
        </div>

        {user.roles && user.roles.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Roles</p>
            <div className="flex flex-wrap gap-1">
              {user.roles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                >
                  {role.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
        <button
          onClick={() => handleOpenRoleModal(user)}
          className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
          title="Manage Roles"
        >
          <FaUserTag size={14} />
          <span className="text-sm font-medium">Roles</span>
        </button>
        <button
          onClick={() => handleDeleteUser(user.UserID)}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          title="Delete"
        >
          <FaTrash size={14} />
          <span className="text-sm font-medium">Delete</span>
        </button>
      </div>
    </div>
  );

  if (loading) return <LoadPage />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          User Management
        </h2>
        <div className="w-full md:w-auto flex gap-3">
          <button
            onClick={() => setShowAddRoleModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-DGXgreen text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
          >
            <FaKey />
            Add Role
          </button>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-DGXblue text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            <FaUserCog />
            Add User
          </button>
        </div>
      </div>
      <div className="relative mb-6">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name, email, college, etc..."
          className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent placeholder-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>
      {filteredUsers.length > 0 ? (
        isMobileView ? (
          <div className="space-y-4">
            {filteredUsers.map((user, index) =>
              renderMobileUserCard(user, index)
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <div
              className="overflow-auto"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-DGXgreen">
                    <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-DGXblack sticky left-0  z-20">
                      #
                    </th>
                    <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-DGXblack">
                      Name
                    </th>
                    <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-DGXblack">
                      Email
                    </th>
                    <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-DGXblack">
                      Organization
                    </th>
                    <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-DGXblack">
                      Designation
                    </th>
                    <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-DGXblack">
                      Mobile
                    </th>
                    <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-DGXblack">
                      Category
                    </th>
                    <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-DGXblack">
                      Roles
                    </th>
                    <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-DGXblack">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.UserID}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-4 text-sm text-gray-600 font-medium sticky left-0 bg-white z-10">
                        {index + 1}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-sm text-gray-900">
                          {user.Name}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">
                          {user.EmailId}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {user.CollegeName}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {user.Designation}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {user.MobileNumber}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.Category === "Faculty"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.Category}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.RoleName &&
                        user.RoleName !== "No Role Assigned" ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {user.RoleName}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No roles
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenRoleModal(user)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                            title="Manage Roles"
                          >
                            <FaUserTag size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.UserID)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-3">
            <FaSearch size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            {searchTerm ? "No users match your search" : "No users found"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-DGXblue hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}
      {showAddUserModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Add New User
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Create a new user account with specific role
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    <span className="flex items-center gap-2">
                      <FaUserCog className="text-DGXblue" />
                      Personal Information
                    </span>
                  </h4>
                  <div className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="Name"
                          value={newUser.Name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-DGXblue focus:border-transparent transition-all duration-200 ${
                            formErrors.Name
                              ? "border-red-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          placeholder="John Doe"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <FaUserCog size={16} />
                        </div>
                      </div>
                      {formErrors.Name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <FaTimes size={12} /> {formErrors.Name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="EmailId"
                          value={newUser.EmailId}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-DGXblue focus:border-transparent transition-all duration-200 ${
                            formErrors.EmailId
                              ? "border-red-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          placeholder="john@example.com"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                      {formErrors.EmailId && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <FaTimes size={12} /> {formErrors.EmailId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Professional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Organization Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="CollegeName"
                        value={newUser.CollegeName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-DGXblue focus:border-transparent transition-all duration-200 ${
                          formErrors.CollegeName
                            ? "border-red-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="University/Company"
                      />
                      {formErrors.CollegeName && (
                        <p className="mt-2 text-sm text-red-600 text-xs">
                          {formErrors.CollegeName}
                        </p>
                      )}
                    </div>

                    {/* Designation Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="Designation"
                        value={newUser.Designation}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-DGXblue focus:border-transparent transition-all duration-200 ${
                          formErrors.Designation
                            ? "border-red-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="Professor/Manager"
                      />
                      {formErrors.Designation && (
                        <p className="mt-2 text-sm text-red-600 text-xs">
                          {formErrors.Designation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact & Category Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Contact & Category
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mobile Number Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          +91
                        </div>
                        <input
                          type="text"
                          name="MobileNumber"
                          value={newUser.MobileNumber}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-DGXblue focus:border-transparent transition-all duration-200 ${
                            formErrors.MobileNumber
                              ? "border-red-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          placeholder="9876543210"
                          maxLength="10"
                        />
                      </div>
                      {formErrors.MobileNumber && (
                        <p className="mt-2 text-sm text-red-600 text-xs">
                          {formErrors.MobileNumber}
                        </p>
                      )}
                    </div>

                    {/* Category Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="Category"
                          value={newUser.Category}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-DGXblue focus:border-transparent appearance-none transition-all duration-200 ${
                            formErrors.Category
                              ? "border-red-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <option value="">Select Category</option>
                          <option value="Faculty">Faculty</option>
                          <option value="Student">Student</option>
                          <option value="Staff">Staff</option>
                          <option value="Administrator">Administrator</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {formErrors.Category && (
                        <p className="mt-2 text-sm text-red-600 text-xs">
                          {formErrors.Category}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {/* Role Assignment Section - Single Selection Only */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        <span className="flex items-center gap-2">
                          <FaKey className="text-DGXgreen" />
                          Assign Role
                        </span>
                      </h4>
                      <span className="text-xs font-medium bg-DGXgreen/10 text-DGXgreen px-3 py-1 rounded-full">
                        Select One Role Only
                      </span>
                    </div>

                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            Role Selection
                          </p>
                          <p className="text-xs text-blue-700">
                            Select exactly one role for this user. The role
                            determines their access permissions.
                          </p>
                        </div>
                      </div>
                    </div>

                    {loadingRoles ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-DGXblue"></div>
                        <p className="mt-3 text-gray-600">
                          Loading available roles...
                        </p>
                      </div>
                    ) : availableRoles.length > 0 ? (
                      <>
                        {/* Role Selection Cards */}
                        <div className="space-y-3 mb-6">
                          {availableRoles.map((role) => (
                            <div
                              key={role.RoleID}
                              onClick={() =>
                                handleRoleToggleForNewUser(role.RoleID)
                              }
                              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                selectedRoleId === role.RoleID
                                  ? "border-DGXgreen bg-green-50 ring-2 ring-DGXgreen/20"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                      selectedRoleId === role.RoleID
                                        ? "bg-DGXgreen text-white"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {selectedRoleId === role.RoleID ? (
                                      <FaCheck size={20} />
                                    ) : (
                                      <span className="font-bold text-sm">
                                        {role.RoleName.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <h5 className="font-sm text-gray-900">
                                      {role.RoleName}
                                    </h5>
                                  </div>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedRoleId === role.RoleID
                                      ? "border-DGXgreen bg-DGXgreen"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {selectedRoleId === role.RoleID && (
                                    <FaCheck size={10} className="text-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Selected Role Display */}
                        {selectedRoleId && (
                          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-800 mb-2">
                                  Selected Role
                                </p>
                                <div className="flex items-center gap-3">
                                  <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                                    {availableRoles.find(
                                      (r) => r.RoleID === selectedRoleId
                                    )?.RoleName || "Unknown Role"}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedRoleId(null);
                                      if (formErrors.roleId) {
                                        setFormErrors((prev) => ({
                                          ...prev,
                                          roleId: "",
                                        }));
                                      }
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                              <div className="text-green-600">
                                <FaCheck size={20} />
                              </div>
                            </div>
                          </div>
                        )}

                        {formErrors.roleId && (
                          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FaTimes className="text-red-500 flex-shrink-0" />
                              <p className="text-sm text-red-700 font-medium">
                                {formErrors.roleId}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-8 border border-gray-300 rounded-lg bg-gray-50 text-center">
                        <div className="text-gray-400 mb-3">
                          <FaKey size={32} className="mx-auto" />
                        </div>
                        <p className="text-gray-600 font-medium mb-2">
                          No roles available
                        </p>
                        <p className="text-sm text-gray-500">
                          Please add roles first using the "Add Role" button
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </form>

              {/* Footer Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center gap-2"
                >
                  <FaTimes size={14} />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-DGXblue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm flex items-center gap-2"
                >
                  <FaUserCog size={14} />
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddRoleModal
        isOpen={showAddRoleModal}
        onClose={() => setShowAddRoleModal(false)}
        availableRoles={availableRoles}
        onAddRole={fetchAvailableRoles}
        userToken={userToken}
        fetchData={fetchData}
      />
      <ManageUserRolesModal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedUserForRole(null);
        }}
        user={selectedUserForRole}
        availableRoles={availableRoles}
        userToken={userToken}
        fetchData={fetchData}
        onSaveSuccess={handleRoleSaveSuccess}
      />
    </div>
  );
};

export default AdminUsers;

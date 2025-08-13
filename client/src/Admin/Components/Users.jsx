import { useState, useContext, useEffect } from 'react';
import ApiContext from '../../context/ApiContext';
import LoadPage from "../../component/LoadPage";
import Swal from 'sweetalert2';
import { FaTrash, FaSearch, FaTimes } from 'react-icons/fa';

const AdminUsers = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const [newUser, setNewUser] = useState({
    Name: '',
    EmailId: '',
    CollegeName: '',
    Designation: '',
    MobileNumber: '',
    Category: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
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
      'Content-Type': 'application/json',
      'auth-token': userToken,
    };

    try {
      const result = await fetchData(endpoint, method, {}, headers);
      if (result.success) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      } else {
        setError(result.message || 'Failed to fetch user data');
      }
    } catch (error) {
      setError('Failed to fetch user data');
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

    // Remove validation error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will lose all unsaved changes!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.isConfirmed) {
        setNewUser({
          Name: '',
          EmailId: '',
          CollegeName: '',
          Designation: '',
          MobileNumber: '',
          Category: '',
        });
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
    if (!newUser.EmailId || !validateEmail(newUser.EmailId)) errors.EmailId = "Enter a valid email address";
    if (!newUser.CollegeName) errors.CollegeName = "College name is required";
    if (!newUser.Designation) errors.Designation = "Designation is required";
    if (!newUser.MobileNumber || !/^\d{10}$/.test(newUser.MobileNumber)) errors.MobileNumber = "Enter a valid 10-digit mobile number";
    if (!newUser.Category) errors.Category = "Category is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    handleAddUser();
  };

  const handleAddUser = async () => {
    const endpoint = "user/addUser";
    const method = "POST";
    const headers = {
      'Content-Type': 'application/json',
      'auth-token': userToken,
    };
    const body = { ...newUser };

    try {
      const result = await fetchData(endpoint, method, body, headers);
      if (result && result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'User added successfully!',
        });

        await fetchUsers();

        setShowAddUserModal(false);
        setNewUser({
          Name: '',
          EmailId: '',
          CollegeName: '',
          Designation: '',
          MobileNumber: '',
          Category: '',
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Fields can not be Empty!',
          text: result?.message || 'Failed to add user',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to add user',
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'OK'
    });

    if (result.isConfirmed) {
      try {
        const endpoint = "user/deleteUser";
        const method = "POST";
        const headers = {
          'Content-Type': 'application/json',
          'auth-token': userToken,
        };
        const body = { userId };

        const response = await fetchData(endpoint, method, body, headers);

        if (response.success) {
          Swal.fire('Deleted!', 'User has been deleted.', 'success');
          await fetchUsers();
        } else {
          Swal.fire('Error!', response.message || 'Failed to delete user', 'error');
        }
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete user', 'error');
      }
    }
  };

  const renderMobileUserCard = (user, index) => (
    <div key={user.UserID} className="p-4 mb-4 rounded-lg shadow bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{user.Name}</h3>
          <p className="text-sm text-gray-600">{user.EmailId}</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          {user.Category}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-gray-500">College</p>
          <p className="text-sm">{user.CollegeName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Designation</p>
          <p className="text-sm">{user.Designation}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Mobile</p>
          <p className="text-sm">{user.MobileNumber}</p>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => handleDeleteUser(user.UserID)}
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
          title="Delete"
        >
          <FaTrash size={14} />
        </button>
      </div>
    </div>
  );

  if (loading) return <LoadPage />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, college, etc..."
            className="pl-10 pr-4 py-2 border rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FaTimes className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2 bg-DGXblue text-white font-semibold rounded-lg w-full md:w-auto whitespace-nowrap"
        >
          Add User
        </button>
      </div>
      
      {filteredUsers.length > 0 ? (
        isMobileView ? (
          <div className="space-y-3">
            {filteredUsers.map((user, index) => renderMobileUserCard(user, index))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <div className="overflow-auto" style={{ maxHeight: "600px" }}>
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-DGXgreen text-white">
                    <th className="p-2 border text-center w-12">#</th>
                    <th className="p-2 border text-center min-w-[150px]">Name</th>
                    <th className="p-2 border text-center min-w-[200px]">Email</th>
                    <th className="p-2 border text-center min-w-[150px]">College Name</th>
                    <th className="p-2 border text-center min-w-[120px]">Designation</th>
                    <th className="p-2 border text-center min-w-[120px]">Mobile Number</th>
                    <th className="p-2 border text-center min-w-[100px]">Category</th>
                    <th className="p-2 border text-center min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.UserID} className="hover:bg-gray-50">
                      <td className="p-2 border text-center w-12">{index + 1}</td>
                      <td className="p-2 border text-center min-w-[150px]">{user.Name}</td>
                      <td className="p-2 border text-center min-w-[200px]">{user.EmailId}</td>
                      <td className="p-2 border text-center min-w-[150px]">{user.CollegeName}</td>
                      <td className="p-2 border text-center min-w-[120px]">{user.Designation}</td>
                      <td className="p-2 border text-center min-w-[120px]">{user.MobileNumber}</td>
                      <td className="p-2 border text-center min-w-[100px]">{user.Category}</td>
                      <td className="p-2 border text-center min-w-[100px]">
                        <button
                          onClick={() => handleDeleteUser(user.UserID)}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <p className="text-center text-gray-500">
          {searchTerm ? "No users match your search" : "No users found"}
        </p>
      )}

      {/* Modal for adding user */}
      {showAddUserModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Add New User</h3>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="Name"
                  value={newUser.Name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md ${formErrors.Name ? 'border-red-500' : ''}`}
                />
                {formErrors.Name && <p className="text-red-500 text-sm">{formErrors.Name}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="EmailId"
                  value={newUser.EmailId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md ${formErrors.EmailId ? 'border-red-500' : ''}`}
                />
                {formErrors.EmailId && <p className="text-red-500 text-sm">{formErrors.EmailId}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">College Name</label>
                <input
                  type="text"
                  name="CollegeName"
                  value={newUser.CollegeName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md ${formErrors.CollegeName ? 'border-red-500' : ''}`}
                />
                {formErrors.CollegeName && <p className="text-red-500 text-sm">{formErrors.CollegeName}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <input
                  type="text"
                  name="Designation"
                  value={newUser.Designation}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md ${formErrors.Designation ? 'border-red-500' : ''}`}
                />
                {formErrors.Designation && <p className="text-red-500 text-sm">{formErrors.Designation}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  name="MobileNumber"
                  value={newUser.MobileNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md ${formErrors.MobileNumber ? 'border-red-500' : ''}`}
                />
                {formErrors.MobileNumber && <p className="text-red-500 text-sm">{formErrors.MobileNumber}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="Category"
                  value={newUser.Category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-md ${formErrors.Category ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Category</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Student">Student</option>
                </select>
                {formErrors.Category && <p className="text-red-500 text-sm">{formErrors.Category}</p>}
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-DGXblue text-white rounded-md hover:bg-blue-600 transition"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
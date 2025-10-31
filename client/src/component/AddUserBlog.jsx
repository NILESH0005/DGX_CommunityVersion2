import React, { useState, useEffect, useContext } from "react";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { IoMdList } from "react-icons/io";
import BlogForm from "../Admin/Components/BlogComponents/BlogForm.jsx";
import LoadPage from "./LoadPage.jsx";
import ApiContext from "../context/ApiContext";
import BlogModal from "./BlogModal.jsx";
import moment from "moment";
import images from "../../public/images.js";
import Swal from "sweetalert2";

const AddUserBlog = (props) => {
  const [showForm, setShowForm] = useState(false);
  const { fetchData, user, userToken } = useContext(ApiContext);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null); // State for blog being edited

  const stripHtmlTags = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const openModal = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  // Function to handle edit
  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setShowForm(true); // Switch to form view
  };

  // Function to handle delete
  const handleDeleteBlog = async (blog) => {
    let timerInterval;

    const result = await Swal.fire({
      title: `Deleting "${blog.title || "Untitled"}"`,
      html: "Confirming in <b></b> seconds.",
      timer: 3000, // 3 seconds countdown
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector("b");
        timerInterval = setInterval(() => {
          const remaining = Swal.getTimerLeft();
          b.textContent = Math.ceil(remaining / 1000);
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    });

    if (result.dismiss === Swal.DismissReason.timer) {
      try {
        const endpoint = `blog/deleteBlog/${blog.BlogID}`;
        const method = "POST"; // because backend route uses POST
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };

        const res = await fetchData(endpoint, method, {}, headers);

        if (res.success) {
          setBlogs((prev) => prev.filter((b) => b.BlogID !== blog.BlogID));
          Swal.fire("Deleted!", "Blog has been deleted.", "success");
        } else {
          Swal.fire("Error!", res.message || "Failed to delete blog.", "error");
        }
      } catch (error) {
        console.error("Error deleting blog:", error);
        Swal.fire("Error!", "Failed to delete blog.", "error");
      }
    }
  };

  // Function to handle form submission success
  const handleFormSuccess = (newBlog, isEdit = false) => {
    if (isEdit) {
      // Update the existing blog
      setBlogs((prev) =>
        prev.map((blog) => (blog.BlogID === newBlog.BlogID ? newBlog : blog))
      );
      if (props.setBlogs) {
        props.setBlogs((prev) =>
          prev.map((blog) => (blog.BlogID === newBlog.BlogID ? newBlog : blog))
        );
      }
    } else {
      // Add new blog
      setBlogs((prev) => [newBlog, ...prev]);
      if (props.setBlogs) {
        props.setBlogs((prev) => [newBlog, ...prev]);
      }
    }
    setEditingBlog(null);
    setShowForm(false);
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingBlog(null);
    setShowForm(false);
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      const endpoint = "blog/getUserBlogs";
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };
      try {
        const result = await fetchData(endpoint, method, {}, headers);
        console.log("API Response:", result);

        if (result?.success && result?.data?.blogs) {
          const userBlogs = result.data.blogs
            .filter((blog) => blog.UserID === user?.UserID)
            .map((blog) => ({
              ...blog,
              isDraft: Boolean(blog.isDraft), // 👈 Convert to true/false
            }));
          setBlogs(userBlogs);
          if (props.setBlogs) {
            props.setBlogs(userBlogs);
          }
        } else {
          console.error("Invalid data format:", result);
          setBlogs([]);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [fetchData, user?.UserID, userToken]);

  if (loading) {
    return <LoadPage />;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-center mb-8">
        <button
          onClick={() => {
            setEditingBlog(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-3 bg-DGXblue from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg font-semibold hover:scale-105"
        >
          {showForm ? "My Blogs" : "Add Blog"}
          {showForm ? (
            <IoMdList className="size-6" />
          ) : (
            <MdAdd className="size-6" />
          )}
        </button>
      </div>

      {showForm ? (
        <BlogForm
          setBlogs={setBlogs}
          editingBlog={editingBlog} // Pass the blog to edit
          onSuccess={handleFormSuccess}
          onCancel={handleCancelEdit}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div
                key={blog.BlogID}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full relative"
              >
                {/* Draft Badge */}
                {blog.isDraft && (
                  <div className="absolute top-3 left-3 z-10">
                    {/* <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Draft
                    </span> */}
                  </div>
                )}

                {/* Action Buttons */}
                {(blog.isDraft || blog.Status === "Pending") && (
                  <div className="absolute top-3 right-3 z-10 flex gap-1">
                    <button
                      onClick={() => handleEditBlog(blog)}
                      className="bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors"
                      title="Edit Blog"
                    >
                      <MdEdit className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog)}
                      className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                      title="Delete Blog"
                    >
                      <MdDelete className="size-4" />
                    </button>
                  </div>
                )}

                {/* Image Section */}
                <div className="w-full h-48 bg-gray-100 overflow-hidden">
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title || "Blog Image"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={images.Noimage}
                      alt="No Image Available"
                      className="w-full h-full object-contain p-4 opacity-80"
                    />
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {blog.title || "Untitled"}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">
                    {stripHtmlTags(blog.content) || "No description available"}
                  </p>

                  <div className="text-xs text-gray-500 mb-3">
                    {blog.isDraft ? "Last updated: " : "Published: "}
                    {blog.AddOnDt
                      ? moment(blog.AddOnDt, "YYYY-MM-DD HH:mm:ss").format(
                          "MMMM D, YYYY"
                        )
                      : "No date available"}
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        blog.isDraft
                          ? "bg-yellow-100 text-yellow-800"
                          : user?.isAdmin === 1
                          ? "bg-green-100 text-green-800"
                          : blog.Status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : blog.Status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {blog.isDraft
                        ? "Draft"
                        : user?.isAdmin === 1
                        ? "Approved"
                        : blog.Status}
                    </span>
                  </div>

                  {/* Admin Remarks (if rejected) */}
                  {blog.Status === "Rejected" && blog.AdminRemark && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-md border border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-1">
                        Admin Remark:
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {blog.AdminRemark}
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => openModal(blog)}
                    className="w-full bg-DGXblue hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 mt-auto"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center py-12">
              <p className="text-gray-500 text-lg font-medium">
                {loading ? "Loading..." : "No blogs found."}
              </p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <BlogModal
          blog={selectedBlog}
          closeModal={closeModal}
          updateBlogState={(blogId, status) => {
            if (status === "delete") {
              setBlogs((prevBlogs) =>
                prevBlogs.filter((blog) => blog.BlogID !== blogId)
              );
            } else {
              setBlogs((prevBlogs) =>
                prevBlogs.map((blog) =>
                  blog.BlogID === blogId ? { ...blog, Status: status } : blog
                )
              );
            }
          }}
        />
      )}
    </div>
  );
};

export default AddUserBlog;

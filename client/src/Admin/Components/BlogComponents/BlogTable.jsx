import React, { useState, useContext, useEffect } from "react";
import BlogModal from "../../../component/BlogModal";
import moment from "moment";
import ApiContext from "../../../context/ApiContext";
import {
  FaEye,
  FaSearch,
  FaFilter,
  FaTimes,
  FaCalendarAlt,
  FaUser,
  FaTag,
} from "react-icons/fa";

const BlogTable = ({ blogs, userToken, defaultFilter }) => {
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(defaultFilter || "");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [blogData, setBlogData] = useState(blogs);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(ApiContext);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
    setBlogData(blogs);
  }, [blogs]);

  const updateBlogState = (blogId, newStatus) => {
    if (newStatus === "delete") {
      setBlogData((prevBlogs) =>
        prevBlogs.filter((blog) => blog.BlogID !== blogId)
      );
    } else {
      setBlogData((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.BlogID === blogId ? { ...blog, Status: newStatus } : blog
        )
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const openModal = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  const filteredBlogs = blogData.filter((blog) => {
    const matchesStatus =
      statusFilter === "" ||
      blog.Status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory =
      categoryFilter === "" ||
      blog.category?.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.UserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.Status?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const renderMobileBlogCard = (blog, index) => (
    <div
      key={blog.BlogID}
      className="p-5 mb-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{blog.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <FaTag size={12} />
            <span>{blog.category}</span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
            blog.Status
          )}`}
        >
          {blog.Status || "Pending"}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <FaUser className="text-gray-400" size={12} />
          <span className="text-sm text-gray-700">
            {blog.User?.Name || blog.UserName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-gray-400" size={12} />
          <span className="text-sm text-gray-700">
            {moment
              .utc(blog.publishedDate || blog.AddOnDt)
              .format("MMMM D, YYYY")}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          onClick={() => openModal(blog)}
          className="flex items-center gap-2 px-4 py-2 bg-DGXblue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
        >
          <FaEye size={14} />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="mt-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Blog Management
          </h2>
          <p className="text-gray-600 text-sm">
            Total Blogs:{" "}
            <span className="font-semibold">{blogData.length}</span>
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search blogs by title, category, author, or status..."
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

        {/* Filters */}
        {isMobileView ? (
          <>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 font-medium w-full"
            >
              <FaFilter />
              <span>Filters</span>
            </button>

            {showFilters && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Filter
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <select
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Blogs Table/Cards */}
      {filteredBlogs.length > 0 ? (
        isMobileView ? (
          <div className="space-y-4">
            {filteredBlogs.map((blog, index) =>
              renderMobileBlogCard(blog, index)
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <div
              className="overflow-auto"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              <div className="min-w-full">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-DGXgreen">
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 sticky left-0 z-20">
                        #
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 min-w-[200px]">
                        Title
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Category
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Author
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Published Date
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Status
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBlogs.map((blog, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="p-4 text-sm text-gray-600 font-medium sticky left-0 bg-white z-10">
                          {index + 1}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-bold text-gray-900">
                            {blog.title}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaTag className="text-gray-400" size={12} />
                            <span className="text-sm text-gray-700">
                              {blog.category}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-gray-400" size={12} />
                            <span className="text-sm text-gray-700">
                              {blog.User?.Name || blog.UserName}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt
                              className="text-gray-400"
                              size={12}
                            />
                            <span className="text-sm text-gray-700">
                              {moment.utc(blog.AddOnDt).format("MMM D, YYYY")}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusClass(
                              blog.Status
                            )}`}
                          >
                            {blog.Status || "Pending"}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            className="flex items-center gap-2 px-4 py-2 bg-DGXblue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm shadow-sm"
                            onClick={() => openModal(blog)}
                          >
                            <FaEye size={14} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-3">
            <FaSearch size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            {searchTerm || statusFilter || categoryFilter
              ? "No blogs match your search/filters"
              : "No blogs found"}
          </p>
          {(searchTerm || statusFilter || categoryFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setCategoryFilter("");
              }}
              className="text-DGXblue hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {isModalOpen && selectedBlog && (
        <BlogModal
          blog={selectedBlog}
          closeModal={closeModal}
          updateBlogState={updateBlogState}
          userToken={userToken}
        />
      )}
    </div>
  );
};

export default BlogTable;

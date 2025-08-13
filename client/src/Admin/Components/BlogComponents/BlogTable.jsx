import React, { useState, useContext, useEffect } from 'react';
import BlogModal from '../../../component/BlogModal';
import moment from 'moment';
import ApiContext from '../../../context/ApiContext';
import { FaEye, FaSearch, FaFilter } from 'react-icons/fa';

const BlogTable = ({ blogs, userToken }) => {
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
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
    window.addEventListener('resize', checkMobileView);
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

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
        return "bg-green-200 text-green-800"; 
      case "Rejected":
        return "bg-red-200 text-red-800"; 
      case "Pending":
        return "bg-yellow-200 text-yellow-800"; 
      default:
        return "bg-gray-200 text-gray-800";
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
    const matchesStatus = statusFilter === "" || blog.Status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === "" || blog.category?.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.UserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.Status?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const renderMobileBlogCard = (blog, index) => (
    <div
      key={blog.BlogID}
      className={`p-4 mb-4 rounded-lg shadow ${getStatusClass(blog.Status)}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{blog.title}</h3>
          <p className="text-sm text-gray-600">Category: {blog.category}</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-semibold">
          {blog.Status || "Pending"}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-gray-500">Author</p>
          <p className="text-sm">{blog.UserName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Published</p>
          <p className="text-sm">{moment.utc(blog.publishedDate).format("MMMM D, YYYY")}</p>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => openModal(blog)}
          className="bg-DGXblue text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm flex items-center gap-1"
        >
          <FaEye size={12} />
          <span>View</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search blogs..."
            className="pl-10 p-2 border rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isMobileView ? (
          <>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
            >
              <FaFilter />
              <span>Filters</span>
            </button>

            {showFilters && (
              <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg">
                <select
                  className="border px-3 py-2 rounded-lg"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {/* <input
                  type="text"
                  placeholder="Filter by category..."
                  className="border px-3 py-2 rounded-lg"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                /> */}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="border px-3 py-2 rounded-lg flex-grow sm:flex-grow-0"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* <input
              type="text"
              placeholder="Filter by category..."
              className="border px-3 py-2 rounded-lg flex-grow"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            /> */}
          </div>
        )}
      </div>

      {filteredBlogs.length > 0 ? (
        isMobileView ? (
          <div className="space-y-3">
            {filteredBlogs.map((blog, index) =>
              renderMobileBlogCard(blog, index)
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <div className="overflow-auto" style={{ maxHeight: "600px" }}>
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-DGXgreen text-white">
                    <th className="p-2 border text-center w-12">#</th>
                    <th className="p-2 border text-center min-w-[150px]">Title</th>
                    <th className="p-2 border text-center min-w-[120px]">Category</th>
                    <th className="p-2 border text-center min-w-[150px]">Name</th>
                    <th className="p-2 border text-center min-w-[180px]">Published Date</th>
                    <th className="p-2 border text-center min-w-[120px]">Status</th>
                    <th className="p-2 border text-center min-w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map((blog, index) => (
                    <tr key={index} className={`hover:bg-gray-50 ${getStatusClass(blog.Status)}`}>
                      <td className="p-2 border text-center w-12">{index + 1}</td>
                      <td className="p-2 border text-center min-w-[150px]">{blog.title}</td>
                      <td className="p-2 border text-center min-w-[120px]">{blog.category}</td>
                      <td className="p-2 border text-center min-w-[150px]">{blog.UserName}</td>
                      <td className="p-2 border text-center min-w-[180px]">
                        {moment.utc(blog.AddOnDt).format("MMMM D, YYYY ")}
                      </td>
                      <td className="p-2 border text-center min-w-[120px]">
                        {blog.Status || "Pending"}
                      </td>
                      <td className="p-2 border text-center min-w-[120px]">
                        <button
                          className="bg-DGXblue text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition flex items-center justify-center gap-1 mx-auto"
                          onClick={() => openModal(blog)}
                        >
                          <FaEye size={12} />
                          <span>View</span>
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
        <p className="text-center text-gray-500 py-4">
          {searchTerm || statusFilter || categoryFilter 
            ? "No blogs match your search/filters" 
            : "No blogs found"}
        </p>
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
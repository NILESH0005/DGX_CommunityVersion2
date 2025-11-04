import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiContext from "../context/ApiContext";
import Swal from "sweetalert2";
import PublicBlogModal from "../container/PublicBlogModal";
import { motion } from "framer-motion";

const PublicBlogPage = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { fetchData, userToken } = useContext(ApiContext);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const endpoint = `blog/getBlogById/${blogId}`;
        const method = "GET";
        const headers = { "Content-Type": "application/json" };

        const result = await fetchData(endpoint, method, {}, headers);
        
        if (result.success && result.data) {
          setBlog(result.data);
        } else {
          Swal.fire("Error", "Blog not found", "error").then(() => {
            navigate("/Blog");
          });
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        Swal.fire("Error", "Failed to load blog", "error").then(() => {
          navigate("/Blog");
        });
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId, fetchData, navigate]);

  const closeModal = () => {
    navigate("/Blog");
  };

  const refreshBlogs = () => {
    // This can be empty or you can implement refresh logic if needed
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-block rounded-full h-12 w-12 border-t-2 border-b-2 border-DGXblue animate-spin" />
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </motion.div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Blog not found</h2>
          <button
            onClick={() => navigate("/Blog")}
            className="mt-4 px-6 py-2 bg-DGXblue text-white rounded-lg hover:bg-DGXgreen transition-colors"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicBlogModal
        blog={blog}
        closeModal={closeModal}
        refreshBlogs={refreshBlogs}
      />
    </div>
  );
};

export default PublicBlogPage;
import React, { useState, useEffect, useContext } from 'react';
import BlogForm from './BlogComponents/BlogForm';
import BlogTable from './BlogComponents/BlogTable';
import ApiContext from '../../context/ApiContext';
import { ToastContainer, toast } from 'react-toastify';

const BlogManager = (props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);
  const [isTableView, setIsTableView] = useState(true);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchData(
        'blog/getBlog',
        'POST',
        {},
        { 
          'Content-Type': 'application/json',
          'auth-token': userToken 
        }
      );

      if (result.success) {
        props.setBlogs(result.data || []);
      } else {
        setError(result.message || 'Failed to fetch blogs');
        toast.error(result.message || 'Failed to fetch blogs');
      }
    } catch (err) {
      setError('Failed to fetch blogs. Please try again later.');
      toast.error('Failed to fetch blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const updateBlogs = (newBlog) => {
    props.setBlogs(prev => [newBlog, ...prev]);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
        <button 
          onClick={fetchBlogs}
          className="ml-4 bg-DGXblue text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Blog Manager</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => setIsTableView(!isTableView)}
          className="bg-DGXblue text-white px-4 py-2 rounded-lg hover:bg-DGXgreen transition-colors"
        >
          {isTableView ? 'Add New Blog' : 'View All Blogs'}
        </button>
        
        {isTableView && (
          <button 
            onClick={fetchBlogs}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {isTableView ? (
        props.blogs.length > 0 ? (
          <BlogTable blogs={props.blogs} refreshBlogs={fetchBlogs} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No blogs found</p>
            <button
              onClick={() => setIsTableView(false)}
              className="mt-4 bg-DGXblue text-white px-4 py-2 rounded-lg"
            >
              Create Your First Blog
            </button>
          </div>
        )
      ) : (
        <BlogForm 
          updateBlogs={updateBlogs} 
          setBlogs={props.setBlogs} 
          setIsTableView={setIsTableView} 
          refreshBlogs={fetchBlogs}
        />
      )}
    </div>
  );
};

export default BlogManager;
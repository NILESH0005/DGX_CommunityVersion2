import React, { useContext, useEffect, useState } from "react";
import { TbUserSquareRounded, TbClock, TbSearch } from "react-icons/tb";
import BlogImage from "../component/BlogImage";
import ApiContext from "../context/ApiContext";
import PublicBlogModal from "./PublicBlogModal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronDown, ArrowRight } from 'lucide-react';

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-DGXblue/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0),
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  )
}

const BlogPage = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const { scrollYProgress } = useScroll();
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const [mounted, setMounted] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pageSize, setPageSize] = useState(6);
  const [showAll, setShowAll] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCategories = async () => {
    try {
      const endpoint = "dropdown/getDropdownValues?category=blogCategory";
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const data = await fetchData(endpoint, method, headers);
      if (data.success) {
        const sortedCategories = data.data.sort((a, b) =>
          a.ddValue.localeCompare(b.ddValue)
        );
        setCategories(sortedCategories);
      } else {
        Swal.fire("Error", "Failed to fetch categories.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error fetching categories.", "error");
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);

        let endpoint = "blog/getPublicBlogs";
        let method = "GET";
        let headers = { 'Content-Type': 'application/json' };

        const result = await fetchData(endpoint, method, {}, headers);
        if (result && result.data) {
          setBlogs(result.data);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
    fetchCategories();
  }, [fetchData, userToken]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setPageSize(6);
    setShowAll(false);
  };

  const openModal = (blog) => {
    if (!userToken) {
      Swal.fire({
        title: 'Login Required',
        text: 'You need to login to view this blog',
        icon: 'info',
        confirmButtonText: 'Go to Login',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/SignInn');
        }
      });
      return;
    }

    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  const BlogCard = ({ blog, index }) => {
    if (!blog) return null;

    const { title, image, AuthAdd, AddOnDt, publishedDate, category, readTime } = blog;
    const fallbackImage = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";

    return (
      <motion.div
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col"
        onClick={() => openModal(blog)}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="relative h-48 w-full overflow-hidden">
          <motion.img
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            src={image || fallbackImage}
            alt={title}
            onError={(e) => e.target.src = fallbackImage}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          {category && (
            <motion.span 
              className="absolute top-3 left-3 bg-white text-DGXblue px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {category}
            </motion.span>
          )}
        </div>

        <div className="p-5 flex-grow flex flex-col">
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <span>{new Date(AddOnDt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            {readTime && (
              <>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <TbClock className="mr-1" size={14} />
                  {readTime} min read
                </span>
              </>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
            {title}
          </h3>

          <div className="mt-auto flex items-center gap-3">
            <motion.div 
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <TbUserSquareRounded className="text-gray-700" size={18} />
            </motion.div>
            <span className="text-sm text-gray-600">{AuthAdd || 'Unknown author'}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const filteredBlogs = blogs.filter(blog =>
    (!selectedCategory || blog.category === selectedCategory) &&
    (!searchQuery || blog.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section */}
      <motion.section 
        style={{ y: headerY }}
        className="relative bg-gradient-to-r from-DGXblue to-DGXgreen py-20 px-4 sm:px-6 lg:px-8 text-center text-white"
      >
        <ParticleBackground />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              DGX Blog
              <span className="block text-green-300">Knowledge Hub</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Insights, stories and innovations from our community
            </p>
          </motion.div>
        </div>
        
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/2 w-full h-full border border-white/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full border border-white/10 rounded-full"
          />
        </div>
      </motion.section>

      {/* Search and Filter Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative max-w-2xl mx-auto mb-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <TbSearch className="text-gray-400" size={20} />
              </motion.div>
              <motion.input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-DGXblue focus:border-transparent transition-all"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              />
            </div>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory
                  ? 'bg-DGXgreen text-black shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                onClick={() => handleCategorySelect(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                All
              </motion.button>

              {categories.map((category) => (
                <motion.button
                  key={category.ddId || category.ddValue}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.ddValue
                    ? 'bg-DGXgreen text-black shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  onClick={() => handleCategorySelect(category.ddValue)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.1 * categories.indexOf(category) }}
                >
                  {category.ddValue}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {loading ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div 
                className="inline-block rounded-full h-12 w-12 border-t-2 border-b-2 border-DGXblue"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <p className="mt-4 text-gray-600">Loading articles...</p>
            </motion.div>
          ) : filteredBlogs.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {blogs.length === 0
                  ? 'No articles available yet'
                  : 'No articles match your search'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {blogs.length === 0
                  ? 'Check back later for new content.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
              >
                {filteredBlogs.slice(0, pageSize).map((blog, index) => (
                  <BlogCard key={blog.BlogID} blog={blog} index={index} />
                ))}
              </motion.div>

              {!showAll && filteredBlogs.length > pageSize && (
                <motion.div 
                  className="mt-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    onClick={() => {
                      if (pageSize + 6 >= filteredBlogs.length) {
                        setShowAll(true);
                      }
                      setPageSize(prev => prev + 6);
                    }}
                    className="px-8 py-3 bg-DGXblue text-white rounded-lg hover:bg-DGXgreen transition-colors shadow-md hover:shadow-lg font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Show More Blogs
                    <ArrowRight className="w-4 h-4 ml-2 inline" />
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-DGXblue to-DGXgreen text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Want to contribute your own article?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Share your knowledge and insights with our growing community of AI enthusiasts.
            </p>
            <motion.button
              className="bg-white text-DGXblue hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create-blog')}
            >
              Write a Blog Post
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Blog Modal - Only show if user is logged in */}
      <AnimatePresence>
        {isModalOpen && selectedBlog && userToken && (
          <PublicBlogModal blog={selectedBlog} closeModal={closeModal} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogPage;
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const BlogDetail = ({ blogs }) => {
    console.log("this is blogg", blogs)
    const { pageId } = useParams();
    const navigate = useNavigate();
    
    const blog = blogs.find(blog => blog.BlogID === parseInt(pageId));
    
    if (!blog) {
        return <div className="text-center py-12">Blog not found</div>;
    }

    const formattedDate = new Date(blog.publishedDate).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="bg-white min-h-screen">
            {/* Header Navigation */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">MINIMAL BLOG</h1>
                    <nav className="flex space-x-6">
                        <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900">Home</button>
                        <button className="text-gray-600 hover:text-gray-900">Categories</button>
                        <button className="text-gray-600 hover:text-gray-900">About</button>
                    </nav>
                </div>
            </header>

            {/* Blog Title Section */}
            <div className="bg-white py-8 border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{blog.title}</h1>
                    <div className="flex flex-wrap items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center">
                            <i className="fas fa-user-circle mr-2"></i>
                            {blog.AuthAdd}
                        </div>
                        <div className="flex items-center">
                            <i className="fas fa-clock mr-2"></i>
                            {formattedDate}
                        </div>
                        <div className="flex items-center">
                            <i className="fas fa-tag mr-2"></i>
                            {blog.category}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Main Content */}
                    <div className="w-full lg:w-2/3">
                        {/* Large Image */}
                        <div className="mb-8">
                            <div className="img-container rounded-lg overflow-hidden">
                                <img src={blog.image} alt={blog.title} className="w-full h-auto object-cover" />
                            </div>
                        </div>
                        
                        {/* Text Content */}
                        <div className="prose max-w-none mb-8">
                            <p className="text-lg">
                                {blog.content}
                            </p>
                            <p className="text-lg">
                                Ignorant branched humanity led now marianne too. Necessary ye contented newspaper zealously breakfast he prevailed. Melancholy middletons yet understood decisively boy law she. Answer him easily are its barton little. Oh no though mother be things simple itself.
                            </p>
                            <p className="text-lg">
                                Oh be me, sure wise sons, no. Piqued ye of am spirit regret. Stimulated discretion impossible admiration in particular conviction up. Fond his say old meet cold find come whom. The sir park sake bred. Advice me cousin an spring of needed. Tell use paid law ever yet new. Fond his say old meet cold find come whom. The sir park sake bred. Advice me cousin an spring of needed. Tell use paid law ever yet new.
                            </p>
                            <p className="text-lg">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent euismod, nisl eget fermentum tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Cras mattis consectetur purus sit amet fermentum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                            </p>
                        </div>
                        
                        {/* Author Bio */}
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-100">
                            <div className="flex items-center">
                                <img src={`https://i.pravatar.cc/150?img=${blog.BlogID}`} alt={blog.author} className="w-16 h-16 rounded-full mr-4" />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{blog.author}</h3>
                                    <p className="text-gray-600 text-sm">Writer & Researcher</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Back Button */}
                        <div className="mb-8">
                            <button 
                                onClick={() => navigate(-1)}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition duration-200 flex items-center"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Articles
                            </button>
                        </div>
                    </div>
                    
                    {/* Right Column - Related Blogs */}
                    <div className="w-full lg:w-1/3">
                        {/* First Related Blog */}
                        <div 
                            className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(`/details/${blog.BlogID + 1 <= blogs.length ? blog.BlogID + 1 : 1}`)}
                        >
                            <div className="flex items-start">
                                <div className="w-1/3">
                                    <img src={blog.additionalImages[0]} alt="Related post" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-2/3 p-4">
                                    <span className="text-xs text-gray-600 uppercase mb-1 block">related blogs</span>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">Heading 1</h3>
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent euismod, nisl eget fermentum tincidunt.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Second Related Blog */}
                        <div 
                            className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(`/details/${blog.BlogID + 2 <= blogs.length ? blog.BlogID + 2 : 2}`)}
                        >
                            <div className="flex items-start">
                                <div className="w-1/3">
                                    <img src={blog.additionalImages[1]} alt="Related post" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-2/3 p-4">
                                    <span className="text-xs text-gray-600 uppercase mb-1 block">related</span>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">Heading 1</h3>
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent euismod, nisl eget fermentum tincidunt.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
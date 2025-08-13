import React, { useEffect, useState } from "react";
import { images } from '../../public';
import { motion } from "framer-motion";

const BlogImage = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const imageS = [
        images.bg1,
        images.bg2,
        images.bg3,
    ];

    // Automatic image rotation
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageS.length);
    //     }, 5000); // Rotate every 5 seconds
    //     return () => clearInterval(interval);
    // }, [imageS.length]);

    return (
        <div
            className="relative bg-gradient-to-r from-DGXblue to-DGXgreen py-20 px-4 sm:px-6 lg:px-8 text-center text-DGXgreen"
            style={{ 
                backgroundImage: `url(${imageS[currentImageIndex]})`, 
                backgroundSize: "cover", 
                backgroundPosition: "center", 
                transition: "background-image 1s ease-in-out" 
            }}
        >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative z-10">
                <motion.h1 
                    className="text-3xl md:text-5xl lg:text-7xl font-bold leading-snug mb-5"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 10 }}
                >
                    Welcome to Our Blog
                </motion.h1>
                
                <motion.p 
                    className="text-gray-100 lg:w-3/5 mx-auto mb-5 text-sm md:text-base"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
                >
                    Start your blog today and join a community of writers and readers who are passionate about
                    sharing their stories and ideas. 
                </motion.p>
            </div>
        </div>
    );
};

export default BlogImage;
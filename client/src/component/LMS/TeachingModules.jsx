import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export const TeachingModules = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Example data for modules with thumbnails
  const modules = [
    {
      id: 1,
      title: "NVIDIA Introductory Material",
      description: "Learn the basics of NVIDIA technologies and tools.",
      progress: 20,
      thumbnail: "NVIDIA_Introductory_Material.png",
    },
    {
      id: 2,
      title: "Industrial-Metaverse-Teaching-Kit",
      description: "Explore the industrial applications of the metaverse.",
      progress: 40,
      thumbnail: "Industrial_meta.png",
    },
    {
      id: 3,
      title: "Generative-AI-Teaching-Kit",
      description: "Dive into generative AI models and their applications.",
      progress: 60,
      thumbnail: "Generative-AI-Teaching-Kit.png",
    },
    {
      id: 4,
      title: "Edge-AI-and-Robotics-Teaching-Kit",
      description: "Learn about AI at the edge and robotics integration.",
      progress: 80,
      thumbnail: "Edge-AI-and-Robotics-Teaching-Kit.png",
    },
    {
      id: 5,
      title: "Deep Learning Teaching Kit",
      description: "Master deep learning concepts and frameworks.",
      progress: 100,
      thumbnail: "Deep Learning Teaching Kit.jpeg",
    },
  ];

  // Handle card click
  const handleCardClick = (title) => {
    const routes = {
      "Deep Learning Teaching Kit": "/deep-learning-kit",
      "Edge-AI-and-Robotics-Teaching-Kit": "/edge-ai-robotics-kit",
      "Generative-AI-Teaching-Kit": "/generative-ai-kit",
      "Industrial-Metaverse-Teaching-Kit": "/industrial-metaverse-kit",
      "NVIDIA Introductory Material": "/nvidia-intro",
    };

    const route = routes[title];
    if (route) {
      navigate(route);
    } else {
      console.warn(`No route defined for module: ${title}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold">
            Welcome to the Teaching Modules
          </h1>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="space-y-8">
            {/* Title and Description */}
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">
                Teaching Modules Platform
              </h1>
              <p className="text-gray-600">
                Explore our interactive learning modules
              </p>
            </div>

            {/* Grid of Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {modules.map((module) => (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white p-6 rounded-lg shadow-lg cursor-pointer transition-transform duration-200"
                  onClick={() => handleCardClick(module.title)} // Pass the title to handleCardClick
                >
                  <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <img
                      src={module.thumbnail}
                      alt={module.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {module.description}
                  </p>
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeachingModules;

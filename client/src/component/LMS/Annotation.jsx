import React from 'react'
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const Annotation = () => {
  const navigate = useNavigate();

  const models = [
    {
      id: 1,
      title: "AWS SageMaker",
      description: "Cloud-powered labeling with built-in workforce management and auto-labeling (Active Learning).",
      progress: 70,
      thumbnail: "AWS Sagemaker.avif",
    },
    {
      id: 2,
      title: "CVAT",
      description: "Open-source, web-based tool for efficient image/video annotation with AI-assisted labeling.",
      progress: 65,
      thumbnail: "cvat2.avif",
    },
    {
      id: 3,
      title: "LabelImg",
      description: "Fast, offline bounding-box annotation tool with PascalVOC/YOLO export.",
      progress: 65,
      thumbnail: "labelimg.avif",
    },
    {
      id: 4,
      title: "VOTT(Visual Object Tagging Tool)",
      description: "Microsoft’s lightweight tool for building computer vision datasets with export to popular formats.",
      progress: 65,
      thumbnail: "vott.avif",
    },
    {
      id: 5,
      title: "LabelMe",
      description: "MIT’s web-based tool for polygon/RGB-D annotation with crowdsourcing support.",
      progress: 65,
      thumbnail: "labelme.avif",
    },
    {
      id: 6,
      title: "VGG",
      description: "Simple, offline annotation tool from Oxford’s VGG group for polygons and keypoints.",
      progress: 65,
      thumbnail: "VGG.jpg",
    }
    
  ];

  const handleCardClick = (title) => {
    const routes = {
      "AWS SageMaker": "/Annsage",
      "CVAT": "/Anncvat",
      "VOTT(Visual Object Tagging Tool)": "/Annvtt",
      "LabelMe": "/annlme",
      "VGG":"/annvgg",
      "LabelImg":"/annlimg",
    };

    const route = routes[title];
    if (route) {
      navigate(route);
    } else {
      console.warn(`No route defined for model: ${title}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold">
          Annotation Tools & Dataset Creation
          </h1>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">
              Annotation Tools & Dataset Creation
              </h1>
              <p className="text-gray-600">
               
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {models.map((model) => (
                <motion.div
                  key={model.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white p-6 rounded-lg shadow-lg cursor-pointer transition-transform duration-200"
                  onClick={() => handleCardClick(model.title)} 
                >
                  <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <img
                      src={model.thumbnail}
                      alt={model.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{model.title}</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {model.description}
                  </p>
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{model.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${model.progress}%` }}
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

export default Annotation;
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 

export const DatasetModules = () => {
  const navigate = useNavigate(); 

  
  const datasets = [
    {
      id: 1,
      title: "MNIST",
      description: "Explore the classic MNIST dataset for handwritten digit recognition.",
      progress: 20,
      thumbnail: "MNIST.jpg",
    },
    {
      id: 2,
      title: "Make-Blobs",
      description: "Synthetic dataset for clustering and classification tasks.",
      progress: 40,
      thumbnail: "Make-Blobs.jpg",
    },
    {
      id: 3,
      title: "IRIS",
      description: "Famous dataset for classification tasks with flower species.",
      progress: 60,
      thumbnail: "IRIS.jpg",
    },
    {
      id: 4,
      title: "Image Classification CNN (Cat-Dog)",
      description: "Binary image classification using CNN on cat and dog images.",
      progress: 80,
      thumbnail: "Image_Classification.jpg",
    },
    {
      id: 5,
      title: "Human Evolution Vid Dataset",
      description: "Dataset for analyzing human evolution through video data.",
      progress: 50,
      thumbnail: "Evolution-of-human-beings-scaled.jpg",
    },
    {
      id: 6,
      title: "House Prediction",
      description: "Predict house prices using regression techniques.",
      progress: 70,
      thumbnail: "House-Price-Prediction-Using-Machine-Learning.jpg",
    },
    {
      id: 7,
      title: "CIFAR-10",
      description: "Dataset for image classification with 10 classes.",
      progress: 90,
      thumbnail: "cifar.png",
    },
  ];

 
  const handleCardClick = (title) => {
    const routes = {
      "MNIST": "/mnist-dataset",
      "Make-Blobs": "/makeblobs",
      "IRIS": "/iris",
      "Image Classification CNN (Cat-Dog)": "/imageclass",
      "Human Evolution Vid Dataset": "/humanevol",
      "House Prediction": "/housepred",
      "CIFAR-10": "/cifar",
    };

    const route = routes[title];
    if (route) {
      navigate(route);
    } else {
      console.warn(`No route defined for dataset: ${title}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
     
      <div className="flex-1 flex flex-col">
       
        <header className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold">
            Welcome to the Dataset Modules
          </h1>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">
                Dataset Modules Platform
              </h1>
              <p className="text-gray-600">
                Explore our interactive dataset modules
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {datasets.map((dataset) => (
                <motion.div
                  key={dataset.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white p-6 rounded-lg shadow-lg cursor-pointer transition-transform duration-200"
                  onClick={() => handleCardClick(dataset.title)} 
                >
                  <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <img
                      src={dataset.thumbnail}
                      alt={dataset.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{dataset.title}</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {dataset.description}
                  </p>
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{dataset.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${dataset.progress}%` }}
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

export default DatasetModules;
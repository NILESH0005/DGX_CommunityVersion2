import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const AlgorithmsModules = () => {
  const navigate = useNavigate();

  const algorithms = [
    {
      id: 1,
      title: "DeepSpeech",
      description: "Mozilla's open-source automatic speech recognition (ASR) engine.",
      progress: 35,
      thumbnail: "https://miro.medium.com/v2/resize:fit:1200/1*_41QvPVqBOiaU1iknQk1MQ.png",
    },
    {
      id: 2,
      title: "DETR",
      description: "DEtection TRansformer: End-to-end object detection with transformers.",
      progress: 45,
      thumbnail: "https://production-media.paperswithcode.com/methods/Screen_Shot_2020-05-27_at_2.17.38_PM.png",
    },
    {
      id: 3,
      title: "LSTM",
      description: "Long Short-Term Memory networks for sequence modeling and prediction.",
      progress: 65,
      thumbnail: "https://miro.medium.com/v2/resize:fit:1400/1*goJVQs-p9kgLODFNyhl9zA.png",
    },
    {
      id: 4,
      title: "Resnet50",
      description: "50-layer deep convolutional neural network for image classification.",
      progress: 75,
      thumbnail: "https://production-media.paperswithcode.com/methods/resnet-1.png",
    }
  ];

  const handleCardClick = (title) => {
    const routes = {
      "DeepSpeech": "/deepspeech-algorithm",
      "DETR": "/detr-algorithm",
      "LSTM": "/lstm-algorithm",
      "Resnet50": "/resnet50-algorithm"
    };

    const route = routes[title];
    if (route) {
      navigate(route);
    } else {
      console.warn(`No route defined for algorithm: ${title}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold">
            Welcome to the Algorithm Modules
          </h1>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">
                Algorithm Modules Platform
              </h1>
              <p className="text-gray-600">
                Explore our interactive machine learning algorithm modules
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {algorithms.map((algorithm) => (
                <motion.div
                  key={algorithm.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white p-6 rounded-lg shadow-lg cursor-pointer transition-transform duration-200"
                  onClick={() => handleCardClick(algorithm.title)} 
                >
                  <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <img
                      src={algorithm.thumbnail}
                      alt={algorithm.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{algorithm.title}</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {algorithm.description}
                  </p>
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{algorithm.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${algorithm.progress}%` }}
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

export default AlgorithmsModules;
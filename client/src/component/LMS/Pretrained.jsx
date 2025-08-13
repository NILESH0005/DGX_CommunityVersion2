import React from 'react'
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
export const Pretrained = () => {
const navigate = useNavigate();

  const models = [
    {
      id: 1,
      title: "DeepSpeech",
      description: "An end-to-end automatic speech recognition (ASR) system using RNNs that converts audio to text, with pre-trained models available for English and other languages.",
      progress: 70,
      thumbnail: "deepspeech1.avif",
    },
    {
      id: 2,
      title: "DETR",
      description: "An object detection model combining CNNs with transformers, offering end-to-end training with pre-trained models for COCO dataset detection without anchor boxes.",
      progress: 65,
      thumbnail: "Detr.avif",
    },
    {
      id: 3,
      title: "LSTM",
      description: " specialized RNN architecture for sequence modeling that handles long-term dependencies, with pre-trained models widely used in time-series forecasting and NLP tasks like text generation.",
      progress: 65,
      thumbnail: "lstm.png",
    },
    {
      id: 4,
      title: "Resnet50",
      description: "A 50-layer deep convolutional neural network with residual connections, featuring pre-trained models on ImageNet that excel in image classification and transfer learning.",
      progress: 65,
      thumbnail: "Resnet50.avif",
    }
  ];

  const handleCardClick = (title) => {
    const routes = {
      "DeepSpeech": "/predeepspeech",
      "DETR": "/predetr",
      "LSTM": "/prelstm",
      "Resnet50": "/preresnet",
  
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
            Pre-Trained Models
          </h1>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">
                Pre-Trained Models
              </h1>
              <p className="text-gray-600">
                Explore state-of-the-art Pre Trained models
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
}
export default Pretrained;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LeaderBoard } from './LeaderBoard';
import  ChatBot from './ChatBot';


export const Lms = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 1,
      title: "Teaching Kits",
      description: "Access and render text files, PowerPoints, and Jupyter Notebooks",
      category: "teaching-kits",
      subcategory: "teaching-kits",
      image: "Teaching kit.avif",
    },
    {
      id: 2,
      title: "Data Sets",
      description: "Access structured/unstructured datasets with upload & manage options",
      category: "data-sets",
      subcategory: "data-sets",
      image: "Datasets.jpg",
    },
    {
      id: 3,
      title: "Regression - Linear and Logistic",
      description: "Explore linear and logistic regression models and applications",
      category: "regression",
      subcategory: "regression",
      image: "Regression.jpg",
    },
    {
      id: 4,
      title: "Pre-Trained Models",
      description: "Access and utilize various pre-trained machine learning models",
      category: "pretrained-models",
      subcategory: "pretrained-models",
      image: "pre-trained.avif",
    },
    {
      id: 5,
      title: "Object Classification",
      description: "Learn and implement object classification techniques",
      category: "object-classification",
      subcategory: "object-classification",
      image: "classification.png",
    },
    {
      id: 6,
      title: "Generative AI and LLM",
      description: "Explore generative AI and large language models",
      category: "generative-ai",
      subcategory: "generative-ai",
      image: "generativeai.avif",
    },
    {
      id: 7,
      title: "Digital Learning",
      description: "Interactive digital learning resources and tools",
      category: "digital-learning",
      subcategory: "digital-learning",
      image: "digital.avif",
    },
    {
      id: 8,
      title: "Computer Vision",
      description: "Learn about image processing and computer vision techniques",
      category: "computer-vision",
      subcategory: "computer-vision",
      image: "computerVision.jpeg",
    },
    {
      id: 9,
      title: "Annotation and Labeling",
      description: "Tools and techniques for data annotation and labeling",
      category: "annotation",
      subcategory: "annotation",
      image: "annotation.jpeg",
    },
    {
      id: 10,
      title: "Algorithms",
      description: "Study various algorithms and their implementations",
      category: "algorithms",
      subcategory: "algorithms",
      image: "algorithms.avif",
    },
  ];


  const handleCardClick = (category, subcategory) => {
   
    const pathMap = {
      'data-sets': '/data-modules',
      'teaching-kits': '/teaching-modules',
      'regression': '/regression-modules',
      'pretrained-models': '/pretrained-modules',
      'object-classification': '/object-classification-modules',
      'generative-ai': '/generative-ai-modules',
      'digital-learning': '/digital-learning-modules',
      'computer-vision': '/computer-vision-modules',
      'annotation': '/annotation-modules',
      'algorithms': '/algorithms-modules'
    };
    
    navigate(pathMap[category] || '/', { state: { category, subcategory } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Header with ChatBot */}
      <header className="bg-white shadow-sm p-4 md:p-6 flex justify-between items-start md:items-center flex-col md:flex-row">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-DGXblue">LMS Platform</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-xl md:text-2xl">Explore our interactive learning modules</p>
        </div>
        <div className="mt-4 md:mt-0">
          <ChatBot />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Modules Cards Section - Full width on mobile, 3/4 on desktop */}
        <div className="w-full lg:w-3/4 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {modules.map((module) => (
              <div
                key={module.id}
                className="bg-white p-4 md:p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 flex flex-col h-full"
                onClick={() => handleCardClick(module.category, module.subcategory)}
              >
                <div className="flex justify-center mb-3 md:mb-4 h-32 md:h-40 overflow-hidden rounded-lg">
                  <img 
                    src={module.image} 
                    alt={module.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-center mb-1 md:mb-2 text-DGXblue">{module.title}</h2>
                <p className="text-gray-600 text-base md:text-lg text-center flex-grow">{module.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Section - Full width on mobile, 1/4 on desktop */}
        <div className="w-full lg:w-1/4 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 shadow-sm lg:shadow-none overflow-y-auto">
          <div className="p-4 md:p-6 sticky top-0 bg-white z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-DGXblue mb-4 md:mb-6">Top Learners</h2>
          </div>
          <div className="pb-4 px-4 md:px-6">
            <LeaderBoard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lms;
import React from "react";
import Skeleton from "react-loading-skeleton";
import Swal from "sweetalert2";

const ContentSection = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-4 text-white">
        <p className="text-red-400 text-lg font-semibold">
          No content available
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const content = {
    title: data[0].Title,
    text: data[0].Content,
    image: data[0].Image,
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0f1c]/80 to-[#060b16]/90 py-12 px-4 md:px-16">
      <div className="max-w-7xl mx-auto rounded-xl border border-blue-800 shadow-[0_0_20px_#1e40af55] bg-[#0f172a]/70 backdrop-blur-md transition duration-500 hover:shadow-[0_0_40px_#3b82f655]">
        <div className="flex flex-col md:flex-row gap-10 p-6 md:p-12 group">
          <div className="md:w-2/3 flex flex-col justify-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight italic hover:not-italic hover:text-blue-400 hover:scale-[1.02] transition duration-300 cursor-pointer whitespace-pre-wrap break-words">
              {content?.title}
            </h2>
            <div className="prose prose-invert prose-lg text-gray-300 whitespace-pre-wrap break-words max-w-none leading-relaxed">
              {content?.text?.split("\n").map((para, i) => (
                <p
                  key={i}
                  className="hover:text-white transition duration-300 hover:scale-[1.01]"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          <div className="md:w-1/3 flex items-center justify-center">
            {content?.image ? (
              <img
                src={content.image}
                alt="Content Visual"
                className="max-h-80 object-contain rounded-lg border border-blue-600 shadow-lg transition duration-500 group-hover:scale-105"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <div className="h-80 w-full flex items-center justify-center border border-dashed border-blue-600 bg-white/10 text-blue-200 rounded-lg">
                No image available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentSection;
import React, { useState, useEffect, useMemo } from 'react';

const LoadPage = () => {
  const messages = useMemo(() => [
    "Loading your experience...",
    "Just a moment, almost there...",
    "Loading, please wait...",
    "Almost ready...",
    "Hang tight, we're getting things ready...",
    "Loading your content, one moment please...",
    "We're working on it, please wait...",
    "Preparing everything for you...",
    "Your experience is loading...",
    "Setting things up, just a second...",
    "Loading in progress, stay with us...",
    "We're almost there, hang on...",
    "Fetching your data, please wait...",
    "Loading, don't go anywhere..."
  ], []);

  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setMessage(messages[randomIndex]);
    }, 1000);

    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 opacity-70">
      <div className="relative flex items-center justify-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mb-20">
        <div className="absolute animate-spin rounded-full border-t-4 border-DGXblue w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40"></div>
        <div className="absolute animate-spin-reverse rounded-full border-t-4 border-DGXgreen w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36"></div>
        <div className="absolute animate-spin rounded-full border-t-4 border-DGXblack w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32"></div>
        <div className="absolute text-center text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-DGXblack mt-4 animate-bounce">
          DGX
        </div>
      </div>
      <div className="text-center text-sm sm:text-lg md:text-xl font-medium text-DGXblack mt-4 mb-4">
        {message}
      </div>
      <div className="text-center text-xs sm:text-base md:text-lg font-medium text-gray-600 opacity-90">
        Please wait while we prepare your content.
      </div>
    </div>
  );
};

export default LoadPage;

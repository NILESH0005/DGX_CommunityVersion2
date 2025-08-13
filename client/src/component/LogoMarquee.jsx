import React, { useState, useEffect, useMemo } from "react";
import Marquee from "react-fast-marquee";
import logo from "../../public/logo"; 

const LogoMarquee = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  
  const logoArray = useMemo(() => Object.values(logo), [logo]);

  
  useEffect(() => {
    let loadedImages = 0;

    const preloadImages = logoArray.map((src) => {
      const img = new Image();
      img.src = src; 
      img.onload = () => {
        loadedImages++;
        if (loadedImages === logoArray.length) {
          setIsLoaded(true);
        }
      };
    });
  }, [logoArray]);

  if (!isLoaded) {
    return (
      <div className="bg-gray-100 py-4 flex justify-center items-center h-32">
        <p className="text-black">Loading logos...</p>
      </div>
    );
  }

  return (
    <div className="bg-white py-4 overflow-hidden">
    <Marquee
      speed={100}
      gradient={false}
      loop={0}
      direction="left"
    >
      <div className="flex flex-wrap justify-between items-center">
        {logoArray.map((logo, index) => (
          <div
            key={index}
            className="mx-2 flex justify-center items-center"
          >
            <img
              src={logo}
              alt={`Logo ${index + 1}`}
              className="ml-12 h-16 sm:h-16 md:h-20 lg:h-20 xl:h-20 2xl:h-24 w-auto"
              srcSet={`${logo} 1x, ${logo}?w=500 2x`}
              sizes="(max-width: 640px) 80vw, (max-width: 768px) 60vw, (max-width: 1024px) 50vw, 40vw"
            />
          </div>
        ))}
      </div>
    </Marquee>
  </div>
  
  );
};

export default LogoMarquee;

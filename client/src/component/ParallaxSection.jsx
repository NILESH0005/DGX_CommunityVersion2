import React, { useState, useEffect } from "react";
import ApiContext from "../context/ApiContext";

const ParallaxSection = ({ data, userToken }) => {
  const [activeText, setActiveText] = useState("");
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    if (data) {
      const active = data.find((text) => text.isActive);
      if (active) {
        setActiveText(active.Content);
      }
    }
  }, [data]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const text = document.getElementById("text");
      const circuit = document.getElementById("circuit_board");
      const wave = document.getElementById("tech_wave");

      const parallaxFactorText = windowSize.width > 768 ? 1.5 : 0.8;
      const parallaxFactorCircuit = windowSize.width > 768 ? 0.5 : 0.3;
      const parallaxFactorWave = windowSize.width > 768 ? 0.3 : 0.2;

      if (text) text.style.transform = `translateY(${scrollY * parallaxFactorText}px)`;
      if (circuit) circuit.style.transform = `translateY(${scrollY * parallaxFactorCircuit}px)`;
      if (wave) wave.style.transform = `translateY(${scrollY * parallaxFactorWave}px)`;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [windowSize]);

  const getTextSize = () => {
    if (windowSize.width < 640) return "text-4xl";
    if (windowSize.width < 768) return "text-5xl";
    if (windowSize.width < 1024) return "text-7xl";
    return "text-9xl";
  };

  const getButtonStyle = () => {
    if (windowSize.width < 640) {
      return "px-6 py-3 text-lg transform translate-y-16";
    }
    return "px-8 py-4 text-xl transform translate-y-24";
  };

  return (
    <section className="relative w-full h-screen flex justify-center items-center overflow-hidden">
      <img
        src="stars.png"
        id="circuit_board"
        alt="Circuit Board"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />
      <h2
        id="text"
        className={`absolute text-white ${getTextSize()} z-10 px-4 text-center`}
        style={{
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          wordBreak: "break-word",
        }}
      >
        {activeText}
      </h2>
     
      <img
        src="bg0.png"
        id="tech_wave"
        alt="Tech Wave"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />
    </section>
  );
};

export default ParallaxSection;
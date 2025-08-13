import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Swal from "sweetalert2";
import ApiContext from "../context/ApiContext";


const ProjectShowcase = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchData } = useContext(ApiContext);

  const fetchProjects = async () => {
    const endpoint = "home/getProjectShowcase";
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
    };
    const body = {};


    try {
      const response = await fetchData(endpoint, method, body, headers);
      if (response?.success && Array.isArray(response.data)) {
        const transformedData = response.data.map((item) => ({
          title: item.Title,
          gif: item.Image,
          conetet:item.Content || "",
          description: item.description,
          techStack: item.TechStack,
        }));
        setProjects(transformedData);
      } else {
        console.warn("No projects data found in the response.");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to fetch projects data", "error");
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-white">
      <h2 className="text-4xl font-extrabold flex items-center gap-3 mb-8">
        🚀 Project Showcase <span className="text-blue-400 animate-pulse">| Featured Works</span>
      </h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-700 text-lg font-bold">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              className="relative bg-gray-800 text-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative w-full h-[250px] flex items-center justify-center bg-black">
                <img src={project.gif} alt={project.title} className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-blue-300">{project.title}</h3>
                <p className="text-sm text-gray-300 mt-1">{project.description}</p>
                <p className="text-sm text-green-400 mt-2">Tech Stack: {project.techStack}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectShowcase;
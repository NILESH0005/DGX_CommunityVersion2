import React, { useState, useContext, useEffect } from "react"; // Added useEffect
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import ApiContext from "../../context/ApiContext";
import { compressImage } from "../../utils/compressImage";


const ProjectShowcase = () => {
  const [projects, setProjects] = useState([]); // Initialize with empty array
  const { fetchData, userToken } = useContext(ApiContext);
  const [isAddingProject, setIsAddingProject] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchData]);


  const fetchProjects = async () => {
    try {
      const endpoint = "home/getProjectShowcase";
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
      };
      const body = {};

      const response = await fetchData(endpoint, method, body, headers);
      // console.log("API Response:", response);

      if (response.success) {
        const transformedProjects = response.data.map((project) => {
          let parsedContent = { description: "" };

          try {
            parsedContent = JSON.parse(project.Content);
          } catch (error) {
            // console.warn("Invalid JSON in project.Content:", project.Content);
          }

          return {
            title: project.Title || "",
            gif: project.Image || "",
            description: parsedContent.description || project.Content || "",
            techStack: project.TechStack || "",
            isEditing: false,
          };
        });

        setProjects(transformedProjects);
      } else {
        throw new Error(response.message || "Failed to fetch projects");
      }
    } catch (error) {
      // console.error("Error fetching projects:", error);
      Swal.fire("Error", `Failed to fetch projects: ${error.message}`, "error");
    }
  };
  const toggleEdit = (index) => {
    setProjects((prevProjects) =>
      prevProjects.map((project, i) =>
        i === index ? { ...project, isEditing: !project.isEditing } : project
      )
    );
  };

  const handleEdit = (index, field, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = value;
    setProjects(updatedProjects);
  };

  const handleGifUpload = async (index, event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const compressedImage = await compressImage(file);
        const updatedProjects = [...projects];
        updatedProjects[index].gif = compressedImage;
        setProjects(updatedProjects);
      } catch (error) {
        // console.error("Error compressing image:", error);
        Swal.fire("Error", "Failed to compress the image. Please try again.", "error");
      }
    }
  };

  const addProject = () => {
    setProjects([
      ...projects,
      {
        title: "",
        gif: "",
        description: "",
        techStack: "",
        isEditing: true,
      },
    ]);
    setIsAddingProject(true);
  };

  const saveProject = async (index) => {
    if (!projects[index].title || !projects[index].description || !projects[index].techStack) {
      Swal.fire("Error", "Please fill in all required fields.", "error");
      return;
    }

    try {
      const endpoint = "home/addProjectShowcase";
      const method = "POST";
      const body = {
        componentName: "ProjectShowcase",
        componentIdName: "project_showcase",
        title: projects[index].title,
        description: projects[index].description,
        techStack: projects[index].techStack,
        gif: projects[index].gif,
      };
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const response = await fetchData(endpoint, method, body, headers);
      // console.log("response:", response)

      if (!response || !response.success || !response.data) {
        throw new Error(response?.message || "Invalid response from the server");
      }

      const updatedProjects = [...projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        isEditing: false,
        // id: response.data.id,
      };

      setProjects(updatedProjects);
      setIsAddingProject(false);

      Swal.fire("Success!", "Project saved successfully!", "success");
    } catch (error) {
      // console.error("Error saving project:", error);
      // Swal.fire("Error", `Failed to save project: ${error.message}`, "error");
    }
  };


  const cancelAddProject = (index) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
    setIsAddingProject(false);
  };

  const deleteProject = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedProjects = projects.filter((_, i) => i !== index);
        setProjects(updatedProjects);
        Swal.fire("Deleted!", "Your project has been deleted.", "success");
      }
    });
  };

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-white">
      <h2 className="text-4xl font-extrabold flex items-center gap-3 mb-8">
        🚀 Project Showcase <span className="text-blue-400 animate-pulse">| Featured Works</span>
      </h2>
      <button onClick={addProject} className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg">
        Add Project
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            className="relative bg-gray-800 text-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl p-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative w-full h-[250px] flex items-center justify-center bg-black">
              {project.gif && (
                <img src={project.gif} alt={project.title} className="w-full h-full object-cover opacity-80" />
              )}
              {project.isEditing && (
                <input
                  type="file"
                  accept="image/gif"
                  onChange={(e) => handleGifUpload(index, e)}
                  className="absolute bottom-2 left-2 text-sm"
                />
              )}
            </div>
            <div className="p-4">
              {project.isEditing ? (
                <>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => handleEdit(index, "title", e.target.value)}
                    className="w-full bg-gray-700 p-2 rounded-md text-white text-lg font-bold mb-2"
                    placeholder="Project Title"
                  />
                  <textarea
                    value={project.description}
                    onChange={(e) => handleEdit(index, "description", e.target.value)}
                    className="w-full bg-gray-700 p-2 rounded-md text-white text-sm mb-2"
                    placeholder="Project Description"
                  />
                  <input
                    type="text"
                    value={project.techStack}
                    onChange={(e) => handleEdit(index, "techStack", e.target.value)}
                    className="w-full bg-gray-700 p-2 rounded-md text-white text-sm mb-2"
                    placeholder="Tech Stack"
                  />
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => saveProject(index)} className="px-4 py-2 bg-green-500 text-white rounded-lg">
                      Save
                    </button>
                    <button onClick={() => cancelAddProject(index)} className="px-4 py-2 bg-red-500 text-white rounded-lg">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold">{project.title}</h3>
                  <p className="text-sm mt-2">{project.description}</p>
                  <p className="text-sm mt-2 font-semibold text-blue-400">{project.techStack}</p>
                  <div className="mt-4 flex gap-2">
                    {/* <button onClick={() => toggleEdit(index)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg">
                      Edit
                    </button> */}
                    <button onClick={() => deleteProject(index)} className="px-4 py-2 bg-red-500 text-white rounded-lg">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectShowcase;
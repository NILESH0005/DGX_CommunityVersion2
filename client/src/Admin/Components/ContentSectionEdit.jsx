import React, { useState, useContext, useEffect } from "react";
import PropTypes from 'prop-types';
import Swal from "sweetalert2";
import ApiContext from "../../context/ApiContext";

const ContentManager = ({ data }) => {
  const [contentData, setContentData] = useState([]);
  const [formData, setFormData] = useState({ 
    title: "", 
    content: "", 
    image: null,
    idCode: null,
    componentName: "ContentSection",
    componentIdName: "contentSection"
  });
  const [charCount, setCharCount] = useState(800);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchData, userToken } = useContext(ApiContext);

  // Initialize data
  useEffect(() => {
    if (data && data.length > 0) {
      const firstItem = data[0];
      setContentData([{
        id: firstItem.idCode,
        title: firstItem.Title,
        content: firstItem.Content,
        image: firstItem.Image
      }]);
      
      setCharCount(800 - firstItem.Content.length);
    }
    setIsLoading(false);
  }, [data]);

  const handleAddClick = () => {
    setFormData({
      title: "",
      content: "",
      image: null,
      idCode: null,
      componentName: "ContentSection",
      componentIdName: "contentSection"
    });
    setIsAdding(true);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (contentData.length > 0) {
      setFormData({
        title: contentData[0].title,
        content: contentData[0].content,
        image: contentData[0].image,
        idCode: contentData[0].id,
        componentName: "ContentSection",
        componentIdName: "contentSection"
      });
      setIsEditing(true);
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const maxLength = name === "title" ? 100 : 800;
    
    if (value.length > maxLength) return;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "content") {
      setCharCount(800 - value.length);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "image/gif") {
      setFormData(prev => ({ ...prev, image: file }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setFormData(prev => ({ ...prev, image: canvas.toDataURL("image/jpeg") }));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleAddContent = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Swal.fire("Error", "Title and Content fields cannot be empty!", "error");
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Add New Content',
        text: "Are you sure you want to add this content?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'OK'
      });

      if (!result.isConfirmed) return;

      setIsLoading(true);
      const endpoint = "home/addContentSection";
      const response = await fetchData(
        endpoint,
        "POST",
        {
          componentName: formData.componentName,
          componentIdName: formData.componentIdName,
          title: formData.title,
          text: formData.content,
          image: formData.image
        },
        {
          "Content-Type": "application/json",
          "auth-token": userToken
        }
      );

      if (response?.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'New content has been added successfully.',
          timer: 1500,
          showConfirmButton: false
        });
        
        // Update local state with new content
        setContentData([{
          id: response.data.id,
          title: formData.title,
          content: formData.content,
          image: formData.image
        }]);
        setIsAdding(false);
      } else {
        throw new Error(response?.message || "Add failed");
      }
    } catch (error) {
      // console.error("Add error:", error);
      Swal.fire('Error!', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContent = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Swal.fire("Error", "Title and Content fields cannot be empty!", "error");
      return;
    }

    if (!formData.idCode) {
      Swal.fire("Error", "Content ID is missing!", "error");
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Update Content',
        text: "Are you sure you want to update this content?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'OK'
      });

      if (!result.isConfirmed) return;

      setIsLoading(true);
      const endpoint = "home/updateContentSection";
      const response = await fetchData(
        endpoint,
        "POST",
        {
          id: formData.idCode,
          Title: formData.title,
          Content: formData.content,
          Image: formData.image,
          ComponentName: formData.componentName,
          ComponentIdName: formData.componentIdName
        },
        {
          "Content-Type": "application/json",
          "auth-token": userToken
        }
      );

      if (response?.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Content has been updated successfully.',
          timer: 1500,
          showConfirmButton: false
        });
        
        // Update local state
        setContentData([{
          id: formData.idCode,
          title: formData.title,
          content: formData.content,
          image: formData.image
        }]);
        setIsEditing(false);
      } else {
        throw new Error(response?.message || "Update failed");
      }
    } catch (error) {
      // console.error("Update error:", error);
      Swal.fire('Error!', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight break-words max-w-[70%]">
          {isEditing ? "Edit Content" : isAdding ? "Add New Content" : "Content Section"}
        </h1>
        
        {!isEditing && !isAdding && (
          <div className="flex gap-2">
            {contentData.length > 0 ? (
              <button
                onClick={handleEditClick}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full shadow-lg transition"
              >
                Edit Content
              </button>
            ) : (
              <button
                onClick={handleAddClick}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full shadow-lg transition"
              >
                Add Content
              </button>
            )}
          </div>
        )}
      </div>

      {!isEditing && !isAdding ? (
        <div className="w-full bg-gradient-to-br from-[#0a0f1c]/80 to-[#060b16]/90 py-12 px-4 md:px-16">
          <div className="max-w-7xl mx-auto rounded-xl border border-blue-800 shadow-[0_0_20px_#1e40af55] bg-[#0f172a]/70 backdrop-blur-md transition duration-500 hover:shadow-[0_0_40px_#3b82f655]">
            <div className="flex flex-col md:flex-row gap-10 p-6 md:p-12 group">
              {contentData.length > 0 ? (
                <>
                  <div className="md:w-2/3 flex flex-col justify-center space-y-6">
                    <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight italic hover:not-italic hover:text-blue-400 hover:scale-[1.02] transition duration-300 cursor-pointer break-words">
                      {contentData[0].title}
                    </h2>
                    <div className="prose prose-invert prose-lg text-gray-300 whitespace-pre-wrap break-words max-w-none leading-relaxed">
                      {contentData[0].content?.split("\n").map((para, i) => (
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
                    {contentData[0].image ? (
                      <img
                        src={contentData[0].image}
                        alt="Content Visual"
                        className="max-h-80 object-contain rounded-lg border border-blue-600 shadow-lg transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-80 w-full flex items-center justify-center border border-dashed border-blue-600 bg-white/10 text-blue-200 rounded-lg">
                        No image available
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center w-full py-8">
                  <p className="text-gray-500 mb-4">No content available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700">Title*:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              maxLength={100}
              placeholder="Enter title (max 100 characters)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700">Content*:</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg h-32 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              maxLength={800}
              placeholder="Enter content (max 800 characters)"
              required
            />
            <p className="text-sm text-gray-500">
              Characters remaining: {charCount} | {formData.content.length}/800 characters
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700">Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          {formData.image && (
            <div className="mb-6 flex justify-center">
              <img
                src={formData.image}
                alt="Preview"
                className="w-80 h-80 object-contain rounded-lg border border-gray-200 shadow-md"
              />
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-full shadow-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={isAdding ? handleAddContent : handleUpdateContent}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg transition"
            >
              {isAdding ? "Add Content" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ContentManager.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      idCode: PropTypes.number.isRequired,
      Title: PropTypes.string.isRequired,
      Content: PropTypes.string.isRequired,
      Image: PropTypes.string,
      ComponentName: PropTypes.string,
      ComponentIdName: PropTypes.string
    })
  ),
};

export default ContentManager;
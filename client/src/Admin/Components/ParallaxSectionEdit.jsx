import { useState, useContext, useEffect } from "react";
import Swal from "sweetalert2";
import ApiContext from "../../context/ApiContext";
import { FaTrash } from "react-icons/fa";

const ParallaxSection = () => {
  const [parallaxTexts, setParallaxTexts] = useState([]);
  const [activeText, setActiveText] = useState("");
  const [newText, setNewText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { fetchData, userToken } = useContext(ApiContext);

  useEffect(() => {
    console.log("User Token:", userToken);
    fetchParallaxTexts();
  }, [userToken, fetchData]);

  const fetchParallaxTexts = async () => {
    const endpoint = "home/getParallaxContent";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
    };
    const body = {};

    try {
      const response = await fetchData(endpoint, method, body, headers);
      console.log("Response:", response);

      if (response.success) {
        setParallaxTexts(response.data);
        const active = response.data.find((text) => text.isActive);
        if (active) {
          setActiveText(active.Content);
        }
      } else {
        Swal.fire("Error", response.message, "error");
      }
    } catch (error) {
      console.error("API Request Error:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  const addParallaxText = async () => {
    if (!userToken) {
      Swal.fire("Error", "User is not authenticated. Please log in again.", "error");
      console.error("userToken is missing!");
      return;
    }

    if (parallaxTexts.length >= 10) {
      Swal.fire({ 
        icon: "error", 
        title: "Limit Reached", 
        text: "You can only add up to 10 parallax texts." 
      });
      return;
    }

    if (!newText.trim()) {
      Swal.fire("Warning", "Please enter some text before adding.", "warn");
      return;
    }

    setIsLoading(true);

    const endpoint = "home/addParallaxText";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    const body = { 
      componentName: "Parallax", 
      componentIdName: "parallaxText", 
      content: newText.trim() 
    };

    try {
      const response = await fetchData(endpoint, method, body, headers);

      if (response.success) {
        setNewText("");
        Swal.fire({ 
          icon: "success", 
          title: "Added!", 
          text: "New parallax text has been added.", 
          timer: 1500, 
          showConfirmButton: false 
        });

        await fetchParallaxTexts();
        
        if (response.data && response.data.id) {
          await handleSetActiveText(response.data.id);
        }
      } else {
        Swal.fire("Error", response.message, "error");
      }
    } catch (error) {
      console.error("API Request Error:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteText = async (idCode) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the parallax text.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "OK",
    });

    if (confirm.isConfirmed) {
      const endpoint = "home/deleteParallaxText";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };
      const body = { idCode };

      try {
        const response = await fetchData(endpoint, method, body, headers);

        if (response.success) {
          Swal.fire("Deleted!", "The text has been removed.", "success");
          await fetchParallaxTexts();
        } else {
          Swal.fire("Error", response.message, "error");
        }
      } catch (error) {
        console.error("API Request Error:", error);
        Swal.fire("Error", "Something went wrong!", "error");
      }
    }
  };

  const handleSetActiveText = async (idCode) => {
    console.log("Setting active text with idCode:", idCode);
    
    if (!idCode) {
      console.error("idCode is missing for setting active text");
      return;
    }

    const endpoint = "home/setActiveParallaxText";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };
    const body = { idCode };

    try {
      const response = await fetchData(endpoint, method, body, headers);

      if (response.success) {
        await fetchParallaxTexts();
        
        Swal.fire({ 
          icon: "success", 
          title: "Updated!", 
          text: "Active parallax text has been updated.", 
          timer: 1500, 
          showConfirmButton: false 
        });
      } else {
        Swal.fire("Error", response.message, "error");
      }
    } catch (error) {
      console.error("API Request Error:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-4 md:p-6">
      <div className="w-full bg-gray-900 text-white text-center py-8 md:py-10 text-xl md:text-2xl font-bold px-4">
        {activeText || "No active parallax text"}
      </div>
      
      <div className="mt-4 md:mt-6 w-full">
        <h2 className="text-lg font-semibold mb-2">Edit Parallax Text</h2>
        
        <div className="bg-gray-100 p-2 md:p-4 rounded-lg shadow w-full overflow-x-auto">
          <div className="min-w-[300px]">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2 text-sm md:text-base">Serial No</th>
                  <th className="border p-2 text-sm md:text-base">Parallax Text</th>
                  <th className="border p-2 text-sm md:text-base">Action</th>
                </tr>
              </thead>
              <tbody>
                {parallaxTexts.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="border p-4 text-center text-gray-500">
                      No parallax texts available
                    </td>
                  </tr>
                ) : (
                  parallaxTexts.map((text, index) => (
                    <tr key={text.idCode || index} className="border">
                      <td className="border p-2 text-center text-sm md:text-base">{index + 1}</td>
                      <td className="border p-2 text-sm md:text-base">{text.Content}</td>
                      <td className="border p-2 text-center">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <button
                            className={`px-2 py-1 text-xs md:text-sm md:px-3 rounded ${
                              activeText === text.Content
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                            onClick={() => handleSetActiveText(text.idCode)}
                            disabled={activeText === text.Content}
                          >
                            {activeText === text.Content ? "Active" : "Set Active"}
                          </button>

                          <button
                            className="text-red-600 hover:text-red-800 text-sm md:text-lg px-1 md:px-3"
                            onClick={() => handleDeleteText(text.idCode)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row gap-2">
          <input
            type="text"
            className="border p-2 flex-grow rounded text-sm md:text-base"
            placeholder="Enter new parallax text..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            disabled={isLoading}
          />
          <button
            className={`px-4 py-2 rounded text-white text-sm md:text-base ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={addParallaxText}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Text"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParallaxSection;
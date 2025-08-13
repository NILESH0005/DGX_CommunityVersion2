import { useState, useContext, useEffect, useMemo } from "react";
import ParallaxSectionEdit from "./ParallaxSectionEdit";
import ContentManager from "./ContentSectionEdit";
import NewSectionEdit from "./NewSectionEdit";
import ProjectShowcaseEdit from "./ProjectShowcaseEdit";
import ApiContext from "../../context/ApiContext";
import Swal from "sweetalert2";

const Home = () => {
  const [cmsData, setCmsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const { fetchData } = useContext(ApiContext);
  
  useEffect(() => {
    const fetchAllCMSContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const endpoint = "home/getAllCMSContent";
        const method = "GET";
        const headers = {
          "Content-Type": "application/json",
        };

        const response = await fetchData(endpoint, method, {}, headers);

        if (response && response.success) {
          // Ensure data is an array
          const responseData = Array.isArray(response.data) ? response.data : [];
          setCmsData(responseData);
          // console.log("CMS Data loaded:", responseData); // Debug log
        } else {
          throw new Error(response?.message || "Failed to fetch CMS content");
        }
      } catch (error) {
        // console.error("Error fetching CMS content:", error);
        setError(error.message);
        Swal.fire("Error", `Failed to fetch CMS content: ${error.message}`, "error");
        // Set empty array on error to prevent undefined issues
        setCmsData([]);
      } finally {
        setIsLoading(false);
        setDataFetched(true);
      }
    };

    fetchAllCMSContent();
  }, [fetchData]);

  // Memoize section data to prevent unnecessary recalculations
  const sectionData = useMemo(() => {
    const getSectionData = (componentIdName, componentName) => {
      return cmsData.filter(
        (item) => 
          item.ComponentIdName === componentIdName && 
          item.ComponentName === componentName
      );
    };

    return {
      parallax: getSectionData("parallaxText", "Parallax"),
      content: getSectionData("contentSection", "ContentSection"),
      news: getSectionData("news_section", "Latest News"),
      project: getSectionData("project_showcase", "ProjectShowcase")
    };
  }, [cmsData]);

  // Don't render child components until data fetch is complete
  if (!dataFetched || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error loading content: {error}</div>
      </div>
    );
  }
  
  return (
    <div>
      <ParallaxSectionEdit 
        data={sectionData.parallax} 
        isDataLoaded={dataFetched}
      />
      <ContentManager 
        data={sectionData.content} 
        isDataLoaded={dataFetched}
      />
      {/* <NewSectionEdit 
        data={sectionData.news} 
        isDataLoaded={dataFetched}
      />
      <ProjectShowcaseEdit 
        data={sectionData.project}
        isDataLoaded={dataFetched}
      /> */}
    </div>
  );
};

export default Home;
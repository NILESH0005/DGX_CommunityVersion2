import React, { useState, useContext } from "react";
import Slider from "react-slick";
import Swal from "sweetalert2";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ApiContext from "../../context/ApiContext";

const initialNewsData = [
  // {
  //   title: "Neural Networks Workshop",
  //   date: "April 5, 2025",
  //   location: "BITS Pilani, Tech Auditorium",
  //   image: "https://picsum.photos/200/300?grayscale",
  //   link: "#",
  // },
];

const NewsSection = () => {
  const [newsList, setNewsList] = useState(initialNewsData);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    image: "",
    link: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchData, userToken } = useContext(ApiContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOrEditNews = async () => {
    if (!formData.title || !formData.location || !formData.image) {
      Swal.fire("Error!", "All fields are required!", "error");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = "home/addNewsSection";
      const method = "POST";
      const body = {
        componentName: "NewsSection",
        componentIdName: "news_section",
        title: formData.title,
        location: formData.location,
        image: formData.image,
        link: formData.link,
      };
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const response = await fetchData(endpoint, method, body, headers);

      if (response.success) {
        if (editIndex !== null) {
          const updatedNews = [...newsList];
          updatedNews[editIndex] = formData;
          setNewsList(updatedNews);
          setEditIndex(null);
          Swal.fire("Updated!", "News has been updated.", "success");
        } else {
          setNewsList([...newsList, formData]);
          Swal.fire("Added!", "News has been added successfully.", "success");
        }

        setFormData({ title: "", date: "", location: "", image: "", link: "" });
      } else {
        throw new Error(response.message || "Failed to add news");
      }
    } catch (error) {
      // console.error("Error adding news:", error);
      Swal.fire("Error", `Failed to add news: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (index) => {
    setFormData(newsList[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This news item will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setNewsList(newsList.filter((_, i) => i !== index));
        Swal.fire("Deleted!", "News has been removed.", "success");
      }
    });
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="w-full p-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">📰 News </h1>
      <p className="text-center text-gray-400 mb-6">
        Explore the latest news, workshops, and events in AI and Data Science.
      </p>

      <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">{editIndex !== null ? "Edit News" : "Add News"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
            className="w-full p-2 bg-gray-700 rounded text-white"
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter event location"
            className="w-full p-2 bg-gray-700 rounded text-white"
          />
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Enter image URL"
            className="w-full p-2 bg-gray-700 rounded text-white"
          />
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="Enter event link (optional)"
            className="w-full p-2 bg-gray-700 rounded text-white"
          />
        </div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={handleAddOrEditNews}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : editIndex !== null ? "Update News" : "Add News"}
          </button>
          {editIndex !== null && (
            <button
              onClick={() => {
                setEditIndex(null);
                setFormData({ title: "", date: "", location: "", image: "", link: "" });
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-full"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <Slider {...settings}>
        {newsList.map((news, index) => (
          <div key={index} className="px-3">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
              {news.image && <img src={news.image} alt={news.title} className="w-full h-48 object-cover" />}
              <div className="p-4">
                <h3 className="text-xl font-semibold">{news.title}</h3>
                <p className="text-gray-300 text-sm mt-2">
                  <strong>Date:</strong> {news.date}
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Location:</strong> {news.location}
                </p>
                {news.link && (
                  <a href={news.link} className="mt-3 inline-block text-green-400 hover:underline">
                    More Info →
                  </a>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleDelete(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default NewsSection;
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const newsData = [
  {
    title: "AI Workshop for Beginners",
    // date: "January 15, 2025",
    location: "GL Bajaj, Training Room 1",
    image: "https://picsum.photos/seed/picsum/200/300",
    link: "#",
  },
  {
    title: "Advanced Data Science Seminar",
    // date: "February 20, 2025",
    location: "KIET Hall 2",
    image: "https://picsum.photos/200/300",
    link: "#",
  },
  {
    title: "Machine Learning Bootcamp",
    // date: "March 10, 2025",
    location: "IIT Delhi, Seminar Hall",
    image: "https://picsum.photos/id/237/200/300",
    link: "#",
  },
  {
    title: "Neural Networks Workshop",
    // date: "April 5, 2025",
    location: "BITS Pilani, Tech Auditorium",
    image: "https://picsum.photos/200/300?grayscale",
    link: "#",
  },
];

const NewsSection = () => {
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
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="w-full p-8 bg-gray-900 text-white">
      <h2 className="text-3xl font-bold text-center mb-6">📰 News & Discussions</h2>
      <p className="text-center text-gray-400 mb-8">
        Explore the latest news, workshops, and events that empower professionals and enthusiasts in AI and Data Science.
      </p>

      <Slider {...settings}>
        {newsData.map((news, index) => (
          <div key={index} className="px-3">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
              {news.image && (
                <img src={news.image} alt={news.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold">{news.title}</h3>
                {/* <p className="text-gray-300 text-sm mt-2"><strong>Date:</strong> {news.date}</p> */}
                <p className="text-gray-300 text-sm"><strong>Location:</strong> {news.location}</p>
                {/* <a href={news.link} className="mt-3 inline-block text-green-400 hover:underline">
                  More Info →
                </a> */}
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default NewsSection;

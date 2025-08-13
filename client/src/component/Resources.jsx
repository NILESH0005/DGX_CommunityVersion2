import React, { useState, useEffect } from 'react';

const Resources = () => {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already subscribed
    const isSubscribed = localStorage.getItem('isSubscribed');
    if (!isSubscribed) {
      setIsModalOpen(true);
    }
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle email submission logic
    alert(`Email submitted: ${email}`);
    // Mark user as subscribed in localStorage
    localStorage.setItem('isSubscribed', 'true');
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const resources = [
    {
      title: 'Official Documentation',
      link: 'https://example.com/docs',
      description: 'Comprehensive guides and references for all community-related activities.',
    },
    {
      title: 'Getting Started Guide',
      link: 'https://example.com/getting-started',
      description: 'Step-by-step guide to help new members get started quickly.',
    },
    {
      title: 'Community Tools',
      link: 'https://example.com/tools',
      description: 'Tools developed by the community to enhance productivity and collaboration.',
    },
    {
      title: 'Open Source Projects',
      link: 'https://example.com/projects',
      description: 'Explore and contribute to community-led open source projects.',
    },
    {
      title: 'Project Showcase',
      link: 'https://example.com/showcase',
      description: 'Showcase of successful projects developed by community members.',
    },
    {
      title: 'Upcoming Events',
      link: 'https://example.com/events',
      description: 'Stay updated on upcoming community events and meetups.',
    },
    {
      title: 'Past Events',
      link: 'https://example.com/past-events',
      description: 'Recap and resources from past events.',
    },
    {
      title: 'Contact Support',
      link: 'https://example.com/contact',
      description: 'Reach out to our support team for any assistance.',
    },
  ];

  return (
    <div className="max-w-full font-serif mx-auto p-10 bg-[#ecfdf5] shadow-lg rounded-lg mt-10 mb-10 flex flex-col md:flex-row">
      <div className="flex-1 md:pr-6">
        <h2 className="text-6xl font-bold mb-10 text-center md:text-left text-[#333]">Community Resources</h2>
        <p className="text-xl text-justify mb-12 md:text-left text-[#555] leading-relaxed">
          Welcome to the Community Resources page! Here, you&apos;ll find a wealth of information and tools to support your journey with DGX servers. Our curated collection includes guides, tutorials, and best practices to help you make the most of your DGX experience. Whether you&apos;re a seasoned professional or just getting started, our resources are designed to provide valuable insights and practical tips. Stay informed, stay connected, and continue to grow with our community.
        </p>
        <section>
          <h3 className="text-xl font-semibold mb-6 text-[#333]">Relevant Links</h3>
          <ul className="space-y-6">
            {resources.map((resource, index) => (
              <li key={index} className="p-6 border border-[#e2e8f0] rounded-lg bg-DGXwhite hover:shadow-lg transition-shadow duration-300">
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3182ce] hover:underline text-xl font-medium"
                >
                  {resource.title}
                </a>
                <p className="text-[#4a5568] mt-2">{resource.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="w-full md:w-1/3 mt-10 md:mt-0 md:ml-8">
        <div className="bg-[#fff] p-6 h-full border border-[#e2e8f0] rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-6 text-center text-[#333]">Subscribe for Updates</h3>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="block text-sm font-medium text-[#4a5568] mb-2">
              Enter your email to get updates:
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                required
                className="p-3 border border-[#d1d5db] rounded-md w-full"
                placeholder="you@example.com"
              />
              <button
                type="submit"
                className="absolute right-0 lg:w-28 top-0 mt-2 mr-2 bg-[#3182ce] text-DGXwhite p-1 rounded-md hover:bg-[#2b6cb0] transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal for Subscribe for Updates */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-DGXblack bg-opacity-60 z-50">
          <div className="bg-DGXwhite p-8 rounded-lg shadow-lg w-full max-w-lg relative animate__animated animate__fadeIn animate__faster">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-[#6b7280] hover:text-[#334155]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="text-2xl font-semibold mb-4 text-center text-[#333]">Subscribe for Updates</h3>
            <form onSubmit={handleSubmit}>
              <label htmlFor="email" className="block text-sm font-medium text-[#4a5568] mb-2">
                Enter your email to get updates:
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="p-3 border border-[#d1d5db] rounded-md w-full"
                  placeholder="you@example.com"
                />
                <button
                  type="submit"
                  className="absolute right-0 w-28 top-0 mt-2 mr-2 bg-[#3182ce] text-DGXwhite p-1 rounded-md hover:bg-[#2b6cb0] transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;

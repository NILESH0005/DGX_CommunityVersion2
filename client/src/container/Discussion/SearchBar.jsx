import React from "react";
import { FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";

/**
 * SearchBar Component
 * Handles searching, filtering, and creating new discussions
 */
const SearchBar = ({
  searchQuery,
  setSearchQuery,
  searchScope,
  setSearchScope,
  demoDiscussions,
  setFilteredDiscussions,
  userToken,
  navigate,
  setIsFormOpen,
}) => {
  // ---------------------------
  // Filter Logic
  // ---------------------------
  const filterDiscussions = (query, scope) => {
    if (!query.trim()) return demoDiscussions;

    const lowerQuery = query.toLowerCase();

    return demoDiscussions.filter((discussion) => {
      const title = discussion.Title?.toLowerCase() || "";
      const content = discussion.Content?.toLowerCase() || "";
      const tags = Array.isArray(discussion.Tag)
        ? discussion.Tag.map((t) => t.toLowerCase())
        : typeof discussion.Tag === "string"
        ? discussion.Tag.toLowerCase()
        : [];

      switch (scope) {
        case "title":
          return title.includes(lowerQuery);
        case "content":
          return content.includes(lowerQuery);
        case "tags":
          return Array.isArray(tags)
            ? tags.some((t) => t.includes(lowerQuery))
            : tags.includes(lowerQuery);
        default:
          return (
            title.includes(lowerQuery) ||
            content.includes(lowerQuery) ||
            (Array.isArray(tags)
              ? tags.some((t) => t.includes(lowerQuery))
              : tags.includes(lowerQuery))
          );
      }
    });
  };

  // ---------------------------
  // Handlers
  // ---------------------------
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      setFilteredDiscussions(demoDiscussions);
      return;
    }

    const filtered = filterDiscussions(value, searchScope);
    setFilteredDiscussions(filtered);
  };

  const handleScopeChange = (e) => {
    const value = e.target.value;
    setSearchScope(value);
    if (searchQuery.trim()) {
      const filtered = filterDiscussions(searchQuery, value);
      setFilteredDiscussions(filtered);
    }
  };

  const handleNewDiscussionClick = () => {
    if (!userToken) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to create a new discussion",
        confirmButtonText: "Login",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/SignInn");
        }
      });
      return;
    }
    setIsFormOpen((prev) => !prev);
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="sticky top-0 bg-white z-20 flex-shrink-0 mb-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-2 sm:p-0">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-DGXgreen to-DGXblue bg-clip-text text-transparent text-center sm:text-left">
          All Discussions
        </h2>

        {/* Search Input and Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              className="w-full py-2 pl-10 pr-16 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-800 focus:border-DGXgreen focus:ring-DGXgreen transition-all duration-300"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={handleSearchChange}
            />

            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>

            <div className="absolute right-0 top-0 h-full flex items-center pr-2">
              <select
                value={searchScope}
                onChange={handleScopeChange}
                className="text-xs border rounded p-1 bg-white"
              >
                <option value="all">All</option>
                <option value="title">Title</option>
                <option value="content">Content</option>
                <option value="tags">Tags</option>
              </select>
            </div>
          </div>

          {/* New Discussion Button */}
          <button
            onClick={handleNewDiscussionClick}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform text-sm sm:text-base ${
              userToken
                ? "bg-gradient-to-r from-DGXgreen to-DGXblue text-white hover:shadow-lg hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100"
            }`}
            disabled={!userToken}
          >
            <span className="text-lg leading-none">＋</span>
            <span className="hidden sm:inline">New Discussion</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;

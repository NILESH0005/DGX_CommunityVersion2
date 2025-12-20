import React from "react";
import { FaSearch, FaPlusCircle } from "react-icons/fa";


const EmptyState = ({
  searchQuery,
  setSearchQuery,
  demoDiscussions,
  setFilteredDiscussions,
  user,
  onStartNew,
}) => {
  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredDiscussions(demoDiscussions);
  };

  const isSearching = Boolean(searchQuery.trim());

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-white rounded-xl border border-gray-200 shadow-inner p-8 transition-all duration-300">
      <div className="mb-4 text-gray-400">
        {isSearching ? (
          <FaSearch size={48} className="mx-auto text-gray-300" />
        ) : (
          <FaPlusCircle size={48} className="mx-auto text-gray-300" />
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-700 mb-2">
        {isSearching ? "No Discussions Found" : "No Discussions Yet"}
      </h2>

      <p className="text-gray-500 mb-6 max-w-md">
        {isSearching
          ? "We couldn’t find any discussions matching your search. Try adjusting your keywords or filters."
          : "Be the first to start a conversation and share your thoughts with the community!"}
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        {isSearching && (
          <button
            onClick={handleClearSearch}
            className="px-5 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
          >
            Clear Search
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

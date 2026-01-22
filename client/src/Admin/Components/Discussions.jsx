import { useState, useContext, useEffect, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import ApiContext from "../../context/ApiContext";
import LoadPage from "../../component/LoadPage";
import { FaTrash, FaSearch, FaTimes, FaEye, FaComment, FaHeart, FaUser } from "react-icons/fa";
import { debounce } from "lodash";

const Discussions = () => {
  const { fetchData, userToken, user } = useContext(ApiContext);
  console.log("Full user object:", user);
  console.log(
    "Available user properties:",
    user ? Object.keys(user) : "User is null/undefined"
  );
  const [discussions, setDiscussions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => {
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);

  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = { email: user.EmailId };
      console.log("Sending payload:", payload);

      const result = await fetchData(
        "discussion/getdiscussion",
        "POST",
        payload,
        { "Content-Type": "application/json" }
      );

      if (result?.data?.updatedDiscussions) {
        setDiscussions(result.data.updatedDiscussions);
      }
    } catch (error) {
      setError(error.message);
      Swal.fire("Error", `Something went wrong: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    console.log("User ID:", user?.id);
    fetchDiscussions();
  }, [fetchDiscussions]);

  const stripHtmlTags = useCallback((html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }, []);

  const handleSearch = useCallback(
    debounce((term) => {
      setIsSearching(false);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsSearching(!!term.trim());
    handleSearch(term);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
  };

  const filteredDiscussions = useMemo(() => {
    if (!searchTerm.trim()) return discussions;

    const term = searchTerm.toLowerCase();
    return discussions.filter((discussion) => {
      const title = (discussion.Title || "").toLowerCase();
      const userName = (discussion.UserName || "").toLowerCase();
      const content = stripHtmlTags(discussion.Content || "").toLowerCase();
      const likes = discussion.likeCount?.toString() || "";
      const comments = discussion.comment?.length?.toString() || "";

      return (
        title.includes(term) ||
        userName.includes(term) ||
        content.includes(term) ||
        likes.includes(searchTerm) ||
        comments.includes(searchTerm)
      );
    });
  }, [discussions, searchTerm, stripHtmlTags]);

  const handleDeleteDiscussion = async (discussionId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
    });

    if (result.isConfirmed) {
      try {
        const endpoint = "discussion/deleteDiscussion";
        const method = "POST";
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };
        const body = { discussionId };

        const response = await fetchData(endpoint, method, body, headers);
        if (response && response.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The discussion has been deleted.",
          });
          fetchDiscussions();
        } else {
          throw new Error("Failed to delete the discussion.");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to delete the discussion: ${error.message}`,
        });
      }
    }
  };

  const renderMobileDiscussionCard = (discussion, index) => (
    <div
      key={discussion.DiscussionID}
      className="p-5 mb-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            {discussion.Title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaUser size={12} />
            <span>{discussion.UserName || "Unknown"}</span>
          </div>
        </div>
        {!discussion.approved && (
          <button
            onClick={() => handleDeleteDiscussion(discussion.DiscussionID)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete"
          >
            <FaTrash size={16} />
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700 line-clamp-2">
          {stripHtmlTags(discussion.Content || "")}
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaHeart className="text-red-500" size={14} />
            <span className="text-sm font-medium text-gray-700">
              {discussion.likeCount || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaComment className="text-blue-500" size={14} />
            <span className="text-sm font-medium text-gray-700">
              {discussion.comment?.length || 0}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!discussion.approved && (
            <button
              onClick={() => handleDeleteDiscussion(discussion.DiscussionID)}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg mb-6 w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <p className="text-red-600 text-center font-medium mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-DGXblue text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium mx-auto block shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Discussions</h2>
          <p className="text-gray-600 text-sm">
            Total Discussions: <span className="font-semibold">{discussions.length}</span>
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search discussions by title, author, content..."
          className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-DGXblue focus:border-transparent placeholder-gray-500"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Discussions Table/Cards */}
      {filteredDiscussions.length > 0 ? (
        isMobileView ? (
          <div className="space-y-4">
            {filteredDiscussions.map((discussion, index) =>
              renderMobileDiscussionCard(discussion, index)
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
              <div className="min-w-full">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-DGXgreen">
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 sticky left-0 z-20">
                        #
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 min-w-[200px]">
                        Title
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 min-w-[150px]">
                        Author
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700 min-w-[250px]">
                        Content
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        <div className="flex items-center gap-1">
                          <FaHeart className="text-red-500" size={12} />
                          <span>Likes</span>
                        </div>
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        <div className="flex items-center gap-1">
                          <FaComment className="text-blue-500" size={12} />
                          <span>Comments</span>
                        </div>
                      </th>
                      <th className="p-4 border-b text-left font-semibold text-sm uppercase tracking-wider text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDiscussions.map((discussion, index) => (
                      <tr
                        key={discussion.DiscussionID}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="p-4 text-sm text-gray-600 font-medium sticky left-0 bg-white z-10">
                          {index + 1}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-bold text-gray-900">
                            {discussion.Title}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-gray-400" size={14} />
                            <span className="text-sm text-gray-700">
                              {discussion.User?.Name || discussion.UserName || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {stripHtmlTags(discussion.Content || "")}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaHeart className="text-red-500" size={14} />
                            <span className="text-sm font-medium text-gray-700">
                              {discussion.likeCount || 0}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaComment className="text-blue-500" size={14} />
                            <span className="text-sm font-medium text-gray-700">
                              {discussion.comment?.length || 0}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {!discussion.approved && (
                            <button
                              onClick={() =>
                                handleDeleteDiscussion(discussion.DiscussionID)
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Delete"
                            >
                              <FaTrash size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-3">
            <FaComment size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            {searchTerm
              ? "No discussions match your search"
              : "No discussions found"}
          </p>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="text-DGXblue hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Discussions;
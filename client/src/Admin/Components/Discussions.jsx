import { useState, useContext, useEffect, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import ApiContext from "../../context/ApiContext";
import LoadPage from "../../component/LoadPage";
import { FaTrash, FaSearch, FaTimes, FaEye } from "react-icons/fa";
import { debounce } from "lodash";


const Discussions = () => {
  const { fetchData, userToken } = useContext(ApiContext);
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

      const result = await fetchData(
        "discussion/getdiscussion",
        "POST",
        {},
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
      className="p-4 mb-4 rounded-lg shadow bg-white"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{discussion.Title}</h3>
          <p className="text-sm text-gray-600">By: {discussion.UserName || "Unknown"}</p>
        </div>
        {!discussion.approved && (
          <button
            onClick={() => handleDeleteDiscussion(discussion.DiscussionID)}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
            title="Delete"
          >
            <FaTrash size={14} />
          </button>
        )}
      </div>

      <div className="mt-2">
        <p className="text-sm text-gray-700">
          {stripHtmlTags((discussion.Content || "").substring(0, 100))}...
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1">
          <span className="font-medium">Likes:</span>
          <span>{discussion.likeCount || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium">Comments:</span>
          <span>{discussion.comment?.length || 0}</span>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        {/* <button
          onClick={() => {
            // You can add a view details functionality here if needed
          }}
          className="bg-DGXblue text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm flex items-center gap-1"
        >
          <FaEye size={12} />
          <span>View</span>
        </button> */}
      </div>
    </div>
  );

  if (loading) return <LoadPage />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full md:w-1/2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title, name, content, etc..."
            className="pl-10 pr-10 py-2 border rounded w-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FaTimes className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {filteredDiscussions.length > 0 ? (
        isMobileView ? (
          <div className="space-y-3">
            {filteredDiscussions.map((discussion, index) =>
              renderMobileDiscussionCard(discussion, index)
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <div className="overflow-auto" style={{ maxHeight: "600px" }}>
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-DGXgreen text-white">
                    <th className="p-2 border text-center w-12">#</th>
                    <th className="p-2 border text-center min-w-[150px]">Title</th>
                    <th className="p-2 border text-center min-w-[120px]">Name</th>
                    <th className="p-2 border text-center min-w-[200px]">Content</th>
                    <th className="p-2 border text-center min-w-[80px]">Likes</th>
                    <th className="p-2 border text-center min-w-[100px]">Comments</th>
                    <th className="p-2 border text-center min-w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDiscussions.map((discussion, index) => (
                    <tr key={discussion.DiscussionID} className="hover:bg-gray-50">
                      <td className="p-2 border text-center w-12">{index + 1}</td>
                      <td className="p-2 border text-center min-w-[150px]">
                        {discussion.Title}
                      </td>
                      <td className="p-2 border text-center min-w-[120px]">
                        {discussion.UserName || "Unknown"}
                      </td>
                      <td className="p-2 border text-center min-w-[200px]">
                        {stripHtmlTags((discussion.Content || "").substring(0, 50))}...
                      </td>
                      <td className="p-2 border text-center min-w-[80px]">
                        {discussion.likeCount || 0}
                      </td>
                      <td className="p-2 border text-center min-w-[100px]">
                        {discussion.comment?.length || 0}
                      </td>
                      <td className="p-2 border text-center min-w-[80px]">
                        {!discussion.approved && (
                          <button
                            onClick={() => handleDeleteDiscussion(discussion.DiscussionID)}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                            title="Delete"
                          >
                            <FaTrash className="inline-block" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <p className="text-center text-gray-500">
          {searchTerm
            ? "No discussions match your search"
            : "No discussions found"}
        </p>
      )}
    </div>
  );
};

export default Discussions;
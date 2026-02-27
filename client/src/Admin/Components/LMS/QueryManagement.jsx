import React, { useState, useEffect, useContext } from "react";
import moment from "moment";
import {
  FaEye,
  FaSearch,
  FaFilter,
  FaTimes,
  FaCalendarAlt,
  FaUser,
  FaFileAlt,
  FaFolderOpen,
} from "react-icons/fa";
import ApiContext from "../../../context/ApiContext";

const QueryManagement = () => {
  const [queryData, setQueryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { fetchData, userToken, user } = useContext(ApiContext);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState("");
  // console.log("Logged user:", user);

  const fetchQueries = async () => {
    try {
      const headers = {
        "auth-token": userToken,
      };

      const data = await fetchData("lms/query-list", "GET", {}, headers);

      console.log("Query API response:", data);

      if (data.success) {
        const formattedData = data.data.map((item) => ({
          id: item.queryId,
          moduleName: item.moduleName,
          submoduleName: item.subModuleName,
          unitName: item.unitName,
          fileName: item.fileName,
          queryRaisedUser: item.userName,
          queryText: item.queryText,
          queryStatus: item.status,
          queryRaisedAddOnDt: item.createdAt,
          moduleCreatorId: item.moduleCreatorId,
        }));

        setQueryData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    }
  };

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  useEffect(() => {
    if (userToken) {
      fetchQueries();
    }
  }, [userToken]);

  const handleView = (queryId) => {
    const query = queryData.find((q) => q.id === queryId);
    setSelectedQuery(query);
    setViewModalOpen(true);
  };

  const handleReply = (queryId) => {
    const query = queryData.find((q) => q.id === queryId);
    setSelectedQuery(query);
    setReplyModalOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    try {
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      await fetchData(
        `lms/reply-query/${selectedQuery.id}`,
        "POST",
        { replyText },
        headers,
      );

      // Update UI
      setQueryData((prev) =>
        prev.map((q) =>
          q.id === selectedQuery.id ? { ...q, queryStatus: "Answered" } : q,
        ),
      );

      setReplyText("");
      setReplyModalOpen(false);
    } catch (error) {
      console.error("Reply failed:", error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Answered":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredQueries = queryData.filter((item) => {
    const matchesStatus =
      statusFilter === "" ||
      item.queryStatus.toLowerCase() === statusFilter.toLowerCase();

    const matchesSearch =
      item.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submoduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.queryRaisedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.queryText.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const renderMobileCard = (query, index) => (
    <div
      key={query.id}
      className="p-5 mb-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            {query.moduleName}
          </h3>
          <p className="text-sm text-gray-600">
            {query.submoduleName} • {query.unitName}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <FaFileAlt size={12} />
            {query.fileName}
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
            query.queryStatus,
          )}`}
        >
          {query.queryStatus}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-700 mb-3">
        <div className="flex items-center gap-2">
          <FaUser size={12} className="text-gray-400" />
          {query.queryRaisedUser}
        </div>
        <div className="flex items-center gap-2">
          <FaCalendarAlt size={12} className="text-gray-400" />
          {moment(query.queryRaisedAddOnDt).format("MMM D, YYYY")}
        </div>
        <p className="line-clamp-2 mt-2 text-gray-600">{query.queryText}</p>
      </div>
    </div>
  );

  return (
    <div className="mt-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Query Management
        </h2>
        <p className="text-gray-600 text-sm">
          Total Queries:{" "}
          <span className="font-semibold">{queryData.length}</span>
        </p>
      </div>

      {/* Search */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by module, user, file or query..."
            className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Filters */}
        {isMobileView ? (
          <>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl w-full"
            >
              <FaFilter />
              Filters
            </button>

            {showFilters && (
              <select
                className="w-full p-3 border border-gray-300 rounded-xl"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Answered">Answered</option>
              </select>
            )}
          </>
        ) : (
          <select
            className="p-3 border border-gray-300 rounded-xl"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        )}
      </div>

      {/* Table or Cards */}
      {filteredQueries.length > 0 ? (
        isMobileView ? (
          filteredQueries.map((query, index) => renderMobileCard(query, index))
        ) : (
          <div className="overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-100 sticky top-0">
                <tr className="bg-DGXgreen">
                  <th className="p-4 text-left text-sm font-semibold">#</th>
                  <th className="p-4 text-left text-sm font-semibold">
                    Module
                  </th>
                  <th className="p-4 text-left text-sm font-semibold">
                    Submodule
                  </th>
                  <th className="p-4 text-left text-sm font-semibold">Unit</th>
                  <th className="p-4 text-left text-sm font-semibold">File</th>
                  <th className="p-4 text-left text-sm font-semibold">
                    Raised By
                  </th>
                  <th className="p-4 text-left text-sm font-semibold">Query</th>
                  <th className="p-4 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="p-4 text-left text-sm font-semibold">Date</th>
                  <th className="p-4 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredQueries.map((query, index) => (
                  <tr key={query.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm">{index + 1}</td>
                    <td className="p-4 text-sm font-semibold">
                      {query.moduleName}
                    </td>
                    <td className="p-4 text-sm">{query.submoduleName}</td>
                    <td className="p-4 text-sm">{query.unitName}</td>
                    <td className="p-4 text-sm">{query.fileName}</td>
                    <td className="p-4 text-sm">{query.queryRaisedUser}</td>
                    <td className="p-4 text-sm max-w-xs truncate">
                      {query.queryText}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusClass(
                          query.queryStatus,
                        )}`}
                      >
                        {query.queryStatus}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {moment(query.queryRaisedAddOnDt).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex gap-2">
                        {/* View Button - Visible to Everyone */}
                        <button
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300"
                          onClick={() => handleView(query.id)}
                        >
                          <FaEye className="inline mr-1" />
                          View
                        </button>

                        {query.queryStatus?.toLowerCase() === "pending" &&
                          Number(query.moduleCreatorId) ===
                            Number(user?.UserID) && (
                            <button
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
                              onClick={() => handleReply(query.id)}
                            >
                              Reply
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-12 text-gray-500">No queries found.</div>
      )}

      {viewModalOpen && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] max-w-full rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Query Details</h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Raised By</p>
                <p className="font-medium">{selectedQuery.queryRaisedUser}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Query</p>
                <p className="bg-gray-100 p-3 rounded-lg">
                  {selectedQuery.queryText}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${getStatusClass(selectedQuery.queryStatus)}`}
                >
                  {selectedQuery.queryStatus}
                </span>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {replyModalOpen && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] max-w-full rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Reply to Query</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Query</p>
              <div className="bg-gray-100 p-3 rounded-lg">
                {selectedQuery.queryText}
              </div>
            </div>

            <textarea
              rows="4"
              placeholder="Write your reply..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setReplyModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={handleSubmitReply}
              >
                Submit Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryManagement;

import React, { useState, useEffect } from "react";
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

const QueryManagement = () => {
  // ✅ Dummy Data
  const dummyQueries = [
    {
      id: 1,
      moduleName: "Physics",
      submoduleName: "Mechanics",
      unitName: "Newton Laws",
      fileName: "laws_of_motion.pdf",
      queryRaisedUser: "Rohit Rawat",
      queryText: "Please explain the derivation of Newton's Second Law.",
      queryStatus: "Open",
      queryRaisedAddOnDt: "2026-02-20",
    },
    {
      id: 2,
      moduleName: "Mathematics",
      submoduleName: "Algebra",
      unitName: "Quadratic Equations",
      fileName: "quadratic_notes.pdf",
      queryRaisedUser: "Ankit Sharma",
      queryText: "How do we solve quadratic equations using factorization?",
      queryStatus: "In Progress",
      queryRaisedAddOnDt: "2026-02-18",
    },
    {
      id: 3,
      moduleName: "Chemistry",
      submoduleName: "Organic Chemistry",
      unitName: "Hydrocarbons",
      fileName: "hydrocarbons.pdf",
      queryRaisedUser: "Priya Singh",
      queryText: "Difference between alkanes and alkenes?",
      queryStatus: "Resolved",
      queryRaisedAddOnDt: "2026-02-15",
    },
  ];

  const [queryData, setQueryData] = useState(dummyQueries);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800 border-red-200";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Resolved":
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
            query.queryStatus
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
        <p className="line-clamp-2 mt-2 text-gray-600">
          {query.queryText}
        </p>
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
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
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
          filteredQueries.map((query, index) =>
            renderMobileCard(query, index)
          )
        ) : (
          <div className="overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-100 sticky top-0">
                <tr className="bg-DGXgreen">
                  <th className="p-4 text-left text-sm font-semibold">#</th>
                  <th className="p-4 text-left text-sm font-semibold">Module</th>
                  <th className="p-4 text-left text-sm font-semibold">Submodule</th>
                  <th className="p-4 text-left text-sm font-semibold">Unit</th>
                  <th className="p-4 text-left text-sm font-semibold">File</th>
                  <th className="p-4 text-left text-sm font-semibold">Raised By</th>
                  <th className="p-4 text-left text-sm font-semibold">Query</th>
                  <th className="p-4 text-left text-sm font-semibold">Status</th>
                  <th className="p-4 text-left text-sm font-semibold">Date</th>
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
                    <td className="p-4 text-sm">
                      {query.queryRaisedUser}
                    </td>
                    <td className="p-4 text-sm max-w-xs truncate">
                      {query.queryText}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusClass(
                          query.queryStatus
                        )}`}
                      >
                        {query.queryStatus}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {moment(query.queryRaisedAddOnDt).format("MMM D, YYYY")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-12 text-gray-500">
          No queries found.
        </div>
      )}
    </div>
  );
};

export default QueryManagement;
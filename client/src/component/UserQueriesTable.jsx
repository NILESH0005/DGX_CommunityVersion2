import React, { useState, useMemo } from "react";
import { FiSearch, FiEye, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const UserQueriesTable = ({ queries = [], onRemove }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  // 🔎 Filter Logic
  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      const matchesSearch =
        q.queryText.toLowerCase().includes(search.toLowerCase()) ||
        q.module.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || q.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [queries, search, statusFilter]);

  // 📄 Pagination Logic
  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage);
  const paginatedData = filteredQueries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-gray-500 mt-1">
          View and manage your submitted queries across modules.
        </p>

        <div className="flex gap-4 mt-4">
          <div className="px-4 py-2 bg-gray-100 rounded-xl shadow-sm text-sm">
            Total Queries: <span className="text-green-600 font-semibold">{queries.length}</span>
          </div>
          <div className="px-4 py-2 bg-gray-100 rounded-xl shadow-sm text-sm">
            Filtered Results: <span className="text-green-600 font-semibold">{filteredQueries.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative w-full lg:w-1/3">
          <FiSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search queries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
          />
        </div>

        <select
          className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Query Cards */}
      <div className="space-y-6">
        {paginatedData.length > 0 ? (
          paginatedData.map((query) => (
            <div
              key={query.id}
              className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition"
            >
              {/* Breadcrumb + Status */}
              <div className="flex justify-between items-start flex-wrap gap-2">
                <p className="text-sm text-gray-500">
                  {query.module} &gt; {query.submodule} &gt; {query.unit} &gt;{" "}
                  <span className="text-green-600">{query.file}</span>
                </p>

                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    query.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  ● {query.status}
                </span>
              </div>

              {/* Name */}
              <h3 className="mt-4 font-semibold text-gray-800">
                {query.queryCreator}
              </h3>

              {/* Query Text */}
              <p className="mt-2 text-gray-600 line-clamp-2">
                {query.queryText}
              </p>

              <button className="flex items-center gap-1 mt-2 text-green-600 text-sm hover:underline">
                <FiEye size={14} /> View More
              </button>

              {/* Footer */}
              <div className="flex justify-between items-center mt-6 border-t pt-4">
                <span className="text-sm text-gray-500">{query.date}</span>

                <button
                  onClick={() => onRemove(query.id)}
                  className="flex items-center gap-1 px-3 py-1 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition text-sm"
                >
                  <FiTrash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No queries found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="flex items-center gap-1 text-gray-600 disabled:opacity-50"
          >
            <FiChevronLeft /> Previous
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === i + 1
                  ? "bg-green-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="flex items-center gap-1 text-gray-600 disabled:opacity-50"
          >
            Next <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserQueriesTable;
import React, { useState, useMemo, useEffect, useContext } from "react";
import {
  FiSearch,
  FiEye,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import ApiContext from "../context/ApiContext";
import Swal from "sweetalert2";

const UserQueriesTable = () => {
  const { fetchData, userToken } = useContext(ApiContext);
  const [editingQuery, setEditingQuery] = useState(null);
  const [updatedText, setUpdatedText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [queries, setQueries] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // ✅ Fetch My Queries
  useEffect(() => {
    const fetchMyQueries = async () => {
      try {
        const headers = { "auth-token": userToken };

        const res = await fetchData("lms/my-queries", "GET", {}, headers);

        if (res.success) {
          const formatted = res.data.map((q) => ({
            id: q.QueryID,
            queryText: q.QueryText,
            status: q.Status,
            module: q.Module?.ModuleName || "N/A",
            submodule: q.SubModule?.SubModuleName || "N/A",
            unit: q.Unit?.UnitName || "N/A",
            file: q.File?.FilesName || "N/A",
            queryCreator: "You",
            date: new Date(q.AddOnDt).toLocaleString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            reply: q.Reply ? q.Reply.ReplyText : null,
            replyDate: q.Reply
              ? new Date(q.Reply.AddOnDt).toLocaleString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : null,
          }));

          setQueries(formatted);
        }
      } catch (error) {
        console.error("Error fetching user queries:", error);
      }
    };

    fetchMyQueries();
  }, [userToken]);

  const handleUpdateQuery = async () => {
    try {
      setIsSaving(true);

      const headers = {
        "auth-token": userToken,
        "Content-Type": "application/json",
      };
      console.log(editingQuery);
      const res = await fetchData(
        "lms/update-query",
        "POST",
        {
          QueryID: editingQuery.id,
          QueryText: updatedText,
        },
        headers,
      );

      console.log("ress", res);

      if (res && res.success) {
        setQueries((prev) =>
          prev.map((q) =>
            q.id === editingQuery.id ? { ...q, queryText: updatedText } : q,
          ),
        );

        setEditingQuery(null);
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuery = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete your query.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetchData(
        "lms/delete-query",
        "POST",
        { QueryID: id },
        {
          "auth-token": userToken,
          "Content-Type": "application/json",
        },
      );

      if (res.success) {
        setQueries((prev) => prev.filter((q) => q.id !== id));

        Swal.fire("Deleted!", "Your query has been deleted.", "success");
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 🔎 Filter Logic
  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      const matchesSearch =
        q.queryText.toLowerCase().includes(search.toLowerCase()) ||
        q.module.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "All" || q.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [queries, search, statusFilter]);

  // 📄 Pagination Logic
  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage);
  const paginatedData = filteredQueries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
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
            Total Queries:{" "}
            <span className="text-green-600 font-semibold">
              {queries.length}
            </span>
          </div>
          <div className="px-4 py-2 bg-gray-100 rounded-xl shadow-sm text-sm">
            Filtered Results:{" "}
            <span className="text-green-600 font-semibold">
              {filteredQueries.length}
            </span>
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
          <option value="Answered">Answered</option>
        </select>
      </div>

      {/* Query Cards */}
      <div className="space-y-6">
        {paginatedData.length > 0 ? (
          paginatedData.map((query) => (
            <div
              key={query.QueryID}
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

              {/* Query Text */}
              <p className="mt-4 text-gray-700">{query.queryText}</p>

              {/* Reply Section */}
              {query.reply && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-700">
                    Instructor Reply
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{query.reply}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {query.replyDate}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center mt-6 border-t pt-4">
                <span className="text-sm text-gray-500">{query.date}</span>

                <div className="flex gap-3">
                  {query.status === "Pending" && (
                    <>
                      <button
                        onClick={() => {
                          setEditingQuery(query);
                          setUpdatedText(query.queryText);
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition text-sm"
                      >
                        <FiEye size={14} /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteQuery(query.id)}
                        className="flex items-center gap-1 px-3 py-1 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition text-sm"
                      >
                        <FiTrash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                </div>
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

      {editingQuery && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Edit Your Query
            </h2>

            <textarea
              value={updatedText}
              onChange={(e) => setUpdatedText(e.target.value)}
              rows={5}
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-400 outline-none resize-none"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setEditingQuery(null)}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateQuery}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserQueriesTable;

import React, { useContext, useRef, useEffect } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TbUserSquareRounded } from "react-icons/tb";
import Swal from "sweetalert2";
import ApiContext from "../context/ApiContext";
import JoditEditor from "jodit-react";

const BlogModal = ({ blog, closeModal, updateBlogState }) => {
  const {
    title,
    image,
    author,
    published_date,
    content,
    Status,
    BlogID,
    UserName,
    allowRepost,
  } = blog || {};
  console.log("BLOG IMAGE URL:", image);

  const { fetchData, userToken, user } = useContext(ApiContext);
  const modalRef = useRef(null);
  const editorRef = useRef(null);

  const resolveImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_API_BASEURL}${img}`;
  };

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeModal]);

  const updateBlogStatus = async (blogId, Status, remark = "") => {
    const endpoint = `blog/updateBlog/${blogId}`;
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    const body = { Status, remark };

    try {
      const result = await fetchData(endpoint, method, body, headers);

      if (result.success) {
        Swal.fire({
          title: "Success!",
          text: `Blog ${Status}ed successfully!`,
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });

        if (typeof updateBlogState === "function") {
          updateBlogState(blogId, Status);
        } else {
          console.warn("updateBlogState is not a function");
        }
        closeModal();
      } else {
        Swal.fire({
          title: "Error!",
          text: `Failed to ${Status} blog: ${result.message}`,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Error ${Status}ing blog: ${error.message}`,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleAction = (status) => {
    if (status === "reject") {
      Swal.fire({
        title: "Reject Blog",
        input: "text",
        inputLabel: "Enter reason for rejection",
        inputPlaceholder: "Provide a reason for rejection...",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Reject",
        inputValidator: (value) => {
          if (!value) {
            return "You need to provide a reason!";
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          updateBlogStatus(BlogID, "reject", result.value);
        }
      });
    } else if (status === "delete") {
      Swal.fire({
        title: `Are you sure?`,
        text: `You are about to delete this blog.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: `OK `,
      }).then((result) => {
        if (result.isConfirmed) {
          updateBlogStatus(BlogID, "delete");
        }
      });
    } else {
      Swal.fire({
        title: `Are you sure?`,
        text: `You are about to ${status} this blog.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: status === "approve" ? "#28a745" : "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: `Yes, ${status}!`,
      }).then((result) => {
        if (result.isConfirmed) {
          updateBlogStatus(BlogID, status);
        }
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-600";
      case "Rejected":
        return "text-red-600";
      case "Pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div
        ref={modalRef}
        className="bg-white w-full h-full max-w-6xl rounded-xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-20">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className={`font-semibold ${getStatusColor(Status)}`}>
                {Status || "Pending"}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{UserName || author}</span>
              {published_date && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{published_date}</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xl text-gray-600" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6">
          {/* IMAGE */}
          {image && (
            <div className="w-full flex justify-center">
              <img
                src={resolveImageUrl(image)}
                alt={title}
                className="max-h-[420px] w-auto rounded-lg shadow-md object-contain"
              />
            </div>
          )}

          {/* AUTHOR CARD */}
          <div className="flex flex-col items-center text-center bg-gray-50 rounded-lg py-4 shadow-sm">
            <TbUserSquareRounded className="text-3xl text-gray-500 mb-1" />
            <span className="font-medium text-gray-700">
              {UserName || author}
            </span>
            <p
              className={`mt-1 text-sm font-semibold ${
                allowRepost ? "text-green-600" : "text-red-600"
              }`}
            >
              {allowRepost ? "Repost Allowed" : "Repost Not Allowed"}
            </p>
          </div>

          {/* BLOG CONTENT */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="prose max-w-none">
              <JoditEditor
                ref={editorRef}
                value={content}
                config={{
                  readonly: true,
                  toolbar: false,
                  statusbar: false,
                  iframe: true,
                  showCharsCounter: false,
                  showWordsCounter: false,
                }}
                tabIndex={1}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-white flex justify-between items-center">
          <div className="flex gap-3">
            {user.isAdmin == "1" && Status === "Pending" && (
              <>
                <button
                  onClick={() => handleAction("approve")}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction("reject")}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow"
                >
                  Reject
                </button>
              </>
            )}

            {user.isAdmin == "1" &&
              (Status === "Approved" || Status === "Rejected") && (
                <button
                  onClick={() => handleAction("delete")}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow"
                >
                  Delete
                </button>
              )}
          </div>

          <button
            onClick={closeModal}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogModal;

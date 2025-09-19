import React, { useContext } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TbUserSquareRounded } from "react-icons/tb";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import ApiContext from "../context/ApiContext";
import { FiRepeat } from "react-icons/fi";


const PublicBlogModal = ({ blog, closeModal, updateBlogState, refreshBlogs }) => {
  const { title, image, author, AuthAdd, published_date, content, Status, BlogID, RepostUser } =
    blog || {};
  const { fetchData, userToken, user } = useContext(ApiContext);
  const navigate = useNavigate();
  console.log("user is", user);

  const handleProfileClick = (userData, e) => {
    e.stopPropagation();
    if (userData?.id) {
      handleProfileRedirect(userData.id, navigate);
    } else {
      console.error("Invalid User ID:", userData);
    }
  };

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
          confirmButtonText: "OK",
        });

        if (typeof updateBlogState === "function") {
          updateBlogState(blogId, Status);
        } else {
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

  const handleRepost = async () => {
    const endpoint = "blog/blogpost"; // adjust to your API route
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    const body = {
      title,           // keep same title or allow editing before repost
      author: user.Name,
      content,
      image,
      category: blog.Category,
      publishedDate: new Date(),
      repostId: BlogID,
    };

    try {
      const result = await fetchData(endpoint, method, body, headers);
      if (result.success) {
        Swal.fire({
          title: "Success!",
          text: "Blog reposted successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
        if (refreshBlogs) {
          refreshBlogs();
        }
        closeModal();
      } else {
        Swal.fire("Error!", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    }
  };


  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-white p-6 rounded-xl w-full max-w-4xl max-h-[90vh] relative overflow-y-auto shadow-2xl"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-500 hover:text-gray-700 text-2xl absolute top-4 right-4 transition-colors duration-200 z-10"
            onClick={closeModal}
          >
            <FontAwesomeIcon icon={faXmark} />
          </motion.button>

          <div className="flex flex-col items-center h-full">
            <div className="w-full mb-8">
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full rounded-xl shadow-lg object-cover h-64 md:h-80"
                src={image}
                alt={title}
              />
              {RepostUser && RepostUser.Name && (
                <motion.span
                  className="absolute top-4 left-4 bg-DGXgreen text-black px-3 py-1 rounded-full text-sm font-semibold shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Repost
                </motion.span>
              )}
            </div>

            <div className="w-full px-4">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-800"
              >
                {title}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6 flex flex-col items-center"
              >
                <div className="flex items-center gap-3 mb-2">
                  <TbUserSquareRounded className="text-indigo-600 text-3xl" />
                  <span className="text-gray-600 font-medium">{AuthAdd || author || "Unknown author"}</span>
                </div>
                {RepostUser && RepostUser.Name && (
                  <div className="flex items-center gap-2 text-sm text-DGXgreen font-medium">
                    <FiRepeat className="text-DGXgreen" />
                    <span>Reposted from {RepostUser.Name}</span>
                  </div>
                )}
                <p className="text-gray-500 text-sm">{published_date}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-justify text-gray-700 leading-relaxed space-y-4 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-4 mt-8 pb-4"
              >
                {user.isAdmin == "1" && Status === "Pending" && (
                  <>
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                      onClick={() => handleAction("approve")}
                    >
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                      onClick={() => handleAction("reject")}
                    >
                      Reject
                    </motion.button>

                  </>
                )}
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                  className="bg-DGXblue hover:bg-DGXgreen text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRepost}
                  className="bg-DGXgreen hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                >
                  <FiRepeat className="inline mr-2" />
                  Repost
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PublicBlogModal;

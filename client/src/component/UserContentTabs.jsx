import React from "react";
import { FaArrowRight, FaTrash, FaEdit } from "react-icons/fa";
import AddUserEvent from "./AddUserEvent.jsx";
import AddUserBlog from "./AddUserBlog.jsx";
import UserQuiz from "./UserQuiz.jsx";
import ChangePassword from "./ChangePassword.jsx";
import moment from "moment";

const UserContentTabs = ({
  activeTab,
  userDisscussions,
  stripHtmlTags,
  handleClickDiscussion,
  handleDeleteDiscussion,
  events,
  totalEventsCount,
  setEvents,
  blogs,
  setBlogs,
  quiz,
  setQuiz,
  userBlogCount,
  setDiscussionToEdit,
  setEditModalIsOpen,
  user,
  profileImage,
}) => {
  console.log("Events :", events);
  const handleEditDiscussion = (discussion) => {
    setDiscussionToEdit(discussion);
    setEditModalIsOpen(true);
  };

  const UPLOADS_BASE_URL = import.meta.env.VITE_API_UPLOADSURL;

  return (
    <div className="w-full bg-white rounded-xl shadow-lg mx-auto p-4 sm:p-6">
      {activeTab === "posts" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              My Discussions
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {userDisscussions.length}{" "}
              {userDisscussions.length === 1 ? "Post" : "Posts"}
            </span>
          </div>

          {userDisscussions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {userDisscussions.map((discussion, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  {/* Image Section */}
                  <div className="w-full h-48 bg-gray-100 overflow-hidden">
                    {discussion.DiscussionImagePath ? (
                      <img
                        src={
                          discussion.DiscussionImagePath
                            ? `${UPLOADS_BASE_URL}/${discussion.DiscussionImagePath}`
                            : discussion.Image
                        }
                        alt={discussion.Title || "Discussion Image"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                      {discussion.Title || "Untitled"}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">
                      {stripHtmlTags(discussion.Content) ||
                        "No description available"}
                    </p>

                    {/* Engagement Metrics */}
                    <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">
                            {discussion.likeCount || 0}
                          </span>
                          <span>Likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">
                            {discussion.commentCount || 0}
                          </span>
                          <span>Comments</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">
                          {discussion.repostCount || 0}
                        </span>
                        <span>Reposts</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      Created:{" "}
                      {discussion.timestamp
                        ? moment(discussion.timestamp).format("MMMM D, YYYY")
                        : "No date available"}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleClickDiscussion(discussion)}
                          className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm"
                        >
                          Read more
                          <FaArrowRight className="ml-1" />
                        </button>
                        <button
                          onClick={() => handleEditDiscussion(discussion)}
                          className="flex items-center text-green-600 hover:text-green-800 font-medium transition-colors text-sm"
                        >
                          Edit
                          <FaEdit className="ml-1" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteDiscussion(discussion)}
                        className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                        aria-label="Delete post"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">
                You haven't created any posts yet.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              My Events
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {totalEventsCount} {totalEventsCount === 1 ? "Event" : "Events"}
            </span>
          </div>
          <AddUserEvent events={events} setEvents={setEvents} />
        </div>
      )}

      {activeTab === "blogs" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              My Blogs
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {userBlogCount !== undefined ? userBlogCount : blogs.length}{" "}
              {userBlogCount === 1 ? " Blog" : " Blogs"}
            </span>
          </div>
          <AddUserBlog blogs={blogs} setBlogs={setBlogs} />
        </div>
      )}

      {activeTab === "quiz" && (
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
            User Quiz
          </h2>
          <UserQuiz quiz={quiz} setQuiz={setQuiz} />
        </div>
      )}

      {activeTab === "password" && (
        <div className="space-y-6">
          <ChangePassword />
        </div>
      )}
    </div>
  );
};

export default UserContentTabs;

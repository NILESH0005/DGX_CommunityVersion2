import React, { useState } from "react";
import { FaArrowRight, FaTrash, FaEdit } from "react-icons/fa";
import AddUserEvent from "./AddUserEvent.jsx";
import AddUserBlog from "./AddUserBlog.jsx";
import UserQueriesTable from "./UserQueriesTable.jsx";
import UserQuiz from "./UserQuiz.jsx";
import ChangePassword from "./ChangePassword.jsx";
import moment from "moment";
import { AiFillLike } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import { FiRepeat, FiXCircle, FiCheckCircle } from "react-icons/fi";

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
  queries,
  setQueries,
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
                  {/* <div className="w-full h-48 bg-gray-100 overflow-hidden">
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
                  </div> */}

                  {/* Content Section */}
                  <div
                    className="relative flex flex-col flex-grow p-5 rounded-2xl bg-white border border-gray-100 shadow-sm 
                hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Gradient Accent */}
                    <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-DGXblue via-DGXgreen to-DGXblue" />

                    {/* Title */}
                    <h3 className="mt-2 text-lg font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[3.5rem]">
                      {discussion.Title || "Untitled"}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3 flex-grow">
                      {stripHtmlTags(discussion.Content) ||
                        "No description available"}
                    </p>

                    {/* Divider */}
                    <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                    {/* Engagement Metrics */}
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      {/* Likes & Comments */}
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-1.5">
                          <AiFillLike className="w-4 h-4 text-DGXblue" />
                          <span className="font-semibold text-gray-800">
                            {discussion.likeCount || 0}
                          </span>
                          <span className="text-gray-400">Likes</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <FaComment className="w-4 h-4 text-DGXgreen" />
                          <span className="font-semibold text-gray-800">
                            {discussion.commentCount || 0}
                          </span>
                          <span className="text-gray-400">Comments</span>
                        </div>
                      </div>

                      {/* Repost */}
                      <div className="relative group flex items-center gap-1.5">
                        {discussion.allowRepost ? (
                          <FiRepeat className="w-4 h-4 text-DGXblue group-hover:rotate-180 transition-transform duration-300" />
                        ) : (
                          <FiXCircle className="w-4 h-4 text-red-400" />
                        )}

                        <span className="font-semibold text-gray-800">
                          {discussion.repostCount || 0}
                        </span>

                        {/* Tooltip */}
                        <div
                          className="absolute -top-7 left-5/2 -translate-x-1/2 -translate-x-550
  bg-gray-900 text-white text-[9px] pl-1 pr-1.5 py-0.5 rounded
  opacity-0 group-hover:opacity-100 transition-all duration-200
  whitespace-nowrap shadow-sm"
                        >
                          {discussion.allowRepost
                            ? "Repost Allowed"
                            : "Repost Not Allowed"}
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mt-3 text-[11px] text-gray-500">
                      Created on{" "}
                      <span className="font-medium text-gray-700">
                        {discussion.timestamp
                          ? moment(discussion.timestamp).format("MMMM D, YYYY")
                          : "No date available"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleClickDiscussion(discussion)}
                          className="flex items-center gap-1 text-sm font-medium text-DGXblue 
                   hover:text-DGXblue/80 transition-colors"
                        >
                          Read more
                          <FaArrowRight />
                        </button>

                        <button
                          onClick={() => handleEditDiscussion(discussion)}
                          className="flex items-center gap-1 text-sm font-medium text-green-600 
                   hover:text-green-700 transition-colors"
                        >
                          Edit
                          <FaEdit />
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteDiscussion(discussion)}
                        className="p-2 rounded-full text-gray-400 hover:text-red-600 
                 hover:bg-red-50 transition-colors"
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
      {activeTab === "queries" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              My Queries
            </h2>

            <span className="px-3 py-1 bg-DGXgreen/20 text-DGXblue rounded-full text-sm font-medium">
              {queries.length} {queries.length === 1 ? "Query" : "Queries"}
            </span>
          </div>

          <UserQueriesTable
            queries={queries}
            onRemove={(id) =>
              setQueries((prev) => prev.filter((q) => q.id !== id))
            }
          />
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

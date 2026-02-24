import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import UserProfileChart from "./UserProfileChart";
import {
  FaArrowRight,
  FaEdit,
  FaUsers,
  FaPoll,
  FaTrash,
  FaQuestionCircle,
} from "react-icons/fa";
import { GoCommentDiscussion } from "react-icons/go";
import {
  FaArrowTrendDown,
  FaArrowTrendUp,
  FaEllipsisVertical,
  FaPersonWalkingDashedLineArrowRight,
} from "react-icons/fa6";
import { images } from "../../public/index.js";
import ChangePassword from "./ChangePassword.jsx";
import { CgProfile } from "react-icons/cg";
import { MdEventAvailable } from "react-icons/md";
import { CgPassword } from "react-icons/cg";
import { SlLogout } from "react-icons/sl";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import ApiContext from "../context/ApiContext.jsx";
import { LiaBlogSolid } from "react-icons/lia";
import LoadPage from "./LoadPage.jsx";
import EditProfileModal from "./EditProfileModal";
import DiscussionModal from "./discussion/DiscussionModal.jsx";
import AddUserEvent from "./AddUserEvent.jsx";
import AddUserBlog from "./AddUserBlog.jsx";
import UserQuiz from "./UserQuiz.jsx";
import UserContentTabs from "./UserContentTabs";
import UserAvatar from "./UserAvatar";
import EditDiscussionModal from "./EditDiscussionModal.jsx";
import PersonalInfoSection from "./PersonalInfoSection";

const UserProfile = (props) => {
  console.log("what is in props", props.totalEventsCount);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user, userToken, fetchData, setUserToken, setUser } =
    useContext(ApiContext); // Add setUser from context
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState(
    images.NvidiaBackground,
  );
  const BASE_URL = import.meta.env.VITE_API_UPLOADSURL;
  const [userDisscussions, setUserDisscussion] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [discussionToEdit, setDiscussionToEdit] = useState(null);
  const [localUser, setLocalUser] = useState(user); // Add local user state
  const [queries, setQueries] = useState([
  {
    id: 1,
    module: "AI & Machine Learning",
    submodule: "Computer Vision",
    unit: "Object Detection",
    file: "YOLOv8.pdf",
    queryCreator: "Nilesh Thakur",
    queryText:
      "How can we optimize YOLOv8 for low-latency edge deployment? I am working on a project that requires real-time object detection on edge devices.",
    date: "23 Feb 2026",
    status: "Pending",
  },
  {
    id: 2,
    module: "Cloud Computing",
    submodule: "AWS Services",
    unit: "Lambda Functions",
    file: "serverless-architecture.pdf",
    queryCreator: "Nilesh Thakur",
    queryText:
      "What are the best practices for managing cold starts in AWS Lambda functions?",
    date: "22 Feb 2026",
    status: "Completed",
  },
  {
    id: 3,
    module: "Cloud Computing",
    submodule: "Kubernetes",
    unit: "Container Orchestration",
    file: "k8s-best-practices.pdf",
    queryCreator: "Nilesh Thakur",
    queryText:
      "What are the best practices for implementing horizontal pod autoscaling in Kubernetes?",
    date: "13 Feb 2026",
    status: "Pending",
  },
  {
    id: 4,
    module: "AI & Machine Learning",
    submodule: "Deep Learning",
    unit: "Neural Networks",
    file: "backpropagation.pdf",
    queryCreator: "Nilesh Thakur",
    queryText:
      "Can you explain how backpropagation works in neural networks with a simple example?",
    date: "12 Feb 2026",
    status: "Completed",
  },
]);
  // Sync localUser with context user
  useEffect(() => {
    if (user) {
      setLocalUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (localUser?.ProfilePicture) {
      // Add base URL to profile picture path
      const fullProfilePictureUrl = `${BASE_URL}/${localUser.ProfilePicture}`;

      const fetchProfileImage = async () => {
        try {
          const response = await fetch(fullProfilePictureUrl);
          if (response.ok) {
            const blob = await response.blob();
            setProfileImage(URL.createObjectURL(blob));
          }
        } catch (error) {
          console.error("Error fetching profile image:", error);
          setProfileImage(null);
        }
      };
      fetchProfileImage();
    } else {
      setProfileImage(null);
    }
  }, [localUser, BASE_URL]);

  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const handleUpdateDiscussion = async (updatedDiscussion) => {
    try {
      // Validate required fields
      if (!updatedDiscussion.DiscussionID) {
        throw new Error("Discussion ID is missing");
      }

      if (!updatedDiscussion.Title || !updatedDiscussion.Content) {
        throw new Error("Title and content are required");
      }

      const endpoint = "discussion/updateDiscussion";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const body = {
        reference: updatedDiscussion.DiscussionID,
        title: updatedDiscussion.Title,
        content: updatedDiscussion.Content,
        tags: updatedDiscussion.Tag || "",
        url: updatedDiscussion.ResourceUrl || "",
        image: updatedDiscussion.Image
          ? `${BASE_URL}${updatedDiscussion.Image}`
          : null,
        visibility: updatedDiscussion.Visibility || "public",
      };

      setLoading(true);

      const response = await fetchData(endpoint, method, body, headers);

      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to update the discussion");
      }

      // Only update user discussions (no demo discussions in this component)
      setUserDisscussion((prevDiscussions) =>
        prevDiscussions.map((d) =>
          d.DiscussionID === updatedDiscussion.DiscussionID
            ? updatedDiscussion
            : d,
        ),
      );

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "The discussion has been updated successfully.",
      });

      setEditModalIsOpen(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (eventOrUrl) => {
    if (typeof eventOrUrl === "string") {
      setBackgroundImage(eventOrUrl);
    } else if (eventOrUrl.target && eventOrUrl.target.files) {
      const file = eventOrUrl.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setBackgroundImage(imageUrl);
      }
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out",
    }).then((result) => {
      if (result.isConfirmed) {
        Cookies.remove("userToken");
        setUserToken(null);
        navigate("/");
      }
    });
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleClickDiscussion = (discussion) => {
    setSelectedDiscussion(discussion);
    setModalIsOpen(true);
  };

  // Function to refresh user data from server
  const refreshUserData = async () => {
    try {
      const endpoint = "userprofile/getUserDetails";
      const method = "POST";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };
      const body = {};

      const result = await fetchData(endpoint, method, body, headers);
      if (result && result.data) {
        const updatedUser = result.data;
        setLocalUser(updatedUser);

        // Also update the context user if setUser is available
        if (setUser) {
          setUser(updatedUser);
        }

        return updatedUser;
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  // Function to handle profile image update
  const handleProfileImageUpdate = (imageUrl) => {
    // Update local user state with new profile picture
    if (localUser) {
      const updatedUser = {
        ...localUser,
        ProfilePicture: imageUrl.replace(`${BASE_URL}/`, ""),
      };
      setLocalUser(updatedUser);

      // Also update context if available
      if (setUser) {
        setUser(updatedUser);
      }
    }
  };

  useEffect(() => {
    const fetchUserDisscussions = () => {
      try {
        const endpoint = "userprofile/getUserDiscussion";
        const method = "POST";
        const body = {};
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };

        if (userToken) {
          setLoading(true);
          fetchData(endpoint, method, body, headers)
            .then((result) => {
              console.log("Raw API responseee:", result);
              if (result && result.data) {
                return result.data;
              } else {
                throw new Error("Invalid data format");
              }
            })
            .then((data) => {
              console.log("Parsed data:", data);
              setLoading(false);
              const discussionsWithFullUrls = data.updatedDiscussions.map(
                (discussion) => ({
                  ...discussion,
                  Image: discussion.Image
                    ? `${BASE_URL}/${discussion.Image}`
                    : null,
                }),
              );
              setUserDisscussion(discussionsWithFullUrls);
            })
            .catch((error) => {
              setLoading(false);
              console.log(`Something went wrong: ${error.message}`);
            });
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (userToken && localUser) {
      setIsLoggedIn(true);
      fetchUserDisscussions();
    }
  }, [localUser, userToken, fetchData, BASE_URL]);

  console.log("localUser", localUser);

  const handleDeleteDiscussion = async (discussion) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!",
    });

    if (result.isConfirmed) {
      try {
        const endpoint = "discussion/deleteDiscussion";
        const method = "POST";
        const headers = {
          "Content-Type": "application/json",
          "auth-token": userToken,
        };
        const body = { discussionId: discussion.DiscussionID };

        const response = await fetchData(endpoint, method, body, headers);
        if (response && response.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The discussion has been deleted.",
            showConfirmButton: false,
            timer: 1500,
          });

          setUserDisscussion((prevDiscussions) =>
            prevDiscussions.filter(
              (d) => d.DiscussionID !== discussion.DiscussionID,
            ),
          );
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

  useEffect(() => {
    console.log("Updated events received in UserProfile:", props.events);
  }, [props.events]);

  return !isLoggedIn ? (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 overflow-hidden">
        {/* Gradient Accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-DGXblue via-DGXgreen to-DGXblue" />

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-DGXblue/10 text-DGXblue">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.75 9V5.25A3.75 3.75 0 0012 1.5a3.75 3.75 0 00-3.75 3.75V9m-.75 0h9a2.25 2.25 0 012.25 2.25v8.25A2.25 2.25 0 0116.5 21h-9A2.25 2.25 0 015.25 19.5v-8.25A2.25 2.25 0 017.5 9z"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Login Required
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Please sign in to view discussions, post comments, and interact with
          the community.
        </p>

        {/* Action */}
        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 rounded-full bg-gradient-to-r from-DGXblue to-DGXgreen text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          Continue to Login
        </button>

        {/* Secondary */}
        <p className="text-xs text-gray-500 text-center mt-4">
          New here?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-DGXblue font-medium cursor-pointer hover:underline"
          >
            Create an account
          </span>
        </p>
      </div>
    </div>
  ) : loading ? (
    <LoadPage />
  ) : (
    <div className="bg-DGXwhite p-2 sm:p-4 md:p-6 lg:p-8">
      {modalIsOpen && selectedDiscussion && (
        <DiscussionModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          discussion={selectedDiscussion}
        />
      )}
      {editModalIsOpen && discussionToEdit && (
        <EditDiscussionModal
          isOpen={editModalIsOpen}
          onRequestClose={() => setEditModalIsOpen(false)}
          discussion={discussionToEdit}
          onUpdate={handleUpdateDiscussion}
        />
      )}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left Sidebar - Profile Section */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
          <UserAvatar
            user={localUser}
            handleImageChange={handleImageChange}
            profileImage={profileImage}
            onImageUpdate={handleProfileImageUpdate} // Pass callback
            refreshUserData={refreshUserData} // Pass refresh function
          />

          <div className="flex flex-col gap-4">
            {/* Navigation Menu */}
            <div className="bg-DGXwhite rounded-lg shadow-xl p-4 border border-DGXgreen">
              <ul className="space-y-2">
                {/* My Discussions */}
                <li>
                  <div
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${
                      activeTab === "posts"
                        ? "bg-DGXgreen/40"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("posts")}
                  >
                    <GoCommentDiscussion className="mr-3 text-lg md:text-xl" />
                    <span
                      className={`text-sm md:text-base ${
                        activeTab === "posts" ? "text-DGXblue font-bold" : ""
                      }`}
                    >
                      My Discussions
                    </span>
                  </div>
                </li>

                {/* My Events */}
                <li>
                  <div
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${
                      activeTab === "events"
                        ? "bg-DGXgreen/40"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("events")}
                  >
                    <MdEventAvailable className="mr-3 text-lg md:text-xl" />
                    <span
                      className={`text-sm md:text-base ${
                        activeTab === "events" ? "text-DGXblue font-bold" : ""
                      }`}
                    >
                      My Events
                    </span>
                  </div>
                </li>

                {/* My Blogs */}
                <li>
                  <div
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${
                      activeTab === "blogs"
                        ? "bg-DGXgreen/40"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("blogs")}
                  >
                    <LiaBlogSolid className="mr-3 text-lg md:text-xl" />
                    <span
                      className={`text-sm md:text-base ${
                        activeTab === "blogs" ? "text-DGXblue font-bold" : ""
                      }`}
                    >
                      My Blogs
                    </span>
                  </div>
                </li>
                <li>
                  <div
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${
                      activeTab === "queries"
                        ? "bg-DGXgreen/40"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("queries")}
                  >
                    <FaQuestionCircle className="mr-3 text-lg md:text-xl" />
                    <span
                      className={`text-sm md:text-base ${
                        activeTab === "queries" ? "text-DGXblue font-bold" : ""
                      }`}
                    >
                      My Queries
                    </span>
                  </div>
                </li>

                {/* Quiz Dashboard */}
                <li>
                  <div
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${
                      activeTab === "quiz"
                        ? "bg-DGXgreen/40"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("quiz")}
                  >
                    <FaPoll className="mr-3 text-lg md:text-xl" />
                    <span
                      className={`text-sm md:text-base ${
                        activeTab === "quiz" ? "text-DGXblue font-bold" : ""
                      }`}
                    >
                      Quiz Dashboard
                    </span>
                  </div>
                </li>

                {/* Change Password */}
                <li>
                  <div
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${
                      activeTab === "password"
                        ? "bg-DGXgreen/40"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("password")}
                  >
                    <CgPassword className="mr-3 text-lg md:text-xl" />
                    <span
                      className={`text-sm md:text-base ${
                        activeTab === "password" ? "text-DGXblue font-bold" : ""
                      }`}
                    >
                      Change Password
                    </span>
                  </div>
                </li>

                {/* Logout */}
                <li>
                  <div
                    className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <SlLogout className="mr-3 text-lg md:text-xl" />
                    <span className="text-sm md:text-base">Logout</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Personal Info Section */}
            <PersonalInfoSection
              user={localUser}
              userToken={userToken}
              fetchData={fetchData}
              onProfileUpdate={refreshUserData}
              setLocalUser={setLocalUser} // Pass setter function
            />
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-full lg:w-2/3">
          <UserContentTabs
            activeTab={activeTab}
            userDisscussions={userDisscussions}
            stripHtmlTags={stripHtmlTags}
            handleClickDiscussion={handleClickDiscussion}
            handleDeleteDiscussion={handleDeleteDiscussion}
            events={props.events}
            setEvents={props.setEvents}
            totalEventsCount={props.totalEventsCount}
            blogs={props.blogs}
            setBlogs={props.setBlogs}
            quiz={props.quiz}
            setQuiz={props.setQuiz}
            setDiscussionToEdit={setDiscussionToEdit}
            setEditModalIsOpen={setEditModalIsOpen}
            queries={queries} 
            setQueries={setQueries}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

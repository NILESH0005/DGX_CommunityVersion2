import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import UserProfileChart from "./UserProfileChart";
import { FaArrowRight, FaEdit, FaUsers, FaPoll, FaTrash } from "react-icons/fa";
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
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user, userToken, fetchData, setUserToken } = useContext(ApiContext);
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState(
    images.NvidiaBackground
  );
  const [userDisscussions, setUserDisscussion] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [discussionToEdit, setDiscussionToEdit] = useState(null);

  useEffect(() => {
    if (user?.ProfilePicture) {
      const fetchProfileImage = async () => {
        try {
          const response = await fetch(user.ProfilePicture);
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
    }
  }, [user]);

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
        image: updatedDiscussion.Image || null,
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
            : d
        )
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
      confirmButtonText: "Yes, log out"
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
              console.log("Raw API response:", result);
              if (result && result.data) {
                return result.data;
              } else {
                throw new Error("Invalid data format");
              }
            })
            .then((data) => {
              console.log("Parsed data:", data);
              setLoading(false);
              setUserDisscussion(data.updatedDiscussions);
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

    if (userToken && user) {
      setIsLoggedIn(true);
      fetchUserDisscussions();
    }
  }, [user, userToken, fetchData]);

  console.log("user", user);

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
          });

          setUserDisscussion((prevDiscussions) =>
            prevDiscussions.filter(
              (d) => d.DiscussionID !== discussion.DiscussionID
            )
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

  return !isLoggedIn ? (
    <h1>login?</h1>
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
            user={user}
            handleImageChange={handleImageChange}
            profileImage={profileImage}
          />

          <div className="flex flex-col gap-4">
            {/* Navigation Menu */}
            <div className="bg-DGXwhite rounded-lg shadow-xl p-4 border border-DGXgreen">
              <ul className="space-y-2">
                <div
                  className={`flex items-center p-3 rounded-lg cursor-pointer ${
                    activeTab === "posts"
                      ? "bg-DGXgreen/40"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("posts")}
                >
                  <GoCommentDiscussion className="mr-3 text-lg md:text-xl" />
                  <li
                    className={`text-sm md:text-base ${
                      activeTab === "posts" ? "text-DGXblue font-bold" : ""
                    }`}
                  >
                    My Discussions
                  </li>
                </div>
                <div
                  className={`flex items-center p-3 rounded-lg cursor-pointer ${
                    activeTab === "events"
                      ? "bg-DGXgreen/40"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("events")}
                >
                  <MdEventAvailable className="mr-3 text-lg md:text-xl" />
                  <li
                    className={`text-sm md:text-base ${
                      activeTab === "events" ? "text-DGXblue font-bold" : ""
                    }`}
                  >
                    My Events
                  </li>
                </div>
                <div
                  className={`flex items-center p-3 rounded-lg cursor-pointer ${
                    activeTab === "blogs"
                      ? "bg-DGXgreen/40"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("blogs")}
                >
                  <LiaBlogSolid className="mr-3 text-lg md:text-xl" />
                  <li
                    className={`text-sm md:text-base ${
                      activeTab === "blogs" ? "text-DGXblue font-bold" : ""
                    }`}
                  >
                    My Blogs
                  </li>
                </div>
                <div
                  className={`flex items-center p-3 rounded-lg cursor-pointer ${
                    activeTab === "quiz"
                      ? "bg-DGXgreen/40"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("quiz")}
                >
                  <FaPoll className="mr-3 text-lg md:text-xl" />
                  <li
                    className={`text-sm md:text-base ${
                      activeTab === "quiz" ? "text-DGXblue font-bold" : ""
                    }`}
                  >
                    Quiz Dashboard
                  </li>
                </div>
                <div
                  className={`flex items-center p-3 rounded-lg cursor-pointer ${
                    activeTab === "password"
                      ? "bg-DGXgreen/40"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("password")}
                >
                  <CgPassword className="mr-3 text-lg md:text-xl" />
                  <li
                    className={`text-sm md:text-base ${
                      activeTab === "password" ? "text-DGXblue font-bold" : ""
                    }`}
                  >
                    Change Password
                  </li>
                </div>
                <div
                  className={`flex items-center p-3 rounded-lg cursor-pointer ${
                    activeTab === "logout"
                      ? "bg-DGXgreen/40"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={handleLogout}
                >
                  <SlLogout className="mr-3 text-lg md:text-xl" />
                  <li
                    className={`text-sm md:text-base ${
                      activeTab === "logout" ? "text-DGXblue font-bold" : ""
                    }`}
                  >
                    Logout
                  </li>
                </div>
              </ul>
            </div>

            {/* Personal Info Section */}
            <PersonalInfoSection 
              user={user} 
              userToken={userToken} 
              fetchData={fetchData} 
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
            blogs={props.blogs}
            setBlogs={props.setBlogs}
            quiz={props.quiz}
            setQuiz={props.setQuiz}
            setDiscussionToEdit={setDiscussionToEdit}
            setEditModalIsOpen={setEditModalIsOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
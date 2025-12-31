import { useState, useEffect, useContext } from "react";
import {
  Heart,
  MessageCircle,
  Calendar,
  Grid3X3,
  List,
  Search,
  Bookmark,
  ArrowLeft,
  Repeat,
  Star,
  Share2,
  Eye,
  Clock,
  Tag,
  MoreHorizontal,
  User,
  Zap,
  TrendingUp,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ApiContext from "../context/ApiContext";
import Noimage from "../assets/No_Image_Available.jpg";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchData } = useContext(ApiContext);
  const userId = id;

  // Add base uploads URL from environment variable
  const baseUploadsUrl = import.meta.env.VITE_API_UPLOADSURL;

  const [activeTab, setActiveTab] = useState("blogs");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [userData, setUserData] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("User Data:", userData);
    console.log("Discussions:", discussions);
    console.log("First discussion UserID:", discussions[0]?.UserID);
  }, [userData, discussions]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Check if it's already a full URL
    if (
      imagePath.includes(baseUploadsUrl) ||
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://") ||
      imagePath.startsWith("//")
    ) {
      return imagePath;
    }

    return `${baseUploadsUrl}/${imagePath}`;
  };

  // Helper function to get profile image URL
  const getProfileImageUrl = (userData) => {
    const profilePic =
      userData?.ProfilePicture ||
      userData?.profilePicture ||
      userData?.UserImage;

    if (!profilePic) {
      return Noimage; // Use your imported default image
    }

    if (profilePic.startsWith("http") || profilePic.startsWith("//")) {
      return profilePic;
    }

    if (profilePic.includes("uploads/")) {
      return `${baseUploadsUrl}/${profilePic}`;
    }

    if (profilePic.includes(baseUploadsUrl)) {
      return profilePic;
    }

    return `${baseUploadsUrl}/uploads/${profilePic}`;
  };

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = `userprofile/profile/${userId}`;
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
      };

      console.log("Fetching user profile for ID:", userId);

      const response = await fetchData(endpoint, method, headers);

      // Check if response is valid and has the expected structure
      console.log("API Response:", response);

      // Handle different possible response structures
      if (response && (response.success || response.data || response.user)) {
        // The data might be in different places depending on API structure
        const userData =
          response.data?.user || response.user || response.data || {};
        const userBlogs = response.data?.blogs || response.blogs || [];
        const userDiscussions =
          response.data?.discussions || response.discussions || [];

        console.log("User data:", userData);
        console.log("Blogs:", userBlogs);
        console.log("Discussions:", userDiscussions);

        setUserData({
          ProfilePicture: getProfileImageUrl(userData), // Use helper function
          UserDescription:
            userData.UserDescription ||
            userData.userDescription ||
            "No description available.",
          Name: userData.Name || userData.name || "Unknown User",
          AddOnDt: userData.AddOnDt || userData.addOnDt || null,
          EmailId: userData.EmailId || userData.emailId || "No email available",
        });

        // Process blogs with proper image URLs and parse counts
        const processedBlogs = userBlogs.map((blog) => ({
          ...blog,
          image: blog.image ? getFullImageUrl(blog.image) : Noimage,
          LikesCount: parseInt(blog.LikesCount) || 0,
          ViewCount: parseInt(blog.ViewCount) || 0,
          Rating: parseFloat(blog.Rating) || 0,
          RepostCount: parseInt(blog.RepostCount) || 0,
          CommentsCount: parseInt(blog.CommentsCount) || 0,
        }));

        // Process discussions with proper image URLs and parse counts
        const processedDiscussions = userDiscussions.map((discussion) => ({
          ...discussion,
          DiscussionImagePath: discussion.DiscussionImagePath
            ? getFullImageUrl(discussion.DiscussionImagePath)
            : Noimage,
          image: discussion.image ? getFullImageUrl(discussion.image) : Noimage,
          LikesCount: parseInt(discussion.LikesCount) || 0,
          ViewCount: parseInt(discussion.ViewCount) || 0,
          CommentsCount: parseInt(discussion.CommentsCount) || 0,
          RepostCount: parseInt(discussion.RepostCount) || 0,
        }));

        console.log("Processed Blogs:", processedBlogs);
        console.log("Processed Discussions:", processedDiscussions);

        setBlogs(processedBlogs);
        setDiscussions(processedDiscussions);
      } else {
        const errorMsg = response?.message || "Failed to fetch user profile";
        console.error("API Error:", errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError(
        error.message || "Failed to fetch user profile. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) {
      document.documentElement.classList.add("loading");
    } else {
      document.documentElement.classList.remove("loading");
    }
  }, [isLoading]);

  const handleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleSave = (postId) => {
    setSavedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const filteredContent = () => {
    let content = activeTab === "blogs" ? blogs : discussions;

    if (searchQuery) {
      content = content.filter((item) =>
        (item.title || item.Title || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    return content.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = a.AddOnDt ? new Date(a.AddOnDt) : new Date(0);
        const dateB = b.AddOnDt ? new Date(b.AddOnDt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      }
      if (sortBy === "popularity") {
        const popularityA = a.LikesCount || a.likes || 0;
        const popularityB = b.LikesCount || b.likes || 0;
        return popularityB - popularityA;
      }
      return 0;
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">Error</div>
          <div className="text-gray-600 dark:text-gray-300 mb-6">{error}</div>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-DGXgreen to-DGXblue hover:from-DGXblue hover:to-DGXgreen text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 dark:text-gray-300 mb-6">
            User not found
          </div>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-DGXgreen to-DGXblue hover:from-DGXblue hover:to-DGXgreen text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Back Button */}
      {/* <div className="fixed top-6 left-6 z-50">
        <button
          onClick={handleBack}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-3 shadow-2xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 border border-white/20"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div> */}

      {/* Hero Section */}
      <div className="relative">
        <div className="h-72 bg-gradient-to-br from-DGXgreen via-DGXblue to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-DGXblue/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative w-full max-w-[1500px] mx-auto px-8 -mt-36">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/20 w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
              {/* --- Profile Picture Section --- */}
              <div className="relative group">
                <div className="relative w-40 h-40 rounded-2xl border-4 border-white shadow-2xl group-hover:scale-105 transition-all duration-500 overflow-hidden">
                  {userData.ProfilePicture &&
                  userData.ProfilePicture !== Noimage ? (
                    <img
                      src={userData.ProfilePicture}
                      alt={userData.Name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = Noimage;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-DGXgreen to-DGXblue flex items-center justify-center text-white text-5xl font-bold">
                      {userData.Name
                        ? userData.Name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}
                </div>
                {/* Hover overlay effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-DGXgreen/20 to-DGXblue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* --- User Info Section --- */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    {/* Name and verification */}
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                        {userData.Name || "Unknown User"}
                      </h1>
                    </div>

                    {/* Email */}
                    <p className="text-xl text-DGXblue dark:text-DGXblue/80 mb-4 font-medium">
                      {userData.EmailId}
                    </p>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-5xl text-lg leading-relaxed">
                      {userData.UserDescription || "No description available."}
                    </p>

                    {/* Join Date */}
                    <div className="flex flex-wrap items-center gap-6 text-base text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                        <Calendar className="w-5 h-5" />
                        Joined{" "}
                        {userData.AddOnDt
                          ? new Date(userData.AddOnDt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "2-digit",
                              }
                            )
                          : "Unknown date"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-[1500px] mx-auto px-8 py-14">
        {/* --- Enhanced Stats Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {/* Blogs Published */}
          <div className="relative bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 shadow-md border border-blue-100 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                  Blogs
                </p>
                <p className="text-3xl font-bold mt-1 text-black dark:text-white">
                  {blogs.length}
                </p>
              </div>
              <div className="absolute top-4 right-4 opacity-30">
                <BookOpen className="w-10 h-10 text-blue-400 dark:text-blue-300" />
              </div>
            </div>
          </div>

          {/* Discussions */}
          <div className="relative bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-6 shadow-md border border-teal-100 dark:border-teal-800 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                  Discussions
                </p>
                <p className="text-3xl font-bold mt-1 text-black dark:text-white">
                  {discussions.length}
                </p>
              </div>
              <div className="absolute top-4 right-4 opacity-30">
                <MessageSquare className="w-10 h-10 text-teal-400 dark:text-teal-300" />
              </div>
            </div>
          </div>

          {/* Total Views */}
          <div className="relative bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 shadow-md border border-purple-100 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                  Total Views
                </p>
                <p className="text-3xl font-bold mt-1 text-black dark:text-white">
                  {blogs.reduce(
                    (total, blog) => total + (blog.ViewCount || 0),
                    0
                  ) +
                    discussions.reduce(
                      (total, discussion) =>
                        total + (discussion.ViewCount || 0),
                      0
                    )}
                </p>
              </div>
              <div className="absolute top-4 right-4 opacity-30">
                <Eye className="w-10 h-10 text-purple-400 dark:text-purple-300" />
              </div>
            </div>
          </div>

          {/* Total Likes */}
          <div className="relative bg-pink-50 dark:bg-pink-900/20 rounded-2xl p-6 shadow-md border border-pink-100 dark:border-pink-800 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                  Total Likes
                </p>
                <p className="text-3xl font-bold mt-1 text-black dark:text-white">
                  {blogs.reduce(
                    (total, blog) => total + (blog.LikesCount || 0),
                    0
                  ) +
                    discussions.reduce(
                      (total, discussion) =>
                        total + (discussion.LikesCount || 0),
                      0
                    )}
                </p>
              </div>
              <div className="absolute top-4 right-4 opacity-30">
                <Heart className="w-10 h-10 text-pink-400 dark:text-pink-300" />
              </div>
            </div>
          </div>
        </div>

        {/* --- Sticky Tabs and Controls --- */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 -mx-8 px-8 py-4 mb-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs */}
            <div className="inline-flex bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
              {["blogs", "discussions"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm
          transition-all duration-300 ${
            activeTab === tab
              ? "bg-white dark:bg-gray-700 text-DGXblue shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-DGXblue dark:hover:text-DGXblue/80"
          }`}
                >
                  {tab === "blogs" ? (
                    <BookOpen className="w-5 h-5" />
                  ) : (
                    <MessageSquare className="w-5 h-5" />
                  )}
                  {tab === "blogs" ? "Blogs" : "Discussions"}
                </button>
              ))}
            </div>

            {/* Search + Sort + View */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 w-72 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm
          focus:outline-none focus:ring-2 focus:ring-DGXblue transition-all duration-300"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-40 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 
          rounded-lg px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-DGXblue transition-all duration-300"
                >
                  <option value="date">Latest</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>

              {/* View Mode Buttons */}
              <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-md transition-all duration-300 flex items-center justify-center 
          ${
            viewMode === "grid"
              ? "bg-DGXblue text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-DGXblue"
          }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-md transition-all duration-300 flex items-center justify-center 
          ${
            viewMode === "list"
              ? "bg-DGXblue text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-DGXblue"
          }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Content Grid --- */}
        <div className="w-full">
          {activeTab === "blogs" && (
            <ContentGrid
              content={filteredContent()}
              viewMode={viewMode}
              type="blogs"
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
              likedPosts={likedPosts}
              savedPosts={savedPosts}
              handleLike={handleLike}
              handleSave={handleSave}
            />
          )}
          {activeTab === "discussions" && (
            <ContentGrid
              content={filteredContent()}
              viewMode={viewMode}
              type="discussions"
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
              likedPosts={likedPosts}
              savedPosts={savedPosts}
              handleLike={handleLike}
              handleSave={handleSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ContentGrid({
  content,
  viewMode,
  type,
  hoveredCard,
  setHoveredCard,
  likedPosts,
  savedPosts,
  handleLike,
  handleSave,
}) {
  if (content.length === 0) {
    return <EmptyState type={type} />;
  }

  return (
    <div
      className={`grid gap-8 ${
        viewMode === "grid"
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1"
      }`}
    >
      {content.map((item, index) => (
        <ContentCard
          key={index}
          item={item}
          type={type}
          viewMode={viewMode}
          isHovered={hoveredCard === index}
          onHover={() => setHoveredCard(index)}
          onLeave={() => setHoveredCard(null)}
          index={index}
          isLiked={likedPosts ? likedPosts[index] : false}
          isSaved={savedPosts ? savedPosts[index] : false}
          onLike={handleLike ? () => handleLike(index) : null}
          onSave={handleSave ? () => handleSave(index) : null}
        />
      ))}
    </div>
  );
}

function ContentCard({
  item,
  type,
  viewMode,
  isHovered,
  onHover,
  onLeave,
  index,
  isLiked,
  isSaved,
  onLike,
  onSave,
}) {
  const getTitle = () => {
    if (type === "blogs") return item.title || "Untitled Blog";
    if (type === "discussions") return item.Title || "Untitled Discussion";
    return "Untitled";
  };

  const getContent = () => {
    if (type === "blogs") return item.content || "No content available";
    if (type === "discussions") return item.Content || "No content available";
    return "No content available";
  };

  const getImage = () => {
    if (type === "blogs") return item.image;
    if (type === "discussions") return item.DiscussionImagePath || item.image;
    return null;
  };

  const getDate = () => {
    return item.AddOnDt || null;
  };

  const getLikes = () => {
    return item.LikesCount || 0;
  };

  const getComments = () => {
    return item.CommentsCount || 0;
  };

  const getReposts = () => {
    return item.RepostCount || 0;
  };

  const getViews = () => {
    return item.ViewCount || 0;
  };

  const getReadingTime = () => {
    const content = getContent();
    const words = content.split(" ").length;
    return Math.ceil(words / 200);
  };

  const getRating = () => {
    if (type === "blogs") return item.Rating || 0;
    return 0;
  };

  const getTags = () => {
    if (type === "discussions" && item.Tag) {
      if (typeof item.Tag === "string") {
        return item.Tag.split(" ").filter((tag) => tag.startsWith("#"));
      }
      return Array.isArray(item.Tag) ? item.Tag : [item.Tag];
    }
    return [];
  };

  // Function to render engagement metrics
  const renderEngagementMetrics = () => {
    const metrics = [
      {
        icon: Eye,
        value: getViews(),
        color: "text-blue-500",
        tooltip: "Views",
      },
      {
        icon: Heart,
        value: getLikes(),
        color: isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400",
        tooltip: "Likes",
      },
    ];

    // Add different metrics based on type
    if (type === "blogs") {
      metrics.push(
        {
          icon: Star,
          value: getRating(),
          color: "text-yellow-500",
          tooltip: "Rating",
        },
        {
          icon: Repeat,
          value: getReposts(),
          color: "text-purple-500",
          tooltip: "Reposts",
        }
      );
    } else {
      metrics.push(
        {
          icon: MessageCircle,
          value: getComments(),
          color: "text-green-500",
          tooltip: "Comments",
        },
        {
          icon: Repeat,
          value: getReposts(),
          color: "text-purple-500",
          tooltip: "Reposts",
        }
      );
    }

    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 text-sm transition-all duration-300 group ${metric.color}`}
              title={metric.tooltip}
            >
              <metric.icon className="w-4 h-4" />
              <span className="font-medium">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Function to format the content without HTML tags
  const getPlainTextContent = () => {
    const content = getContent();
    if (!content) return "No content available";

    // Remove HTML tags and limit length
    const plainText = content.replace(/<[^>]*>/g, "");
    return plainText.length > 200
      ? plainText.substring(0, 200) + "..."
      : plainText;
  };

  return (
    <div
      className={`group cursor-pointer transition-all duration-500 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-DGXblue/20 ${
        isHovered ? "scale-105 shadow-2xl border-DGXblue/30" : "shadow-lg"
      } ${viewMode === "list" ? "flex flex-row" : ""}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Image Section */}
      {getImage() && getImage() !== Noimage && (
        <div
          className={`relative overflow-hidden ${
            viewMode === "grid" ? "h-56" : "h-48 w-64 flex-shrink-0"
          }`}
        >
          <img
            src={getImage()}
            alt={getTitle()}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = Noimage;
            }}
          />
        </div>
      )}

      {/* Content Section */}
      <div className="p-7 flex flex-col justify-between h-[350px] overflow-hidden">
        {/* Title */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3
              className="font-bold text-2xl leading-snug text-gray-900 dark:text-white 
                     group-hover:text-DGXblue dark:group-hover:text-DGXblue/80 
                     transition-colors duration-300 flex-1 line-clamp-2"
            >
              {getTitle()}
            </h3>
          </div>

          {/* Content Preview */}
          <div
            className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 mb-5 opacity-90 
                 group-hover:opacity-100 transition-opacity duration-300"
          >
            {getPlainTextContent()}
          </div>

          {/* Tags */}
          {getTags().length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {getTags()
                .slice(0, 3)
                .map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-flex items-center gap-1 text-xs font-medium 
                         bg-gradient-to-r from-DGXblue/10 to-DGXgreen/10 
                         text-DGXblue dark:text-DGXblue/80 px-3 py-1.5 
                         rounded-full hover:from-DGXblue/20 hover:to-DGXgreen/20 
                         transition-colors duration-300"
                  >
                    <Tag className="w-3 h-3" />
                    {tag.replace("#", "")}
                  </span>
                ))}
              {getTags().length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1.5">
                  +{getTags().length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Engagement Metrics */}
        {renderEngagementMetrics()}

        {/* Date and Actions */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100 dark:border-gray-700">
          {getDate() && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(getDate()).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {type === "blogs" && (
                <>
                  <span className="mx-1">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getReadingTime()} min read
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="h-72 bg-gradient-to-br from-DGXgreen via-DGXblue to-purple-600"></div>
      <div className="max-w-6xl mx-auto px-6 -mt-36">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-8">
            <div className="w-36 h-36 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-10 w-64 mb-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-6 w-48 mb-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-full mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse"
            >
              <div className="h-56 w-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-6">
                <div className="h-6 w-3/4 mb-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-full mb-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-2/3 mb-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ type }) {
  const emptyConfig = {
    blogs: {
      icon: BookOpen,
      title: "No blogs published yet",
      description:
        "This user hasn't created any blogs yet. Check back later for new content!",
      color: "text-DGXblue",
    },
    discussions: {
      icon: MessageSquare,
      title: "No discussions started",
      description:
        "This user hasn't started any discussions yet. They might be working on something new!",
      color: "text-green-500",
    },
  };

  const config = emptyConfig[type];

  return (
    <div className="text-center py-20">
      <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center">
        <config.icon className={`w-12 h-12 ${config.color} opacity-60`} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {config.title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
        {config.description}
      </p>
    </div>
  );
}

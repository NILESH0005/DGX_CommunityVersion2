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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ApiContext from "../context/ApiContext";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchData } = useContext(ApiContext);
  const userId = id;

  const [activeTab, setActiveTab] = useState("blogs");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
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
          ProfilePicture:
            userData.ProfilePicture || userData.profilePicture || null,
          UserDescription:
            userData.UserDescription ||
            userData.userDescription ||
            "No description available.",
          Name: userData.Name || userData.name || "Unknown User",
          AddOnDt: userData.AddOnDt || userData.addOnDt || null,
          EmailId: userData.EmailId || userData.emailId || "No email available",
        });

        setBlogs(userBlogs);
        setDiscussions(userDiscussions);
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
        const dateA =
          a.publishedDate || a.AuthAdd
            ? new Date(a.publishedDate || a.AuthAdd)
            : new Date(0);
        const dateB =
          b.publishedDate || b.AuthAdd
            ? new Date(b.publishedDate || b.AuthAdd)
            : new Date(0);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">Error</div>
          <div className="text-gray-600 dark:text-gray-300 mb-6">{error}</div>
          <button
            onClick={handleBack}
            className="bg-DGXgreen hover:bg-DGXblue text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 dark:text-gray-300 mb-6">
            User not found
          </div>
          <button
            onClick={handleBack}
            className="bg-DGXgreen hover:bg-DGXblue text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleBack}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="h-64 bg-gradient-to-br from-DGXgreen to-DGXblue relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 -mt-32">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                  {userData.ProfilePicture ? (
                    <img
                      src={userData.ProfilePicture}
                      alt={userData.Name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-DGXgreen to-DGXblue flex items-center justify-center text-white text-4xl font-bold">
                      {userData.Name
                        ? userData.Name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {userData.Name || "Unknown User"}
                    </h1>
                    <p className="text-lg text-DGXblue dark:text-DGXblue/80 mb-3">
                      {userData.EmailId}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-2xl">
                      {userData.UserDescription || "No description available."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined{" "}
                        {userData.AddOnDt
                          ? new Date(userData.AddOnDt).toLocaleDateString()
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
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-DGXblue dark:text-DGXblue/80">
              {blogs.length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Blogs</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-DGXblue dark:text-DGXblue/80">
              {discussions.length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Discussions</div>
          </div>
          {/* <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-DGXblue dark:text-DGXblue/80">
              {discussions.reduce(
                (total, discussion) => total + (discussion.LikesCount || 0),
                0
              ) + blogs.reduce((total, blog) => total + (blog.likes || 0), 0)}
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Discussion total Likes
            </div>
          </div> */}
        </div>

        {/* Sticky Tabs and Controls */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 py-4 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="w-full lg:w-auto">
              <div className="grid w-full lg:w-auto grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {["blogs", "discussions"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-white dark:bg-gray-700 shadow-md text-DGXblue dark:text-DGXblue/80"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {tab === "blogs" && "📄 Blogs"}
                    {tab === "discussions" && "💬 Discussions"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-DGXblue focus:border-transparent"
                />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-DGXblue focus:border-transparent"
                >
                  <option value="date">Latest</option>
                  <option value="popularity">Popular</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md ${
                    viewMode === "grid"
                      ? "bg-DGXblue/10 text-DGXblue dark:text-DGXblue/80"
                      : ""
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md ${
                    viewMode === "list"
                      ? "bg-DGXblue/10 text-DGXblue dark:text-DGXblue/80"
                      : ""
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="w-full">
          {activeTab === "blogs" && (
            <ContentGrid
              content={filteredContent()}
              viewMode={viewMode}
              type="blogs"
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
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
              handleLike={handleLike}
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
  handleLike,
}) {
  if (content.length === 0) {
    return <EmptyState type={type} />;
  }

  return (
    <div
      className={`grid gap-6 ${
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
          onLike={handleLike ? () => handleLike(index) : null}
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
  onLike,
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
    if (type === "blogs") return item.publishedDate || item.AuthAdd;
    if (type === "discussions") return item.AddOnDt; // Fixed: Use AddOnDt instead of AuthAdd
    return null;
  };

  const getLikes = () => {
    if (type === "discussions") return item.LikesCount || 0;
    if (type === "blogs") return item.likes || 0;
    return 0;
  };

  const getComments = () => {
    if (type === "discussions") return item.CommentsCount || 0;
    if (type === "blogs") return item.comments || 0;
    return 0;
  };

  const getTags = () => {
    if (type === "discussions" && item.Tag) {
      // Handle the Tag property which is a string like "#Technology #AI #Innovation"
      if (typeof item.Tag === "string") {
        return item.Tag.split(" ").filter((tag) => tag.startsWith("#"));
      }
      return Array.isArray(item.Tag) ? item.Tag : [item.Tag];
    }
    return [];
  };

  return (
    <div
      className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl rounded-xl border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md hover:bg-white/80 dark:hover:bg-gray-800/80 overflow-hidden ${
        isHovered ? "scale-105 shadow-2xl" : ""
      } ${viewMode === "list" ? "flex flex-row" : ""}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {type === "blogs" && (
        <>
          {viewMode === "grid" && getImage() && (
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={getImage()}
                alt={getTitle()}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-DGXblue dark:group-hover:text-DGXblue/80 transition-colors duration-300 line-clamp-2">
                {getTitle()}
              </h3>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
            <div
              className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mt-2"
              dangerouslySetInnerHTML={{ __html: getContent() }}
            />

            {item.Category && (
              <div className="mt-2">
                <span className="text-xs bg-DGXblue/10 text-DGXblue dark:text-DGXblue/80 px-2 py-1 rounded-full">
                  {item.Category}
                </span>
              </div>
            )}
            {getDate() && (
              <div className="w-full text-right">
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                  {new Date(getDate()).toLocaleDateString()}
                </span>
              </div>
            )}  
            {/* Add likes and comments for blogs too */}
            {/* <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Heart className="w-4 h-4 mr-1" />
                  {getLikes()}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {getComments()}
                </div>
              </div>
            </div> */}
          </div>
        </>
      )}

      {type === "discussions" && (
        <>
          {viewMode === "grid" && getImage() && (
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={getImage()}
                alt={getTitle()}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-DGXblue dark:group-hover:text-DGXblue/80 transition-colors duration-300 line-clamp-2">
                {getTitle()}
              </h3>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
            <div
              className="text-gray-600 dark:text-gray-300 text-sm mt-2 mb-4"
              dangerouslySetInnerHTML={{ __html: getContent() }}
            />

            {getTags().length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {getTags().map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="text-xs bg-DGXblue/10 text-DGXblue dark:text-DGXblue/80 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {onLike && (
                  <button
                    onClick={onLike}
                    className={`flex items-center text-sm transition-colors duration-300 ${
                      isLiked
                        ? "text-red-500"
                        : "text-gray-500 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 mr-1 ${
                        isLiked ? "fill-current" : ""
                      }`}
                    />
                    {getLikes()}
                  </button>
                )}
                <div className="text-gray-500 flex items-center text-sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {getComments()}
                </div>
              </div>

              {getDate() && (
                <div className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                  {new Date(getDate()).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-64 bg-gradient-to-br from-DGXgreen to-DGXblue"></div>
      <div className="max-w-6xl mx-auto px-6 -mt-32">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-8 w-64 mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-6 w-32 mb-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-full mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
            >
              <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="p-6">
                <div className="h-6 w-3/4 mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-full mb-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ type }) {
  const emptyMessages = {
    blogs: "No blogs found",
    discussions: "No discussions yet",
  };

  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {emptyMessages[type]}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        This user hasn't created any {type} yet.
      </p>
    </div>
  );
}

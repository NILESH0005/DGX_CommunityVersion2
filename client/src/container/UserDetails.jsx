import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Eye,
  Grid3X3,
  List,
  Search,
  Moon,
  Sun,
  UserPlus,
  Mail,
  MapPin,
  Link as LinkIcon,
  Bookmark,
  TrendingUp,
  Clock,
} from "lucide-react";

// Mock data
const profileData = {
  name: "Nilesh Thakur",
  username: "@nilesh",
  bio: "Full-stack developer passionate about creating beautiful, functional web experiences. Coffee enthusiast ☕",
  location: "Noida Sector - 62 , India",
  website: "DGXCommunity.com ",
  //   followers: 2847,
  //   following: 892,
  joinDate: "March 2021",
  avatar: "../../public/No Image.webp",
};

const mockBlogs = [
  {
    id: 1,
    title: "Building Scalable React Applications",
    excerpt:
      "Learn the best practices for creating maintainable React apps that can grow with your team.",
    date: "2024-01-15",
   
    views: 1200,
    readTime: "8 min read",
    tags: ["React", "JavaScript", "Architecture"],
    image: "/placeholder.svg?height=200&width=300&text=React+Blog",
  },
  {
    id: 2,
    title: "The Future of Web Development",
    excerpt:
      "Exploring emerging trends and technologies that will shape the next decade of web development.",
    date: "2024-01-10",
    likes: 189,
    comments: 32,
    views: 890,
    readTime: "12 min read",
    tags: ["Web Development", "Trends", "Future"],
    image: "/placeholder.svg?height=200&width=300&text=Future+Web",
  },
  {
    id: 3,
    title: "Mastering CSS Grid and Flexbox",
    excerpt:
      "A comprehensive guide to modern CSS layout techniques with practical examples.",
    date: "2024-01-05",
    likes: 156,
    comments: 28,
    views: 750,
    readTime: "6 min read",
    tags: ["CSS", "Layout", "Design"],
    image: "/placeholder.svg?height=200&width=300&text=CSS+Guide",
  },
];

const mockPosts = [
  {
    id: 1,
    content:
      "Just shipped a new feature that reduces load time by 40%! The key was implementing proper code splitting and lazy loading. #webperf",
    date: "2024-01-16",
    likes: 89,
    comments: 12,
    shares: 5,
    tags: ["Performance", "WebDev"],
  },
  {
    id: 2,
    content:
      "Working on an exciting new project using Next.js 14 and the new App Router. The developer experience is incredible! 🚀",
    date: "2024-01-14",
    likes: 67,
    comments: 8,
    shares: 3,
    tags: ["Next.js", "React"],
  },
  {
    id: 3,
    content:
      "Hot take: The best way to learn a new technology is to build something you actually want to use. What's your latest side project?",
    date: "2024-01-12",
    likes: 145,
    comments: 23,
    shares: 8,
    tags: ["Learning", "SideProjects"],
  },
];

const mockModules = [
  {
    id: 1,
    name: "React Component Library",
    description:
      "A collection of reusable React components with TypeScript support",
    stars: 342,
    forks: 89,
    language: "TypeScript",
    updated: "2024-01-15",
  },
  {
    id: 2,
    name: "CSS Animation Toolkit",
    description:
      "Lightweight CSS animations and transitions for modern web apps",
    stars: 156,
    forks: 34,
    language: "CSS",
    updated: "2024-01-10",
  },
  {
    id: 3,
    name: "API Response Cache",
    description:
      "Smart caching solution for REST API responses with automatic invalidation",
    stars: 89,
    forks: 23,
    language: "JavaScript",
    updated: "2024-01-08",
  },
];

export default function MyProfile() {
  const [activeTab, setActiveTab] = useState("blogs");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const filteredContent = () => {
    let content =
      activeTab === "blogs"
        ? mockBlogs
        : activeTab === "posts"
        ? mockPosts
        : mockModules;

    if (searchQuery) {
      content = content.filter((item) =>
        item.title
          ? item.title.toLowerCase().includes(searchQuery.toLowerCase())
          : item.content
          ? item.content.toLowerCase().includes(searchQuery.toLowerCase())
          : item.name
          ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
          : false
      );
    }

    return content.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = a.date
          ? new Date(a.date)
          : a.updated
          ? new Date(a.updated)
          : new Date();
        const dateB = b.date
          ? new Date(b.date)
          : b.updated
          ? new Date(b.updated)
          : new Date();
        return dateB.getTime() - dateA.getTime();
      }
      if (sortBy === "popularity") {
        const popularityA = a.likes ? a.likes : a.stars ? a.stars : 0;
        const popularityB = b.likes ? b.likes : b.stars ? b.stars : 0;
        return popularityB - popularityA;
      }
      return 0;
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
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
                  <img
                    src={profileData.avatar || "/placeholder.svg"}
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-DGXgreen to-DGXblue text-white text-2xl font-bold rounded-full">
                    {profileData.avatar ? "" : "AR"}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {profileData.name}
                    </h1>
                    <p className="text-lg text-purple-600 dark:text-purple-400 mb-3">
                      {profileData.username}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-2xl">
                      {profileData.bio}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profileData.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <LinkIcon className="w-4 h-4" />
                        {profileData.website}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {profileData.joinDate}
                      </div>
                    </div>
                  </div>

                  {/* <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 rounded-lg flex items-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </button>
                      <button className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Message
                      </button>
                    </div>

                     <div className="flex gap-6 text-center">
                      <div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white">
                          {profileData.followers.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white">
                          {profileData.following.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                      </div>
                    </div> 
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Sticky Tabs and Controls */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 py-4 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="w-full lg:w-auto">
              <div className="grid w-full lg:w-auto grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {["blogs", "posts"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-white dark:bg-gray-700 shadow-md text-purple-600 dark:text-purple-400"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {tab === "blogs" && "📄 Blogs"}
                    {tab === "posts" && "📝 Posts"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="date">Latest</option>
                  <option value="popularity">Popular</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md ${
                    viewMode === "grid"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : ""
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md ${
                    viewMode === "list"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
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
          {activeTab === "posts" && (
            <ContentGrid
              content={filteredContent()}
              viewMode={viewMode}
              type="posts"
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
            />
          )}
          {activeTab === "modules" && (
            <ContentGrid
              content={filteredContent()}
              viewMode={viewMode}
              type="modules"
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ContentGrid({ content, viewMode, type, hoveredCard, setHoveredCard }) {
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
          key={item.id}
          item={item}
          type={type}
          viewMode={viewMode}
          isHovered={hoveredCard === item.id}
          onHover={() => setHoveredCard(item.id)}
          onLeave={() => setHoveredCard(null)}
          index={index}
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
}) {
  return (
    <div
      className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl rounded-xl border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md hover:bg-white/80 dark:hover:bg-gray-800/80 overflow-hidden ${
        isHovered ? "scale-105 shadow-2xl" : ""
      } ${viewMode === "list" ? "flex flex-row" : ""}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "fadeInUp 0.6s ease-out forwards",
      }}
    >
      {type === "blogs" && (
        <>
          {viewMode === "grid" && item.image && (
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}
          <div className="p-6 pb-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 line-clamp-2">
                {item.title}
              </h3>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mt-2">
              {item.excerpt}
            </p>
          </div>
          <div className="px-6 pt-0">
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="px-6 pt-0 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {item.likes}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {item.comments}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {item.views}
              </div>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {item.readTime}
            </div>
          </div>
        </>
      )}

      {type === "posts" && (
        <>
          <div className="p-6 pt-6">
            <p className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
              {item.content}
            </p>
            <div className="flex flex-wrap gap-1 mb-4">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="px-6 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-red-500 transition-colors duration-300 flex items-center text-sm">
                <Heart className="w-4 h-4 mr-1" />
                {item.likes}
              </button>
              <button className="text-gray-500 hover:text-blue-500 transition-colors duration-300 flex items-center text-sm">
                <MessageCircle className="w-4 h-4 mr-1" />
                {item.comments}
              </button>
              <button className="text-gray-500 hover:text-green-500 transition-colors duration-300 flex items-center text-sm">
                <Share2 className="w-4 h-4 mr-1" />
                {item.shares}
              </button>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(item.date).toLocaleDateString()}
            </div>
          </div>
        </>
      )}

      {type === "modules" && (
        <>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                {item.name}
              </h3>
              <span className="text-xs border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-full">
                {item.language}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
              {item.description}
            </p>
          </div>
          <div className="px-6 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {item.stars}
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                {item.forks}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Clock className="w-3 h-3" />
              {new Date(item.updated).toLocaleDateString()}
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
      <div className="h-64 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800"></div>
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
    posts: "No posts yet",
    modules: "No modules available",
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
        Try adjusting your search or filters to find what you're looking for.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
      >
        Clear Filters
      </button>
    </div>
  );
}

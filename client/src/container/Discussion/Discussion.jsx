import { useState, useEffect, useContext } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ApiContext from "../../context/ApiContext.jsx";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { fetchDiscussionStats } from "../../utils/discussionStats.js";

import DiscussionList from "./DiscussionList.jsx";
import DiscussionForm from "./DiscussionForm.jsx";
import SearchBar from "./SearchBar.jsx";
import EmptyState from "./EmptyState.jsx";
import MobileSidebar from "./MobileSidebar.jsx";
import DiscussionModal from "../../component/discussion/DiscussionModal.jsx";
import CommunityHighlights from "../../component/discussion/CommunityHighlights.jsx";
import TopContributors from "../../component/discussion/TopContributors.jsx";

const Discussion = () => {
  const { fetchData, userToken, user } = useContext(ApiContext);
  const navigate = useNavigate();

  // ===== States =====
  const [demoDiscussions, setDemoDiscussions] = useState([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState([]);
  const [discussionStats, setDiscussionStats] = useState({});
  const [communityHighlights, setCommunityHighlights] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState("all");
  const [userReposts, setUserReposts] = useState(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentUserId = user?.uniqueId || user?.UserID;

  // ===== Fetch Data =====
  const fetchDiscussionData = async (userEmail) => {
    try {
      const endpoint = "discussion/getdiscussion";
      const method = "POST";
      const body = { email: userEmail || null };
      const headers = { "Content-Type": "application/json" };

      setLoading(true);
      const result = await fetchData(endpoint, method, body, headers);
      const discussions = result?.data?.updatedDiscussions || [];

      const stats = await fetchDiscussionStats(fetchData);
      setDiscussionStats(stats);

      const discussionsWithStats = discussions.map((d) => ({
        ...d,
        likeCount: stats[d.DiscussionID]?.TotalLikes || 0,
        commentCount: stats[d.DiscussionID]?.TotalComments || 0,
        viewCount: stats[d.DiscussionID]?.TotalViews || 0,
      }));

      setDemoDiscussions(discussionsWithStats);
      setFilteredDiscussions(discussionsWithStats);
      setIsLoading(false);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken && user) fetchDiscussionData(user.EmailId);
    else fetchDiscussionData(null);
  }, [user, userToken]);

  // ===== Helpers =====
  const openModal = (discussion) => {
    setSelectedDiscussion(discussion);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  // ===== Render =====
  return (
    <div className="h-screen flex flex-col bg-white">
      <ToastContainer />
      {modalIsOpen && selectedDiscussion && (
        <DiscussionModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          discussion={selectedDiscussion}
          updateStats={() => fetchDiscussionData(user?.EmailId)}
        />
      )}

      <div className="flex-1 flex flex-col lg:flex-row w-full mx-auto bg-white rounded-md border border-gray-200 shadow-md mt-4 mb-4 p-4 overflow-hidden">
        {/* LEFT - Top Contributors */}
        <aside className="hidden lg:block lg:w-1/4 px-4 space-y-8">
          <TopContributors topUsers={topUsers} />
        </aside>

        {/* CENTER - Discussion List and Form */}
        <section className="w-full lg:w-2/4 px-4 flex flex-col overflow-y-scroll h-[80vh]">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchScope={searchScope}
            setSearchScope={setSearchScope}
            demoDiscussions={demoDiscussions}
            setFilteredDiscussions={setFilteredDiscussions}
            userToken={userToken} 
            navigate={navigate} 
            setIsFormOpen={setIsFormOpen} 
          />

          {isFormOpen && (
            <DiscussionForm
              userToken={userToken}
              user={user}
              fetchData={fetchData}
              fetchDiscussionData={fetchDiscussionData}
              onClose={() => setIsFormOpen(false)}
            />
          )}

          {filteredDiscussions.length > 0 ? (
            <DiscussionList
              discussions={filteredDiscussions}
              openModal={openModal}
              userToken={userToken}
              navigate={navigate}
              fetchData={fetchData}
              user={user}
            />
          ) : (
            <EmptyState
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              demoDiscussions={demoDiscussions}
              setFilteredDiscussions={setFilteredDiscussions}
              user={user}
              onStartNew={() => setIsFormOpen(true)}
            />
          )}
        </section>

        {/* RIGHT - Community Highlights */}
        <aside className="hidden lg:block lg:w-1/4 px-4 space-y-8">
          <CommunityHighlights
            localHighlights={demoDiscussions.slice(0, 5)} // or pass your communityHighlights
            getUpdatedDiscussion={(id) =>
              demoDiscussions.find((d) => d.DiscussionID === id)
            }
            getDiscussionWithStats={(discussion) => ({
              ...discussion,
              likeCount:
                discussionStats[discussion.DiscussionID]?.TotalLikes ||
                discussion.likeCount ||
                0,
              commentCount:
                discussionStats[discussion.DiscussionID]?.TotalComments ||
                discussion.commentCount ||
                0,
            })}
            openModal={openModal}
            handleSidebarLike={() => {}}
            statsLoading={statsLoading}
          />
        </aside>
      </div>
    </div>
  );
};

export default Discussion;

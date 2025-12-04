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
import DiscussionModal from "../../component/discussion/DiscussionModal.jsx";
import CommunityHighlights from "../../component/discussion/CommunityHighlights.jsx";
import TopContributors from "../../component/discussion/TopContributors.jsx";

const Discussion = () => {
  const { fetchData, userToken, user } = useContext(ApiContext);
  const navigate = useNavigate();
  const [demoDiscussions, setDemoDiscussions] = useState([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState([]);
  const [discussionStats, setDiscussionStats] = useState({});
  const [topUsers, setTopUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState("all");

  const currentUserId = user?.uniqueId || user?.UserID;

  // ===== Update Comment Count =====
  const handleUpdateCommentCount = (discussionId, newCount, updatedComments) => {
    setDemoDiscussions((prev) =>
      prev.map((d) =>
        d.DiscussionID === discussionId
          ? { ...d, commentCount: newCount, comment: updatedComments }
          : d
      )
    );
    setFilteredDiscussions((prev) =>
      prev.map((d) =>
        d.DiscussionID === discussionId
          ? { ...d, commentCount: newCount, comment: updatedComments }
          : d
      )
    );
  };

  // ===== Like Count Update =====
  const handleUpdateLikeCount = (discussionId, newCount, userLikeState) => {
    setDemoDiscussions((prev) =>
      prev.map((d) =>
        d.DiscussionID === discussionId
          ? { ...d, likeCount: newCount, userLike: userLikeState }
          : d
      )
    );
    setFilteredDiscussions((prev) =>
      prev.map((d) =>
        d.DiscussionID === discussionId
          ? { ...d, likeCount: newCount, userLike: userLikeState }
          : d
      )
    );
  };

  // ✅ Fetch discussions
  const fetchDiscussionData = async (userEmail) => {
    try {
      const endpoint = "discussion/getdiscussion";
      const method = "POST";
      const body = { email: userEmail || null };
      const headers = { "Content-Type": "application/json" };

      setLoading(true);
      const result = await fetchData(endpoint, method, body, headers);

      // 🧹 1. Separate original & reposted discussions
      const allDiscussions = result?.data?.updatedDiscussions || [];
      const reposts = allDiscussions.filter((d) => d.RepostID);
      const discussions = allDiscussions.filter((d) => !d.RepostID);

      // 🔗 2. Merge repost info into their original posts
      reposts.forEach((r) => {
        const target = discussions.find(
          (orig) => orig.DiscussionID === r.RepostID
        );
        if (target) {
          target.reposts = target.reposts || [];
          target.reposts.push({
            userId: r.UserID,
            name: r.User?.Name || "Unknown",
          });
        }
      });

      // 📊 3. Attach stats
      const stats = await fetchDiscussionStats(fetchData);
      setDiscussionStats(stats);

      const discussionsWithStats = discussions.map((d) => ({
        ...d,
        likeCount: stats[d.DiscussionID]?.TotalLikes || 0,
        commentCount: stats[d.DiscussionID]?.TotalComments || 0,
        viewCount: stats[d.DiscussionID]?.TotalViews || 0,
      }));

      // ✅ 4. Set states
      setDemoDiscussions(discussionsWithStats);
      setFilteredDiscussions(discussionsWithStats);
      setIsLoading(false);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      setLoading(false);
    }
  };

  // ===== Top Users =====
  const getTopUsersByDiscussions = (discussions) => {
    const userMap = {};
    discussions.forEach((d) => {
      const userID = d.UserID || d.userId;
      const userName = d.User?.Name;
      if (!userID) return;
      if (!userMap[userID]) userMap[userID] = { userID, userName, count: 1 };
      else userMap[userID].count++;
    });
    return Object.values(userMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // ===== Effects =====
  useEffect(() => {
    const initFetch = async () => {
      await fetchDiscussionData(user?.EmailId || null);
    };
    if (userToken !== undefined) initFetch();
  }, [user, userToken]);

  useEffect(() => {
    if (demoDiscussions.length > 0) {
      const topUsersList = getTopUsersByDiscussions(demoDiscussions);
      setTopUsers(topUsersList);
    }
  }, [demoDiscussions]);

  // ===== Modal Helpers =====
  const openModal = (discussion) => {
    setSelectedDiscussion(discussion);
    setModalIsOpen(true);
  };
  const closeModal = () => setModalIsOpen(false);

  // ===== Render =====
  return (
    <div className="h-screen flex flex-col bg-white">
      <ToastContainer />
      {modalIsOpen && selectedDiscussion && (
        <DiscussionModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          discussion={selectedDiscussion}
          updateCommentCount={handleUpdateCommentCount}
        />
      )}

      <div className="flex-1 flex flex-col lg:flex-row w-full mx-auto bg-white rounded-md border border-gray-200 shadow-md mt-4 mb-4 p-4 overflow-hidden">
        {/* LEFT - Top Contributors */}
        <aside className="hidden lg:block lg:w-1/6 px-4 space-y-8">
          <TopContributors topUsers={topUsers} />
        </aside>

        {/* CENTER - Discussion List */}
        <section className="w-full lg:w-5/6 px-4 flex flex-col overflow-y-scroll h-[80vh]">
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
              updateLikeCount={handleUpdateLikeCount}
              updateCommentCount={handleUpdateCommentCount}
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
            key={demoDiscussions.length}
            localHighlights={[...demoDiscussions]
              .sort(
                (a, b) =>
                  b.likeCount + b.commentCount - (a.likeCount + a.commentCount)
              )
              .slice(0, 5)}
            openModal={openModal}
            handleSidebarLike={handleUpdateLikeCount}
            statsLoading={false}
          />
        </aside>
      </div>
    </div>
  );
};

export default Discussion;

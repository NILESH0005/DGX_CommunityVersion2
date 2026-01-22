// utils/discussionStats.js
export const fetchDiscussionStats = async (fetchData, userToken) => {
  try {
    const endpoint = "dropdown/discussionStats";
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": userToken,
    };

    const result = await fetchData(endpoint, method, {}, headers);

    if (result?.success && result?.data) {
      // Convert array to object for easier lookup
      const statsMap = {};
      result.data.forEach((discussion) => {
        statsMap[discussion.DiscussionID] = {
          TotalLikes: discussion.TotalLikes,
          TotalComments: discussion.TotalComments,
          TotalViews: discussion.TotalViews,
          HasUserViewed: discussion.HasUserViewed, // 🔥 THIS WAS MISSING
        };
      });
      return statsMap;
    }
    return {};
  } catch (error) {
    console.error("Error fetching discussion stats:", error);
    return {};
  }
};

import { Op } from "sequelize";
import db from "../models/index.js"; // adjust path based on your setup
const { CMSContent, User, LMSModulesDetails, CommunityEvents, CommunityBlog,  CommunityDiscussion } = db;

export const addParallaxTextService = async (
  userEmail,
  { componentName, componentIdName, content }
) => {
  try {
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
      attributes: ["UserID", "Name", "isAdmin"],
    });

    if (!user) {
      return {
        success: false,
        message: "User not found, please login first.",
        data: {},
      };
    }

    // Step 2: Insert new CMS content
    const newContent = await CMSContent.create({
      ComponentName: componentName,
      ComponentIdName: componentIdName,
      Content: content,
      AuthAdd: user.Name,
      AddOnDt: new Date(),
      delStatus: 0,
    });

    return {
      success: true,
      message: "Parallax text added successfully!",
      data: { id: newContent.idCode },
    };
  } catch (error) {
    console.error(
      "Error in addParallaxTextService:",
      error.message,
      error.stack
    );
    return {
      success: false,
      message: "Unexpected Error",
      data: error,
    };
  }
};

export const deleteParallaxTextService = async (userEmail, idCode) => {
  try {
    // 1. Fetch the user
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
      attributes: ["UserID", "Name", "isAdmin"],
    });

    if (!user) {
      return {
        success: false,
        message: "User not found, please login first.",
        data: {},
      };
    }

    // 2. Verify the content exists
    const content = await CMSContent.findOne({
      where: {
        idCode,
        ComponentName: "Parallax",
        delStatus: 0,
      },
      attributes: ["idCode", "isActive"],
    });

    if (!content) {
      return {
        success: false,
        message: "Content not found or already deleted",
        data: {},
      };
    }

    // 3. Ensure it's not active
    if (content.isActive === true || content.isActive === 1) {
      return {
        success: false,
        message: "Deactivate before deleting",
        data: {},
      };
    }

    // 4. Perform soft delete
    await CMSContent.update(
      {
        delStatus: 1,
        delOnDt: new Date(),
        AuthDel: user.Name,
        isActive: 0,
      },
      { where: { idCode } }
    );

    return {
      success: true,
      message: "Deleted successfully",
      data: { idCode, AuthDel: user.Name },
    };
  } catch (error) {
    console.error("Error in deleteParallaxTextService:", error);
    return {
      success: false,
      message: "Unexpected Error",
      data: error,
    };
  }
};

export const addContentSectionService = async (
  userEmail,
  { componentName, componentIdName, title, text, image }
) => {
  try {
    // 1. Find user
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
      attributes: ["UserID", "Name"],
    });

    if (!user) {
      return {
        success: false,
        message: "User not found, please login first.",
        data: {},
      };
    }

    // 2. Insert new content
    const newContent = await CMSContent.create({
      ComponentName: componentName,
      ComponentIdName: componentIdName,
      Title: title,
      Content: text,
      Image: image,
      AuthAdd: user.Name,
      AddOnDt: new Date(),
      delStatus: 0,
    });

    return {
      success: true,
      message: "Content added successfully!",
      data: { id: newContent.idCode },
    };
  } catch (error) {
    console.error("Error in addContentSectionService:", error);
    return {
      success: false,
      message: "Unexpected Error",
      data: error,
    };
  }
};

export const getParallaxContentService = async () => {
  try {
    const results = await CMSContent.findAll({
      where: {
        ComponentName: "Parallax",
        delStatus: 0,
      },
      attributes: [
        "idCode",
        "ComponentName",
        "ComponentIdName",
        "Content",
        "isActive",
      ],
    });

    return {
      success: true,
      message: "Parallax content fetched successfully!",
      data: results,
    };
  } catch (error) {
    console.error("Error in getParallaxContentService:", error);
    return {
      success: false,
      message: "Unexpected Error",
      data: error,
    };
  }
};

export const getAllCMSContentService = async () => {
  try {
    const rows = await CMSContent.findAll({
      where: { delStatus: 0 }, // Only non-deleted records
    });

    return {
      success: true,
      message: "Data fetched successfully",
      data: rows,
    };
  } catch (error) {
    console.error("Error in getAllCMSContentService:", error);
    return {
      success: false,
      message: "Unexpected Error",
      data: error,
    };
  }
};

export const updateContentSectionService = async (
  userEmail,
  {
    id,
    Title,
    Content,
    Image = null,
    ComponentName = "ContentSection",
    ComponentIdName = "contentSection",
  }
) => {
  try {
    // Step 1: Validate content ID
    if (!id || isNaN(Number(id))) {
      return {
        success: false,
        message: "Valid numeric Content ID is required",
      };
    }
    if (!Title || !Content) {
      return {
        success: false,
        message: "Title and Content are required fields",
      };
    }

    // Step 2: Fetch user
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
      attributes: ["UserID", "Name", "isAdmin"],
    });

    if (!user) {
      return { success: false, message: "User not found, please login first." };
    }

    // Step 3: Check if content exists
    const content = await CMSContent.findOne({
      where: { idCode: Number(id), delStatus: 0 },
    });

    if (!content) {
      return { success: false, message: "Content not found" };
    }

    // Step 4: Update record
    const [affectedRows] = await CMSContent.update(
      {
        Title,
        Content,
        Image,
        ComponentName,
        ComponentIdName,
        AuthLstEdt: user.Name,
        editOnDt: new Date(),
      },
      { where: { idCode: Number(id) } }
    );

    if (affectedRows === 0) {
      return { success: false, message: "No changes were made" };
    }

    return { success: true, message: "Content updated successfully" };
  } catch (error) {
    console.error("Error in updateContentSectionService:", error);
    return { success: false, message: "Unexpected Error", data: error };
  }
};

export const setActiveParallaxTextService = async (idCode) => {
  try {
    // 1. Deactivate all Parallax rows
    await CMSContent.update(
      { isActive: 0 },
      { where: { ComponentName: "Parallax" } }
    );

    // 2. Activate selected row
    const [updatedRows] = await CMSContent.update(
      { isActive: 1 },
      { where: { idCode } }
    );

    if (updatedRows === 0) {
      return {
        success: false,
        message: "Parallax text not found",
      };
    }

    return {
      success: true,
      message: "Active parallax text set successfully!",
    };
  } catch (error) {
    console.error("Error in setActiveParallaxTextService:", error);
    return {
      success: false,
      message: "Unexpected Error",
      data: error,
    };
  }
};

export const getHomePageContentService = async () => {
  try {
    // Fetch Parallax content
    const parallaxResults = await CMSContent.findAll({
      where: {
        ComponentName: "Parallax",
        delStatus: 0,
      },
      attributes: [
        "idCode",
        "ComponentName",
        "ComponentIdName",
        "Content",
        "isActive",
      ],
    });

    // Fetch ContentSection
    const contentResults = await CMSContent.findAll({
      where: {
        ComponentName: "ContentSection",
        delStatus: 0,
      },
      attributes: [
        "idCode",
        "ComponentName",
        "ComponentIdName",
        "Title",
        "Content",
        "Image",
        "isActive",
      ],
    });

    return {
      success: true,
      data: {
        parallax: parallaxResults,
        content: contentResults,
      },
      message: "Homepage content fetched successfully",
    };
  } catch (error) {
    console.error("Error in getHomePageContentService:", error);
    return {
      success: false,
      message: "Failed to fetch homepage content",
      data: error,
    };
  }
};



export const getLogoutHomePageContentService = async () => {
  try {
    // Fetch all data in parallel for better performance
    const [
      featuredBlogs,
      recentDiscussions,
      upcomingEvents,
      featuredModules
    ] = await Promise.allSettled([
      // Featured Blogs (approved and not deleted)
      CommunityBlog.findAll({
        where: {
          delStatus: 0,
          Status: 'Approved'
        },
        attributes: [
          'BlogID',
          'title',
          'AuthAdd',
          'content',
          'publishedDate',
          'image',
          'Category',
          'AddOnDt'
        ],
        order: [['publishedDate', 'DESC']],
        limit: 3
      }).catch(error => {
        console.error("Error fetching featured blogs:", error);
        return []; // Return empty array on error
      }),

      // Recent Discussions (not deleted)
      CommunityDiscussion.findAll({
        where: {
          delStatus: 0
        },
        attributes: [
          'DiscussionID',
          'Title',
          'Content',
          'Image',
          'Likes',
          'Tag',
          'Visibility',
          'AddOnDt'
        ],
        order: [['AddOnDt', 'DESC']],
        limit: 3
      }).catch(error => {
        console.error("Error fetching recent discussions:", error);
        return [];
      }),

      // Upcoming Events (approved, not deleted, and future dates)
      CommunityEvents.findAll({
        where: {
          delStatus: 0,
          Status: 'Approved',
          StartDate: {
            [Op.gte]: new Date()
          }
        },
        attributes: [
          'EventID',
          'EventTitle',
          'StartDate',
          'EndDate',
          'EventType',
          'Venue',
          'Host',
          'RegistrationLink',
          'EventImage',
          'EventDescription'
        ],
        order: [['StartDate', 'ASC']],
        limit: 3
      }).catch(error => {
        console.error("Error fetching upcoming events:", error);
        return [];
      }),

      // Featured Modules (not deleted)
      LMSModulesDetails.findAll({
        where: {
          delStatus: 0
        },
        attributes: [
          'ModuleID',
          'ModuleName',
          'ModuleImage',
          'ModuleDescription',
          'ModuleImagePath',
          'SortingOrder',
          'AuthAdd'
        ],
        order: [['SortingOrder', 'ASC']],
        limit: 3
      }).catch(error => {
        console.error("Error fetching featured modules:", error);
        return [];
      })
    ]);

    // Extract values from Promise.allSettled results
    const featuredBlogsResult = featuredBlogs.status === 'fulfilled' ? featuredBlogs.value : [];
    const recentDiscussionsResult = recentDiscussions.status === 'fulfilled' ? recentDiscussions.value : [];
    const upcomingEventsResult = upcomingEvents.status === 'fulfilled' ? upcomingEvents.value : [];
    const featuredModulesResult = featuredModules.status === 'fulfilled' ? featuredModules.value : [];

    // Format dates and handle null values
    const formatData = (data) => {
      return data.map(item => {
        const itemData = item.get ? item.get({ plain: true }) : item;
        return {
          ...itemData,
          // Format dates to ISO string for consistency
          ...(itemData.publishedDate && { publishedDate: new Date(itemData.publishedDate).toISOString() }),
          ...(itemData.AddOnDt && { AddOnDt: new Date(itemData.AddOnDt).toISOString() }),
          ...(itemData.StartDate && { StartDate: new Date(itemData.StartDate).toISOString() }),
          ...(itemData.EndDate && { EndDate: new Date(itemData.EndDate).toISOString() })
        };
      });
    };

    return {
      success: true,
      data: {
        featuredBlogs: formatData(featuredBlogsResult),
        recentDiscussions: formatData(recentDiscussionsResult),
        upcomingEvents: formatData(upcomingEventsResult),
        featuredModules: formatData(featuredModulesResult),
        metadata: {
          blogsCount: featuredBlogsResult.length,
          discussionsCount: recentDiscussionsResult.length,
          eventsCount: upcomingEventsResult.length,
          modulesCount: featuredModulesResult.length,
          fetchedAt: new Date().toISOString()
        }
      },
      message: "Logout homepage content fetched successfully",
    };
  } catch (error) {
    console.error("Error in getLogoutHomePageContentService:", error);
    return {
      success: false,
      message: "Failed to fetch logout homepage content",
      data: {
        featuredBlogs: [],
        recentDiscussions: [],
        upcomingEvents: [],
        featuredModules: [],
        metadata: {
          blogsCount: 0,
          discussionsCount: 0,
          eventsCount: 0,
          modulesCount: 0,
          fetchedAt: new Date().toISOString(),
          error: true
        }
      },
      error: error.message
    };
  }
};
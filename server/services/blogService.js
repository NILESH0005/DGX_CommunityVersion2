import db from "../models/index.js"; // assuming your models/index.js exports all models
import { logInfo, logWarning, logError } from "../helper/index.js";
import { Op } from "sequelize"; // ✅ direct import
import Community_Blog from "../models/Community_Blog.js";

const Blog = db.CommunityBlog;
const User = db.User;
const ContentInteraction = db.ContentInteraction

export const createBlogPost = async (userEmail, blogData) => {
  try {
    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
      attributes: ["UserID", "Name", "isAdmin"],
    });

    if (!user) {
      logWarning("User not found, please login first.");
      return {
        status: 400,
        response: {
          success: false,
          data: {},
          message: "User not found, please login first.",
        },
      };
    }

    const isAdmin = user.isAdmin === 1;
    const status = isAdmin ? "Approved" : "Pending";
    const approvedBy = isAdmin ? user.Name : null;
    const approvedOn = isAdmin ? new Date() : null;

    let repostUserId = null;
    let repostId = null;

    if (blogData.repostId && blogData.repostId !== 0) {
      const originalBlog = await Blog.findOne({
        where: { BlogID: blogData.repostId, delStatus: 0 },
        attributes: ["UserID"],
      });

      if (originalBlog) {
        repostUserId = originalBlog.UserID;
        repostId = blogData.repostId;
      }
    }

    const blogPost = await Blog.create({
      title: blogData.title ?? null,
      author: blogData.author ?? null,
      content: blogData.content ?? null,
      image: blogData.image ?? null,
      Category: blogData.category ?? null,
      publishedDate: blogData.publishedDate ?? null,
      AuthAdd: user.Name,
      AddOnDt: new Date(),
      delStatus: 0,
      Status: status,
      AdminRemark: null,
      ApprovedBy: approvedBy,
      ApprovedOn: approvedOn,
      UserID: user.UserID,
      RepostID: blogData.repostId ?? null,
      RepostUserID: repostUserId ?? null,
      allowRepost: blogData.allowRepost ?? false, // Fixed: use blogData.allowRepost
    });

    console.log("blog body", blogPost);
    logInfo("Blog posted successfully!");

    return {
      status: 200,
      response: {
        success: true,
        data: { postId: blogPost.BlogID },
        message: "Blog posted successfully!",
      },
    };
  } catch (error) {
    logError("Blog creation failed:", error);
    return {
      status: 500,
      response: {
        success: false,
        data: error,
        message: "Something went wrong while posting the blog",
      },
    };
  }
};

export const getBlogService = async (userEmail) => {
  // Check user exists
  const user = await User.findOne({
    where: {
      EmailId: userEmail,
      delStatus: { [Op.or]: [0, null] },
    },
  });

  if (!user) {
    return { success: false, message: "User not found", data: {} };
  }

  const isAdmin = user.isAdmin === 1;

  const userBlogCount = await Blog.count({
    where: {
      UserID: user.UserID,
      delStatus: { [Op.or]: [0, null] },
    },
  });

  const totalCount = await Blog.count({
    where: {
      delStatus: { [Op.or]: [0, null] },
      ...(isAdmin ? {} : { Status: "Approved" }),
    },
  });

  const blogs = await Blog.findAll({
    where: {
      delStatus: { [Op.or]: [0, null] },
      ...(isAdmin
        ? {}
        : {
          [Op.or]: [{ UserID: user.UserID }, { Status: "Approved" }],
        }),
    },
    order: [["AddOnDt", "DESC"]],
    attributes: [
      "BlogID",
      "title",
      ["AuthAdd", "UserName"],
      "author",
      "content",
      ["Category", "category"],
      "AddOnDt",
      ["AddOnDt", "timestamp"],
      "image",
      "UserID",
      "Status",
      "AdminRemark",
    ],
  });

  console.log("these are blogs", blogs);

  return {
    success: true,
    data: blogs,
    userBlogCount,
    totalCount,
    message: "Blogs fetched successfully",
  };
};

export const getUserBlogsService = async (userEmail) => {
  // Get user by EmailId
  const user = await User.findOne({
    where: {
      EmailId: userEmail,
      delStatus: { [Op.or]: [0, null] },
    },
  });

  if (!user) {
    return { success: false, message: "User not found", data: {} };
  }

  // Count blogs
  const totalCount = await Blog.count({
    where: {
      UserID: user.UserID,
      delStatus: { [Op.or]: [0, null] },
      Status: { [Op.in]: ["Pending", "Rejected", "Approved"] },
    },
  });

  // Fetch blogs
  const blogs = await Blog.findAll({
    where: {
      UserID: user.UserID,
      delStatus: { [Op.or]: [0, null] },
      Status: { [Op.in]: ["Pending", "Rejected", "Approved"] },
    },
    order: [["AddOnDt", "DESC"]],
    attributes: [
      "BlogID",
      "title",
      ["AuthAdd", "UserName"],
      "author",
      "content",
      ["Category", "category"],
      "publishedDate",
      ["AddOnDt", "timestamp"],
      "image",
      "AddOnDt",
      "UserID",
      "Status",
      "AdminRemark",
      "allowRepost",
    ],
  });

  return {
    success: true,
    data: { blogs, totalCount },
    message: "User's blogs fetched successfully",
  };
};

export const getPublicBlogsService = async () => {
  const publicBlogs = await Blog.findAll({
    where: {
      delStatus: { [Op.or]: [0, null] },
      Status: "Approved",
    },
    order: [["AddOnDt", "DESC"]],
    attributes: [
      "UserID",
      "BlogID",
      "title",
      "AuthAdd",
      "AddOnDt",
      "Status",
      ["Category", "category"],
      "publishedDate",
      "content",
      "AddOnDt",
      "image",
      "UserID",
      "RepostID",
      "RepostUserID",
      "allowRepost",
    ],
    include: [
      {
        model: User,
        as: "RepostUser", // ✅ must match the alias in index.js
        attributes: ["UserID", "Name"],
      },
    ],
  });

  if (!publicBlogs || publicBlogs.length === 0) {
    return { success: false, message: "No public blogs found", data: [] };
  }

  return {
    success: true,
    data: publicBlogs,
    message: "Public blogs fetched successfully",
  };
};

export const updateBlogService = async (blogId, user, data) => {
  const { CommunityBlog } = db;

  // Check blog existence
  const blog = await CommunityBlog.findOne({
    where: { BlogID: blogId, delStatus: 0 },
  });
  if (!blog) {
    return { success: false, status: 404, message: "Blog not found" };
  }

  // Check admin rights
  if (user.isAdmin !== 1) {
    return { success: false, status: 403, message: "You are not authorized" };
  }

  let updateData = {};
  const now = new Date();

  switch (data.Status) {
    case "approve":
      if (blog.Status === "Approved") {
        return {
          success: false,
          status: 400,
          message: "Blog is already approved",
        };
      }
      updateData = {
        Status: "Approved",
        ApprovedBy: user.id,
        ApprovedOn: now,
        AuthLstEdt: user.id,
        editOnDt: now,
      };
      break;

    case "reject":
      if (blog.Status === "Rejected") {
        return {
          success: false,
          status: 400,
          message: "Blog is already rejected",
        };
      }
      updateData = {
        Status: "Rejected",
        AdminRemark: data.remark || "",
        AuthLstEdt: user.id,
        editOnDt: now,
      };
      break;

    case "delete":
      updateData = {
        delStatus: 1,
        AuthLstEdt: user.id,
        delOnDt: now,
      };
      break;

    default:
      updateData = {
        title: data.title,
        author: data.author,
        content: data.content,
        publishedDate: data.publishedDate,
        Category: data.category,
        image: data.image,
        AuthLstEdt: user.id,
        editOnDt: now,
      };
      break;
  }

  await CommunityBlog.update(updateData, { where: { BlogID: blogId } });

  return {
    success: true,
    status: 200,
    message: `Blog ${data.Status ? data.Status + "d" : "updated"
      } successfully!`,
    data: { blogId },
  };
};

// export const handleBlogLikeAction = async (user, postData) => {
//   try {
//     const blogId = postData.reference;
//     if (!blogId) throw new Error("Invalid blog reference");

//     // Check if an interaction already exists for this user & blog
//     let interaction = await ContentInteraction.findOne({
//       where: {
//         ProcessName: 'Blog',
//         UserID: user.UserID,
//         reference: blogId,
//         delStatus: 0
//       },
//     });

//     const currentDate = new Date();
//     const intendedLikeStatus = postData.likes === 1 ? 1 : 0;

//     if (interaction) {
//       // Update existing interaction - only update if like status is changing
//       if (interaction.Likes !== intendedLikeStatus) {
//         const updateData = {
//           Likes: intendedLikeStatus,
//           LikeStatus: 0, // Always set to 0 as per requirement
//           AuthLstEdt: user.Name,
//           editOnDt: currentDate, // Only update when there's a change
//         };

//         await ContentInteraction.update(updateData, {
//           where: { id: interaction.id },
//         });
//       }

//       return {
//         success: true,
//         data: {
//           liked: intendedLikeStatus === 1,
//           interactionId: interaction.id,
//         },
//         message:
//           intendedLikeStatus === 1
//             ? "Blog liked successfully"
//             : "Blog unliked successfully",
//       };
//     }

//     // Create new interaction if it doesn't exist
//     const newInteraction = await ContentInteraction.create({
//       ProcessName: 'Blog',
//       UserID: user.UserID,
//       reference: blogId,
//       Likes: intendedLikeStatus,
//       LikeStatus: 0, // Always 0 for like operations
//       Rating: null, // null for like operations
//       RatingStatus: null, // null for like operations
//       AuthAdd: user.Name,
//       AuthDel: null,
//       AuthLstEdt: null, // No edit on creation
//       delOnDt: null,
//       AddOnDt: currentDate,
//       editOnDt: null, // null on initial creation
//       delStatus: 0
//     });

//     return {
//       success: true,
//       data: {
//         liked: intendedLikeStatus === 1,
//         interactionId: newInteraction.id,
//       },
//       message:
//         intendedLikeStatus === 1
//           ? "Blog liked successfully"
//           : "Blog unliked successfully",
//     };
//   } catch (error) {
//     console.error("Blog Like Error:", error);
//     throw error;
//   }
// };
export const handleBlogLikeAction = async (user, postData) => {
  try {
    const blogId = postData.reference;
    if (!blogId) throw new Error("Invalid blog reference");

    // Check if an interaction already exists for this user & blog
    let interaction = await ContentInteraction.findOne({
      where: {
        ProcessName: 'Blog',
        UserID: user.UserID,
        reference: blogId,
        delStatus: 0
      },
    });

    const currentDate = new Date();
    const intendedLikeStatus = postData.likes === 1 ? 1 : 0;

    if (interaction) {
      // Update existing interaction - only update if like status is changing
      const updateData = {
        AuthLstEdt: user.Name,
        editOnDt: currentDate,
      };

      // Only update Likes if it's changing
      if (interaction.Likes !== intendedLikeStatus) {
        updateData.Likes = intendedLikeStatus;
        updateData.LikeStatus = 0; // Always 0
      }

      await ContentInteraction.update(updateData, {
        where: { id: interaction.id },
      });

      return {
        success: true,
        data: {
          liked: intendedLikeStatus === 1,
          interactionId: interaction.id,
        },
        message:
          intendedLikeStatus === 1
            ? "Blog liked successfully"
            : "Blog unliked successfully",
      };
    }

    // Create new interaction if it doesn't exist
    const newInteraction = await ContentInteraction.create({
      ProcessName: 'Blog',
      UserID: user.UserID,
      reference: blogId,
      Likes: intendedLikeStatus,
      LikeStatus: 0, // Always 0 for like operations
      Rating: null, // null for like operations
      RatingStatus: null, // null for like operations
      AuthAdd: user.Name,
      AuthDel: null,
      AuthLstEdt: null, // No edit on creation
      delOnDt: null,
      AddOnDt: currentDate,
      editOnDt: null, // null on initial creation
      delStatus: 0
    });

    return {
      success: true,
      data: {
        liked: intendedLikeStatus === 1,
        interactionId: newInteraction.id,
      },
      message:
        intendedLikeStatus === 1
          ? "Blog liked successfully"
          : "Blog unliked successfully",
    };
  } catch (error) {
    console.error("Blog Like Error:", error);
    throw error;
  }
};

// New function to handle ratings
export const handleBlogRateAction = async (user, postData) => {
  try {
    const blogId = postData.reference || postData.blogId;
    const ratingValue = postData.rating;
    
    if (!blogId) throw new Error("Invalid blog reference");
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      throw new Error("Invalid rating value");
    }

    // Check if an interaction already exists for this user & blog
    let interaction = await ContentInteraction.findOne({
      where: {
        ProcessName: 'Blog',
        UserID: user.UserID,
        reference: blogId,
        delStatus: 0
      },
    });

    const currentDate = new Date();

    if (interaction) {
      // Update existing interaction with rating
      const updateData = {
        Rating: ratingValue,
        RatingStatus: 0, // Always 0 for rating
        AuthLstEdt: user.Name,
        editOnDt: currentDate,
      };

      await ContentInteraction.update(updateData, {
        where: { id: interaction.id },
      });

      return {
        success: true,
        data: {
          rated: true,
          rating: ratingValue,
          interactionId: interaction.id,
        },
        message: "Blog rated successfully",
      };
    }

    // Create new interaction if it doesn't exist (user rates without liking first)
    const newInteraction = await ContentInteraction.create({
      ProcessName: 'Blog',
      UserID: user.UserID,
      reference: blogId,
      Likes: 0, // User hasn't liked, only rated
      LikeStatus: 0,
      Rating: ratingValue,
      RatingStatus: 0, // Always 0 for rating
      AuthAdd: user.Name,
      AuthDel: null,
      AuthLstEdt: null,
      delOnDt: null,
      AddOnDt: currentDate,
      editOnDt: null,
      delStatus: 0
    });

    return {
      success: true,
      data: {
        rated: true,
        rating: ratingValue,
        interactionId: newInteraction.id,
      },
      message: "Blog rated successfully",
    };
  } catch (error) {
    console.error("Blog Rate Error:", error);
    throw error;
  }
};

// Combined function for both like and rating in one call
export const handleBlogLikeAndRateAction = async (user, postData) => {
  try {
    const blogId = postData.reference;
    const likeValue = postData.likes || 0;
    const ratingValue = postData.rating || null;

    if (!blogId) throw new Error("Invalid blog reference");

    // Check if an interaction already exists for this user & blog
    let interaction = await ContentInteraction.findOne({
      where: {
        ProcessName: 'Blog',
        UserID: user.UserID,
        reference: blogId,
        delStatus: 0
      },
    });

    const currentDate = new Date();

    if (interaction) {
      // Update existing interaction with both like and rating
      const updateData = {
        AuthLstEdt: user.Name,
        editOnDt: currentDate,
      };

      // Update like if provided
      if (likeValue !== undefined) {
        updateData.Likes = likeValue;
        updateData.LikeStatus = 0;
      }

      // Update rating if provided
      if (ratingValue !== undefined && ratingValue !== null) {
        updateData.Rating = ratingValue;
        updateData.RatingStatus = 0;
      }

      await ContentInteraction.update(updateData, {
        where: { id: interaction.id },
      });

      return {
        success: true,
        data: {
          liked: likeValue === 1,
          rating: ratingValue,
          interactionId: interaction.id,
        },
        message: "Blog interaction updated successfully",
      };
    }

    // Create new interaction with both like and rating
    const newInteraction = await ContentInteraction.create({
      ProcessName: 'Blog',
      UserID: user.UserID,
      reference: blogId,
      Likes: likeValue || 0,
      LikeStatus: 0,
      Rating: ratingValue,
      RatingStatus: ratingValue ? 0 : null,
      AuthAdd: user.Name,
      AuthDel: null,
      AuthLstEdt: null,
      delOnDt: null,
      AddOnDt: currentDate,
      editOnDt: null,
      delStatus: 0
    });

    return {
      success: true,
      data: {
        liked: likeValue === 1,
        rating: ratingValue,
        interactionId: newInteraction.id,
      },
      message: "Blog interaction created successfully",
    };
  } catch (error) {
    console.error("Blog Like & Rate Error:", error);
    throw error;
  }
};
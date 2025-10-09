import db from "../models/index.js"; // assuming your models/index.js exports all models
import { logInfo, logWarning, logError } from "../helper/index.js";
import { Op } from "sequelize"; // ✅ direct import
import Community_Blog from "../models/Community_Blog.js";

const Blog = db.CommunityBlog;
const User = db.User;

// export const createBlogPost = async (userEmail, blogData) => {
//   try {
//     const user = await User.findOne({
//       where: { EmailId: userEmail, delStatus: 0 },
//       attributes: ["UserID", "Name", "isAdmin"],
//     });

//     if (!user) {
//       logWarning("User not found, please login first.");
//       return {
//         status: 400,
//         response: {
//           success: false,
//           data: {},
//           message: "User not found, please login first.",
//         },
//       };
//     }

//     const isAdmin = user.isAdmin === 1;
//     const status = isAdmin ? "Approved" : "Pending";
//     const approvedBy = isAdmin ? user.Name : null;
//     const approvedOn = isAdmin ? new Date() : null;

//     let repostUserId = null;
//     let repostId = null;

//     if (blogData.repostId && blogData.repostId !== 0) {
//       const originalBlog = await Blog.findOne({
//         where: { BlogID: blogData.repostId, delStatus: 0 },
//         attributes: ["UserID"],
//       });

//       if (originalBlog) {
//         repostUserId = originalBlog.UserID;
//         repostId = blogData.repostId;

//         if (originalBlog.Status === "Approved") {
//           status = "Approved";
//           approvedBy = originalBlog.ApprovedBy || "System Auto-Approval";
//           approvedOn = new Date();
//         }
//       }
//     }

//     const blogPost = await Blog.create({
//       title: blogData.title ?? null,
//       author: blogData.author ?? null,
//       content: blogData.content ?? null,
//       image: blogData.image ?? null,
//       Category: blogData.category ?? null,
//       publishedDate: blogData.publishedDate ?? null,
//       AuthAdd: user.Name,
//       AddOnDt: new Date(),
//       delStatus: 0,
//       Status: status,
//       AdminRemark: null,
//       ApprovedBy: approvedBy,
//       ApprovedOn: approvedOn,
//       UserID: user.UserID,
//       RepostID: blogData.repostId ?? null,
//       RepostUserID: repostUserId ?? null,
//       allowRepost: blogData.allowRepost ?? false, // Fixed: use blogData.allowRepost
//     });

//     console.log("blog body", blogPost);
//     logInfo("Blog posted successfully!");

//     return {
//       status: 200,
//       response: {
//         success: true,
//         data: { postId: blogPost.BlogID },
//         message: "Blog posted successfully!",
//       },
//     };
//   } catch (error) {
//     logError("Blog creation failed:", error);
//     return {
//       status: 500,
//       response: {
//         success: false,
//         data: error,
//         message: "Something went wrong while posting the blog",
//       },
//     };
//   }
// };

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

    let status = "Pending";
    let approvedBy = null;
    let approvedOn = null;

    // If admin user, auto approve
    if (user.isAdmin === 1) {
      status = "Approved";
      approvedBy = user.Name;
      approvedOn = new Date();
    }

    let repostUserId = null;
    let repostId = null;

    // ✅ Repost check
    if (blogData.repostId && blogData.repostId !== 0) {
      const originalBlog = await Blog.findOne({
        where: { BlogID: blogData.repostId, delStatus: 0 },
        attributes: ["UserID", "Status", "ApprovedBy", "ApprovedOn"],
      });

      if (originalBlog) {
        repostUserId = originalBlog.UserID;
        repostId = blogData.repostId;

        // ✅ Auto-approve repost if original was approved
        if (originalBlog.Status === "Approved") {
          status = "Approved";
          approvedBy = originalBlog.ApprovedBy || "System Auto-Approval";
          approvedOn = new Date();
        }
      }
    }

    // ✅ Create the blog or repost
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
      RepostID: repostId,
      RepostUserID: repostUserId,
      allowRepost: blogData.allowRepost ?? false,
    });

    logInfo("Blog posted successfully!");

    return {
      status: 200,
      response: {
        success: true,
        data: { postId: blogPost.BlogID, status },
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
      [Op.or]: [{ RepostID: null }, { RepostID: 0 }], 
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
    message: `Blog ${
      data.Status ? data.Status + "d" : "updated"
    } successfully!`,
    data: { blogId },
  };
};

export const handleBlogLikeAction = async (user, postData) => {
  try {
    const originalBlogId = postData.reference;
    if (!originalBlogId) throw new Error("Invalid blog reference");

    // Check if a like row already exists for this user & blog
    let likeRow = await Blog.findOne({
      where: {
        Reference: originalBlogId, // points to original blog
        UserID: user.UserID, // this user
      },
    });

    if (likeRow) {
      // Toggle Likes column (0 or 1)
      const newLikeStatus = postData.likes === 1 ? 1 : 0;

      await Blog.update(
        {
          Likes: newLikeStatus,
          AuthLstEdt: user.Name,
          editOnDt: new Date(),
        },
        {
          where: { BlogID: likeRow.BlogID },
        }
      );

      return {
        success: true,
        data: {
          liked: newLikeStatus === 1,
          blogLikeRowId: likeRow.BlogID,
        },
        message:
          newLikeStatus === 1
            ? "Blog liked successfully"
            : "Blog unliked successfully",
      };
    }

    // If no like row exists yet, insert a new one
    const newLike = await Blog.create({
      Reference: originalBlogId,
      UserID: user.UserID,
      AuthAdd: user.Name,
      AddOnDt: new Date(),
      Likes: postData.likes === 1 ? 1 : 0,
    });

    return {
      success: true,
      data: {
        liked: postData.likes === 1,
        blogLikeRowId: newLike.BlogID,
      },
      message:
        postData.likes === 1
          ? "Blog liked successfully"
          : "Blog unliked successfully",
    };
  } catch (error) {
    console.error("Blog Like Error:", error);
    throw error;
  }
};

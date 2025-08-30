import db from "../models/index.js"; // assuming your models/index.js exports all models
import { logInfo, logWarning, logError } from "../helper/index.js";
import { Op } from "sequelize"; // ✅ direct import

const Blog = db.CommunityBlog;
const User = db.User;

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
    });

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
      "UserID",
      "Status",
      "AdminRemark",
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
      "BlogID",
      "title",
      "AuthAdd", // alias for username
      "AddOnDt",
      "Status",
      ["Category", "category"],
      "publishedDate",
      "content",
      "image",
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

import db from "../models/index.js"; // assuming your models/index.js exports all models
import { logInfo, logWarning, logError } from "../helper/index.js";

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

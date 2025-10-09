import { body, validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import db from "../models/index.js";
import dotenv from "dotenv";
import {
  queryAsync,
  mailSender,
  logError,
  logInfo,
  logWarning,
} from "../helper/index.js";
import {
  createBlogPost,
  getBlogService,
  getPublicBlogsService,
  getUserBlogsService,
  handleBlogLikeAction,
  handleBlogRateAction,
  updateBlogService,
} from "../services/blogService.js";

const User = db.User;

dotenv.config();

export const blogpost_bulk = async (req, res) => {
  let success = false;
  const userId = req.user.id;
  // console.log(userId);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    logWarning(warningMessage);
    res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
    return;
  }
  try {
    const blogPosts = req.body;
    if (!Array.isArray(blogPosts)) {
      const warningMessage = "Request body should be an array of blog posts";
      logWarning(warningMessage);
      return res.status(400).json({ success: false, message: warningMessage });
    }
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        res
          .status(500)
          .json({ success: false, data: err, message: errorMessage });
        return;
      }

      try {
        const query = `SELECT UserID, Name FROM Community_User WHERE isnull(delStatus, 0) = 0 AND EmailId = ?`;
        const rows = await queryAsync(conn, query, [userId]);

        if (rows.length > 0) {
          const blogPostResults = [];
          for (let i = 0; i < blogPosts.length; i++) {
            let { title, author, content, image, category, publishedDate } =
              blogPosts[i];

            title = title ?? null;
            content = content ?? null;
            image = image ?? null;
            category = category ?? null;
            author = author ?? null;
            publishedDate = publishedDate ?? null;

            try {
              const blogPostQuery = `
                            INSERT INTO Community_Blog 
                            (title, author, content, category, image, publishedDate, AuthAdd, AddOnDt, delStatus) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), 0); 
                            `;
              const blogPost = await queryAsync(conn, blogPostQuery, [
                title,
                author,
                content,
                category,
                AddOnDt,
                image,
                publishedDate,
                AddOnDt,
                rows[0].Name,
                0,
              ]);

              const lastInsertedIdQuery = `SELECT TOP 1 BlogID FROM Community_Blog WHERE ISNULL(delStatus,0) = 0 ORDER BY BlogID DESC;`;
              const lastInsertedId = await queryAsync(
                conn,
                lastInsertedIdQuery
              );

              blogPostResults.push({
                success: true,
                postId: lastInsertedId[0].BlogID,
                message: `Blog ${i + 1} posted successfully`,
              });
            } catch (postErr) {
              logError(postErr);
              blogPostResults.push({
                success: false,
                postId: null,
                message: `Failed to post Blog ${i + 1}: ${postErr.message}`,
              });
            }
          }

          closeConnection();

          const failedPosts = blogPostResults.filter(
            (result) => !result.success
          );
          if (failedPosts.length > 0) {
            res.status(500).json({
              success: false,
              data: blogPostResults,
              message: "Some posts failed",
            });
          } else {
            success = true;
            const infoMessage = "All blogs posted successfully";
            logInfo(infoMessage);
            res
              .status(200)
              .json({ success, data: blogPostResults, message: infoMessage });
          }
          return;
        } else {
          closeConnection();
          const warningMessage = "User not found, please login first";
          logWarning(warningMessage);
          res
            .status(200)
            .json({ success: false, data: {}, message: warningMessage });
          return;
        }
      } catch (queryErr) {
        closeConnection();
        logError(queryErr);
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong, please try again",
        });
        return;
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong, please try again",
    });
  }
};

export const blogpost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logWarning("Data is not in the right format");
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const userEmail = req.user.id;
    const blogData = req.body;

    const result = await createBlogPost(userEmail, blogData);
    console.log("blog post result", result);

    return res.status(result.status).json(result.response);
  } catch (err) {
    logError("Unexpected Error in blogpost controller:", err);
    return res.status(500).json({
      success: false,
      data: err,
      message: "Unexpected error occurred",
    });
  }
};

// export const getBlog = async (req, res) => {
//   const userId = req.user.id;
//   // console.log("User ID:", userId);
//   let success = false;

//   try {
//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         const errorMessage = "Failed to connect to database";
//         logError(err);
//         res.status(500).json({ success: false, data: err, message: errorMessage });
//         return;``
//       }
//       try {
//         // const BlogQuery = `SELECT BlogID, title, AuthAdd as UserName, author, content, Category as category, publishedDate, AddOnDt as timestamp, image, UserID, Status, AdminRemark FROM Community_Blog WHERE ISNULL(delStatus, 0) = 0  ORDER BY AddOnDt DESC`;

//         const userQuery = `SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
//         const userRows = await queryAsync(conn, userQuery, [userId]);

//         if (userRows.length > 0) {
//           var conditionParam = "";
//           const user = userRows[0];

//           const isAdmin = user.isAdmin === 1;
//           // console.log("is admin ", isAdmin)

//           isAdmin != 1

//           conditionParam = "and Status = 'Approved'";
//         }

//         const BlogQuery = `SELECT BlogID, title, AuthAdd as UserName, author, content, Category as category, publishedDate, AddOnDt as timestamp, image, UserID, Status,
//         AdminRemark FROM Community_Blog
//         WHERE ISNULL(delStatus, 0) = 0 `+ conditionParam + `ORDER BY AddOnDt DESC`
//         const BlogGet = await queryAsync(conn, BlogQuery);
//         success = true;
//         closeConnection();
//         const infoMessage = "Blog Got Successfully";
//         logInfo(infoMessage);
//         res.status(200).json({ success, data: BlogGet, message: infoMessage });
//       }
//       catch (queryErr) {
//         logError(queryErr);
//         closeConnection();
//         res.status(500).json({ success: false, data: queryErr, message: 'Something went wrong please try again' });
//       }
//     })
//   }
//   catch (error) {
//     logError(error);
//     res.status(500).json({ success: false, data: {}, message: 'Something went wrong please try again' });
//   }
// }

// export const getBlog = async (req, res) => {
//   let success = false;
//   const userId = req.user?.id;

//   if (!userId) {
//     return res
//       .status(400)
//       .json({ success, data: {}, message: "User ID not found. Please login." });
//   }

//   try {
//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         logError("Failed to connect to database");
//         return res
//           .status(500)
//           .json({
//             success,
//             data: err,
//             message: "Failed to connect to database",
//           });
//       }

//       try {
//         const userQuery = `SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
//         const userRows = await queryAsync(conn, userQuery, [userId]);

//         if (userRows.length === 0) {
//           closeConnection();
//           return res
//             .status(404)
//             .json({ success, data: {}, message: "User not found" });
//         }

//         const user = userRows[0];
//         const isAdmin = user.isAdmin === 1;
//         let conditionParam = "";
//         let userSpecificCondition = `AND UserID = ${user.UserID}`;

//         if (!isAdmin) {
//           conditionParam = "AND Status = 'Approved'";
//           // Non-admins should see both their own blogs (regardless of status) and approved blogs from others
//           userSpecificCondition = `AND (UserID = ${user.UserID} OR Status = 'Approved')`;
//         }

//         // Get total count of blogs for the logged-in user
//         const userBlogCountQuery = `
//             SELECT COUNT(*) AS userBlogCount
//             FROM Community_Blog
//             WHERE ISNULL(delStatus, 0) = 0
//             AND UserID = ${user.UserID}
//           `;
//         const userCountResult = await queryAsync(conn, userBlogCountQuery);
//         const userBlogCount = userCountResult[0].userBlogCount;

//         // Get total count of all visible blogs (for reference)
//         const totalCountQuery = `
//             SELECT COUNT(*) AS totalCount
//             FROM Community_Blog
//             WHERE ISNULL(delStatus, 0) = 0 ${conditionParam}
//           `;
//         const totalCountResult = await queryAsync(conn, totalCountQuery);
//         const totalCount = totalCountResult[0].totalCount;

//         // Get blog data with appropriate visibility
//         const BlogQuery = `
//             SELECT BlogID, title, AuthAdd as UserName, author, content, Category as category, publishedDate,
//                    AddOnDt as timestamp, image, UserID, Status, AdminRemark
//             FROM Community_Blog
//             WHERE ISNULL(delStatus, 0) = 0 ${userSpecificCondition}
//             ORDER BY AddOnDt DESC;
//           `;

//         const BlogGet = await queryAsync(conn, BlogQuery);
//         success = true;
//         closeConnection();
//         logInfo("Blogs fetched successfully");

//         return res.status(200).json({
//           success,
//           data: BlogGet,
//           // totalCount,
//           userBlogCount, // Count of blogs belonging to the logged-in user
//           message: "Blogs fetched successfully",
//         });
//       } catch (queryErr) {
//         closeConnection();
//         logError("Database Query Error:", queryErr);
//         return res
//           .status(500)
//           .json({ success, data: queryErr, message: "Database Query Error" });
//       }
//     });
//   } catch (error) {
//     logError("Unexpected Error:", error);
//     return res
//       .status(500)
//       .json({
//         success: false,
//         data: error,
//         message: "Unexpected Error, check logs",
//       });
//   }
// };

export const getBlog = async (req, res) => {
  let success = false;
  const userId = req.user?.id; // coming from auth middleware

  if (!userId) {
    return res.status(400).json({
      success,
      data: {},
      message: "User ID not found. Please login.",
    });
  }

  try {
    const result = await getBlogService(userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    logInfo("Blogs fetched successfully");

    return res.status(200).json({
      success: true,
      data: result.data,
      userBlogCount: result.userBlogCount,
      totalCount: result.totalCount,
      message: result.message,
    });
  } catch (error) {
    logError(error.message || "Unknown error", error.stack);

    // ✅ FIXED: Send JSON response instead of returning a plain object
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateBlog = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const blogId = req.params.blogId;
    const result = await updateBlogService(blogId, req.user, req.body);

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in updateBlog controller:", error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong, please try again",
    });
  }
};

export const getUserBlogs = async (req, res) => {
  let success = false;
  const userEmail = req.user?.id; // middleware should put email in req.user.id

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    logWarning(warningMessage);
    return res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
  }

  if (!userEmail) {
    const warningMessage = "User email not found. Please login.";
    logWarning(warningMessage);
    return res.status(400).json({ success, data: {}, message: warningMessage });
  }

  try {
    const result = await getUserBlogsService(userEmail);

    if (!result.success) {
      return res.status(404).json(result);
    }

    logInfo("User's blogs fetched successfully");

    return res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    logError(error.message || "Unknown error", error.stack);

    return res.status(500).json({
      success: false,
      message: error.message || "Unexpected error occurred",
    });
  }
};

export const getPublicBlogs = async (req, res) => {
  try {
    const result = await getPublicBlogsService();

    if (!result.success) {
      return res.status(404).json(result);
    }

    logInfo("Public blogs fetched successfully");

    return res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    logError(error.message || "Unknown error", error.stack);

    return res.status(500).json({
      success: false,
      message: error.message || "Unexpected error occurred",
    });
  }
};

export const likeBlogController = async (req, res) => {
  try {
    const userEmail = req.user?.id;
    const postData = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User not logged in",
      });
    }

    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
    });

    if (!user) throw new Error("User not found");

    const result = await handleBlogLikeAction(user, postData);

    return res.status(200).json(result);
  } catch (err) {
    console.error("Like Blog Controller Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};


export const rateBlogController = async (req, res) => {
  try {
    const userEmail = req.user?.id;
    const blogId = req.params.blogId;
    const { rating } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User not logged in",
      });
    }

    const user = await User.findOne({
      where: { EmailId: userEmail, delStatus: 0 },
    });

    if (!user) throw new Error("User not found");

    const result = await handleBlogRateAction(user, {
      reference: blogId,
      rating: parseInt(rating)
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Rate Blog Controller Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};
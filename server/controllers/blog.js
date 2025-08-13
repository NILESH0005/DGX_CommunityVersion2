import { body, validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import dotenv from "dotenv";
import {
  queryAsync,
  mailSender,
  logError,
  logInfo,
  logWarning,
} from "../helper/index.js";

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
                image,
                publishedDate,
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
  let success = false;
  const userId = req.user.id;
  // console.log("User ID:", userId);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logWarning("Data is not in the right format");
    return res.status(400).json({
      success,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }
  try {
    let { title, author, content, image, category, publishedDate } = req.body;
    title = title ?? null;
    content = content ?? null;
    image = image ?? null;
    category = category ?? null;
    author = author ?? null;
    publishedDate = publishedDate ?? null;

    connectToDatabase(async (err, conn) => {
      if (err) {
        logError("Failed to connect to database");
        closeConnection();
        return res.status(500).json({
          success: false,
          data: err,
          message: "Failed to connect to database",
        });
      }

      try {
        // Fetch user details (including admin status)
        const userQuery = `SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);

        if (userRows.length > 0) {
          const user = userRows[0];
          const isAdmin = user.isAdmin === 1;

          // Determine approval details based on admin status
          const status = isAdmin ? "Approved" : "Pending";
          const approvedBy = isAdmin ? user.Name : null;
          const approvedOn = isAdmin ? new Date() : null;

          // Insert blog post
          const blogPostQuery = `
                          INSERT INTO Community_Blog 
                          (title, author, content, Category, image, publishedDate, AuthAdd, AddOnDt, delStatus, Status, AdminRemark, ApprovedBy, ApprovedOn, UserID) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), 0, ?, ?, ?, ?, ?);
                      `;
          const blogPost = await queryAsync(conn, blogPostQuery, [
            title,
            author,
            content,
            category,
            image,
            publishedDate,
            user.Name,
            status,
            null,
            approvedBy,
            approvedOn,
            user.UserID,
          ]);

          // Fetch last inserted Blog ID
          const lastInsertedIdQuery = `SELECT TOP 1 BlogID FROM Community_Blog WHERE ISNULL(delStatus, 0) = 0 ORDER BY BlogID DESC;`;
          const lastInsertedId = await queryAsync(conn, lastInsertedIdQuery);

          success = true;
          closeConnection();
          logInfo("Blog posted successfully!");

          return res.status(200).json({
            success,
            data: { postId: lastInsertedId[0].BlogID },
            message: "Blog posted successfully!",
          });
        } else {
          closeConnection();
          logWarning("User not found, please login first.");
          return res.status(400).json({
            success: false,
            data: {},
            message: "User not found, please login first.",
          });
        }
      } catch (queryErr) {
        closeConnection();
        logError("Database Query Error:", queryErr);
        return res.status(500).json({
          success: false,
          data: queryErr,
          message: "Database Query Error",
        });
      }
    });
  } catch (error) {
    logError("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      data: error,
      message: "Unexpected Error, check logs",
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
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({
      success,
      data: {},
      message: "User ID not found. Please login.",
    });
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        closeConnection();
        return res.status(500).json({
          success,
          data: err,
          message: "Failed to connect to database",
        });
      }

      try {
        const userQuery = `SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);

        if (userRows.length === 0) {
          closeConnection();
          return res.status(404).json({
            success,
            data: {},
            message: "User not found",
          });
        }

        const user = userRows[0];
        const isAdmin = user.isAdmin === 1;

        // For admins - no restrictions, show all blogs
        // For regular users - show their own blogs + approved blogs from others
        const visibilityCondition = isAdmin
          ? ""
          : `AND (UserID = ${user.UserID} OR Status = 'Approved')`;

        // Get counts
        const userBlogCountQuery = `
          SELECT COUNT(*) AS userBlogCount 
          FROM Community_Blog 
          WHERE ISNULL(delStatus, 0) = 0 
          AND UserID = ${user.UserID}
        `;

        const totalCountQuery = `
          SELECT COUNT(*) AS totalCount 
          FROM Community_Blog 
          WHERE ISNULL(delStatus, 0) = 0
          ${isAdmin ? "" : "AND Status = 'Approved'"}
        `;

        const [userCountResult, totalCountResult] = await Promise.all([
          queryAsync(conn, userBlogCountQuery),
          queryAsync(conn, totalCountQuery),
        ]);

        // Get blog data
        const BlogQuery = `
        SELECT 
            BlogID, title, AuthAdd as UserName, author, content, 
            Category as category, AddOnDt, AddOnDt as timestamp, 
            image, UserID, Status, AdminRemark
          FROM Community_Blog  
          WHERE ISNULL(delStatus, 0) = 0 
          ${visibilityCondition}
          ORDER BY AddOnDt DESC;
        `;

        const BlogGet = await queryAsync(conn, BlogQuery);
        closeConnection();

        return res.status(200).json({
          success: true,
          data: BlogGet,
          userBlogCount: userCountResult[0].userBlogCount,
          message: "Blogs fetched successfully",
        });
      } catch (queryErr) {
        closeConnection();
        logError("Database Query Error:", queryErr);
        return res.status(500).json({
          success,
          data: queryErr,
          message: "Database Query Error",
        });
      }
    });
  } catch (error) {
    logError("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      data: error,
      message: "Unexpected Error, check logs",
    });
  }
};

export const updateBlog = async (req, res) => {
  let success = false;
  const userId = req.user.id;
  // console.log("user ID:", userId);

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
    let {
      title,
      author,
      content,
      publishedDate,
      category,
      image,
      Status,
      remark,
    } = req.body;

    const blogId = req.params.blogId;

    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        res.status(500).json({
          success: false,
          data: err,
          message: "Failed to connect to database",
        });
        return;
      }

      try {
        const checkBlogQuery = `
              SELECT BlogID, AuthAdd 
              FROM Community_Blog
              WHERE BlogID = ? AND isnull(delStatus, 0) = 0;
            `;
        const blogRows = await queryAsync(conn, checkBlogQuery, [blogId]);

        if (blogRows.length === 0) {
          logWarning("Blog not found");
          closeConnection();
          res
            .status(404)
            .json({ success: false, data: {}, message: "Blog not found" });
          return;
        }

        if (req.user.isAdmin !== 1) {
          logWarning("You are not authorized to perform this action");
          closeConnection();
          res.status(403).json({
            success: false,
            data: {},
            message: "You are not authorized",
          });
          return;
        }

        if (Status === "approve" && Status === "Approved") {
          logWarning("Blog is already approved");
          closeConnection();
          res.status(400).json({
            success: false,
            data: {},
            message: "Blog is already approved",
          });
          return;
        }

        if (Status === "reject" && Status === "Rejected") {
          logWarning("Blog is already rejected");
          res.status(400).json({
            success: false,
            data: {},
            message: "Blog is already rejected",
          });
          return;
        }

        let query;
        let queryParams;

        switch (Status) {
          case "approve":
            query = `
                  UPDATE Community_Blog 
                  SET Status = 'Approved', ApprovedBy = ?, ApprovedOn = GETDATE(), AuthLstEdit = ?, editOnDt = GETDATE() 
                  WHERE BlogID = ?;
                `;
            queryParams = [userId, userId, blogId];
            break;

          case "reject":
            if (!remark || typeof remark !== "string") remark = "";

            query = `
                  UPDATE Community_Blog 
                  SET Status = 'Rejected', AdminRemark = ?, AuthLstEdit = ?, editOnDt = GETDATE() 
                  WHERE BlogID = ?;
                `;
            queryParams = [String(remark), userId, blogId];
            break;

          case "delete":
            query = `
                  UPDATE Community_Blog 
                  SET delStatus = 1, AuthLstEdit = ?, delOnDt = GETDATE() 
                  WHERE BlogID = ?;
                `;
            queryParams = [userId, blogId];
            break;

          default:
            query = `
                  UPDATE Community_Blog 
                  SET title = ?, author = ?, content = ?, publishedDate = ?, Category = ?, image = ?, 
                      AuthLstEdit = ?, editOnDt = GETDATE() 
                  WHERE BlogID = ?;
                `;
            queryParams = [
              title,
              author,
              content,
              publishedDate,
              category,
              image,
              userId,
              blogId,
            ];
            break;
        }

        await queryAsync(conn, query, queryParams);
        success = true;
        closeConnection();

        const infoMessage = `Blog ${
          Status ? Status + "d" : "updated"
        } successfully!`;
        logInfo(infoMessage);

        res
          .status(200)
          .json({ success, data: { blogId }, message: infoMessage });
      } catch (queryErr) {
        closeConnection();
        logError(`Error updating blog ${blogId} : ${queryErr.message}`);
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong, please try again",
        });
      }
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong, please try again",
    });
  }
};

export const getUserBlogs = async (req, res) => {
  let success = false;
  const userEmail = req.user?.id;

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
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(errorMessage, err);
        return res
          .status(500)
          .json({ success: false, data: err, message: errorMessage });
      }

      try {
        const userQuery = `SELECT UserID FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userEmail]);

        if (userRows.length === 0) {
          const warningMessage = "User not found";
          logWarning(warningMessage);
          closeConnection();
          return res
            .status(404)
            .json({ success, data: {}, message: warningMessage });
        }

        const userId = userRows[0].UserID;
        const countQuery = `
            SELECT COUNT(*) as totalCount 
            FROM Community_Blog 
            WHERE ISNULL(delStatus, 0) = 0 
              AND UserID = ? 
              AND Status IN ('Pending', 'Rejected', 'Approved')
          `;
        const countResult = await queryAsync(conn, countQuery, [userId]);
        const totalCount = countResult[0].totalCount;

        // Get blog data
        const BlogQuery = `
            SELECT 
              BlogID, 
              title, 
              AuthAdd as UserName, 
              author, 
              content, 
              Category as category, 
              publishedDate, 
              AddOnDt as timestamp, 
              image, 
              UserID, 
              Status, 
              AdminRemark
            FROM Community_Blog 
            WHERE ISNULL(delStatus, 0) = 0 
              AND UserID = ? 
              AND Status IN ('Pending', 'Rejected', 'Approved')
            ORDER BY AddOnDt DESC;
          `;

        const blogs = await queryAsync(conn, BlogQuery, [userId]);

        success = true;
        closeConnection();
        const infoMessage = "User's blogs fetched successfully";
        logInfo(infoMessage);

        return res.status(200).json({
          success,
          data: {
            blogs,
            totalCount,
          },
          message: infoMessage,
        });
      } catch (queryErr) {
        const errorMessage = "Database query error";
        logError(errorMessage, queryErr);
        closeConnection();
        return res.status(500).json({
          success: false,
          data: queryErr,
          message: errorMessage,
        });
      }
    });
  } catch (error) {
    const errorMessage = "Unexpected error occurred";
    logError(errorMessage, error);
    return res.status(500).json({
      success: false,
      data: error,
      message: errorMessage,
    });
  }
};

export const getPublicBlogs = async (req, res) => {
  let success = false;

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        closeConnection();
        return res.status(500).json({
          success,
          data: err,
          message: "Failed to connect to database",
        });
      }

      try {
        // Get only approved blogs with basic public information
        const publicBlogQuery = `
          SELECT 
            BlogID, 
            title, 
            --author,
			      AuthAdd,
				  AddOnDt,
			      Status,
            Category as category, 
            publishedDate, 
			      content,
            image
          FROM Community_Blog 
          WHERE ISNULL(delStatus, 0) = 0 
          AND Status = 'Approved'
          ORDER BY AddOnDt DESC;
        `;

        const publicBlogs = await queryAsync(conn, publicBlogQuery);
        closeConnection();

        return res.status(200).json({
          success: true,
          data: publicBlogs,
          message: "Public blogs fetched successfully",
        });
      } catch (queryErr) {
        closeConnection();
        logError("Database Query Error:", queryErr);
        return res.status(500).json({
          success,
          data: queryErr,
          message: "Database Query Error",
        });
      }
    });
  } catch (error) {
    logError("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      data: error,
      message: "Unexpected Error, check logs",
    });
  }
};

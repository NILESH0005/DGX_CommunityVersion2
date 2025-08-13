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

// export const discussionpost = async (req, res) => {
//   console.log("incoming req body", req.body);
//   let success = false;
//   const userId = req.user.id;

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const warningMessage = "Data is not in the right format";
//     logWarning(warningMessage);
//     res
//       .status(400)
//       .json({ success, data: errors.array(), message: warningMessage });
//     return;
//   }

//   try {
//     let {
//       title,
//       content,
//       image,
//       likes,
//       comment,
//       tags,
//       url,
//       visibility,
//       reference,
//     } = req.body;
//     const threadReference = reference ?? 0;
//     title = title ?? null;
//     content = content ?? null;
//     image = image ?? null;
//     likes = likes ?? null;
//     comment = comment ?? null;
//     tags = tags ?? null;
//     url = url ?? null;
//     visibility = visibility ?? null;

//     // Connect to the database
//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         const errorMessage = "Failed to connect to database";
//         logError(err);
//         res
//           .status(500)
//           .json({ success: false, data: err, message: errorMessage });
//         return;
//       }

//       try {
//         const query = `SELECT UserID, Name FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
//         const rows = await queryAsync(conn, query, [userId]);

//         if (rows.length > 0) {
//           // Get visibility ID from tblDDReferences
//           let visibilityId = null;
//           if (visibility) {
//             const visibilityQuery = `SELECT idCode FROM tblDDReferences WHERE ddCategory = 'Privacy' AND ddValue = ? AND ISNULL(delStatus,0) = 0`;
//             const visibilityResult = await queryAsync(conn, visibilityQuery, [
//               visibility,
//             ]);
//             if (visibilityResult.length > 0) {
//               visibilityId = visibilityResult[0].idCode;
//             }
//           }

//           if (likes !== null) {
//             const likeExistsQuery = `SELECT DiscussionID FROM Community_Discussion WHERE ISNULL(delStatus,0)=0 AND Reference=? AND UserID=? AND Likes IS NOT NULL;`;
//             const likeExists = await queryAsync(conn, likeExistsQuery, [
//               threadReference,
//               rows[0].UserID,
//             ]);
//             if (likeExists.length > 0) {
//               const updateLikeQuery = `UPDATE Community_Discussion SET Likes=?, AuthLstEdit=?, editOnDt=GETDATE() WHERE ISNULL(delStatus,0)=0 AND DiscussionID=?`;
//               await queryAsync(conn, updateLikeQuery, [
//                 likes,
//                 rows[0].Name,
//                 likeExists[0].DiscussionID,
//               ]);
//               closeConnection();
//               res.status(200).json({
//                 success: true,
//                 data: {},
//                 message: "Like Posted Successfully",
//               });
//               return;
//             }
//           }

//           const discussionPostQuery = `
//                         INSERT INTO Community_Discussion
//                         (UserID, Title, Content, Image, Likes, Comment, Tag, Visibility, Reference, ResourceUrl, AuthAdd, AddOnDt, delStatus)
//                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?);
//                     `;
//           await queryAsync(conn, discussionPostQuery, [
//             rows[0].UserID,
//             title,
//             content,
//             image,
//             likes,
//             comment,
//             tags,
//             visibilityId, // Store the ID instead of the string
//             threadReference,
//             url,
//             rows[0].Name,
//             0,
//           ]);

//           const lastInsertedIdQuery = `SELECT TOP 1 DiscussionID, Visibility FROM Community_Discussion WHERE ISNULL(delStatus,0)=0 ORDER BY DiscussionID DESC;`;
//           const lastInsertedId = await queryAsync(conn, lastInsertedIdQuery);

//           const lstInsertedVisibilityValue = `SELECT ddValue FROM tblDDReferences WHERE idCode=? AND ISNULL(delStatus,0)=0`;
//           const visibilityValue = await queryAsync(
//             conn,
//             lstInsertedVisibilityValue,
//             [lastInsertedId[0].Visibility]
//           );

//           success = true;
//           closeConnection();
//           const infoMessage = "Discussion Posted Successfully";
//           logInfo(infoMessage);
//           res.status(200).json({
//             success,
//             data: {
//               postId: lastInsertedId[0].DiscussionID,
//               visibility: {
//                 value: visibilityValue[0]?.ddValue || null,
//                 id: lastInsertedId[0].Visibility,
//               },
//               action: likes !== null ? 'like' : comment !== null ? 'comment' : 'post'

//             },
//             message: infoMessage,
//           });
//           return;
//         } else {
//           closeConnection();
//           const warningMessage = "User not found login first";
//           logWarning(warningMessage);
//           res
//             .status(200)
//             .json({ success: false, data: {}, message: warningMessage });
//           return;
//         }
//       } catch (queryErr) {
//         closeConnection();
//         console.error("Database Query Error:", queryErr);
//         logError(queryErr);
//         res.status(500).json({
//           success: false,
//           data: queryErr,
//           message: "Something went wrong please try again",
//         });
//         return;
//       }
//     });
//   } catch (error) {
//     logError(error);
//     return res.status(500).json({
//       success: false,
//       data: {},
//       message: "Something went wrong please try again",
//     });
//   }
// };

export const discussionpost = async (req, res) => {
  // console.log("incoming req body", req.body);
  let success = false;
  const userId = req.user.id;

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
      content,
      likes,
      comment,
      tags,
      url,
      visibility,
      reference,
      bannerImagePath, // This will come from the FileUploader
    } = req.body;

    const threadReference = reference ?? 0;
    title = title ?? null;
    content = content ?? null;
    likes = likes ?? null;
    comment = comment ?? null;
    tags = tags ?? null;
    url = url ?? null;
    visibility = visibility ?? null;
    bannerImagePath = bannerImagePath ?? null; // Handle null case for image path

    // Connect to the database
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
        const query = `SELECT UserID, Name FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
        const rows = await queryAsync(conn, query, [userId]);

        if (rows.length > 0) {
          // Get visibility ID from tblDDReferences
          let visibilityId = null;
          if (visibility) {
            const visibilityQuery = `SELECT idCode FROM tblDDReferences WHERE ddCategory = 'Privacy' AND ddValue = ? AND ISNULL(delStatus,0) = 0`;
            const visibilityResult = await queryAsync(conn, visibilityQuery, [
              visibility,
            ]);
            if (visibilityResult.length > 0) {
              visibilityId = visibilityResult[0].idCode;
            }
          }

          if (likes !== null) {
            const likeExistsQuery = `SELECT DiscussionID FROM Community_Discussion WHERE ISNULL(delStatus,0)=0 AND Reference=? AND UserID=? AND Likes IS NOT NULL;`;
            const likeExists = await queryAsync(conn, likeExistsQuery, [
              threadReference,
              rows[0].UserID,
            ]);
            if (likeExists.length > 0) {
              const updateLikeQuery = `UPDATE Community_Discussion SET Likes=?, AuthLstEdit=?, editOnDt=GETDATE() WHERE ISNULL(delStatus,0)=0 AND DiscussionID=?`;
              await queryAsync(conn, updateLikeQuery, [
                likes,
                rows[0].Name,
                likeExists[0].DiscussionID,
              ]);
              closeConnection();
              res.status(200).json({
                success: true,
                data: {},
                message: "Like Posted Successfully",
              });
              return;
            }
          }

          const discussionPostQuery = `
            INSERT INTO Community_Discussion 
            (UserID, Title, Content, Image, Likes, Comment, Tag, Visibility, Reference, ResourceUrl, AuthAdd, AddOnDt, delStatus, DiscussionImagePath) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?, ?); 
          `;

          await queryAsync(conn, discussionPostQuery, [
            rows[0].UserID,
            title,
            content,
            null, // Keeping the original Image field as null since we're using DiscussionImagePath
            likes,
            comment,
            tags,
            visibilityId, // Store the ID instead of the string
            threadReference,
            url,
            rows[0].Name,
            0,
            bannerImagePath, // Store the relative path to the uploaded image
          ]);

          const lastInsertedIdQuery = `SELECT TOP 1 DiscussionID, Visibility FROM Community_Discussion WHERE ISNULL(delStatus,0)=0 ORDER BY DiscussionID DESC;`;
          const lastInsertedId = await queryAsync(conn, lastInsertedIdQuery);

          const lstInsertedVisibilityValue = `SELECT ddValue FROM tblDDReferences WHERE idCode=? AND ISNULL(delStatus,0)=0`;
          const visibilityValue = await queryAsync(
            conn,
            lstInsertedVisibilityValue,
            [lastInsertedId[0].Visibility]
          );

          success = true;
          closeConnection();
          const infoMessage = "Discussion Posted Successfully";
          logInfo(infoMessage);
          res.status(200).json({
            success,
            data: {
              postId: lastInsertedId[0].DiscussionID,
              visibility: {
                value: visibilityValue[0]?.ddValue || null,
                id: lastInsertedId[0].Visibility,
              },
              action:
                likes !== null ? "like" : comment !== null ? "comment" : "post",
              imagePath: bannerImagePath, // Return the image path to the client
            },
            message: infoMessage,
          });
          return;
        } else {
          closeConnection();
          const warningMessage = "User not found login first";
          logWarning(warningMessage);
          res
            .status(200)
            .json({ success: false, data: {}, message: warningMessage });
          return;
        }
      } catch (queryErr) {
        closeConnection();
        // console.error("Database Query Error:", queryErr);
        logError(queryErr);
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
        return;
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};

export const getdiscussion = async (req, res) => {
  let success = false;
  const userId = req.body.user;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    console.error(warningMessage, errors.array());
    res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
    return;
  }

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        res
          .status(500)
          .json({ success: false, data: err, message: errorMessage });
        return;
      }

      try {
        let rows = [];
        if (userId !== null && userId !== undefined) {
          const query = `SELECT UserID, Name FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
          rows = await queryAsync(conn, query, [userId]);
        }

        if (rows.length === 0) {
          rows.push({ UserID: null });
        }

        // First get all comment counts in one query using your CTE approach
        const commentCountsQuery = `
          WITH CommentTree AS (
              SELECT d.DiscussionID as id, cd.discussionId, cd.[likes], cd.comment, cd.Reference, cd.AddOnDt
              FROM Community_Discussion cd
              JOIN Community_Discussion d ON cd.Reference = d.DiscussionID
              WHERE ISNULL(cd.delStatus, 0) = 0 AND ISNULL(d.delStatus, 0) = 0
              
              UNION ALL
                  SELECT ct.id, t.discussionId, t.[likes], t.comment, t.Reference, t.AddOnDt
              FROM Community_Discussion t
              INNER JOIN CommentTree ct
                  ON t.Reference = ct.discussionId
              WHERE ISNULL(t.delStatus, 0) = 0
          )
          SELECT id as discussionId, count(1) as commentCount 
          FROM CommentTree 
          WHERE isnull(comment,'') <> ''
          GROUP BY id;
        `;
        const commentCountsResult = await queryAsync(conn, commentCountsQuery);

        // Convert to a map for easy lookup
        const commentCountsMap = new Map();
        commentCountsResult.forEach((row) => {
          commentCountsMap.set(row.discussionId, row.commentCount);
        });

        // Recursive function to fetch comments and their replies
        const fetchCommentsWithReplies = async (parentId) => {
          const commentsQuery = `
    SELECT 
      cd.DiscussionID, 
      cd.UserID, 
      cd.Comment, 
      cu.Name as UserName,
      cd.AddOnDt as timestamp, 
      cd.Likes, 
      cd.Reference,
      (
        SELECT COUNT(*) 
        FROM Community_Discussion 
        WHERE ISNULL(delStatus, 0) = 0 
        AND Likes > 0 
        AND Reference = cd.DiscussionID
      ) as likeCount,
      CASE WHEN EXISTS (
        SELECT 1 FROM Community_Discussion 
        WHERE ISNULL(delStatus, 0) = 0 
        AND Likes > 0 
        AND Reference = cd.DiscussionID 
        AND UserID = ?
      ) THEN 1 ELSE 0 END as userLike
    FROM Community_Discussion cd
    JOIN Community_User cu ON cd.UserID = cu.UserID
    WHERE ISNULL(cd.delStatus, 0) = 0 
      AND cd.Comment IS NOT NULL 
      AND cd.Reference = ?
    ORDER BY cd.AddOnDt DESC
  `;
          const comments = await queryAsync(conn, commentsQuery, [
            rows[0].UserID,
            parentId,
          ]);

          for (const comment of comments) {
            comment.comment = await fetchCommentsWithReplies(
              comment.DiscussionID
            );

            const likeQuery = `
      SELECT DiscussionID 
      FROM Community_Discussion 
      WHERE ISNULL(delStatus, 0) = 0 
        AND Likes > 0 
        AND Reference = ? 
        AND UserID = ?
    `;
            const userLikeResult = await queryAsync(conn, likeQuery, [
              comment.DiscussionID,
              rows[0].UserID,
            ]);

            comment.userLike = userLikeResult.length > 0 ? 1 : 0;

            // Get like count
            const likeCountQuery = `
      SELECT COUNT(*) as likeCount 
      FROM Community_Discussion 
      WHERE ISNULL(delStatus, 0) = 0 
        AND Likes > 0 
        AND Reference = ?
    `;
            const likeCountResult = await queryAsync(conn, likeCountQuery, [
              comment.DiscussionID,
            ]);
            comment.likeCount = likeCountResult[0].likeCount || 0;

            // Recursively fetch replies - THIS IS THE KEY LINE THAT WAS MISSING/MODIFIED
            comment.comment = await fetchCommentsWithReplies(
              comment.DiscussionID
            );
          }

          return comments;
        };

        // Fetch main discussions with proper username
        const discussionGetQuery = `
          SELECT 
    d.DiscussionID,
    d.UserID,
    d.Title,
    d.Content,
    d.Likes,
    d.Comment,
    d.Tag,
    d.Visibility,
    d.Reference,
    d.ResourceUrl,
    d.AuthAdd,
    d.AuthDel,
    d.AuthLstEdit,
    d.delOnDt,
    d.AddOnDt,
    d.editOnDt,
    d.delStatus,
    d.DiscussionImagePath,
    u.Name AS UserName,
    r.ddValue AS VisibilityName
FROM 
    Community_Discussion d
JOIN 
    Community_User u ON d.UserID = u.UserID
JOIN 
    tblDDReferences r ON TRY_CAST(d.Visibility AS INT) = r.idCode
WHERE 
    ISNULL(d.delStatus, 0) = 0
    AND d.Reference = 0
    AND r.ddCategory = 'Privacy'
    AND r.ddValue = 'Public'
    AND TRY_CAST(d.Visibility AS INT) IS NOT NULL
ORDER BY 
    d.AddOnDt DESC;

        `;
        const discussionGet = await queryAsync(conn, discussionGetQuery);

        const updatedDiscussions = [];

        for (const item of discussionGet) {
          // Get like count for the post
          const likeCountQuery = `
            SELECT COUNT(*) as likeCount 
            FROM Community_Discussion 
            WHERE ISNULL(delStatus, 0) = 0 
              AND Likes > 0 
              AND Reference = ?
          `;
          const likeCountResult = await queryAsync(conn, likeCountQuery, [
            item.DiscussionID,
          ]);
          const likeCount = likeCountResult[0].likeCount || 0;

          // Check if user liked this post
          const userLikeQuery = `
            SELECT DiscussionID 
            FROM Community_Discussion 
            WHERE ISNULL(delStatus, 0) = 0 
              AND Likes > 0 
              AND Reference = ? 
              AND UserID = ?
          `;
          const userLikeResult = await queryAsync(conn, userLikeQuery, [
            item.DiscussionID,
            rows[0].UserID,
          ]);
          const userLike = userLikeResult.length > 0 ? 1 : 0;

          // Get comment count from our pre-calculated map
          const commentCount = commentCountsMap.get(item.DiscussionID) || 0;

          // Fetch comments with all nested replies
          const comments = await fetchCommentsWithReplies(item.DiscussionID);

          updatedDiscussions.push({
            ...item,
            likeCount,
            userLike,
            commentCount,
            comment: comments,
            ImageUrl: item.DiscussionImagePath
              ? `${req.protocol}://${req.get("host")}/${
                  item.DiscussionImagePath
                }`
              : null,
          });
        }

        success = true;
        closeConnection();
        const infoMessage = "Discussion Get Successfully";
        res.status(200).json({
          success,
          data: { updatedDiscussions },
          message: infoMessage,
        });
      } catch (queryErr) {
        console.error(queryErr);
        closeConnection();
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong please try again",
    });
  }
};

// export const getdiscussion = async (req, res) => {
//   let success = false;
//   // console.log("user is", req.body);

//   const userId = req.body.user;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const warningMessage = "Data is not in the right format";
//     // console.error(warningMessage, errors.array());
//     logWarning(warningMessage);
//     res.status(400).json({ success, data: errors.array(), message: warningMessage });
//     return;
//   }

//   try {
//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         const errorMessage = "Failed to connect to database";
//         logError(err);
//         res.status(500).json({ success: false, data: err, message: errorMessage });
//         return;
//       }

//       try {
//         let rows = [];
//         if (userId !== null && userId !== undefined) {
//           const query = `SELECT UserID, Name FROM Community_User WHERE isnull(delStatus,0) = 0 AND EmailId = ?`;
//           rows = await queryAsync(conn, query, [userId]);
//         }

//         if (rows.length === 0) {
//           rows.push({ UserID: null });
//         }

//         // Step 1: Fetch total comment counts per root discussion using recursive CTE
//         const commentCountQuery = `
//           ;WITH CommentTree AS (
//             SELECT d.DiscussionID, d.Comment, d.Reference
//             FROM Community_Discussion d
//             WHERE ISNULL(d.delStatus, 0) = 0

//             UNION ALL

//             SELECT t.DiscussionID, t.Comment, t.Reference
//             FROM Community_Discussion t
//             INNER JOIN CommentTree ct ON t.Reference = ct.DiscussionID
//             WHERE ISNULL(t.delStatus, 0) = 0
//           )
//           SELECT ct.Reference as discussionId, COUNT(*) as commentCount
//           FROM CommentTree ct
//           WHERE ISNULL(ct.Comment, '') <> '' AND ct.Reference != 0
//           GROUP BY ct.Reference;
//         `;

//         const commentCounts = await queryAsync(conn, commentCountQuery);

//         const commentCountMap = {};
//         commentCounts.forEach(({ discussionId, commentCount }) => {
//           commentCountMap[discussionId] = commentCount;
//         });

//         // Step 2: Fetch discussions
//         const discussionGetQuery = `
//           SELECT
//             d.*,
//             u.Name as UserName,
//             r.ddValue AS VisibilityName
//           FROM
//             Community_Discussion d
//           JOIN
//             Community_User u ON d.UserID = u.UserID
//           JOIN
//             tblDDReferences r ON TRY_CAST(d.Visibility AS INT) = r.idCode
//           WHERE
//             ISNULL(d.delStatus, 0) = 0
//             AND d.Reference = 0
//             AND r.ddCategory = 'Privacy'
//             AND r.ddValue = 'Public'
//             AND TRY_CAST(d.Visibility AS INT) IS NOT NULL
//           ORDER BY
//             d.AddOnDt DESC;
//         `;
//         const discussionGet = await queryAsync(conn, discussionGetQuery);

//         const updatedDiscussions = [];

//         for (const item of discussionGet) {
//           // Get like count for the post
//           const likeCountQuery = `
//             SELECT COUNT(*) as likeCount
//             FROM Community_Discussion
//             WHERE ISNULL(delStatus, 0) = 0
//               AND Likes > 0
//               AND Reference = ?
//           `;
//           const likeCountResult = await queryAsync(conn, likeCountQuery, [item.DiscussionID]);
//           const likeCount = likeCountResult[0]?.likeCount || 0;

//           // Check if user liked this post
//           const userLikeQuery = `
//             SELECT DiscussionID
//             FROM Community_Discussion
//             WHERE ISNULL(delStatus, 0) = 0
//               AND Likes > 0
//               AND Reference = ?
//               AND UserID = ?
//           `;
//           const userLikeResult = await queryAsync(conn, userLikeQuery, [
//             item.DiscussionID,
//             rows[0].UserID
//           ]);
//           const userLike = userLikeResult.length > 0 ? 1 : 0;

//           // Add commentCount (from recursive CTE map)
//           const commentCount = commentCountMap[item.DiscussionID] || 0;

//           updatedDiscussions.push({
//             ...item,
//             likeCount,
//             userLike,
//             commentCount // ✅ Only count — no full comment tree
//           });
//         }

//         success = true;
//         closeConnection();
//         const infoMessage = "Discussion Get Successfully";
//         logInfo(infoMessage);
//         res.status(200).json({
//           success,
//           data: { updatedDiscussions },
//           message: infoMessage,
//         });
//       } catch (queryErr) {
//         logError(queryErr);
//         closeConnection();
//         res.status(500).json({
//           success: false,
//           data: queryErr,
//           message: "Something went wrong please try again",
//         });
//       }
//     });
//   } catch (error) {
//     logError(error);
//     res.status(500).json({
//       success: false,
//       data: {},
//       message: "Something went wrong please try again",
//     });
//   }
// };

export const updateDiscussion = async (req, res) => {
  // console.log("Incoming update req body", req.body);
  let success = false;
  const userId = req.user.id; // Make sure this is the UserID, not email

  // Enhanced validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Invalid input";
    logWarning(warningMessage);
    return res.status(400).json({
      success,
      data: errors.array(),
      message: warningMessage,
    });
  }

  try {
    let { reference, title, content, image, tags, url, visibility } = req.body;

    // Validate required fields
    if (!reference) {
      return res.status(400).json({
        success,
        message: "Reference ID is required",
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        success,
        message: "Title and content are required",
      });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        return res.status(500).json({
          success: false,
          data: err,
          message: errorMessage,
        });
      }

      try {
        // First get the user's ID from their email if needed
        let actualUserId = userId;

        // If userId is an email, we need to get the numeric UserID
        if (typeof userId === "string" && userId.includes("@")) {
          const getUserQuery = `SELECT UserID FROM Community_User 
                             WHERE EmailId = ? AND ISNULL(delStatus,0) = 0`;
          const userResult = await queryAsync(conn, getUserQuery, [userId]);

          if (userResult.length === 0) {
            closeConnection();
            return res.status(401).json({
              success: false,
              message: "User not found",
            });
          }
          actualUserId = userResult[0].UserID;
        }

        // Check if discussion exists and belongs to user
        const checkQuery = `SELECT DiscussionID FROM Community_Discussion 
                          WHERE DiscussionID = ? AND UserID = ? 
                          AND ISNULL(delStatus, 0) = 0`;
        const discussionExists = await queryAsync(conn, checkQuery, [
          reference,
          actualUserId, // Use the numeric UserID here
        ]);

        if (discussionExists.length === 0) {
          closeConnection();
          return res.status(404).json({
            success: false,
            message: "Discussion not found or you don't have permission",
          });
        }

        // Get user info using the numeric UserID
        const userQuery = `SELECT Name FROM Community_User 
                          WHERE UserID = ? AND ISNULL(delStatus,0) = 0`;
        const userRows = await queryAsync(conn, userQuery, [actualUserId]);

        if (userRows.length === 0) {
          closeConnection();
          return res.status(401).json({
            success: false,
            message: "User not found",
          });
        }

        // Handle visibility
        let visibilityId = null;
        if (visibility) {
          const visibilityQuery = `SELECT idCode FROM tblDDReferences 
                                WHERE ddCategory = 'Privacy' AND ddValue = ? 
                                AND ISNULL(delStatus,0) = 0`;
          const visibilityResult = await queryAsync(conn, visibilityQuery, [
            visibility,
          ]);
          visibilityId = visibilityResult[0]?.idCode || null;
        }

        // Update discussion
        const updateQuery = `
          UPDATE Community_Discussion
          SET 
            Title = ?, 
            Content = ?, 
            Image = COALESCE(?, Image),
            Tag = ?, 
            ResourceUrl = ?, 
            Visibility = ?, 
            AuthLstEdit = ?, 
            editOnDt = GETDATE()
          WHERE 
            DiscussionID = ? 
            AND UserID = ? 
            AND ISNULL(delStatus, 0) = 0
        `;

        const result = await queryAsync(conn, updateQuery, [
          title,
          content,
          image,
          tags || null,
          url || null,
          visibilityId,
          userRows[0].Name,
          reference,
          actualUserId, // Use the numeric UserID here
        ]);

        if (result.affectedRows === 0) {
          closeConnection();
          return res.status(404).json({
            success: false,
            message: "No changes made or discussion not found",
          });
        }

        closeConnection();
        return res.status(200).json({
          success: true,
          message: "Discussion updated successfully",
        });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        return res.status(500).json({
          success: false,
          message: "Database error occurred",
          error: queryErr.message,
        });
      }
    });
  } catch (err) {
    logError(err);
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      error: err.message,
    });
  }
};

export const searchdiscussion = async (req, res) => {
  let success = false;
  const { searchTerm, userId } = req.body;

  if (!searchTerm || searchTerm.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Search term is required." });
  }
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
        let rows = [];
        if (userId) {
          const query = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
          rows = await queryAsync(conn, query, [userId]);
        }

        if (rows.length === 0) {
          rows.push({ UserID: null });
        }

        const searchPattern = `%${searchTerm}%`;
        const discussionGetQuery = `
                    SELECT 
                        DiscussionID, UserID, AuthAdd as UserName, Title, Content, Image, Tag, ResourceUrl, AddOnDt as timestamp 
                    FROM 
                        Community_Discussion 
                    WHERE 
                        ISNULL(delStatus, 0) = 0 
                        AND Visibility = 'public' 
                        AND Reference = 0 
                        AND (
                            Title LIKE ? OR 
                            Content LIKE ? OR 
                            Tag LIKE ?
                        ) 
                    ORDER BY AddOnDt DESC
                `;

        const discussionGet = await queryAsync(conn, discussionGetQuery, [
          searchPattern,
          searchPattern,
          searchPattern,
        ]);

        const updatedDiscussions = [];

        for (const item of discussionGet) {
          const likeCountQuery = `SELECT DiscussionID, UserID, Likes FROM Community_Discussion WHERE ISNULL(delStatus, 0) = 0 AND Likes > 0 AND Reference = ?`;
          const likeCountResult = await queryAsync(conn, likeCountQuery, [
            item.DiscussionID,
          ]);

          const commentQuery = `SELECT DiscussionID, UserID, Comment, AuthAdd as UserName, AddOnDt as timestamp FROM Community_Discussion WHERE ISNULL(delStatus, 0) = 0 AND Comment IS NOT NULL AND Reference = ? ORDER BY AddOnDt DESC`;
          const commentResult = await queryAsync(conn, commentQuery, [
            item.DiscussionID,
          ]);

          const commentsArrayUpdated = [];
          let userLike = 0;

          if (
            likeCountResult.some(
              (likeItem) =>
                likeItem.UserID === rows[0].UserID && likeItem.Likes === 1
            )
          ) {
            userLike = 1;
          }

          if (commentResult.length > 0) {
          }

          updatedDiscussions.push({
            ...item,
            likeCount: likeCountResult.length,
            userLike,
            comment: commentsArrayUpdated,
            highlightedTitle: item.Title.replace(
              new RegExp(searchTerm, "gi"),
              (match) => `<strong>${match}</strong>`
            ),
            highlightedContent: item.Content.replace(
              new RegExp(searchTerm, "gi"),
              (match) => `<strong>${match}</strong>`
            ),
          });
        }

        success = true;
        closeConnection();
        res.status(200).json({
          success,
          data: { updatedDiscussions },
          message: "Discussion Get Successfully",
        });
        return;
      } catch (queryErr) {
        closeConnection();
        logError(queryErr);
        res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong, please try again.",
        });
        return;
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong, please try again.",
    });
  }
};

// export const deleteProjectShowcase = (req, res) => {
//     let success = false;
//     const adminName = req.user?.id; // Extract user ID from the token

//     if (!adminName) {
//         return res.status(401).json({
//             success: false,
//             message: "Unauthorized: User information not found in token.",
//         });
//     }

//     try {
//         connectToDatabase(async (err, conn) => {
//             if (err) {
//                 logError(err);
//                 return res.status(500).json({
//                     success: false,
//                     data: err,
//                     message: "Database connection error.",
//                 });
//             }
//             try {
//                 // Check if the ProjectShowcase exists and is not already deleted
//                 const checkQuery = `SELECT * FROM tblCMSContent WHERE ComponentName = 'ProjectShowcase' AND (delStatus IS NULL OR delStatus = 0)`;
//                 const result = await queryAsync(conn, checkQuery);

//                 if (result.length === 0) {
//                     return res.status(404).json({
//                         success: false,
//                         message: "ProjectShowcase not found or already deleted.",
//                     });
//                 } else {
//                     try {
//                         // Update the delStatus, delOnDt, and AuthDel fields for the ProjectShowcase
//                         const updateQuery = `
//                 UPDATE tblCMSContent
//                 SET delStatus = 1, delOnDt = GETDATE(), AuthDel = ?
//                 OUTPUT inserted.idCode, inserted.delStatus, inserted.delOnDt, inserted.AuthDel
//                 WHERE ComponentName = 'ProjectShowcase' AND (delStatus IS NULL OR delStatus = 0)
//               `;
//                         const rows = await queryAsync(conn, updateQuery, [adminName]);

//                         if (rows.length > 0) {
//                             success = true;
//                             logInfo("ProjectShowcase deleted successfully");
//                             return res.status(200).json({
//                                 success,
//                                 data: {
//                                     idCode: rows[0].idCode,
//                                     AuthDel: rows[0].AuthDel,
//                                     delOnDt: rows[0].delOnDt,
//                                     delStatus: rows[0].delStatus
//                                 },
//                                 message: "ProjectShowcase deleted successfully.",
//                             });
//                         } else {
//                             logWarning("Failed to delete the ProjectShowcase.");
//                             return res.status(404).json({
//                                 success: false,
//                                 message: "Failed to delete the ProjectShowcase.",
//                             });
//                         }
//                     } catch (updateErr) {
//                         logError(updateErr);
//                         return res.status(500).json({
//                             success: false,
//                             data: updateErr,
//                             message: "Error updating ProjectShowcase deletion.",
//                         });
//                     }
//                 }
//             } catch (error) {
//                 logError(error);
//                 return res.status(404).json({
//                     success: false,
//                     message: "Error finding ProjectShowcase data!",
//                 });
//             }
//         });
//     } catch (error) {
//         logError(error);
//         return res.status(500).json({
//             success: false,
//             message: "Unable to connect to the database!",
//         });
//     }
// };

export const deleteDiscussion = (req, res) => {
  let success = false;
  const { discussionId } = req.body;
  const adminName = req.user?.id;

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError(err);
        return res.status(500).json({
          success: false,
          data: err,
          message: "Database connection error.",
        });
      }
      try {
        const checkQuery = `SELECT * FROM Community_Discussion WHERE DiscussionID = ? AND (delStatus IS NULL OR delStatus = 0)`;
        const result = await queryAsync(conn, checkQuery, [discussionId]);

        if (result.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Discussion not found or already deleted.",
          });
        } else {
          try {
            const updateQuery = ` UPDATE Community_Discussion  SET delStatus = 1, delOnDt = GETDATE(), AuthDel = ?  OUTPUT inserted.DiscussionID, inserted.delStatus,inserted.delOnDt, inserted.AuthDel
                WHERE DiscussionID = ? AND (delStatus IS NULL OR delStatus = 0)
              `;
            const rows = await queryAsync(conn, updateQuery, [
              adminName,
              discussionId,
            ]);

            if (rows.length > 0) {
              success = true;
              logInfo("Discussion deleted successfully");
              return res.status(200).json({
                success,
                data: {
                  discussionId: rows[0].DiscussionID,
                  AuthDel: rows[0].AuthDel,
                  delOnDt: rows[0].delOnDt,
                  delStatus: rows[0].delStatus,
                },
                message: "Discussion deleted successfully.",
              });
            } else {
              logWarning("Failed to delete the discussion.");
              return res.status(404).json({
                success: false,
                message: "Failed to delete the discussion.",
              });
            }
          } catch (updateErr) {
            logError(updateErr);
            return res.status(500).json({
              success: false,
              data: updateErr,
              message: "Error updating discussion deletion.",
            });
          }
        }
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: "Error finding discussion data!",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to connect to the database!",
    });
  }
};

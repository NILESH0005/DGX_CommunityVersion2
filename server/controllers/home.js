import { validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import dotenv from "dotenv";
import { logError, queryAsync, logInfo, logWarning } from "../helper/index.js";
import {
  addContentSectionService,
  addParallaxTextService,
  deleteParallaxTextService,
  getAllCMSContentService,
  getHomePageContentService,
  getParallaxContentService,
  setActiveParallaxTextService,
  updateContentSectionService,
  getLogoutHomePageContentService ,
} from "../services/cmsService.js";

dotenv.config();

export const addParallaxText = async (req, res) => {
  let success = false;

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
    const userId = req.user.id; // comes from fetchUser middleware
    const { componentName, componentIdName, content } = req.body;

    const result = await addParallaxTextService(userId, {
      componentName,
      componentIdName,
      content,
    });

    if (result.success) {
      logInfo(result.message);
      return res.status(200).json(result);
    } else {
      logWarning(result.message);
      return res.status(400).json(result);
    }
  } catch (error) {
    logError("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      data: { error: error.message },
      message: "Unexpected Error, check logs",
    });
  }
};

export const deleteParallaxText = async (req, res) => {
  let success = false;
  const userEmail = req.user.id; // from fetchUser middleware
  const { idCode } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const result = await deleteParallaxTextService(userEmail, idCode);

    if (!result.success) {
      return res
        .status(400)
        .json({ success: false, data: result.data, message: result.message });
    }

    return res
      .status(200)
      .json({ success: true, data: result.data, message: result.message });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      data: error,
      message: "Unexpected Error, check logs",
    });
  }
};

export const addContentSection = async (req, res) => {
  let success = false;
  const userEmail = req.user.id; // from fetchUser middleware

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const { componentName, componentIdName, title, text, image } = req.body;

    const result = await addContentSectionService(userEmail, {
      componentName,
      componentIdName,
      title,
      text,
      image,
    });

    if (!result.success) {
      return res
        .status(400)
        .json({ success: false, data: result.data, message: result.message });
    }

    return res
      .status(200)
      .json({ success: true, data: result.data, message: result.message });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      data: error,
      message: "Unexpected Error, check logs",
    });
  }
};

export const getParallaxContent = async (req, res) => {
  let success = false;
  try {
    const result = await getParallaxContentService();

    if (!result.success) {
      return res
        .status(500)
        .json({ success: false, data: result.data, message: result.message });
    }

    return res
      .status(200)
      .json({ success: true, data: result.data, message: result.message });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      data: error,
      message: "Unexpected Error, check logs",
    });
  }
};

export const getContent = async (req, res) => {
  // console.log("Received request for getContent");

  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        // console.error("Database connection failed:", err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to connect to database" });
      }

      try {
        const contentQuery = `
                  SELECT idCode, ComponentName, ComponentIdName, Title, Content, Image, isActive  
                  FROM tblCMSContent  
                  WHERE ComponentName = 'ContentSection' AND ISNULL(delStatus, 0) = 0
              `;
        const contentResults = await queryAsync(conn, contentQuery);

        if (!contentResults.length) {
          return res
            .status(200)
            .json({ success: true, data: [], message: "No content found" });
        }

        return res.status(200).json({
          success: true,
          data: contentResults,
          message: "Content fetched successfully",
        });
      } catch (queryErr) {
        // console.error("Database query error:", queryErr);
        return res
          .status(500)
          .json({ success: false, message: "Database Query Error" });
      } finally {
        closeConnection(); // Ensure DB connection is closed
      }
    });
  } catch (error) {
    // console.error("Unexpected error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unexpected error occurred" });
  }
};

export const updateContentSection = async (req, res) => {
  try {
    const userEmail = req.user.id; // fetched from middleware
    const result = await updateContentSectionService(userEmail, req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.data || {},
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data || {},
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const addNewsSection = async (req, res) => {
  let success = false;
  // console.log("header here:", req.headers);
  const userId = req.user.id;
  // console.log("User Id:", userId);
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
    const { componentName, componentIdName, title, location, image, link } =
      req.body;

    connectToDatabase(async (err, conn) => {
      if (err) {
        logError("Failed to connect to database");
        return res.status(500).json({
          success: false,
          data: err,
          message: "Failed to connect to database",
        });
      }

      try {
        // Fetch user details
        const userQuery = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);

        if (userRows.length > 0) {
          const user = userRows[0];

          // Insert news into the tblCMSContent table
          const insertQuery = `INSERT INTO tblCMSContent (ComponentName, ComponentIdName, Title, Location, Image, Link, AuthAdd, AddOnDt, delStatus) VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), 0);`;

          const content = JSON.stringify({ title, location }); // Store news data as JSON
          // console.log("inserted data", content);

          const insertResult = await queryAsync(conn, insertQuery, [
            componentName,
            componentIdName,
            title,
            location,
            image,
            link,
            user.Name,
          ]);

          success = true;
          closeConnection();
          logInfo("News added successfully!");

          return res.status(200).json({
            success,
            data: { id: insertResult.insertId },
            message: "News added successfully!",
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
        logError("Database Query Error: ", queryErr);
        return res.status(500).json({
          success: false,
          data: queryErr,
          message: "Database Query Error",
        });
      }
    });
  } catch (error) {
    logError("Unexpected Error: ", error);
    return res.status(500).json({
      success: false,
      data: error,
      message: "Unexpected Error, check logs",
    });
  }
};

// export const addProjectShowcase = async (req, res) => {
//   let success = false;
//   // console.log("Headers:", req.headers);
//   const userId = req.user.id;
//   // console.log("User ID:", userId);

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     logWarning("Data is not in the right format");
//     return res.status(400).json({ success, data: errors.array(), message: "Data is not in the right format" });
//   }

//   try {
//     const { componentName, componentIdName, title, description, gif, techStack } = req.body;
//     // console.log("Request Body:", req.body); // Log the request body

//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         logError("Failed to connect to database:", err);
//         return res.status(500).json({ success: false, data: err, message: "Failed to connect to database" });
//       }

//       try {
//         const userQuery = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
//         const userRows = await queryAsync(conn, userQuery, [userId]);

//         if (userRows.length > 0) {
//           const user = userRows[0];

//           // Insert into tblCMSContent
//           const insertQuery = `INSERT INTO tblCMSContent (
//               ComponentName, ComponentIdName, Title, Content, Image, TechStack, AuthAdd, AddOnDt, delStatus
//             ) VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), 0);`;

//           const insertResult = await queryAsync(conn, insertQuery, [
//             componentName, componentIdName, title, description, gif, techStack, user.Name
//           ]);

//           // console.log("Insert Result:", insertResult);

//           // Fetch the last inserted ID using SCOPE_IDENTITY()
//           const lastInsertedIdQuery = `SELECT TOP 1 idCode FROM tblCMSContent WHERE ISNULL(delStatus, 0) = 0 ORDER BY idCode DESC;`;
//           const lastInsertedId = await queryAsync(conn, lastInsertedIdQuery);

//           // console.log("Last Inserted ID Query Result:", lastInsertedId);

//           success = true;
//           closeConnection();
//           logInfo("Project Showcase added successfully!");

//           return res.status(200).json({
//             success,
//             data: { postId: lastInsertedId[0]?.CMSContentID || null },
//             message: "Project Showcase added successfully!",
//           });
//         } else {
//           closeConnection();
//           logWarning("User not found, please login first.");
//           return res.status(400).json({ success: false, data: {}, message: "User not found, please login first." });
//         }
//       } catch (queryErr) {
//         closeConnection();
//         logError("Database Query Error:", queryErr);
//         return res.status(500).json({ success: false, data: queryErr, message: "Database Query Error" });
//       }
//     });
//   } catch (error) {
//     logError("Unexpected Error:", error);
//     return res.status(500).json({ success: false, data: error, message: "Unexpected Error, check logs" });
//   }
// };

export const addProjectShowcase = async (req, res) => {
  let success = false;
  const userId = req.user.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const { componentName, componentIdName, title, description, techStack } =
      req.body;
    const gifFilePath = req.file ? req.file.path : null; // Get the file path

    connectToDatabase(async (err, conn) => {
      if (err) {
        return res.status(500).json({
          success: false,
          data: err,
          message: "Failed to connect to database",
        });
      }

      try {
        const userQuery = `SELECT UserID, Name FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);

        if (userRows.length > 0) {
          const user = userRows[0];

          // Insert into tblCMSContent
          const insertQuery = `INSERT INTO tblCMSContent (
              ComponentName, ComponentIdName, Title, Content, Image, TechStack, AuthAdd, AddOnDt, delStatus
            ) VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), 0);`;

          const insertResult = await queryAsync(conn, insertQuery, [
            componentName,
            componentIdName,
            title,
            description,
            gifFilePath,
            techStack,
            user.Name,
          ]);

          // Fetch the last inserted ID
          const lastInsertedIdQuery = `SELECT TOP 1 idCode FROM tblCMSContent WHERE ISNULL(delStatus, 0) = 0 ORDER BY idCode DESC;`;
          const lastInsertedId = await queryAsync(conn, lastInsertedIdQuery);

          success = true;
          closeConnection();

          return res.status(200).json({
            success,
            data: { postId: lastInsertedId[0]?.idCode || null },
            message: "Project Showcase added successfully!",
          });
        } else {
          closeConnection();
          return res.status(400).json({
            success: false,
            data: {},
            message: "User not found, please login first.",
          });
        }
      } catch (queryErr) {
        closeConnection();
        return res.status(500).json({
          success: false,
          data: queryErr,
          message: "Database Query Error",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: error,
      message: "Unexpected Error, check logs",
    });
  }
};

export const setActiveParallaxText = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: errors.array(),
      message: "Data is not in the right format",
    });
  }

  try {
    const { idCode } = req.body;

    if (!idCode || isNaN(Number(idCode))) {
      return res.status(400).json({
        success: false,
        message: "Valid idCode is required",
      });
    }

    const result = await setActiveParallaxTextService(Number(idCode));

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error in setActiveParallaxText:", error);
    return res.status(500).json({
      success: false,
      message: "Unexpected Error",
      data: error,
    });
  }
};

// export const updateContentSection = async (req, res) => {
//   let success = false;
//   // console.log("Headers:", req.headers);
//   const userId = req.user.id;
//   // console.log("User Object:", req.user);
//   // console.log("User ID:", userId);

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success,
//       data: errors.array(),
//       message: "Data is not in the right format",
//     });
//   }

//   try {
//     const { id, title, text, image } = req.body;
//     // console.log("Request Body:", req.body);

//     if (!id) {
//       return res
//         .status(400)
//         .json({ success, message: "Content ID is required" });
//     }

//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         return res.status(500).json({
//           success: false,
//           data: err,
//           message: "Failed to connect to database",
//         });
//       }

//       try {
//         // Check if the content exists
//         const checkQuery = `SELECT * FROM tblCMSContent WHERE idCode = ? AND ISNULL(delStatus, 0) = 0`;
//         const checkRows = await queryAsync(conn, checkQuery, [id]);
//         // console.log("Existing content check result:", checkRows);

//         if (checkRows.length === 0) {
//           return res
//             .status(404)
//             .json({ success, message: "Content not found or already deleted" });
//         }
//         const updateQuery = `UPDATE tblCMSContent SET Title = ?, [Content] = ?, Image = ?, editOnDt = GETDATE()
//           WHERE idCode = ?`;
//         // console.log("Update query:", updateQuery);
//         // console.log("Parameters:", [title, text, image, id]);

//         const updateResult = await queryAsync(conn, updateQuery, [
//           title,
//           text,
//           image,
//           id,
//         ]);
//         // console.log("Update result:", updateResult);

//         if ((success = true)) {
//           return res
//             .status(200)
//             .json({ success, message: "Content updated successfully" });
//         } else {
//           return res.status(400).json({
//             success,
//             message: "Failed to update content. No rows affected.",
//           });
//         }
//       } catch (error) {
//         // console.error("Database Query Error:", error);
//         return res
//           .status(500)
//           .json({ success: false, message: "Internal server error", error });
//       } finally {
//         closeConnection();
//       }
//     });
//   } catch (error) {
//     // console.error("Server Error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Something went wrong", error });
//   }
// };

export const getProjectShowcase = async (req, res) => {
  let success = false;
  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError("Failed to connect to database");
        return res.status(500).json({
          success: false,
          data: err,
          message: "Failed to connect to database",
        });
      }
      try {
        const query = `
          SELECT 
            idCode, 
            ComponentName, 
            ComponentIdName, 
            Title, 
            Location, 
            Image, 
            Link, 
            Content, 
            AuthAdd, 
            AuthDel, 
            AuthLstEdt, 
            delOnDt, 
            AddOnDt, 
            editOnDt, 
            delStatus, 
            isActive, 
            TechStack 
          FROM 
            tblCMSContent 
          WHERE 
            ComponentName = 'ProjectShowcase' 
            AND ISNULL(delStatus, 0) = 0 
            AND isActive = 1
        `;

        const results = await queryAsync(conn, query);
        // console.log("Query result:", results);

        success = true;
        closeConnection();
        logInfo("Project Showcase content fetched successfully!");

        return res.status(200).json({
          success,
          data: results,
          message: "Project Showcase content fetched successfully!",
        });
      } catch (queryErr) {
        closeConnection();
        logError("Database Query Error: ", queryErr);
        return res.status(500).json({
          success: false,
          data: queryErr,
          message: "Database Query Error",
        });
      }
    });
  } catch (error) {
    logError("Unexpected Error: ", error);
    return res.status(500).json({
      success: false,
      data: error,
      message: "Unexpected Error, check logs",
    });
  }
};

export const getAllCMSContent = async (req, res) => {
  try {
    const result = await getAllCMSContentService();

    if (!result.success) {
      return res
        .status(500)
        .json({ success: false, data: result.data, message: result.message });
    }

    return res
      .status(200)
      .json({ success: true, data: result.data, message: result.message });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      data: error,
      message: "Unexpected Error, check logs",
    });
  }
};

// In your API file (add this new endpoint)
// export const getHomePageContent = async (req, res) => {
//   try {
//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         logError("Failed to connect to database");
//         return res.status(500).json({
//           success: false,
//           message: "Failed to connect to database",
//         });
//       }

//       try {
//         // Fetch both parallax and content data in parallel
//         const [parallaxResults, contentResults] = await Promise.all([
//           queryAsync(conn, `SELECT idCode, ComponentName, ComponentIdName, Content, isActive FROM tblCMSContent WHERE ComponentName = 'Parallax' AND ISNULL(delStatus, 0) = 0`),
//           queryAsync(conn, `SELECT idCode, ComponentName, ComponentIdName, Title, Content, Image, isActive FROM tblCMSContent WHERE ComponentName = 'ContentSection' AND ISNULL(delStatus, 0) = 0`)
//         ]);

//         closeConnection();

//         return res.status(200).json({
//           success: true,
//           data: {
//             parallax: parallaxResults,
//             content: contentResults
//           },
//           message: "Homepage content fetched successfully"
//         });
//       } catch (queryErr) {
//         closeConnection();
//         logError("Database Query Error: ", queryErr);
//         return res.status(500).json({
//           success: false,
//           message: "Database Query Error",
//         });
//       }
//     });
//   } catch (error) {
//     logError("Unexpected Error: ", error);
//     return res.status(500).json({
//       success: false,
//       message: "Unexpected Error, check logs",
//     });
//   }
// };

export const getHomePageContent = async (req, res) => {
  try {
    const result = await getHomePageContentService();
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error("Error in getHomePageContent:", error);
    return res.status(500).json({
      success: false,
      message: "Unexpected Error",
      data: error,
    });
  }
};

export const getLogoutHomePageContent = async (req, res) => {
  try {
    const result = await getLogoutHomePageContentService();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message,
        data: null
      });
    }
  } catch (error) {
    console.error("Error in getLogoutHomePageContent controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};


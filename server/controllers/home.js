import { validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import dotenv from "dotenv";
import { logError, queryAsync, logInfo, logWarning } from "../helper/index.js";

dotenv.config();

export const addParallaxText = async (req, res) => {
  let success = false;
  // console.log("fvdf", req.header);
  const userId = req.user.id;
  // console.log("user:", userId);
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
    let { componentName, componentIdName, content } = req.body;

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
        const userQuery = `SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);

        if (userRows.length > 0) {
          const user = userRows[0];
          const insertQuery = `INSERT INTO tblCMSContent  (ComponentName, ComponentIdName, Content,  AuthAdd, AddOnDt, delStatus) VALUES (?, ?, ?,  ?, GETDATE(), 0);`;

          const insertResult = await queryAsync(conn, insertQuery, [
            componentName,
            componentIdName,
            content,
            user.Name,
          ]);

          success = true;
          closeConnection();
          logInfo("Parallax text added successfully!");

          return res.status(200).json({
            success,
            data: { id: insertResult.insertId },
            message: "Parallax text added successfully!",
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

export const deleteParallaxText = async (req, res) => {
  let success = false;
  const userId = req.user.id;
  const { idCode } = req.body;
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
        const userQuery = `SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
        const userRows = await queryAsync(conn, userQuery, [userId]);

        if (userRows.length === 0) {
          closeConnection();
          logWarning("User not found, please login first.");
          return res.status(400).json({
            success: false,
            data: {},
            message: "User not found, please login first.",
          });
        }

        const user = userRows[0];

        // 1. Verify the content exists
        const verifyQuery = `SELECT idCode, isActive 
                           FROM tblCMSContent 
                           WHERE idCode = ? 
                           AND ComponentName = 'Parallax'
                           AND ISNULL(delStatus, 0) = 0`;

        const verifyResult = await queryAsync(conn, verifyQuery, [parseInt(idCode)]);

        if (verifyResult.length === 0) {
          closeConnection();
          logWarning("Content not found or already deleted");
          return res.status(404).json({
            success: false,
            message: "Content not found or already deleted",
          });
        }

        // 2. Check if active
        if (verifyResult[0].isActive === 1) {
          closeConnection();
          logWarning("Deactivate before deleting");
          return res.status(400).json({
            success: false,
            message: "Deactivate before deleting",
          });
        }

        // 3. Perform soft delete
        const deleteQuery = `UPDATE tblCMSContent 
                           SET delStatus = 1, 
                               delOnDt = GETDATE(), 
                               AuthDel = ?,
                               isActive = 0
                           WHERE idCode = ?`;

        const deleteResult = await queryAsync(conn, deleteQuery, [user.Name, parseInt(idCode)]);

        success = true;
        closeConnection();
        logInfo("Parallax text deleted successfully");

        return res.status(200).json({
          success,
          data: {
            idCode: parseInt(idCode),
            AuthDel: user.Name
          },
          message: "Deleted successfully",
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

export const addContentSection = async (req, res) => {
  let success = false;
  // console.log("Headers:", req.headers);
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
    const { componentName, componentIdName, title, text, image } = req.body;

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

          const insertQuery = `INSERT INTO tblCMSContent (ComponentName, ComponentIdName, Title, Content, Image, AuthAdd, AddOnDt, delStatus)  VALUES (?, ?, ?, ?, ?, ?, GETDATE(), 0);`;
          const insertResult = await queryAsync(conn, insertQuery, [
            componentName,
            componentIdName,
            title,
            text,
            image,
            user.Name,
          ]);

          success = true;
          closeConnection();
          logInfo("Content added successfully!");

          return res.status(200).json({
            success,
            data: { id: insertResult.insertId },
            message: "Content added successfully!",
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

export const getParallaxContent = async (req, res) => {
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
        const query = `SELECT idCode, ComponentName, ComponentIdName, Content, isActive  FROM tblCMSContent  WHERE ComponentName = 'Parallax' AND ISNULL(delStatus, 0) = 0 `;
        const results = await queryAsync(conn, query);
        // console.log("Query result:", results);
        
        success = true;
        closeConnection();
        logInfo("Parallax content fetched successfully!");
        
        return res.status(200).json({
          success,
          data: results,
          message: "Parallax content fetched successfully!",
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
    const userId = req.user.id; // Get user email from authentication
    // console.log("User ID:", userId);

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: "Validation failed"
      });
    }

    // Destructure with type checking
    const {
      id,
      Title,
      Content,
      Image = null,
      ComponentName = "ContentSection",
      ComponentIdName = "contentSection"
    } = req.body;

    // Validate required fields
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid numeric Content ID is required"
      });
    }

    if (!Title || !Content) {
      return res.status(400).json({
        success: false,
        message: "Title and Content are required fields"
      });
    }

    connectToDatabase(async (err, conn) => {
      if (err) {
        // console.error("DB connection error:", err);
        return res.status(500).json({
          success: false,
          message: "Database connection failed"
        });
      }

      try {
        // First, get the user's name from the database using email ID
        const userQuery = 'SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?';
        const userRows = await queryAsync(conn, userQuery, [userId]);
        // console.log("User Rows:", userRows);

        if (userRows.length === 0) {
          return res.status(400).json({
            success: false,
            message: "User not found, please login first.",
          });
        }

        const user = userRows[0];
        const authLstEdit = user.Name; // Get the username for AuthLstEdit

        // 1. Check if content exists
        const checkQuery = `SELECT idCode FROM tblCMSContent WHERE idCode = ? AND ISNULL(delStatus, 0) = 0`;
        const [content] = await queryAsync(conn, checkQuery, [Number(id)]);
        
        if (!content) {
          return res.status(404).json({
            success: false,
            message: "Content not found"
          });
        }

        // 2. Perform update with AuthLstEdit username
        const updateQuery = `
          UPDATE tblCMSContent 
          SET 
            Title = ?, 
            Content = ?, 
            Image = ?, 
            ComponentName = ?, 
            ComponentIdName = ?, 
            AuthLstEdit = ?,
            editOnDt = GETDATE()
          WHERE idCode = ?
        `;

        const result = await queryAsync(conn, updateQuery, [
          Title,
          Content,
          Image,
          ComponentName,
          ComponentIdName,
          authLstEdit, // Username for AuthLstEdit column
          Number(id)
        ]);

        if (result.affectedRows === 0) {
          return res.status(400).json({
            success: false,
            message: "No changes were made"
          });
        }

        return res.status(200).json({
          success: true,
          message: "Content updated successfully"
        });

      } catch (error) {
        // console.error("Query error:", error);
        return res.status(500).json({
          success: false,
          message: "Database operation failed",
          error: error.message
        });
      } finally {
        closeConnection(conn);
      }
    });

  } catch (error) {
    // console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
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
        const { idCode } = req.body;
        await queryAsync(
          conn,
          `UPDATE tblCMSContent SET isActive = 0 WHERE ComponentName = 'Parallax'`
        );
        await queryAsync(
          conn,
          `UPDATE tblCMSContent SET isActive = 1 WHERE idCode = ?`,
          [idCode]
        );

        success = true;
        closeConnection();
        logInfo("Active parallax text set successfully!");
        return res.status(200).json({
          success,
          message: "Active parallax text set successfully!",
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
            AuthLstEdit, 
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
    connectToDatabase(async (err, conn) => {
      if (err) {
        logError("Failed to connect to database");
        return res.status(500).json({
          success: false,
          data: err,
          message: "Failed to connect to database",
        });
      }

      const query = `SELECT * FROM tblCMSContent WHERE delStatus = 0`; // Fetch only non-deleted records
      const rows = await queryAsync(conn, query);

      closeConnection();
      return res.status(200).json({
        success: true,
        data: rows,
        message: "Data fetched successfully",
      });
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
  let conn;
  try {
    // Connect to database
    conn = await new Promise((resolve, reject) => {
      connectToDatabase((err, connection) => {
        if (err) {
          logError("Failed to connect to database", err);
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });

    // Execute queries in parallel with proper error handling
    const [parallaxResults, contentResults] = await Promise.all([
      queryAsync(conn, `
        SELECT idCode, ComponentName, ComponentIdName, Content, isActive 
        FROM tblCMSContent 
        WHERE ComponentName = 'Parallax' AND ISNULL(delStatus, 0) = 0
      `).catch(err => {
        logError("Parallax query failed", err);
        throw err;
      }),
      queryAsync(conn, `
        SELECT idCode, ComponentName, ComponentIdName, Title, Content, Image, isActive 
        FROM tblCMSContent 
        WHERE ComponentName = 'ContentSection' AND ISNULL(delStatus, 0) = 0
      `).catch(err => {
        logError("Content query failed", err);
        throw err;
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        parallax: parallaxResults,
        content: contentResults
      },
      message: "Homepage content fetched successfully"
    });
  } catch (error) {
    logError("Homepage content fetch error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch homepage content",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (conn) {
      try {
        await closeConnection(conn);
      } catch (closeErr) {
        logError("Failed to close connection", closeErr);
      }
    }
  }
};
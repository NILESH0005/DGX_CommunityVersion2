// import { body, validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import dotenv from "dotenv";
import { queryAsync, logError, logInfo } from "../helper/index.js";

dotenv.config();

// export const getDropdownValues = async (req, res) => {
//     let success = false;
//     let infoMessage = ''
//     try {
//         const { category } = req.query;
//         if (!category) {
//             return res.status(400).json({ success, data: {}, message: "Category is required" });
//         }

//         connectToDatabase(async (err, conn) => {

//             if (err) {
//                 // console.error('Connection error:', err);
//                 const errorMessage = "Failed to connect to database";
//                 logError(err);
//                 res.status(500).json({ success: false, data: err, message: errorMessage });
//                 return;
//             }
//             try {
//                 const query = `SELECT idCode, ddValue FROM tblDDReferences WHERE ddCategory = ? AND delStatus = 0`;
//                 const results = await queryAsync(conn, query, [category]);
//                 if (results.length === 0) {
//                     success = false;
//                     infoMessage = `No data found for ${category} category`;
//                     logInfo(infoMessage);
//                     res.status(404).json({ success, message: infoMessage });
//                 } else {
//                     success = true;
//                     infoMessage = "Dropdown values fetched successfully";
//                     logInfo(infoMessage);
//                     res.status(200).json({ success, data: results, message: infoMessage });
//                 }
//                 closeConnection();
//             } catch (queryErr) {
//                 // console.error('Query error:', queryErr);
//                 logError(queryErr);
//                 closeConnection();
//                 res.status(500).json({ success: false, data: queryErr, message: "Something went wrong, please try again" });
//             }
//         });
//     } catch (error) {
//         logError(error);
//         res.status(500).json({ success: false, data: {}, message: "Something went wrong, please try again" });
//     }
// };

//Faster api
export const getDropdownValues = async (req, res) => {
    let success = false;
    let infoMessage = '';
    const startTime = Date.now();

    try {
        const { category } = req.query;
        if (!category) {
            return res.status(400).json({ success, data: {}, message: "Category is required" });
        }

        const conn = await new Promise((resolve, reject) => {
            connectToDatabase((err, connection) => {
                if (err) return reject(err);
                return resolve(connection);
            });
        });

        try {
            const query = `SELECT idCode, ddValue FROM tblDDReferences WHERE ddCategory = ? AND delStatus = 0`;
            const results = await queryAsync(conn, query, [category]);

            if (results.length === 0) {
                success = false;
                infoMessage = `No data found for ${category} category`;
                logInfo(infoMessage);
                return res.status(404).json({ success, message: infoMessage });
            } else {
                success = true;
                infoMessage = "Dropdown values fetched successfully";
                logInfo(infoMessage);
                return res.status(200).json({ success, data: results, message: infoMessage });
            }
        } catch (queryErr) {
            // console.error('Query error:', queryErr);
            logError(queryErr);
            return res.status(500).json({ success: false, data: queryErr, message: "Something went wrong, please try again" });
        } finally {
            if (conn) conn.release?.(); // use release if it's a pool
            else if (typeof closeConnection === 'function') closeConnection(); // fallback
        }

    } catch (error) {
        // console.error('Connection error:', error);
        logError(error);
        return res.status(500).json({ success: false, data: error, message: "Failed to connect to database" });
    } finally {
        const endTime = Date.now();
        // console.log(`getDropdownValues response time: ${endTime - startTime}ms`);
    }
};


export const getQuizDropdown = async (req, res) => {
    let success = false;
    let infoMessage = '';
    const startTime = Date.now();

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                const errorMessage = "Failed to connect to database";
                // console.error(errorMessage, err);
                logError(err);
                return res.status(500).json({ success, data: err, message: errorMessage });
            }

            try {
                const query = `
                    SELECT 
                        qd.QuizID, 
                        QuizName, 
                        NegativeMarking, 
                        QuizDuration, 
                        QuizLevel,  
                        StartDateAndTime, 
                        EndDateTime, 
                        COUNT(QuestionsID) AS QuestionCount 
                    FROM QuizDetails qd
                    LEFT JOIN QuizMapping qm ON qm.quizId = qd.QuizID
                    WHERE qd.delStatus = 0 
                      AND ISNULL(qm.delStatus, 0) = 0 
                      AND EndDateTime > GETDATE()
                    GROUP BY 
                        qd.QuizID, QuizName, NegativeMarking, QuizDuration, 
                        QuizLevel, StartDateAndTime, EndDateTime
                    ORDER BY StartDateAndTime ASC
                `;

                const results = await queryAsync(conn, query);

                if (results.length === 0) {
                    infoMessage = "No active quizzes found";
                    logInfo(infoMessage);
                    return res.status(404).json({ success, message: infoMessage });
                }

                success = true;
                infoMessage = "Quiz dropdown data fetched successfully";
                logInfo(infoMessage);
                return res.status(200).json({ success, data: results, message: infoMessage });

            } catch (queryErr) {
                logError(queryErr);
                return res.status(500).json({ success: false, data: queryErr, message: "Query failed" });
            } finally {
                if (conn?.release) conn.release();
                else if (typeof closeConnection === 'function') closeConnection();
            }
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({ success: false, message: "Unexpected error occurred" });
    } finally {
        // console.log(`getQuizDropdown response time: ${Date.now() - startTime}ms`);
    }
};


export const getQuizGroupDropdown = async (req, res) => {
    let success = false;
    let infoMessage = '';
    const startTime = Date.now();

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                const errorMessage = "Failed to connect to database";
                // console.error(errorMessage, err);
                logError(err);
                return res.status(500).json({ success, data: err, message: errorMessage });
            }

            try {
                const query = `
                    SELECT group_id, group_name 
                    FROM GroupMaster 
                    WHERE delStatus = 0 
                      AND group_category = 'quizGroup'
                    ORDER BY group_name ASC
                `;
                const results = await queryAsync(conn, query);

                if (results.length === 0) {
                    infoMessage = "No quiz groups found";
                    logInfo(infoMessage);
                    return res.status(404).json({ success, message: infoMessage });
                }

                success = true;
                infoMessage = "Quiz group names fetched successfully";
                logInfo(infoMessage);
                return res.status(200).json({ success, data: results, message: infoMessage });

            } catch (queryErr) {
                logError(queryErr);
                return res.status(500).json({ success: false, data: queryErr, message: "Query failed" });
            } finally {
                if (conn?.release) conn.release();
                else if (typeof closeConnection === 'function') closeConnection();
            }
        });
    } catch (error) {
        logError(error);
        return res.status(500).json({ success: false, data: error, message: "Unexpected error occurred" });
    } finally {
        // console.log(`getQuizGroupDropdown response time: ${Date.now() - startTime}ms`);
    }
};


export const getQuestionGroupDropdown = async (req, res) => {
  let success = false;
  let infoMessage = '';
  let conn;

  try {
    // Connect to DB
    conn = await new Promise((resolve, reject) => {
      connectToDatabase((err, connection) => {
        if (err) return reject(err);
        resolve(connection);
      });
    });

    const query = `
      SELECT group_id, group_name 
      FROM GroupMaster 
      WHERE delStatus = 0 AND group_category = 'questionGroup';
    `;

    const results = await queryAsync(conn, query);

    if (results.length === 0) {
      success = false;
      infoMessage = "No groups found";
      logInfo(infoMessage);
      return res.status(404).json({ success, message: infoMessage });
    } else {
      success = true;
      infoMessage = "Group names fetched successfully";
      logInfo(infoMessage);
      return res.status(200).json({ success, data: results, message: infoMessage });
    }
  } catch (error) {
    // console.error('Error:', error);
    logError(error);
    return res.status(500).json({
      success: false,
      data: error,
      message: "Something went wrong, please try again"
    });
  } finally {
  closeConnection();
}
};


export const getModuleById = async (req, res) => {
  let success = false;
  const { moduleId } = req.query;

  if (!moduleId) {
    return res.status(400).json({
      success,
      message: "Module ID is required"
    });
  }

  let conn;
  try {
    // Promisify connection
    conn = await new Promise((resolve, reject) => {
      connectToDatabase((err, connection) => {
        if (err) return reject(err);
        resolve(connection);
      });
    });

    const query = `
      SELECT 
        ModuleID,
        ModuleName,
        ModuleImage,
        ModuleDescription
      FROM ModulesDetails
      WHERE ModuleID = ?
        AND ISNULL(delStatus, 0) = 0
    `;

    const results = await queryAsync(conn, query, [moduleId]);

    if (results.length === 0) {
      return res.status(404).json({
        success,
        message: "Module not found"
      });
    }

    const moduleData = {
      ...results[0],
      ModuleImage: results[0].ModuleImage
        ? { data: Buffer.isBuffer(results[0].ModuleImage)
            ? results[0].ModuleImage.toString('base64')
            : results[0].ModuleImage }  // fallback if already string
        : null
    };

    success = true;
    return res.status(200).json({
      success,
      data: moduleData,
      message: "Module fetched successfully"
    });

  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching module"
    });

  } finally {
     closeConnection(); // Only needed now
  }
};

// export const getModules = async (req, res) => {
//     let success = false;

//     try {
//         connectToDatabase(async (err, conn) => {
//             if (err) {
//                 logError(err);
//                 return res.status(500).json({
//                     success,
//                     message: "Database connection error"
//                 });
//             }

//             try {
//                 const query = `
//             SELECT 
//               ModuleID, 
//               ModuleName, 
//               ModuleImage, 
//               ModuleDescription 
//             FROM ModulesDetails 
//             WHERE delStatus = 0
//             ORDER BY ModuleID
//           `;

//                 const results = await queryAsync(conn, query);

//                 success = true;
//                 res.status(200).json({
//                     success,
//                     data: results,
//                     message: "Modules fetched successfully"
//                 });
//             } catch (queryErr) {
//                 logError(queryErr);
//                 res.status(500).json({
//                     success,
//                     message: "Error fetching modules"
//                 });
//             } finally {
//                 closeConnection();
//             }
//         });
//     } catch (error) {
//         logError(error);
//         res.status(500).json({
//             success,
//             message: "Server error"
//         });
//     }
// };


// export const getModules = async (req, res) => {
//     let success = false;

//     try {
//         connectToDatabase(async (err, conn) => {
//             if (err) {
//                 logError(err);
//                 return res.status(500).json({
//                     success,
//                     message: "Database connection error"
//                 });
//             }

//             try {
//                 const query = `
//                     SELECT 
//                         ModuleID, 
//                         ModuleName, 
//                         ModuleImage, 
//                         ModuleDescription,
//                         SortingOrder
//                     FROM ModulesDetails 
//                     WHERE delStatus = 0
//                     ORDER BY 
//                         CASE WHEN SortingOrder IS NULL THEN 1 ELSE 0 END,
//                         SortingOrder ASC,
//                         ModuleID ASC
//                 `;

//                 const results = await queryAsync(conn, query);

//                 success = true;
//                 res.status(200).json({
//                     success,
//                     data: results,
//                     message: "Modules fetched successfully"
//                 });
//             } catch (queryErr) {
//                 logError(queryErr);
//                 res.status(500).json({
//                     success,
//                     message: "Error fetching modules"
//                 });
//             } finally {
//                 closeConnection();
//             }
//         });
//     } catch (error) {
//         logError(error);
//         res.status(500).json({
//             success,
//             message: "Server error"
//         });
//     }
// };

export const getModules = async (req, res) => {
    let success = false;

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                console.error('Database connection error:', err);
                return res.status(500).json({
                    success,
                    message: "Database connection error"
                });
            }
            try {
                const query = `
                    SELECT 
                        ModuleID, 
                        ModuleName, 
                        ModuleImage, 
                        ModuleImagePath,  
                        ModuleDescription,
                        SortingOrder
                    FROM ModulesDetails 
                    WHERE delStatus = 0
                    ORDER BY 
                        CASE WHEN SortingOrder IS NULL THEN 1 ELSE 0 END,
                        SortingOrder ASC,
                        ModuleID ASC
                `;

                const results = await queryAsync(conn, query);

                // Transform results to include image URLs
                const modulesWithImageUrls = results.map(module => {
                    let imageUrl = null;
                    if (module.ModuleImagePath) {
                        // Check if path already contains full URL
                        if (module.ModuleImagePath.startsWith('http')) {
                            imageUrl = module.ModuleImagePath;
                        } else {
                            // Construct full URL
                            const baseUrl = `${req.protocol}://${req.get('host')}`;
                            // Remove any duplicate uploads/ prefix
                            const cleanPath = module.ModuleImagePath.replace(/^\/?uploads\//, '');
                            imageUrl = `${baseUrl}/uploads/${cleanPath}`;
                        }
                    }

                    return {
                        ...module,
                        ModuleImageUrl: imageUrl
                    };
                });

                success = true;
                res.status(200).json({
                    success,
                    data: modulesWithImageUrls,
                    message: "Modules fetched successfully"
                });
            } catch (queryErr) {
                console.error('Query error:', queryErr);
                res.status(500).json({
                    success,
                    message: "Error fetching modules",
                    error: queryErr.message // Include error details for debugging
                });
            } finally {
                closeConnection();
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success,
            message: "Server error",
            error: error.message
        });
    }
};



// export const getSubModules = async (req, res) => {
//     let success = false;
//     const { moduleId } = req.query;

//     if (!moduleId) {
//         return res.status(400).json({ success, message: "moduleId is required" });
//     }

//     try {
//         connectToDatabase(async (err, conn) => {
//             if (err) {
//                 logError(err);
//                 return res.status(500).json({ success, message: "Database connection error" });
//             }

//             try {
//                 const query = `
//                     SELECT 
//                         SubModuleID, 
//                         SubModuleName, 
//                         SubModuleImage, 
//                         SubModuleDescription,
//                         ModuleID
//                     FROM SubModulesDetails 
//                     WHERE ISNULL(delStatus, 0) = 0 AND ModuleID = ?
//                     ORDER BY SubModuleID
//                 `;

//                 const results = await queryAsync(conn, query, [moduleId]);

//                 success = true;
//                 res.status(200).json({
//                     success,
//                     data: results,
//                     message: "SubModules fetched successfully"
//                 });
//             } catch (queryErr) {
//                 logError(queryErr);
//                 res.status(500).json({ success, message: "Error fetching submodules" });
//             } finally {
//                 closeConnection();
//             }
//         });
//     } catch (error) {
//         logError(error);
//         res.status(500).json({ success, message: "Server error" });
//     }
// };


// export const getUnitsWithFiles = async (req, res) => {
//     let success = false;

//     try {
//         connectToDatabase(async (err, conn) => {
//             if (err) {
//                 logError(err);
//                 return res.status(500).json({
//                     success,
//                     message: "Database connection error"
//                 });
//             }

//             try {
//                 // First get all units
//                 const unitsQuery = `
//                     SELECT 
//                         UnitID,
//                         UnitName,
//                         UnitImg,
//                         UnitDescription,
//                         SubModuleID,
//                         AuthAdd
//                     FROM UnitsDetails
//                     WHERE ISNULL(delStatus, 0) = 0
//                     ORDER BY UnitID
//                 `;

//                 const units = await queryAsync(conn, unitsQuery);

//                 // Then get all files
//                 const filesQuery = `
//                     SELECT 
//                         FileID,
//                         FilesName,
//                         FilePath,
//                         FileType,
//                         UnitID,
//                         AuthAdd,
//                         Percentage
//                     FROM FilesDetails
//                     WHERE ISNULL(delStatus, 0) = 0
//                     ORDER BY FileID
//                 `;

//                 const files = await queryAsync(conn, filesQuery);

//                 // Group files by UnitID
//                 const filesByUnit = files.reduce((acc, file) => {
//                     if (!acc[file.UnitID]) {
//                         acc[file.UnitID] = [];
//                     }
//                     acc[file.UnitID].push(file);
//                     return acc;
//                 }, {});

//                 // Combine units with their files
//                 const result = units.map(unit => ({
//                     ...unit,
//                     files: filesByUnit[unit.UnitID] || []
//                 }));

//                 success = true;
//                 res.status(200).json({
//                     success,
//                     data: result,
//                     message: "Units with files fetched successfully"
//                 });
//             } catch (queryErr) {
//                 logError(queryErr);
//                 res.status(500).json({
//                     success,
//                     message: "Error fetching units with files"
//                 });
//             } finally {
//                 closeConnection();
//             }
//         });
//     } catch (error) {
//         logError(error);
//         res.status(500).json({
//             success,
//             message: "Server error"
//         });
//     }
// };
// export const getSubModules = async (req, res) => {
//     let success = false;
//     const { moduleId } = req.query;

//     if (!moduleId) {
//         return res.status(400).json({ success, message: "moduleId is required" });
//     }

//     try {
//         connectToDatabase(async (err, conn) => {
//             if (err) {
//                 logError(err);
//                 return res.status(500).json({ success, message: "Database connection error" });
//             }

//             try {
//                 const query = `
//                     SELECT 
//                         SubModuleID, 
//                         SubModuleName, 
//                         SubModuleImage, 
//                         SubModuleDescription,
//                         ModuleID,
//                         SortingOrder
//                     FROM SubModulesDetails 
//                     WHERE ISNULL(delStatus, 0) = 0 AND ModuleID = ?
//                     ORDER BY 
//                         CASE WHEN SortingOrder IS NULL THEN 1 ELSE 0 END,
//                         SortingOrder ASC,
//                         SubModuleID ASC
//                 `;

//                 const results = await queryAsync(conn, query, [moduleId]);

//                 success = true;
//                 res.status(200).json({
//                     success,
//                     data: results,
//                     message: "SubModules fetched successfully"
//                 });
//             } catch (queryErr) {
//                 logError(queryErr);
//                 res.status(500).json({ success, message: "Error fetching submodules" });
//             } finally {
//                 closeConnection();
//             }
//         });
//     } catch (error) {
//         logError(error);
//         res.status(500).json({ success, message: "Server error" });
//     }
// };


// export const getUnitsWithFiles = async (req, res) => {
//     let success = false;
//     const { subModuleId } = req.params; 

//     try {
//         connectToDatabase(async (err, conn) => {
//             if (err) {
//                 logError(err);
//                 return res.status(500).json({
//                     success,
//                     message: "Database connection error"
//                 });
//             }

//             try {
//                 const query = `
//                     SELECT 
//                         u.UnitID,
//                         u.UnitName,
//                         u.UnitImg,
//                         u.UnitDescription,
//                         u.SubModuleID,
//                         u.AuthAdd,
//                         f.FileID,
//                         f.FilesName,
//                         f.FilePath,
//                         f.FileType,
//                         f.Description,
//                         f.AuthAdd AS FileAuthAdd,
//                         f.Percentage
//                     FROM UnitsDetails u
//                     LEFT JOIN FilesDetails f ON u.UnitID = f.UnitID AND ISNULL(f.delStatus, 0) = 0
//                     WHERE ISNULL(u.delStatus, 0) = 0
//                     AND u.SubModuleID = ?
//                     ORDER BY u.UnitID, f.FileID
//                 `;

//                 const results = await queryAsync(conn, query, [subModuleId]);

//                 // Group files by UnitID
//                 const unitsMap = new Map();
//                 results.forEach(row => {
//                     if (!unitsMap.has(row.UnitID)) {
//                         unitsMap.set(row.UnitID, {
//                             UnitID: row.UnitID,
//                             UnitName: row.UnitName,
//                             UnitImg: row.UnitImg,
//                             UnitDescription: row.UnitDescription,
//                             SubModuleID: row.SubModuleID,
//                             AuthAdd: row.AuthAdd,
//                             files: []
//                         });
//                     }

//                     if (row.FileID) {
//                         unitsMap.get(row.UnitID).files.push({
//                             FileID: row.FileID,
//                             FilesName: row.FilesName,
//                             Description: row.Description,
//                             FilePath: row.FilePath,
//                             FileType: row.FileType,
//                             AuthAdd: row.FileAuthAdd,
//                             Percentage: row.Percentage
//                         });
//                     }
//                 });

//                 const result = Array.from(unitsMap.values());

//                 success = true;
//                 res.status(200).json({
//                     success,
//                     data: result,
//                     message: "Units with files fetched successfully"
//                 });
//             } catch (queryErr) {
//                 logError(queryErr);
//                 res.status(500).json({
//                     success,
//                     message: "Error fetching units with files"
//                 });
//             } finally {
//                 closeConnection();
//             }
//         });
//     } catch (error) {
//         logError(error);
//         res.status(500).json({
//             success,
//             message: "Server error"
//         });
//     }
// };

export const getSubModules = async (req, res) => {
    let success = false;
    const { moduleId } = req.query;

    if (!moduleId) {
        return res.status(400).json({ success, message: "moduleId is required" });
    }

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                console.error("Database connection error:", err);
                return res.status(500).json({ success, message: "Database connection error" });
            }

            try {
                const query = `
                    SELECT 
                        SubModuleID, 
                        SubModuleName, 
                        --SubModuleImage, 
                        SubModuleImagePath,
                        SubModuleDescription,
                        ModuleID,
                        SortingOrder
                    FROM SubModulesDetails 
                    WHERE ISNULL(delStatus, 0) = 0 AND ModuleID = ?
                    ORDER BY 
                        CASE WHEN SortingOrder IS NULL THEN 1 ELSE 0 END,
                        SortingOrder ASC,
                        SubModuleID ASC
                `;

                const results = await queryAsync(conn, query, [moduleId]);

                const subModulesWithImageUrls = results.map(subModule => {
                    let imageUrl = null;
                    if (subModule.SubModuleImagePath) {
                        if (subModule.SubModuleImagePath.startsWith("http")) {
                            imageUrl = subModule.SubModuleImagePath;
                        } else {
                            const baseUrl = `${req.protocol}://${req.get("host")}`;
                            const cleanPath = subModule.SubModuleImagePath.replace(/^\/?uploads\//, "");
                            imageUrl = `${baseUrl}/uploads/${cleanPath}`;
                        }
                    }

                    return {
                        ...subModule,
                        SubModuleImageUrl: imageUrl
                    };
                });

                success = true;
                res.status(200).json({
                    success,
                    data: subModulesWithImageUrls,
                    message: "SubModules fetched successfully"
                });
            } catch (queryErr) {
                console.error("Query error:", queryErr);
                res.status(500).json({
                    success,
                    message: "Error fetching submodules",
                    error: queryErr.message
                });
            } finally {
                closeConnection();
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({
            success,
            message: "Server error",
            error: error.message
        });
    }
};


export const getUnitsWithFiles = async (req, res) => {
    let success = false;
    const { subModuleId } = req.params; 

    try {
        connectToDatabase(async (err, conn) => {
            if (err) {
                logError(err);
                return res.status(500).json({
                    success,
                    message: "Database connection error"
                });
            }

            try {
                const query = `
                    SELECT 
                        u.UnitID,
                        u.UnitName,
                        u.UnitImg,
                        u.UnitDescription,
                        u.SubModuleID,
                        u.AuthAdd,
                        u.SortingOrder AS UnitSortingOrder,
                        f.FileID,
                        f.FilesName,
                        f.FilePath,
                        f.FileType,
                        f.Description,
                        f.AuthAdd AS FileAuthAdd,
                        f.Percentage,
                        f.SortingOrder AS FileSortingOrder
                    FROM UnitsDetails u
                    LEFT JOIN FilesDetails f ON u.UnitID = f.UnitID AND ISNULL(f.delStatus, 0) = 0
                    WHERE ISNULL(u.delStatus, 0) = 0
                    AND u.SubModuleID = ?
                    ORDER BY 
                        CASE WHEN u.SortingOrder IS NULL THEN 1 ELSE 0 END,
                        u.SortingOrder ASC,
                        u.UnitID ASC,
                        CASE WHEN f.SortingOrder IS NULL THEN 1 ELSE 0 END,
                        f.SortingOrder ASC,
                        f.FileID
                `;

                const results = await queryAsync(conn, query, [subModuleId]);

                // Group files by UnitID and sort files within each unit
                const unitsMap = new Map();
                results.forEach(row => {
                    if (!unitsMap.has(row.UnitID)) {
                        unitsMap.set(row.UnitID, {
                            UnitID: row.UnitID,
                            UnitName: row.UnitName,
                            UnitImg: row.UnitImg,
                            UnitDescription: row.UnitDescription,
                            SubModuleID: row.SubModuleID,
                            AuthAdd: row.AuthAdd,
                            SortingOrder: row.UnitSortingOrder,
                            files: []
                        });
                    }

                    if (row.FileID) {
                        unitsMap.get(row.UnitID).files.push({
                            FileID: row.FileID,
                            FilesName: row.FilesName,
                            Description: row.Description,
                            FilePath: row.FilePath,
                            FileType: row.FileType,
                            AuthAdd: row.FileAuthAdd,
                            Percentage: row.Percentage,
                            SortingOrder: row.FileSortingOrder
                        });
                    }
                });

                // Sort files within each unit by their SortingOrder
                const result = Array.from(unitsMap.values()).map(unit => ({
                    ...unit,
                    files: unit.files.sort((a, b) => 
                        (a.SortingOrder || Number.MAX_SAFE_INTEGER) - (b.SortingOrder || Number.MAX_SAFE_INTEGER)
                    )
                }));

                success = true;
                res.status(200).json({
                    success,
                    data: result,
                    message: "Units with files fetched successfully"
                });
            } catch (queryErr) {
                logError(queryErr);
                res.status(500).json({
                    success,
                    message: "Error fetching units with files"
                });
            } finally {
                closeConnection();
            }
        });
    } catch (error) {
        logError(error);
        res.status(500).json({
            success,
            message: "Server error"
        });
    }
};

// export const getUnitsWithFiles = async (req, res) => {
//     let success = false;
//     const { subModuleId } = req.params; 

//     try {
//         connectToDatabase(async (err, conn) => {
//             if (err) {
//                 logError(err);
//                 return res.status(500).json({
//                     success,
//                     message: "Database connection error"
//                 });
//             }

//             try {
//                 const query = `
//                     SELECT 
//                         u.UnitID,
//                         u.UnitName,
//                         u.UnitImg,
//                         u.UnitDescription,
//                         u.SubModuleID,
//                         u.AuthAdd,
//                         u.SortingOrder,
//                         f.FileID,
//                         f.FilesName,
//                         f.FilePath,
//                         f.FileType,
//                         f.Description,
//                         f.AuthAdd AS FileAuthAdd,
//                         f.Percentage
//                     FROM UnitsDetails u
//                     LEFT JOIN FilesDetails f ON u.UnitID = f.UnitID AND ISNULL(f.delStatus, 0) = 0
//                     WHERE ISNULL(u.delStatus, 0) = 0
//                     AND u.SubModuleID = ?
//                     ORDER BY 
//                         CASE WHEN u.SortingOrder IS NULL THEN 1 ELSE 0 END,
//                         u.SortingOrder ASC,
//                         u.UnitID ASC,
//                         f.FileID
//                 `;

//                 const results = await queryAsync(conn, query, [subModuleId]);

//                 // Group files by UnitID
//                 const unitsMap = new Map();
//                 results.forEach(row => {
//                     if (!unitsMap.has(row.UnitID)) {
//                         unitsMap.set(row.UnitID, {
//                             UnitID: row.UnitID,
//                             UnitName: row.UnitName,
//                             UnitImg: row.UnitImg,
//                             UnitDescription: row.UnitDescription,
//                             SubModuleID: row.SubModuleID,
//                             AuthAdd: row.AuthAdd,
//                             SortingOrder: row.SortingOrder,
//                             files: []
//                         });
//                     }

//                     if (row.FileID) {
//                         unitsMap.get(row.UnitID).files.push({
//                             FileID: row.FileID,
//                             FilesName: row.FilesName,
//                             Description: row.Description,
//                             FilePath: row.FilePath,
//                             FileType: row.FileType,
//                             AuthAdd: row.FileAuthAdd,
//                             Percentage: row.Percentage
//                         });
//                     }
//                 });

//                 const result = Array.from(unitsMap.values());

//                 success = true;
//                 res.status(200).json({
//                     success,
//                     data: result,
//                     message: "Units with files fetched successfully"
//                 });
//             } catch (queryErr) {
//                 logError(queryErr);
//                 res.status(500).json({
//                     success,
//                     message: "Error fetching units with files"
//                 });
//             } finally {
//                 closeConnection();
//                 // console.log("closeeee",closeConnection);
                
//             }
//         });
//     } catch (error) {
//         logError(error);
//         res.status(500).json({
//             success,
//             message: "Server error"
//         });
//     }
// };
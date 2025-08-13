import { body, validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import dotenv from "dotenv";
import { queryAsync, logError, logInfo, logWarning } from "../helper/index.js";

dotenv.config();

export const addEvent = async (req, res) => {
  let success = false;
  const userId = req.user.id;
  let conn;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logWarning("Data is not in the right format");
    return res.status(400).json({ success, data: errors.array(), message: "Data is not in the right format" });
  }

  try {
    const { title, start, end, category, companyCategory, venue, host, registerLink, description, poster } = req.body;

    // Promisify the DB connection
    conn = await new Promise((resolve, reject) => {
      connectToDatabase((err, connection) => {
        if (err) return reject(err);
        return resolve(connection);
      });
    });

    // Fetch user details
    const userQuery = `SELECT UserID, Name, isAdmin FROM Community_User WHERE ISNULL(delStatus, 0) = 0 AND EmailId = ?`;
    const userRows = await queryAsync(conn, userQuery, [userId]);

    if (userRows.length === 0) {
      logWarning("User not found, please login first.");
      return res.status(400).json({ success: false, data: {}, message: "User not found, please login first." });
    }

    const user = userRows[0];
    const isAdmin = user.isAdmin === 1;

    const status = isAdmin ? "Approved" : "Pending";
    const approvedBy = isAdmin ? user.Name : null;
    const approvedOn = isAdmin ? new Date() : null;

    const insertEventQuery = `
      INSERT INTO Community_Event 
      (EventTitle, StartDate, EndDate, EventType, Category, Venue, Host, RegistrationLink, EventImage, EventDescription, AuthAdd, AddOnDt, delStatus, Status, AdminRemark, ApprovedBy, ApprovedOn, UserID) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), 0, ?, ?, ?, ?, ?);`;

    await queryAsync(conn, insertEventQuery, [
      title, start, end, category, companyCategory, venue, host, registerLink, poster, description,
      user.Name, status, null, approvedBy, approvedOn, user.UserID
    ]);

    const lastInsertedIdQuery = `SELECT TOP 1 EventID FROM Community_Event WHERE ISNULL(delStatus, 0) = 0 ORDER BY EventID DESC;`;
    const lastInsertedId = await queryAsync(conn, lastInsertedIdQuery);

    success = true;
    logInfo("Event added successfully!");

    return res.status(200).json({
      success,
      data: { eventId: lastInsertedId[0].EventID },
      message: "Event added successfully!",
    });

  } catch (error) {
    logError("Unexpected Error: ", error);
    return res.status(500).json({ success: false, data: error, message: "Unexpected Error, check logs" });

  } finally {
    if (typeof closeConnection === 'function') closeConnection();
  }
};


export const getEvent = async (req, res) => { 
  let success = false;
  try {
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        return res.status(500).json({ success: false, data: err, message: errorMessage });
      }
      try {
        const EventWorkshopGetQuery = `
          SELECT CE.EventID, CE.EventTitle, CE.AuthAdd AS UserName, CE.StartDate, CE.EndDate, 
                 CE.Host, ET.ddValue AS EventType, CE.Venue, CE.RegistrationLink, 
                 CE.EventDescription, C.ddValue AS Category, CE.AddOnDt AS timestamp, 
                 CE.EventImage, CE.Status, CE.UserID, CE.AdminRemark 
          FROM Community_Event CE 
          LEFT JOIN tblDDReferences ET ON CE.EventType = ET.idCode AND ET.ddCategory = 'eventType'
          LEFT JOIN tblDDReferences C ON CE.Category = C.idCode AND C.ddCategory = 'eventHost'
          WHERE ISNULL(CE.delStatus, 0) = 0 AND CE.UserID = 14 
          ORDER BY CE.AddOnDt DESC;
        `;

        const EventWorkshopGet = await queryAsync(conn, EventWorkshopGetQuery);

        // Corrected count query
        const countQuery = `
          SELECT COUNT(*) AS totalCount 
          FROM Community_Event 
          WHERE ISNULL(delStatus, 0) = 0 AND UserID = 14
        `;
        const countResult = await queryAsync(conn, countQuery);
        const totalCount = countResult[0].totalCount;

        success = true;
        closeConnection();
        const infoMessage = "Event and Workshop Got Successfully";
        logInfo(infoMessage);
        return res.status(200).json({
          success,
          data: EventWorkshopGet,
          totalCount,
          message: infoMessage
        });
      } catch (queryErr) {
        logError(queryErr);
        closeConnection();
        return res.status(500).json({
          success: false,
          data: queryErr,
          message: "Something went wrong please try again",
        });
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


// export const updateEvent = async (req, res) => {
//   let success = false;

//   // Extract user ID from the authenticated request (assuming it's added by authentication middleware)
//   const userId = req.user.id;

//   // Validate request data
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const warningMessage = "Data is not in the right format";
//     logWarning(warningMessage); // Log the warning
//     res
//       .status(400)
//       .json({ success, data: errors.array(), message: warningMessage });
//     return;
//   }

//   try {
//     // Destructure form data
//     let {
//       title,
//       start,
//       end,
//       category,
//       companyCategory,
//       venue,
//       host,
//       registerLink,
//       poster,
//       description,
//     } = req.body;

//     // Set defaults if necessary
//     title = title ?? null;
//     start = start ?? null;
//     end = end ?? null;
//     category = category ?? null;
//     companyCategory = companyCategory ?? null;
//     venue = venue ?? null;
//     host = host ?? null;
//     registerLink = registerLink ?? null;
//     description = description ?? null;

//     // Extract event ID from request parameters (assumes eventId is passed as a parameter)
//     const eventId = req.params.eventId;

//     // Connect to the database
//     connectToDatabase(async (err, conn) => {
//       if (err) {
//         const errorMessage = "Failed to connect to database";
//         logError(err); // Log the error
//         res
//           .status(500)
//           .json({ success: false, data: err, message: errorMessage });
//         return;
//       }

//       try {
//         // Check if the event exists and belongs to the authenticated user
//         const checkEventQuery = `
//             SELECT EventID, AuthAdd 
//             FROM Community_Event 
//             WHERE EventID = ? AND isnull(delStatus, 0) = 0;
//           `;
//         const eventRows = await queryAsync(conn, checkEventQuery, [eventId]);

//         if (eventRows.length === 0) {
//           const warningMessage = "Event not found or does not belong to you";
//           logWarning(warningMessage);
//           res
//             .status(404)
//             .json({ success: false, data: {}, message: warningMessage });
//           return;
//         }

//         // Ensure the event belongs to the user attempting to update it
//         if (eventRows[0].AuthAdd !== userId && req.user.isAdmin !== 1) {
//           const warningMessage = "You are not authorized to update this event";
//           logWarning(warningMessage);
//           res
//             .status(403)
//             .json({ success: false, data: {}, message: warningMessage });
//           return;
//         }

//         // Update event details
//         const updateEventQuery = `UPDATE Community_Event 
//                         SET EventTitle = ?, 
//                         StartDate = ?, 
//                         EndDate = ?, 
//                         EventType = ?, 
//                         Category = ?, 
//                         Venue = ?, 
//                         Host = ?, 
//                         RegistrationLink = ?, 
//                         EventImage = ?, 
//                         EventDescription = ?, 
//                         AuthLstEdit = ?, 
//                         editOnDt = GETDATE() 
//                     WHERE EventID = ?;
//                   `;

//         await queryAsync(conn, updateEventQuery, [
//           title,
//           start,
//           end,
//           category,
//           companyCategory,
//           venue,
//           host,
//           registerLink,
//           poster,
//           description,
//           userId,  // 👈 Set `AuthLstEdit` to the ID of the user making the update
//           eventId,
//         ]);

//         success = true;
//         closeConnection();

//         const infoMessage = "Event updated successfully!";
//         logInfo(infoMessage);

//         // Send success response
//         res.status(200).json({
//           success,
//           data: { eventId },
//           message: infoMessage,
//         });
//       } catch (queryErr) {
//         closeConnection();
//         logError(queryErr);
//         res.status(500).json({
//           success: false,
//           data: queryErr,
//           message: "Something went wrong, please try again",
//         });
//       }
//     });
//   } catch (error) {
//     logError(error);
//     res.status(500).json({
//       success: false,
//       data: {},
//       message: "Something went wrong, please try again",
//     });
//   }
// };

export const updateEvent = async (req, res) => {
  let success = false;


  const userId = req.user.id;
  // console.log("user ID:", userId);

  // Validate request data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    logWarning(warningMessage);
    res.status(400).json({ success, data: errors.array(), message: warningMessage });
    return;
  }

  try {
    let {
      title,
      start,
      end,
      category,
      companyCategory,
      venue,
      host,
      registerLink,
      poster,
      description,
      Status,
      remark,
    } = req.body;

    const eventId = req.params.eventId;

    // Connect to the database
    connectToDatabase(async (err, conn) => {
      if (err) {
        const errorMessage = "Failed to connect to database";
        logError(err);
        res.status(500).json({ success: false, data: err, message: errorMessage });
        return;
      }

      try {
        // Check if the event exists
        const checkEventQuery = `
              SELECT EventID, AuthAdd 
              FROM Community_Event 
              WHERE EventID = ? AND isnull(delStatus, 0) = 0;
            `;
        const eventRows = await queryAsync(conn, checkEventQuery, [eventId]);
        // console.log("event:", eventRows);

        if (eventRows.length === 0) {
          const warningMessage = "Event not found";
          logWarning(warningMessage);
          res.status(404).json({ success: false, data: {}, message: warningMessage });
          return;
        }

        // Ensure the user is authorized to perform the action
        if (req.user.isAdmin !== 1) {
          const warningMessage = "You are not authorized to perform this action";
          logWarning(warningMessage);
          res.status(403).json({ success: false, data: {}, message: warningMessage });
          return;
        }

        if (Status === "Approved" && Status === "Approved") {
          const warningMessage = "Event is already approved";
          logWarning(warningMessage);
          res.status(400).json({ success: false, data: {}, message: warningMessage });
          return;
        }

        if (Status === "reject" && Status === "Rejected") {
          const warningMessage = "Event is already rejected";
          logWarning(warningMessage);
          res.status(400).json({ success: false, data: {}, message: warningMessage });
          return;
        }

        let query;
        let queryParams;

        // Handle different actions
        switch (Status) {
          case "approve":
            query = `
                  UPDATE Community_Event 
                  SET Status = 'Approved', AuthLstEdit = ?, editOnDt = GETDATE() 
                  WHERE EventID = ?;
                `;
            queryParams = [userId, eventId];
            break;

          case "reject":
            if (!remark || typeof remark !== "string") {
              remark = "";
            }

            query = `
                  UPDATE Community_Event 
                  SET Status = 'Rejected', AdminRemark = ?, AuthLstEdit = ?, editOnDt = GETDATE() 
                  WHERE EventID = ?;
                `;
            queryParams = [String(remark), userId, eventId];
            break;

          case "delete":
            query = `
                  UPDATE Community_Event 
                  SET delStatus = 1, AuthLstEdit = ?, editOnDt = GETDATE() 
                  WHERE EventID = ?;
                `;
            queryParams = [userId, eventId];
            break;

          default:
            // Default to updating event details
            query = `
                  UPDATE Community_Event 
                  SET EventTitle = ?, StartDate = ?, EndDate = ?, EventType = ?, Category = ?, 
                      Venue = ?, Host = ?, RegistrationLink = ?, EventImage = ?, EventDescription = ?, 
                      AuthLstEdit = ?, editOnDt = GETDATE() 
                  WHERE EventID = ?;
                `;
            queryParams = [
              title,
              start,
              end,
              category,
              companyCategory,
              venue,
              host,
              registerLink,
              poster,
              description,
              userId,
              eventId,
            ];
            break;
        }

        // Execute the query
        await queryAsync(conn, query, queryParams);

        success = true;
        closeConnection();

        const infoMessage = `Event ${Status ? Status + "ed" : "updated"} successfully!`;
        logInfo(infoMessage);

        // Send success response
        res.status(200).json({ success, data: { eventId }, message: infoMessage });
      } catch (queryErr) {
        closeConnection();
        logError(`Error updating event ${eventId} : ${queryErr.message}`);
        logError(queryErr);
        // console.log("Query Error Details:", queryErr);
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
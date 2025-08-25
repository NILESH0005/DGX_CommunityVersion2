import { body, validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import dotenv from "dotenv";
import { queryAsync, logError, logInfo, logWarning } from "../helper/index.js";
import { addEventService, getEventService } from "../services/eventService.js";
import User from "../models/User.js"

dotenv.config();

export const addEvent = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({
        success: false,
        message: "User email is missing in token",
      });
    }

    const newEvent = await addEventService(req.user, req.body);

    res.status(200).json({
      success: true,
      data: newEvent,
      message: "Event added successfully!",
    });
  } catch (error) {
    console.error("AddEvent Error:", error);
    res.status(500).json({
      success: false,
      data: error.message || error,
      message: "Unexpected Error, check logs",
    });
  }
};

export const getEvent = async (req, res) => {
  let success = false;
  const userId = req.user?.uniqueId; 
  console.log("req.user:", req.user);
  console.log("Looking for events with UserID:", userId);


  if (!userId) {
    return res.status(400).json({
      success,
      message: "User ID not found. Please login.",
    });
  }

  try {
    const { events, totalCount } = await getEventService(userId);

    logInfo("Events fetched successfully");

    success = true;
    return res.status(200).json({
      success,
      data: events,
      totalCount,
      message: "Event and Workshop fetched successfully",
    });
  } catch (error) {
    logError(error.message || "Unknown error", error.stack);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong, please try again",
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
    res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
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
        res
          .status(500)
          .json({ success: false, data: err, message: errorMessage });
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
          res
            .status(404)
            .json({ success: false, data: {}, message: warningMessage });
          return;
        }

        // Ensure the user is authorized to perform the action
        if (req.user.isAdmin !== 1) {
          const warningMessage =
            "You are not authorized to perform this action";
          logWarning(warningMessage);
          res
            .status(403)
            .json({ success: false, data: {}, message: warningMessage });
          return;
        }

        if (Status === "Approved" && Status === "Approved") {
          const warningMessage = "Event is already approved";
          logWarning(warningMessage);
          res
            .status(400)
            .json({ success: false, data: {}, message: warningMessage });
          return;
        }

        if (Status === "reject" && Status === "Rejected") {
          const warningMessage = "Event is already rejected";
          logWarning(warningMessage);
          res
            .status(400)
            .json({ success: false, data: {}, message: warningMessage });
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

        const infoMessage = `Event ${
          Status ? Status + "ed" : "updated"
        } successfully!`;
        logInfo(infoMessage);

        // Send success response
        res
          .status(200)
          .json({ success, data: { eventId }, message: infoMessage });
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

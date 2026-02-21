import db, { sequelize } from "../models/index.js";
import { Op } from "sequelize";
import moment from "moment-timezone";
import { fn, col } from "sequelize"; // ✅ ADD THIS LINE

const CommunityEvents = db.CommunityEvents;
const User = db.User;
const MasterTable = db.TableDDReference;
const ContentInteractionLog = db.ContentInteractionLog;
// const istToUtc = (dateString) => {
//   if (!dateString) return null;
//   return moment
//     .tz(dateString, "Asia/Kolkata")
//     .utc()
//     .format("YYYY-MM-DD HH:mm:ss");
// };

export const addEventService = async (decodedUser, payload) => {
  const {
    title,
    start,
    end,
    category, // e.g. "Workshop" or "Event"
    companyCategory,
    venue,
    host,
    registerLink,
    description,
    poster,
  } = payload;

  // 🔹 Fetch user details by EmailId from token
  const user = await User.findOne({
    where: {
      EmailId: decodedUser.id,
      delStatus: 0,
    },
  });

  if (!user) {
    throw new Error("User not found, please login first.");
  }

  // 🔹 Map category string to idCode from MasterTable
  const eventTypeRow = await MasterTable.findOne({
    where: {
      ddCategory: "EventType",
      idCode: category, // e.g. "Workshop"
      delStatus: 0,
    },
  });

  if (!eventTypeRow) {
    throw new Error(`Invalid category: ${category}`);
  }

  const eventTypeId = eventTypeRow.idCode; // use idCode

  const isAdmin = decodedUser.isAdmin === 1;

  const status = isAdmin ? "Approved" : "Pending";
  const approvedBy = isAdmin ? user.Name : null;
  const approvedOn = isAdmin ? new Date() : null;

  // 🔹 Create event
  // const newEvent = await CommunityEvents.create({
  //   EventTitle: title,
  //   StartDate: start,
  //   EndDate: end,
  //   EventType: eventTypeId, // ✅ use the integer idCode, not string
  //   Category: companyCategory,
  //   Venue: venue,
  //   Host: host,
  //   RegistrationLink: registerLink,
  //   EventImage: poster,
  //   EventDescription: description,
  //   AuthAdd: user.Name,
  //   AddOnDt: new Date(),
  //   delStatus: 0,
  //   Status: status,
  //   AdminRemark: null,
  //   ApprovedBy: approvedBy,
  //   ApprovedOn: approvedOn,
  //   UserID: user.UserID,
  // });

  const newEvent = await CommunityEvents.create({
    EventTitle: title,
    StartDate: start,
    EndDate: end,
    EventType: eventTypeId,
    Category: companyCategory,
    Venue: venue,
    Host: host,
    RegistrationLink: registerLink,
    EventImage: poster,
    EventDescription: description,
    AuthAdd: user.UserID,
    AddOnDt: new Date(),
    delStatus: 0,
    Status: status,
    AdminRemark: null,
    ApprovedBy: approvedBy,
    ApprovedOn: approvedOn,
    UserID: user.UserID,
  });

  return newEvent;
};

export const getEventService = async (userId) => {
  const [events] = await sequelize.query(`
     SELECT 
      ce.*,
      mt1.ddValue as EventType,
      mt2.ddValue as Category,
      u.Name as UserName
    FROM giindiadgx_community.Community_Events ce
    LEFT JOIN giindiadgx_community.tblDDReference mt1 
      ON ce.EventType = mt1.idCode 
      AND mt1.ddCategory = 'eventType' 
      AND mt1.delStatus = 0
    LEFT JOIN giindiadgx_community.tblDDReference mt2 
      ON ce.Category = mt2.idCode 
      AND mt2.ddCategory = 'eventHost' 
      AND mt2.delStatus = 0
    LEFT JOIN giindiadgx_community.Community_User u 
      ON ce.UserID = u.UserID 
      AND u.delStatus = 0
    WHERE ce.delStatus = 0
    ORDER BY ce.AddOnDt DESC
  `);

  console.log("Query conditions:", { delStatus: 0, UserID: userId });

  const totalCount = await CommunityEvents.count({
    where: { delStatus: 0, UserID: userId },
  });

  return { events, totalCount };
};

export const updateEventService = async (eventId, user, payload) => {
  try {
    // 1. Check if event exists
    const event = await CommunityEvents.findOne({
      where: {
        EventID: eventId,
        [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
      },
    });

    if (!event) {
      return { success: false, status: 404, message: "Event not found" };
    }

    // 2. Authorization check
    if (user.isAdmin !== 1) {
      return {
        success: false,
        status: 403,
        message: "You are not authorized to perform this action",
      };
    }

    let updateData = {};
    const {
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
    } = payload;

    // 3. Handle Status actions
    switch (Status) {
      case "approve":
        if (event.Status === "Approved") {
          return {
            success: false,
            status: 400,
            message: "Event is already approved",
          };
        }
        updateData = {
          Status: "Approved",
          AuthLstEdt: user.uniqueId,
          editOnDt: new Date(),
        };
        break;

      case "reject":
        if (event.Status === "Rejected") {
          return {
            success: false,
            status: 400,
            message: "Event is already rejected",
          };
        }
        updateData = {
          Status: "Rejected",
          AdminRemark: remark || "",
          AuthLstEdt: user.uniqueId,
          editOnDt: new Date(),
        };
        break;

      case "delete":
        updateData = {
          delStatus: 1,
          AuthLstEdt: user.uniqueId,
          editOnDt: new Date(),
        };
        break;

      default:
        // normal update
        updateData = {
          EventTitle: title,
          StartDate: start,
          EndDate: end,
          EventType: category,
          Category: companyCategory,
          Venue: venue,
          Host: host,
          RegistrationLink: registerLink,
          EventImage: poster,
          EventDescription: description,
          AuthLstEdt: user.uniqueId,
          editOnDt: new Date(),
        };
        break;
    }

    // 4. Perform update
    await CommunityEvents.update(updateData, { where: { EventID: eventId } });

    return {
      success: true,
      status: 200,
      data: { eventId },
      message: `Event ${Status ? Status + "ed" : "updated"} successfully!`,
    };
  } catch (error) {
    console.error("Error in updateEventService:", error);
    return {
      success: false,
      status: 500,
      message: "Something went wrong, please try again",
      error,
    };
  }
};

export const getEventByIdService = async (eventId) => {
  const event = await CommunityEvents.findOne({
    where: {
      EventID: eventId,
      delStatus: 0,
    },
    include: [
      {
        model: MasterTable,
        as: "EventTypeRef",
        attributes: ["ddValue"],
        where: { ddCategory: "eventType", delStatus: 0 },
        required: false,
      },
      {
        model: MasterTable,
        as: "CategoryRef",
        attributes: ["ddValue"],
        where: { ddCategory: "eventHost", delStatus: 0 },
        required: false,
      },
    ],
  });

  if (!event) {
    return null;
  }

  const eventObj = event.toJSON ? event.toJSON() : event;

  return {
    ...eventObj,
    EventType: eventObj.EventTypeRef?.ddValue || eventObj.EventType,
    Category: eventObj.CategoryRef?.ddValue || eventObj.Category,
    EventTypeRef: undefined,
    CategoryRef: undefined,
  };
};

export const EventViewService = {
  async getTotalEventViews(userId) {
    try {
      const events = await CommunityEvents.findAll({
        where: { delStatus: 0 },
        attributes: ["EventID", "EventTitle"],
        raw: true,
      });

      const results = await Promise.all(
        events.map(async (event) => {
          // ✅ Total views
          const totalViews = await ContentInteractionLog.count({
            where: {
              ProcessName: "Event",
              reference: event.EventID,
              View: 1,
              delStatus: 0,
            },
          });

          // ✅ Has this user viewed?
          let userHasViewed = false;

          if (userId) {
            const userView = await ContentInteractionLog.findOne({
              where: {
                ProcessName: "Event",
                reference: event.EventID,
                UserID: userId,
                View: 1,
                delStatus: 0,
              },
            });

            userHasViewed = !!userView;
          }

          return {
            eventID: event.EventID,
            eventTitle: event.EventTitle,
            totalViews,
            HasUserViewed: userHasViewed, // ✅ SAME PATTERN AS DISCUSSION
          };
        }),
      );

      return { success: true, data: results };
    } catch (error) {
      console.error("Error fetching total event views:", error);
      return { success: false, message: error.message };
    }
  },

  async getEventViewById(eventId, userId) {
    try {
      const totalViews = await ContentInteractionLog.count({
        where: {
          ProcessName: "Event",
          reference: eventId,
          View: 1,
          delStatus: 0,
        },
      });

      let userHasViewed = false;

      if (userId) {
        const userView = await ContentInteractionLog.findOne({
          where: {
            ProcessName: "Event",
            reference: eventId,
            UserID: userId,
            View: 1,
            delStatus: 0,
          },
        });

        userHasViewed = !!userView;
      }

      return {
        success: true,
        data: {
          reference: eventId,
          totalViews,
          HasUserViewed: userHasViewed,
        },
      };
    } catch (error) {
      console.error("Error fetching event view by ID:", error);
      return { success: false, message: error.message };
    }
  },
};

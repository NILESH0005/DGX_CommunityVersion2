import db from "../models/index.js";
import { Op } from "sequelize"; // ✅ direct import

const CommunityEvents = db.CommunityEvents;
const User = db.User;
const MasterTable = db.TableDDReference;

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
  const newEvent = await CommunityEvents.create({
    EventTitle: title,
    StartDate: start,
    EndDate: end,
    EventType: eventTypeId, // ✅ use the integer idCode, not string
    Category: companyCategory,
    Venue: venue,
    Host: host,
    RegistrationLink: registerLink,
    EventImage: poster,
    EventDescription: description,
    AuthAdd: user.Name,
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
  const events = await CommunityEvents.findAll({
    where: { delStatus: 0 },

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
    order: [["AddOnDt", "DESC"]],
  });
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
          AuthLstEdt: user.id,
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
          AuthLstEdt: user.id,
          editOnDt: new Date(),
        };
        break;

      case "delete":
        updateData = {
          delStatus: 1,
          AuthLstEdt: user.id,
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
          AuthLstEdt: user.id,
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

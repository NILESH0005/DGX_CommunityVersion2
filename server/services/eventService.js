import db from "../models/index.js";
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
    where: { delStatus: 0, UserID: userId },

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

import db from "../models/index.js";
const { ContactUs, User } = db;


export const getContactDetailsService = async () => {
  const contact = await ContactUs.findOne({
    where: { delStatus: 0 },
    order: [["id", "DESC"]],
  });
  return contact;
};

export const updateContactDetailsService = async (userEmail, data) => {
  // Fetch user name
  const user = await User.findOne({
    where: { EmailId: userEmail, delStatus: 0 },
    attributes: ["UserID", "Name"],
  });

  if (!user) {
    throw new Error("User not found. Please login again.");
  }

  const userName = user.UserID;

  // Soft delete old record
  await ContactUs.update(
    { delStatus: 1, delOnDt: new Date(), AuthDel: userName },
    { where: { delStatus: 0 } }
  );

  // Insert new record
  const newContact = await ContactUs.create({
    ...data,
    AuthAdd: userName,
    AddOnDt: new Date(),
    delStatus: 0,
  });

  return newContact;
};

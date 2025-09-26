
import {
  getContactDetailsService,
  updateContactDetailsService,
} from "../services/contactUsService.js";
import { validationResult } from "express-validator";

export const getContactDetails = async (req, res) => {
  try {
    const contact = await getContactDetailsService();

    if (!contact) {
      return res.status(200).json({
        success: false,
        data: {},
        message: "No contact details found",
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
      message: "Contact details fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again",
    });
  }
};

export const updateContactDetails = async (req, res) => {
  let success = false;

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success,
      message: "Invalid input format",
      data: errors.array(),
    });
  }

  try {
    const { address, email, phone, working_hours, map_embed_code } = req.body;
    const userEmail = req.user?.id; // ⚠️ assuming req.user.id holds EmailId

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    const newContact = await updateContactDetailsService(userEmail, {
      address,
      email,
      phone,
      working_hours,
      map_embed_code,
    });

    success = true;
    return res.status(200).json({
      success,
      message: "Contact details updated successfully",
      data: { newRecordId: newContact.id },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unexpected server error",
      data: error,
    });
  }
};

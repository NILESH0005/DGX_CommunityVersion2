import { body, validationResult } from "express-validator";
import { connectToDatabase, closeConnection } from "../database/mySql.js";
import dotenv from "dotenv";
import { queryAsync, logError, logInfo, logWarning } from "../helper/index.js";
import {
  addEventService,
  getEventService,
  updateEventService,
  EventViewService,
  getEventByIdService,
} from "../services/eventService.js";
import User from "../models/User.js";

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

export const updateEvent = async (req, res) => {
  let success = false;

  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage = "Data is not in the right format";
    logWarning(warningMessage);
    return res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
  }

  try {
    const eventId = req.params.eventId;
    const user = req.user; // { id, isAdmin }
    const payload = req.body;

    const result = await updateEventService(eventId, user, payload);

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        data: result.error || {},
        message: result.message,
      });
    }

    success = true;
    logInfo(result.message);
    return res.status(200).json({
      success,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({
      success: false,
      data: {},
      message: "Something went wrong, please try again",
    });
  }
};

export const getEventById = async (req, res) => {
  let success = false;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success,
      message: "Event ID is required",
    });
  }

  try {
    const event = await getEventByIdService(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    logInfo(`Event ${id} fetched successfully`);

    success = true;
    return res.status(200).json({
      success,
      data: event,
      message: "Event fetched successfully",
    });
  } catch (error) {
    logError(error.message || "Unknown error", error.stack);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong, please try again",
    });
  }
};

export const EventViewController = {
  async getAllEventViews(req, res) {
    try {
      const userId = req.user?.uniqueId; // from JWT

      const result = await EventViewService.getTotalEventViews(userId);
      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch event views",
      });
    }
  },

  async getEventViewById(req, res) {
    try {
      const userId = req.user?.uniqueId;
      const { eventId } = req.params;

      const result = await EventViewService.getEventViewById(eventId, userId);
      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch event view",
      });
    }
  },
};

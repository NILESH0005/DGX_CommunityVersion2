import express from "express";
import { fetchUser } from "../middleware/fetchUser.js";
import {
  addEvent,
  EventViewController,
  getEvent,
  getEventById,
  updateEvent,
} from "../controllers/eventandworkshop.js";

const router = express.Router();

router.post("/addEvent", fetchUser, addEvent);
router.get("/getEvent", fetchUser, getEvent);
router.get("/getEventById/:id", getEventById);
router.post("/updateEvent/:eventId", fetchUser, updateEvent);
router.get("/event-views", fetchUser, EventViewController.getAllEventViews);
router.get("/event-views/:eventId", EventViewController.getEventViewById);

export default router;

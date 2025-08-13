import express from "express";
// import { body } from 'express-validator';
import { fetchUser } from '../middleware/fetchUser.js'; // Optional, if you need user authentication
import { addEvent, getEvent, updateEvent } from "../controllers/eventandworkshop.js"; // Import your addEvent controller

const router = express.Router();

// Route for adding a new event
router.post('/addEvent', fetchUser, addEvent); // The fetchUser middleware can be used if you need to authenticate the user.
router.get('/getEvent', getEvent);
router.post('/updateEvent/:eventId', fetchUser, updateEvent);

export default router; 
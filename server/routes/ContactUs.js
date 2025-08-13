import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { getContactDetails, updateContactDetails } from "../controllers/contactUs.js";

const router = express.Router();

router.get('/getContactDetails', getContactDetails)
router.post('/updateContactDetails', fetchUser, updateContactDetails)



export default router;
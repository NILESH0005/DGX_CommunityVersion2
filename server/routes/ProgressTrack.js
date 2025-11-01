import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { getUserFileIDs, getModuleSubmoduleProgress, getUserViewStatus, getViewStatistics, recordView  } from "../controllers/progressTrack.js";

const router = express.Router();

router.post('/getUserFileIDs', fetchUser ,getUserFileIDs)
router.post('/getModuleSubmoduleProgress', fetchUser ,getModuleSubmoduleProgress)
router.post('/recordView', fetchUser, recordView);
router.get('/viewStats', getViewStatistics);
router.get('/userViewStatus', fetchUser, getUserViewStatus);

export default router;
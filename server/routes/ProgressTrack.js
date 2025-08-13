import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { getUserFileIDs, getModuleSubmoduleProgress  } from "../controllers/progressTrack.js";

const router = express.Router();

router.post('/getUserFileIDs', fetchUser ,getUserFileIDs)
router.post('/getModuleSubmoduleProgress', fetchUser ,getModuleSubmoduleProgress)


export default router;
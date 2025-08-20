import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { discussionPost, getDiscussion, searchdiscussion, deleteDiscussion, updateDiscussion  } from "../controllers/discussion.js";

const router = express.Router();

router.post('/discussionPost', fetchUser, discussionPost)
router.post('/getdiscussion', getDiscussion)
router.post('/searchdiscussion', searchdiscussion)
router.post('/deleteDiscussion', fetchUser, deleteDiscussion)
router.post('/updateDiscussion', fetchUser, updateDiscussion)


export default router;
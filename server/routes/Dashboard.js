import express from "express";
// import { fetchUser } from '../middleware/fetchUser.js';
import { fetchUser } from '../middleware/fetchUser.js';
import { getApprovalCounts, getProcessCounts, getTrendingBlogs, getTrendingDiscussion } from "../controllers/dashboard.js";

const router = express.Router();

router.get('/getTrendingBlogs', getTrendingBlogs)
router.get('/getTrendingDiscussion', getTrendingDiscussion)
router.get('/getApprovalCounts', getApprovalCounts)
router.get("/processCounts", getProcessCounts);




export default router;
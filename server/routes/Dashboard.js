import express from "express";
// import { fetchUser } from '../middleware/fetchUser.js';
import { fetchUser } from '../middleware/fetchUser.js';
import { getApprovalCounts, getTrendingBlogs } from "../controllers/dashboard.js";

const router = express.Router();

router.get('/getTrendingBlogs', getTrendingBlogs)
router.get('/getApprovalCounts', getApprovalCounts)



export default router;
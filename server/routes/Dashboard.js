import express from "express";
// import { fetchUser } from '../middleware/fetchUser.js';
import { fetchUser } from '../middleware/fetchUser.js';
import { getTrendingBlogs } from "../controllers/dashboard.js";

const router = express.Router();

router.get('/getTrendingBlogs', getTrendingBlogs)


export default router;
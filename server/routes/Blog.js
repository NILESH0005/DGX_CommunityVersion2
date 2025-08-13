import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { blogpost, getBlog, blogpost_bulk, updateBlog, getUserBlogs, getPublicBlogs } from "../controllers/blog.js";

const router = express.Router();

router.post('/blogpost', fetchUser, blogpost)
router.post('/blogpost_bulk', fetchUser, blogpost_bulk)
router.post('/getBlog', fetchUser, getBlog)
router.get('/getPublicBlogs', getPublicBlogs)
router.post('/getUserBlogs', fetchUser, getUserBlogs)
router.post('/updateBlog/:blogId', fetchUser, updateBlog);


export default router;
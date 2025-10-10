import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { blogpost, getBlog, blogpost_bulk, updateBlog, getUserBlogs, getPublicBlogs, likeBlogController, rateBlogController, getUserBlogInteractionController, getBlogStatsController } from "../controllers/blog.js";

const router = express.Router();

router.post('/blogpost', fetchUser, blogpost)
router.post('/blogpost_bulk', fetchUser, blogpost_bulk)
router.get('/getBlog', fetchUser, getBlog)
router.get('/getPublicBlogs', getPublicBlogs)
router.get('/getUserBlogs', fetchUser, getUserBlogs)
router.post('/updateBlog/:blogId', fetchUser, updateBlog);
router.post('/likeBlogController', fetchUser, likeBlogController);
router.post('/rate/:blogId', fetchUser, rateBlogController);

router.get('/user-interaction/:blogId', fetchUser, getUserBlogInteractionController);
router.get('/stats/:blogId', getBlogStatsController);





export default router;
import express from "express";
import { fetchUser } from "../middleware/fetchUser.js";

import {
  discussionPost,
  getDiscussion,
  deleteDiscussion,
  updateDiscussion,
  discussionLike,
  getSingleDiscussionLikeInfo,
  getDiscussionLikes,
  deleteUserComment,
} from "../controllers/discussion.js";

const router = express.Router();

router.post("/discussionPost", fetchUser, discussionPost);
router.post("/getdiscussion", getDiscussion);
router.post("/deleteDiscussion", fetchUser, deleteDiscussion);
router.post("/updateDiscussion", fetchUser, updateDiscussion);
router.post("/like", fetchUser, discussionLike); // New like endpoint
router.post("/get-likes", getDiscussionLikes); // No auth required - for public access
router.post("/get-single-like", getSingleDiscussionLikeInfo); // No auth required
router.post("/deleteUserComment", fetchUser, deleteUserComment);

export default router;

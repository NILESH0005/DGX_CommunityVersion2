import express from 'express';
import { uploadFile } from '../controllers/fileController.js';
// import fetchUser from '../middleware/fetchUser.js';

const router = express.Router();

// Change this to handle both with and without authentication as needed
router.post('/upload', uploadFile); // Removed fetchUser if not needed for file uploads

export default router;
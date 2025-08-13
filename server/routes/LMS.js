// routes/lmsRoutes.js
import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';
import { LMS } from "../controllers/lms.js";

const router = express.Router();

router.post('/upload-learning-material',
  fetchUser,
  LMS.upload.single('file'), 
  LMS.uploadFile            
);

router.post('/upload-learning-material-update',
  fetchUser,
  LMS.upload.single('file'), 
  LMS.uploadUpdatedFile          
);

router.get('/sub-modules',
  fetchUser,
  LMS.getSubModules
);

router.post('/save-learning-materials',
  fetchUser,
  LMS.saveLearningMaterials
);

router.get('/units',
  fetchUser,
  LMS.getUnits
);
router.post('/files',
  fetchUser,
  LMS.upload.single('file'), 
  LMS.saveFileOrLink         
);

export default router;
// routes/lmsRoutes.js
import express from "express";
import { fetchUser } from "../middleware/fetchUser.js";
import { checkModuleExist, getModuleViews, LMS,  getSubModuleViews, getAllActiveFiles, getFileById, downloadFileById, getSubModuleRating , handleLmsSubmoduleRateAction, getModuleRating } from "../controllers/lms.js";

const router = express.Router();

router.post(
  "/upload-learning-material",
  fetchUser,
  LMS.upload.single("file"),
  LMS.uploadFile
);

router.post(
  "/upload-learning-material-update",
  fetchUser,
  LMS.upload.single("file"),
  LMS.uploadUpdatedFile
);

router.get("/sub-modules", fetchUser, LMS.getSubModules);

router.post("/save-learning-materials", fetchUser, LMS.saveLearningMaterials);

router.get("/units", fetchUser, LMS.getUnits);
router.post("/files", fetchUser, LMS.upload.single("file"), LMS.saveFileOrLink);

// router.post("/validate", checkModuleExist, fetchUser);

router.get("/submodule-views", getSubModuleViews);
router.get("/module-views", getModuleViews);
router.get("/getAllActiveFiles", getAllActiveFiles);
router.post("/getFileById", getFileById);
router.get("/download/:FileID", downloadFileById);
router.post("/rate-submodule",fetchUser, handleLmsSubmoduleRateAction);
router.get(  "/submodule-rating/:subModuleId",fetchUser, getSubModuleRating);
router.get(
  "/module-rating/:moduleId",
  getModuleRating
);


export default router;

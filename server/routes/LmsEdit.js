import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';


import { updateModule, deleteModule, deleteSubModule, updateSubModule, addSubmodule, deleteUnit, 
    updateUnit, deleteFile, addUnit, recordFileView, updateModuleOrder, updateSubmoduleOrder, 
    updateUnitOrder, updateFilesOrder, deleteMultipleFiles, updateFile } from "../controllers/lmsEdit.js";

const router = express.Router();

router.post('/updateModule/:id', fetchUser, updateModule)
router.post('/updateModuleOrder', fetchUser, updateModuleOrder)
router.post('/updateSubModule/:id', fetchUser, updateSubModule)
router.post('/updateSubmoduleOrder', fetchUser, updateSubmoduleOrder)
router.post('/updateUnit/:id', fetchUser, updateUnit)
router.post('/updateUnitOrder', fetchUser, updateUnitOrder)
router.post('/updateFilesOrder', fetchUser, updateFilesOrder)
router.post('/deleteModule', fetchUser, deleteModule)
router.post('/deleteUnit', fetchUser, deleteUnit)
router.post('/deleteFile', fetchUser, deleteFile)
router.post('/deleteMultipleFiles', fetchUser, deleteMultipleFiles)

router.post('/deleteSubModule', fetchUser, deleteSubModule)
router.post('/addSubmodule', fetchUser, addSubmodule)
router.post('/addUnit', fetchUser, addUnit)
router.post('/recordFileView', fetchUser, recordFileView)

router.post('/updateFile', fetchUser, updateFile)





export default router;
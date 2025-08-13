import express from 'express';
import { getDropdownValues, getQuizGroupDropdown, getQuizDropdown, getQuestionGroupDropdown, getModules, getSubModules, getUnitsWithFiles, getModuleById } from '../controllers/dropdown.js';  // Make sure the path is correct

const router = express.Router();

router.get('/getDropdownValues', getDropdownValues);
router.get('/getQuizGroupDropdown', getQuizGroupDropdown);
router.get('/getQuestionGroupDropdown', getQuestionGroupDropdown);
router.get('/getQuizDropdown', getQuizDropdown);
router.get('/getModules', getModules);
router.get('/getSubModules', getSubModules);
router.get('/getModuleById', getModuleById);  // For single module by ID
router.get('/getUnitsWithFiles/:subModuleId', getUnitsWithFiles); // Changed to accept parameter






export default router;

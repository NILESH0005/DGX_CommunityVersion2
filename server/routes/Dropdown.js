import express from 'express';
import { getDropdownValues, getQuizGroupDropdown, getQuizDropdown, getQuestionGroupDropdown, getModules, getSubModules, getUnitsWithFiles, getModuleById } from '../controllers/dropdown.js';  // Make sure the path is correct
import { fetchUser } from '../middleware/fetchUser.js';

const router = express.Router();

router.get('/getDropdownValues', getDropdownValues);
router.get('/getQuizGroupDropdown', getQuizGroupDropdown);
router.get('/getQuestionGroupDropdown', getQuestionGroupDropdown);
router.get('/getQuizDropdown', getQuizDropdown);
router.get('/getModules', getModules);
router.get('/getSubModules', getSubModules);
router.get('/getModuleById', getModuleById); 
router.get('/getUnitsWithFiles/:subModuleId', fetchUser,  getUnitsWithFiles); 






export default router;

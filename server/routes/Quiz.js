import express from "express";
import { fetchUser } from '../middleware/fetchUser.js';
import { createQuiz, getQuizzes, deleteQuiz, createQuestion, deleteQuestion, getQuestionsByGroupAndLevel, updateQuiz, 
    createQuizQuestionMapping, getUserQuizCategory, getQuizQuestions, submitQuiz,getQuestion, unmappQuestion, updateQuestion,
    getLeaderboardRanking, getUserQuizHistory, getQuizzesByRefId, getQuizQuestionsByQuizId } from "../controllers/quiz.js";

const router = express.Router();

router.post('/createQuiz', fetchUser, createQuiz)
router.post('/deleteQuiz', fetchUser, deleteQuiz)
router.post('/getQuizzes', fetchUser, getQuizzes)
router.get('/getLeaderboardRanking', fetchUser, getLeaderboardRanking)
router.post('/createQuestion', fetchUser, createQuestion)
router.get('/getQuestion', fetchUser, getQuestion)
router.post('/deleteQuestion', fetchUser, deleteQuestion)
router.post('/getQuestionsByGroupAndLevel', fetchUser, getQuestionsByGroupAndLevel)
router.post('/createQuizQuestionMapping', fetchUser, createQuizQuestionMapping)
router.get('/getUserQuizCategory', fetchUser, getUserQuizCategory)
router.get('/getUserQuizHistory', fetchUser, getUserQuizHistory)
router.post('/getQuizQuestions', fetchUser, getQuizQuestions)
router.post('/getQuizQuestionsByQuizId', fetchUser, getQuizQuestionsByQuizId)

router.post('/submitQuiz', fetchUser, submitQuiz)
router.post('/unmappQuestion', fetchUser, unmappQuestion)
// router.get('/getQuizResults/:quizId', fetchUser, getQuizResults)
router.post('/updateQuiz', fetchUser, updateQuiz)
router.post('/updateQuestion', fetchUser, updateQuestion)

router.post('/getQuizzesByRefId', fetchUser, getQuizzesByRefId)









export default router;




























  
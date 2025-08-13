 import React, { useState, useEffect, useContext } from "react";
 import { useParams, useLocation, useNavigate } from "react-router-dom";
 import QuizHeader from "./QuizHeader";
 import QuizPalette from "./QuizPalette";
 import ApiContext from "../../context/ApiContext";
 import Loader from "../LoadPage";
 import Swal from "sweetalert2";

 
const fetchQuizQuestions = async (quiz, onQuizComplete) => {
    //  const [loading, setLoading] = useState(true);
    //  const [error, setError] = useState(null);
      const { userToken, fetchData } = useContext(ApiContext);

    
     

    console.log(quiz.quiz.QuizID);
    // setLoading(true);
    // setError(null);

    //   if (loading) {
    //     return <Loader />;
    //   }

    try {
      console.log("Fetching questions with:", quiz);

      // Determine the endpoint and request body based on available data
      let endpoint, requestBody;

      if (quiz.quiz.group_id && quiz.quiz.QuizID) {
        // Regular quiz flow with both group_id and QuizID
        endpoint = "quiz/getQuizQuestions";
        requestBody = {
          quizGroupID: quiz.quiz.group_id,
          QuizID: quiz.quiz.QuizID
        };
      } else if (quiz.quiz.QuizID) {
        // LMS module flow with only QuizID
        endpoint = "quiz/getQuizQuestionsByQuizId"; // You'll need to create this endpoint
        requestBody = {
          QuizID: quiz.quiz.QuizIDQuizID
        };
      } else {
        throw new Error("Insufficient data to fetch questions");
      }
      console.log("leetttss go", requestBody)

      const data = await fetchData(
        endpoint,
        "POST",
        requestBody,
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      console.log("API Response:", data);

      if (!data) {
        throw new Error("No data received from server");
      }

      if (data.success) {
        const transformedQuestions = transformQuestions(data.data.questions);
        setQuestions(transformedQuestions);

        const saved = loadSavedAnswers();
        setSelectedAnswers(saved?.answers || Array(transformedQuestions.length).fill(null));

        // Initialize timer and question status
        if (transformedQuestions.length > 0) {
          const duration = transformedQuestions[0].duration || quiz.duration || 30;
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          setTimer({ hours, minutes, seconds: 0 });
        }

        const initialQuestionStatus = transformedQuestions.reduce((acc, _, index) => {
          acc[index + 1] = "not-visited";
          return acc;
        }, {});

        setQuestionStatus(initialQuestionStatus);
      } else {
        throw new Error(data.message || "Failed to fetch questions");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    //   setError(err.message || "Failed to load questions");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to load questions",
      });
    } finally {
    //   setLoading(false);
    }
  };

  export default fetchQuizQuestions;
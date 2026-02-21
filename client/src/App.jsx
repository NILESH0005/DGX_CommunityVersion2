// src/App.jsx
import React, { useState, useContext } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Home from "./container/Home.jsx";
import Navbar from "./component/Navbar.jsx";
import VerifyEmail from "./component/VerifyEmail.jsx";
import Register from "./component/Register.jsx";
import SignInn from "./component/SignInn";
import ForgotPassword from "./component/ForgotPassword";
import ChangePassword from "./component/ChangePassword.jsx";
import UserProfile from "./component/UserProfile.jsx";
import Discussion from "./container/Discussion/Discussion.jsx";
import Blog from "./container/Blog.jsx";
import ContactUs from "./container/ContactUs.jsx";
import Notfound from "./component/Notfound.jsx";
import ResetPassword from "./component/ResetPassword.jsx";
import CommunityGuidelines from "./component/CommunityGuidelines.jsx";
import Resources from "./component/Resources.jsx";
import Footer from "./component/Footer.jsx";
import Survey from "./component/Survey.jsx";
import EventWorkshopPage from "./container/EventWorkshopPage.jsx";
import LoadPage from "./component/LoadPage.jsx";
import EventRegistrationPage from "./component/EventRegistrationPage.jsx";
import GeneralUserCalendar from "./component/GeneralUserCalendar.jsx";
import AdminDashboard from "./Admin/AdminDashboard.jsx";
import HomeAfterLoginComponent from "./component/HomeAfterLoginComponent.jsx";
import CreateICSFile from "./component/CreateICSFile.jsx";
import ConfirmationModal from "./component/ConfirmationModal.jsx";
import { ToastContainer } from "react-toastify";
import ContentSection from "./component/ContentSection.jsx";
import ParallaxSection from "./component/ParallaxSection.jsx";
import NewsSection from "./component/NewsSection.jsx";
import ProjectShowcase from "./component/ProjectShowcase.jsx";
import CommunityHighlights from "./component/CommunityHighlights.jsx";
import AddUserEvent from "./component/AddUserEvent.jsx";
import QuizInterface from "./component/QuizInterface.jsx";
import QuizPanel from "./Admin/Components/Quiz/QuizPanel.jsx";
import CreateQuiz from "./Admin/Components/Quiz/CreateQuiz.jsx";
import QuizList from "./component/quiz/QuizList.jsx";
import Quiz from "./component/quiz/Quiz.jsx";
import QuestionBank from "./Admin/Components/Quiz/QuestionBank.jsx";
import QuizQuestions from "./Admin/Components/Quiz/QuizQuestions.jsx";
import Lms from "./component/LMS/Lms.jsx";
import QuizResult from "./component/quiz/QuizResult.jsx";
import LeaderBoard from "./component/LMS/LeaderBoard.jsx";
import Chatbot from "./component/LMS/ChatBot.jsx";
import LearningPath from "./component/LMS Manager/LearningPath.jsx";
import ModuleCard from "./component/LMS Manager/ModuleCard.jsx";
import SubModuleCard from "./component/LMS Manager/SubmoduleCard.jsx";
import UnitsWithFiles from "./component/LMS Manager/UnitsWithFiles.jsx";
import ModuleOrder from "./Admin/Components/LMS/EditableComponents/ModuleOrder.jsx";
import { pdfjs } from "react-pdf";
import { useEffect } from "react";
import ApiContext from "./context/ApiContext.jsx";
import UserDetails from "../src/container/UserDetails.jsx";
import BlogForm from "./Admin/Components/BlogComponents/BlogForm.jsx";
import EventDetailsPage from "./component/EventDetailsPage.jsx";
import PublicBlogPage from "./component/PublicBlogPage.jsx";
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ProtectedLayout = () => {
  const { userToken } = useContext(ApiContext);
  return userToken ? <Outlet /> : <Navigate to="/SignInn" replace />;
};


function App() {
  const [blogs, setBlogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalEventsCount, setTotalEventsCount] = useState(0); 

  const { userToken, fetchData } = useContext(ApiContext);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const endpoint = "eventandworkshop/getEvent";
      const method = "GET";
      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      console.log("Fetching events with token:", userToken);

      const eventData = await fetchData(endpoint, method, {}, headers);
      console.log("Full API response:", eventData);

      if (eventData && eventData.success) {
        const eventsData =
          eventData.data || eventData.events || eventData.result || [];
        console.log("Events data extracted:", eventsData);
        setEvents(eventsData);

        if (eventData.totalCount !== undefined) {
          setTotalEventsCount(eventData.totalCount);
          console.log("Total events count:", eventData.totalCount);
        }
      } else {
        console.error("Failed to fetch events - no success:", eventData);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchEventData();
    } else {
      console.log("No user token, skipping events fetch");
    }
  }, [userToken]); 

  return (
    <>
      <ToastContainer
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow ">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route exact path="/VerifyEmail" element={<VerifyEmail />} />
            <Route exact path="/Register" element={<Register />} />
            <Route path="/SignInn" element={<SignInn />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="/ChangePassword" element={<ChangePassword />} />
            <Route path="/userprofile/profile/:id" element={<UserDetails />} />
            <Route
              path="/UserProfile"
              element={
                <UserProfile
                  blogs={blogs}
                  setBlogs={setBlogs}
                  events={events} 
                  setEvents={setEvents} 
                  totalEventsCount={totalEventsCount} 
                />
              }
            />
            <Route path="/Discussion" element={<Discussion />} />
            <Route path="/ContactUs" element={<ContactUs />} />
            <Route path="/Blog" element={<Blog />} />
            <Route path="/BlogForm" element={<BlogForm />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/blog/:blogId" element={<PublicBlogPage />} />
            </Route>
            <Route path="/ResetPassword" element={<ResetPassword />} />
            <Route
              path="/CommunityGuidelines"
              element={<CommunityGuidelines />}
            />
            <Route path="/Resources" element={<Resources />} />
            <Route path="/404" element={<Notfound />} />
            <Route path="/Survey" element={<Survey />} />
            <Route path="/ConfirmationModal" element={<ConfirmationModal />} />
            <Route
              path="/EventWorkshopPage"
              element={
                <EventWorkshopPage events={events} setEvents={setEvents} />
              }
            />
            <Route
              path="/EventRegistrationPage"
              element={<EventRegistrationPage />}
            />
            <Route
              path="/event/:eventId"
              element={<EventDetailsPage events={events} />}
            />
            <Route
              path="/HomeAfterLoginComponent"
              element={<HomeAfterLoginComponent />}
            />
            <Route path="/CreateICSFile" element={<CreateICSFile />} />
            <Route path="/AddUserEvent" element={<AddUserEvent />} />
            <Route path="/ParallaxSection" element={<ParallaxSection />} />
            <Route path="/ContentSection" element={<ContentSection />} />
            <Route path="/NewsSection" element={<NewsSection />} />
            <Route path="/ProjectShowcase" element={<ProjectShowcase />} />
            <Route
              path="/CommunityHighlights"
              element={<CommunityHighlights />}
            />

            <Route path="/QuizInterface" element={<QuizInterface />} />
            <Route
              path="../Admin/Components/Quiz/QuizPanel"
              element={<QuizPanel />}
            />
            <Route path="/QuizList" element={<QuizList />} />
            <Route path="/quiz/:quizId" element={<Quiz />} />
            <Route path="/QuizQuestions" element={<QuizQuestions />} />
            <Route path="/quiz-result" element={<QuizResult />} />

            <Route path="/CreateQuiz" element={<CreateQuiz />} />
            <Route path="/QuestionBank" element={<QuestionBank />} />
            <Route
              path="/AdminDashboard"
              element={
                <AdminDashboard
                  blogs={blogs}
                  setBlogs={setBlogs}
                  events={events}
                  setEvents={setEvents}
                />
              }
            />
            <Route path="/LoadPage" element={<LoadPage />} />
            <Route
              path="/GeneralUserCalendar"
              element={<GeneralUserCalendar />}
            />
            <Route path="/Lms" element={<Lms />} />
            <Route path="/ModuleOrder" element={<ModuleOrder />} />

            

            <Route path="/leaderboard" element={<LeaderBoard />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/Lms" element={<Lms />} />
   

            <Route path="/LearningPath" element={<LearningPath />} />
            <Route path="/modules" element={<ModuleCard />} />
            <Route path="/module/:moduleId" element={<SubModuleCard />} />
            <Route
              path="/submodule/:subModuleId"
              element={<UnitsWithFiles />}
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default App;

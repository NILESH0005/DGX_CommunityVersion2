// utils/adminRouteMap.js
import {
  faHome,
  faComments,
  faCalendar,
  faBlog,
  faEnvelope,
  faUser,
  faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";
import { FaBrain } from "react-icons/fa";

export const adminRouteMap = {
  11: { to: "/AdminDashboard", icon: faHome },       // Admin Dashboard
  12: { to: "/AdminUsers", icon: faUser },           // User Management
  14: { to: "/AdminBlogs", icon: faBlog },           // Blog Management
  15: { to: "/AdminEvents", icon: faCalendar },      // Event Management
  13: { to: "/AdminDiscussions", icon: faComments }, // Discussion Management
  17: { to: "/AdminLMSUpload", icon: faChalkboardTeacher }, // Upload Learning Kit
  18: { to: "/AdminLMSEdit", icon: faChalkboardTeacher },   // Edit LMS
  19: { to: "/AdminQuizPanel", icon: FaBrain },      // Quiz Panel
  20: { to: "/AdminQuestionBank", icon: FaBrain },   // Question Bank
  21: { to: "/AdminQuizMapping", icon: FaBrain },    // Quiz Mapping
  16: { to: "/ContactUs", icon: faEnvelope },        // Contact Messages
};

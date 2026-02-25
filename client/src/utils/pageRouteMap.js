// utils/navbarRouteMap.js
import {
  faHome,
  faComments,
  faCalendar,
  faBlog,
  faEnvelope,
  faBook,
  faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";
import { FaBrain } from "react-icons/fa";
import { GiServerRack } from "react-icons/gi";


export const navbarRouteMap = {
  1: { to: "/", icon: faHome },                     // Home
  2: { to: "/Discussion", icon: faComments },       // Discussion
  3: { to: "/EventWorkshopPage", icon: faCalendar },// Events
  4: { to: "/Blog", icon: faBlog },                 // Blogs
  5: { to: "/QuizInterface", icon: FaBrain },       // Quiz
  6: { to: "/LearningPath", icon: faChalkboardTeacher }, // LMS
  7: { to: "/ContactUs", icon: faEnvelope },        // Contact
  8: { to: "/CommunityGuidelines", icon: faBook },  // Guidelines
  24: {to: "/DGX_Control_Center", icon: GiServerRack }
};

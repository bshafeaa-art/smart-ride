import React from "react";
import { Icon } from "@chakra-ui/react";
import { MdHome, MdDirectionsCar, MdPerson, MdLock, MdBuild, MdOutlineAppRegistration } from "react-icons/md";

// Pages (Check these paths carefully!)
import MainDashboard from "./views/admin/default";
import Cars from "./pages/Car/Cars";
import MyBookings from "./pages/User/MyBookings";
// 🟢 FIXED IMPORTS: Make sure these point to the files we actually edited!
import Login from "./views/auth/index"; 
import Register from "./views/auth/signUp"; // Assuming this is where it is
import Profile from "./views/admin/profile";
import Services from "./views/admin/services"; 

const routes = [
  // 🔒 ADMIN ONLY
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    component: <MainDashboard />,
    allowedRole: "admin", 
  },
  
  // 🌍 EVERYONE SEES THIS
  {
    name: "Showroom (Cars)",
    layout: "/admin",
    path: "/cars",
    icon: <Icon as={MdDirectionsCar} width='20px' height='20px' color='inherit' />,
    component: <Cars />,
    allowedRole: "all", 
  },
  {
    name: "Services",
    layout: "/admin",
    path: "/services",
    icon: <Icon as={MdBuild} width='20px' height='20px' color='inherit' />,
    component: <Services />,
    allowedRole: "all",
  },
  {
    name: "My Bookings",
    layout: "/admin",
    path: "/my-bookings",
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
    component: <MyBookings />,
    allowedRole: "all", // 🟢 FIXED: Let users see their own bookings!
  },
  
  // 🔒 ADMIN ONLY (Profile)
  {
    name: "Admin Profile",
    layout: "/admin",
    path: "/profile",
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
    component: <Profile />,
    allowedRole: "admin", 
  },

  // 🔑 AUTH PAGES
  {
    name: "Sign In",
    layout: "/auth",
    path: "/sign-in", // 🟢 FIXED: Matches your browser URL
    icon: <Icon as={MdLock} width='20px' height='20px' color='inherit' />,
    component: <Login />,
    allowedRole: "all",
  },
  {
    name: "Sign Up",
    layout: "/auth",
    path: "/sign-up", // 🟢 FIXED: Matches standard path
    icon: <Icon as={MdOutlineAppRegistration} width='20px' height='20px' color='inherit' />,
    component: <Register />,
    allowedRole: "all",
  },
];

export default routes;
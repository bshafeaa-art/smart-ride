import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// LAYOUTS
import AuthLayout from "layouts/auth";
import AdminLayout from "layouts/admin";
import UserLayout from "layouts/user";

// ADMIN PAGES 
import AdminBookAction from "views/admin/book";
import AdminServiceAction from "views/admin/serviceBooking";

// USER PAGES
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Locations from "./pages/Locations";
import Services from "./pages/Services";
import Support from "./pages/Support";
import Cars from "./pages/Car/Cars";
import BookCar from "./pages/Car/BookCar";
import MyBookings from "./pages/User/MyBookings";
import LeaveReview from "./pages/User/LeaveReview";
import UserLogin from "pages/UserLogin";

// 🟢 THE UPDATED GATEKEEPER
const AdminGuard = ({ children }) => {
  const userString = localStorage.getItem("user");

  if (!userString) {
    return <Navigate to="/user-login" replace />; // 🟢 Redirect to User Login, not Admin
  }

  const user = JSON.parse(userString);
  if (user.role?.toLowerCase() !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// 🟢 THE UPDATED REDIRECTOR
const Redirector = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      navigate("/user-login"); // 🟢 DEFAULT: Go to User Login
    } else {
      const user = JSON.parse(userString);
      const role = user.role ? user.role.toLowerCase() : "user";
      if (role === "admin") {
        navigate("/admin/default");
      } else {
        navigate("/home");
      }
    }
  }, [navigate]);
  return null;
};

export default function App() {
  return (
    <Routes>
      {/* 🟢 PUBLIC ROUTES FIRST */}
      <Route path="/user-login" element={<UserLogin />} />
      <Route path="auth/*" element={<AuthLayout />} />

      {/* 🟢 ADMIN PANEL (PROTECTED) */}
      <Route
        path="admin/*"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route path="book/:id" element={<AdminBookAction />} />
        <Route path="book-service/:id" element={<AdminServiceAction />} />
      </Route>

      {/* 🟢 USER WEBSITE */}
      <Route element={<UserLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="locations" element={<Locations />} />
        <Route path="services" element={<Services />} />
        <Route path="support" element={<Support />} />
        <Route path="cars" element={<Cars />} />
        <Route path="book-car/:id" element={<BookCar />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="leave-review/:id" element={<LeaveReview />} />
      </Route>

      {/* 🟢 FINAL REDIRECT LOGIC (NO DUPLICATES) */}
      <Route path="/" element={<Redirector />} />
      <Route path="*" element={<Navigate to="/user-login" replace />} />
    </Routes>
  );
}
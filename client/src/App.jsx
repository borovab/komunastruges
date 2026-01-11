// App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components";
import { getSession } from "./lib/api";

import { Login, AdminDashboard, AdminWorkers, UserDashboard, UserProfile, AdminAddUser } from "./pages";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

import AdminProfile from "./pages/Admin/AdminProfile/AdminProfile.jsx";
import AdminReports from "./pages/Admin/AdminReports/AdminReports.jsx";

function RootRedirect() {
  const session = getSession();

  return session?.user?.role === "admin" ? (
    <Navigate to="/admin" replace />
  ) : session?.user?.role === "user" ? (
    <Navigate to="/user" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* USER */}
      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="workers" element={<AdminWorkers />} />
        <Route path="add-user" element={<AdminAddUser />} />
        <Route path="raportimet" element={<AdminReports />} />
      </Route>

      {/* ROOT */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

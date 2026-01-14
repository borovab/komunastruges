// App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { createPortal } from "react-dom";

import { ProtectedRoute } from "./components";
import { getSession } from "./lib/api";
import { useLang } from "./contexts/LanguageContext";

import {
  Login,
  AdminDashboard,
  AdminWorkers,
  UserDashboard,
  UserProfile,
  AdminAddUser,
  SuperAdminDashboard,
  SuperAdminProfile,
  SuperAdminWorkers,
  SuperAdminAddUser,
  SuperAdminReports,
  SuperAdminDepartments,
  ManagerDashboard,
  ManagerWorkers,
  ManagerAddUser,
  ManagerReports,
  ManagerProfile,
} from "./pages";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

// ✅ MANAGER
import ManagerLayout from "./layouts/ManagerLayout";

import AdminProfile from "./pages/Admin/AdminProfile/AdminProfile.jsx";
import AdminReports from "./pages/Admin/AdminReports/AdminReports.jsx";

// ✅ ADMIN DEPARTMENTS
import AdminDepartments from "./pages/Admin/AdminDepartments/AdminDepartments.jsx";

import logo from "./assets/logo.png";

function RootRedirect() {
  const session = getSession();
  const role = String(session?.user?.role || "").trim().toLowerCase();

  return role === "superadmin" ? (
    <Navigate to="/superadmin" replace />
  ) : role === "admin" ? (
    <Navigate to="/admin" replace />
  ) : role === "manager" ? (
    <Navigate to="/manager" replace />
  ) : role === "user" ? (
    <Navigate to="/user" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

function FullScreenLangLoader() {
  const { isChangingLang, t } = useLang();
  if (!isChangingLang) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/65 backdrop-blur-[2px] grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <img src={logo} alt="Loading" className="h-13 w-12" />
        <div className="h-12 w-12 rounded-full border-4 border-white/60 border-t-white animate-spin" />
        <div className="text-white text-sm font-semibold">{t("common.loading") || "Loading..."}</div>
      </div>
    </div>,
    document.body
  );
}

export default function App() {
  return (
    <>
      <FullScreenLangLoader />

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

        {/* MANAGER */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute role="manager">
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerDashboard />} />
          <Route path="profile" element={<ManagerProfile />} />
          <Route path="workers" element={<ManagerWorkers />} />
          <Route path="add-user" element={<ManagerAddUser />} />
          <Route path="raportimet" element={<ManagerReports />} />
        </Route>

        {/* SUPERADMIN */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute role="superadmin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminDashboard />} />
          <Route path="profile" element={<SuperAdminProfile />} />
          <Route path="workers" element={<SuperAdminWorkers />} />
          <Route path="add-user" element={<SuperAdminAddUser />} />
          <Route path="raportimet" element={<SuperAdminReports />} />
          <Route path="departments" element={<SuperAdminDepartments />} />
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
          <Route path="departments" element={<AdminDepartments />} />
        </Route>

        {/* ROOT */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

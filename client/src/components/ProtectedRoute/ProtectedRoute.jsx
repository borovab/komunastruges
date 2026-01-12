import React from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "../../lib/api";

export default function ProtectedRoute({ role, children }) {
  const s = getSession();
  if (!s?.user) return <Navigate to="/login" replace />;

  const userRole = String(s.user.role || "").trim().toLowerCase();
  const neededRole = role ? String(role).trim().toLowerCase() : "";

  if (neededRole && userRole !== neededRole) return <Navigate to="/" replace />;

  return children;
}

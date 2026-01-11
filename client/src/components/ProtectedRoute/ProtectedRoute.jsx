import React from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "../../lib/api";

export default function ProtectedRoute({ role, children }) {
  const s = getSession();
  if (!s?.user) return <Navigate to="/login" replace />;
  if (role && s.user.role !== role) return <Navigate to="/" replace />;
  return children;
}

// layouts/PublicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-default-50">
      

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}

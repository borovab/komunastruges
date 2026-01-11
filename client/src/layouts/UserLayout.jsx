// layouts/UserLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar/SideBar";
import TopBar from "../components/TopBar/TopBar";

export default function UserLayout() {
  return (
    <div className="min-h-screen flex bg-default-50">
      <SideBar   className="hidden md:block" />

      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

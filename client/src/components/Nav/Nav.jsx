import SideBar from "../SideBar/SideBar";
import TopBar from "../TopBar/TopBar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-default-50">
      <SideBar className="hidden md:block" />

      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

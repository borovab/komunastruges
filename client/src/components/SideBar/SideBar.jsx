// Sidebar.jsx (NO HeroUI) - Settings replaced with "Profili im"
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, clearSession, getSession } from "../../lib/api";
import logo from "../../assets/logo.png"; // 🔁 ndrysho path nëse logo-ja është tjetër

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

const Icon = ({ children, active }) => (
  <span
    className={cn(
      "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition",
      active
        ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
        : "bg-white/70 text-slate-500 border-slate-200"
    )}
  >
    {children}
  </span>
);

const MenuBtn = ({ label, active, onClick, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 rounded-2xl px-2 py-2 transition text-left",
      active ? "bg-slate-100 shadow-sm" : "hover:bg-slate-50"
    )}
  >
    <Icon active={active}>{icon}</Icon>
    <span className="text-sm font-medium text-slate-700">{label}</span>
    {active ? <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" /> : null}
  </button>
);

export default function Sidebar({ className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const s = getSession();

  // ✅ FIX: normalize role (handles "Manager", " manager ", etc.)
  const role = String(s?.user?.role || "").trim().toLowerCase();

  const fullName = s?.user?.fullName || "User";
  const username = s?.user?.username || "";

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    clearSession();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const mainLinks =
    role === "admin"
      ? [
          {
            label: "Panel",
            path: "/admin",
            icon: (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-18v7h7V2h-7Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            ),
          },
          {
            label: "Raportimet",
            path: "/admin/raportimet",
            icon: (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M7 3h10v18H7V3Z" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M9 7h6M9 11h6M9 15h6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            ),
          },

          // ✅ NEW: Departamentet
          {
            label: "Departamentet",
            path: "/admin/departments",
            icon: (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M4 8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M8 9h8M8 12h8M8 15h5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            ),
          },

          {
            label: "Punëtorët",
            path: "/admin/workers",
            icon: (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M16 11a4 4 0 1 0-8 0m13 10a7 7 0 1 0-14 0"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            ),
          },
          {
            label: "Shto përdorues",
            path: "/admin/add-user",
            icon: (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            ),
          },
        ]
      : role === "manager"
      ? [
          {
            label: "Paneli",
            path: "/manager",
            icon: (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-18v7h7V2h-7Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            ),
          },
          {
            label: "Raportimet",
            path: "/manager/raportimet",
            icon: (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M7 3h10v18H7V3Z" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M9 7h6M9 11h6M9 15h6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            ),
          },
          {
            label: "Punëtorët",
            path: "/manager/workers",
            icon: (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M16 11a4 4 0 1 0-8 0m13 10a7 7 0 1 0-14 0"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            ),
          },
            {
            label: "Shto Punëtorë",
            path: "/manager/add-user",
            icon: (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M16 11a4 4 0 1 0-8 0m13 10a7 7 0 1 0-14 0"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            ),
          },
        ]
      : role === "user"
      ? [
          {
            label: "Raportet e mia",
            path: "/user",
            icon: (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M7 3h10v18H7V3Z" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M9 7h6M9 11h6M9 15h6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            ),
          },
        ]
      : [];

  const bottomLinks = [
    {
      label: "Profili im",
      path: role === "admin" ? "/admin/profile" : role === "manager" ? "/manager/profile" : "/user/profile",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  if (!s?.user) return null;

  return (
    <aside className={cn("h-screen w-[280px] p-3", className)}>
      <div className="h-full rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
        {/* TOP: Logo + user name */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl grid place-items-center shadow-sm overflow-hidden shrink-0">
              <img src={logo} alt="Logo" className="h-7 w-7 object-contain" draggable="false" />
            </div>

            <div className="leading-tight min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">{fullName}</div>
              <div className="text-[11px] text-slate-500 truncate">@{username || "user"} • Raportimi i punës</div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-3">
          <div className="h-px bg-slate-200" />
        </div>

        {/* Main menu */}
        <div className="px-3 pt-3 flex flex-col gap-1">
          {mainLinks.map((l) => (
            <MenuBtn
              key={l.path}
              label={l.label}
              active={isActive(l.path)}
              icon={l.icon}
              onClick={() => navigate(l.path)}
            />
          ))}
        </div>

        <div className="flex-1" />

        {/* Bottom */}
        <div className="px-3 pb-3 flex flex-col gap-1">
          {bottomLinks.map((l) => (
            <MenuBtn
              key={l.path}
              label={l.label}
              active={isActive(l.path)}
              icon={l.icon}
              onClick={() => navigate(l.path)}
            />
          ))}

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-2xl px-2 py-2 mt-2 text-left text-red-600 hover:bg-red-50 transition"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M10 17H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M15 12H9m0 0 2-2m-2 2 2 2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path d="M13 7h7v10h-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

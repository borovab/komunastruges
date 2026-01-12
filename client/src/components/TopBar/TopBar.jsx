// Topbar.jsx (mobile-only + simple + NO boxes + active underline)
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, clearSession, getSession } from "../../lib/api";
import logo from "../../assets/logo.png";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const s = getSession();

  const role = String(s?.user?.role || "").trim().toLowerCase();
  const fullName = s?.user?.fullName || "";
  const username = s?.user?.username || "";

  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!s?.user) return null;

  const links =
    role === "admin"
      ? [
          { label: "Panel", path: "/admin" },
          { label: "Raportimet", path: "/admin/raportimet" },
          { label: "Departamentet", path: "/admin/departments" },
          { label: "Punëtorët", path: "/admin/workers" },
          { label: "Shto përdorues", path: "/admin/add-user" },
        ]
      : role === "manager"
      ? [
          { label: "Paneli", path: "/manager" },
          { label: "Raportimet", path: "/manager/raportimet" },
          { label: "Punëtorët", path: "/manager/workers" },
          { label: "Shto Punëtorë", path: "/manager/add-user" },
        ]
      : role === "user"
      ? [{ label: "Raportet e mia", path: "/user" }]
      : [];

  const profilePath =
    role === "admin" ? "/admin/profile" : role === "manager" ? "/manager/profile" : "/user/profile";

  const isActive = (path) => location.pathname === path;

  const goHome = () => {
    if (role === "admin") return navigate("/admin");
    if (role === "manager") return navigate("/manager");
    if (role === "user") return navigate("/user");
    return navigate("/login");
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    clearSession();
    navigate("/login");
  };

  const MenuItem = ({ label, path, danger }) => {
    const active = isActive(path);

    return (
      <button
        type="button"
        onClick={() => navigate(path)}
        className={cn(
          "w-full flex items-center justify-between py-3 text-left transition",
          "border-b",
          active ? "border-blue-600" : "border-slate-200",
          danger ? "text-red-600 border-red-200" : "text-slate-800"
        )}
      >
        <span className={cn("text-sm", active ? "font-semibold text-blue-700" : "font-medium")}>{label}</span>

        <svg viewBox="0 0 24 24" className={cn("h-5 w-5", danger ? "text-red-400" : "text-slate-400")} fill="none">
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  };

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-slate-200">
      {/* top row */}
      <div className="h-16 px-4 flex items-center justify-between">
        <button type="button" onClick={goHome} className="flex items-center gap-3 min-w-0">
          <span className="h-9 w-9 grid place-items-center shrink-0 overflow-hidden">
            <img src={logo} alt="Logo" className="h-7 w-7 object-contain" draggable="false" />
          </span>

          <div className="min-w-0 leading-tight text-left">
            <div className="text-sm font-semibold text-slate-900 truncate">{fullName || "Komuna"}</div>
            <div className="text-[11px] text-slate-500 truncate">@{username || "raportimi"} • Raportimi i punës</div>
          </div>
        </button>

        <button
          type="button"
          className="h-10 w-10 grid place-items-center text-slate-700"
          aria-label={open ? "Mbyll menunë" : "Hap menunë"}
          aria-expanded={open ? "true" : "false"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* dropdown */}
      {open ? (
        <div className="px-4 pb-2">
          <div className="flex flex-col">
            {links.map((l) => (
              <MenuItem key={l.path} label={l.label} path={l.path} />
            ))}

            <MenuItem label="Profili im" path={profilePath} />

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-between py-3 text-left border-b border-red-200 text-red-600"
            >
              <span className="text-sm font-semibold">Logout</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-400" fill="none" aria-hidden="true">
                <path
                  d="M10 17H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M15 12H9m0 0 2-2m-2 2 2 2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path d="M13 7h8v10h-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

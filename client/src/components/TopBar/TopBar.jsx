// Topbar.jsx (mobile-only + modern + with Logout)
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, clearSession, getSession } from "../../lib/api";
import logo from "../../assets/logo.png"; // 🔁 ndrysho emrin/path nëse logo-ja është tjetër

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const s = getSession();
  const role = s?.user?.role;

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
          { label: "Punëtorët", path: "/admin/workers" },
        ]
      : role === "user"
      ? [{ label: "Raportet e mia", path: "/user" }]
      : [];

  const isActive = (path) => location.pathname === path;

  const goHome = () => {
    if (role === "admin") return navigate("/admin");
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

  return (
    <header className="lg:hidden sticky top-0 z-50">
      {/* glass topbar */}
      <div className="h-16 px-3 flex items-center justify-between border-b border-slate-200/70 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        {/* LEFT: brand */}
        <button type="button" onClick={goHome} className="flex items-center gap-2 min-w-0">
          <span className="h-9 w-9 rounded-2xl grid place-items-center shadow-sm shrink-0 overflow-hidden">
            <img src={logo} alt="Logo" className="h-6 w-6 object-contain" draggable="false" />
          </span>

          {/* moved name + username here */}
          <div className="leading-tight text-left min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{fullName || "Komuna"}</div>
            <div className="text-[11px] text-slate-500 truncate">
              @{username || "raportimi"} • Raportimi i punës
            </div>
          </div>
        </button>

        {/* RIGHT: menu button */}
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center h-10 w-10 rounded-2xl border transition",
            open
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          )}
          aria-label={open ? "Mbyll menunë" : "Hap menunë"}
          aria-expanded={open ? "true" : "false"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* dropdown */}
      {open ? (
        <div className="border-b border-slate-200/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="px-3 py-3">
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <button
                  key={l.path}
                  type="button"
                  onClick={() => navigate(l.path)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-2xl px-3 py-3 border transition text-left",
                    isActive(l.path)
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  )}
                >
                  <span className="text-sm font-semibold">{l.label}</span>
                  <span className="text-slate-400">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              ))}

              {/* profile shortcut */}
              <button
                type="button"
                onClick={() => navigate(role === "admin" ? "/profile" : "/user/profile")}
                className={cn(
                  "w-full flex items-center justify-between rounded-2xl px-3 py-3 border transition text-left",
                  isActive(role === "admin" ? "/profile" : "/user/profile")
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                )}
              >
                <span className="text-sm font-semibold">Profili im</span>
                <span className="text-slate-400">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-between rounded-2xl px-3 py-3 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition text-left"
              >
                <span className="text-sm font-semibold">Logout</span>
                <span className="text-red-400">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
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
                    <path
                      d="M13 7h8v10h-8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

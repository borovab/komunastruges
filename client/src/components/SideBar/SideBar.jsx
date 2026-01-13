// Sidebar.jsx (NO HeroUI) - Settings replaced with "Profili im" + language flags (top-right)
// ✅ i18n (NO SQ fallback) + all UI strings via t()
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, clearSession, getSession } from "../../lib/api";
import logo from "../../assets/logo.png"; // 🔁 ndrysho path nëse logo-ja është tjetër
import { useLang } from "../../contexts/LanguageContext";

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
  const { lang, setLang, t } = useLang();

  // ✅ FIX: normalize role (handles "Manager", " manager ", etc.)
  const role = String(s?.user?.role || "").trim().toLowerCase();

  const fullName = s?.user?.fullName || t("sidebar.fallbacks.user");
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
            label: t("sidebar.links.admin.panel"),
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
            label: t("sidebar.links.admin.reports"),
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

          {
            label: t("sidebar.links.admin.departments"),
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
            label: t("sidebar.links.admin.workers"),
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
            label: t("sidebar.links.admin.addUser"),
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
      : role === "superadmin"
      ? [
          {
            label: t("sidebar.links.superadmin.panel"),
            path: "/superadmin",
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
            label: t("sidebar.links.superadmin.reports"),
            path: "/superadmin/raportimet",
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
            label: t("sidebar.links.superadmin.departments"),
            path: "/superadmin/departments",
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
            label: t("sidebar.links.superadmin.workers"),
            path: "/superadmin/workers",
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
            label: t("sidebar.links.superadmin.addUser"),
            path: "/superadmin/add-user",
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
            label: t("sidebar.links.manager.panel"),
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
            label: t("sidebar.links.manager.reports"),
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
            label: t("sidebar.links.manager.workers"),
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
            label: t("sidebar.links.manager.addWorker"),
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
            label: t("sidebar.links.user.myReports"),
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
      label: t("sidebar.bottom.profile"),
      path:
        role === "superadmin"
          ? "/superadmin/profile"
          : role === "admin"
          ? "/admin/profile"
          : role === "manager"
          ? "/manager/profile"
          : "/user/profile",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  const FlagIcon = ({ code }) => {
    // ✅ simplified, no nested <svg>, no invalid "class"
    if (code === "sq") {
      // Albania (simple)
      return (
        <svg viewBox="0 0 28 20" className="h-6 w-6" aria-hidden="true">
          <rect width="28" height="20" rx="2" fill="#E41E20" />
          <path
            d="M14 6.2c1.2 1.2 2.4 1.8 3.7 2.1-1 1.1-2.1 1.8-3.7 2.5-1.6-.7-2.7-1.4-3.7-2.5 1.3-.3 2.5-.9 3.7-2.1Z"
            fill="#0B0B0B"
            opacity="0.85"
          />
        </svg>
      );
    }

    // North Macedonia (simple)
    return (
      <svg viewBox="0 0 28 20" className="h-6 w-6" aria-hidden="true">
        <rect width="28" height="20" rx="2" fill="#D20000" />
        <circle cx="14" cy="10" r="4" fill="#FFE600" />
        <path d="M14 0v6" stroke="#FFE600" strokeWidth="2" />
        <path d="M14 14v6" stroke="#FFE600" strokeWidth="2" />
        <path d="M0 10h8" stroke="#FFE600" strokeWidth="2" />
        <path d="M20 10h8" stroke="#FFE600" strokeWidth="2" />
      </svg>
    );
  };

  const FlagBtn = ({ code, label }) => {
    const active = lang === code;
    return (
      <button
        type="button"
        onClick={() => setLang(code)}
        aria-label={label}
        className={cn(
          "h-9 px-2 grid place-items-center leading-none transition",
          active ? "border-b-2 border-blue-600" : "border-b-2 border-transparent"
        )}
      >
        <FlagIcon code={code} />
      </button>
    );
  };

  if (!s?.user) return null;

  return (
    <aside className={cn("h-screen w-[280px] p-3", className)}>
      <div className="h-full rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
        {/* TOP: Logo + user name + flags top-right */}
        <div className="px-4 pt-4 relative">
          <div className="absolute right-4 top-4 flex items-center gap-1">
            <FlagBtn code="sq" label={t("sidebar.lang.sq")} />
            <FlagBtn code="mk" label={t("sidebar.lang.mk")} />
          </div>

          <div className="flex items-center gap-3 min-w-0 pr-16">
            <div className="h-10 w-10 rounded-2xl grid place-items-center shadow-sm overflow-hidden shrink-0">
              <img src={logo} alt={t("sidebar.logoAlt")} className="h-7 w-7 object-contain" draggable="false" />
            </div>

            <div className="leading-tight min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">{fullName}</div>
              <div className="text-[11px] text-slate-500 truncate">
                @{username || t("sidebar.fallbacks.username")}
              </div>
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
            <span className="text-sm font-semibold">{t("sidebar.actions.logout")}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

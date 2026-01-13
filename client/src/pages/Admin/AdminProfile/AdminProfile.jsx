// src/pages/admin/AdminProfile/AdminProfile.jsx (i18n sq/mk)
import React from "react";
import { api, getSession } from "../../../lib/api";
import { useLang } from "../../../contexts/LanguageContext";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function AdminProfile() {
  const { t } = useLang();

  const s = getSession();
  const user = s?.user;

  const [fullName, setFullName] = React.useState(user?.fullName || "");
  const [username, setUsername] = React.useState(user?.username || "");

  const [curPassword, setCurPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newPassword2, setNewPassword2] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  React.useEffect(() => {
    const s2 = getSession();
    const u2 = s2?.user;
    setFullName(u2?.fullName || "");
    setUsername(u2?.username || "");
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!fullName.trim()) return setErr(t("adminProfile.errors.fullNameRequired"));
    if (!username.trim()) return setErr(t("adminProfile.errors.usernameRequired"));

    setLoading(true);
    try {
      await api.updateUser(user.id, {
        fullName: fullName.trim(),
        username: username.trim(),
      });

      // update session local
      const next = { ...getSession() };
      next.user = {
        ...next.user,
        fullName: fullName.trim(),
        username: username.trim(),
      };

      try {
        localStorage.setItem("session", JSON.stringify(next));
      } catch {}

      setOk(t("adminProfile.ok.profileUpdated"));
    } catch (e2) {
      setErr(e2?.message || t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!curPassword.trim()) return setErr(t("adminProfile.errors.currentPasswordRequired"));
    if (!newPassword.trim()) return setErr(t("adminProfile.errors.newPasswordRequired"));
    if (newPassword.length < 6) return setErr(t("adminProfile.errors.newPasswordMin6"));
    if (newPassword !== newPassword2) return setErr(t("adminProfile.errors.newPasswordMismatch"));

    setLoading(true);
    try {
      await api.updateUser(user.id, {
        currentPassword: curPassword,
        password: newPassword,
      });

      setCurPassword("");
      setNewPassword("");
      setNewPassword2("");

      setOk(t("adminProfile.ok.passwordChanged"));
    } catch (e2) {
      setErr(e2?.message || t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">{t("adminProfile.title")}</h2>
        <p className="text-[12px] sm:text-sm text-slate-500 mt-1">{t("adminProfile.subtitle")}</p>
      </div>

      {err ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {err}
        </div>
      ) : null}

      {ok ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">
          {ok}
        </div>
      ) : null}

      {/* Profile card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600/10 border border-blue-600/10 grid place-items-center text-blue-700 font-extrabold text-sm">
              {(user.fullName || "A").trim().slice(0, 1).toUpperCase()}
            </div>

            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">{user.fullName}</div>
              <div className="text-[11px] text-slate-500">@{user.username}</div>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-[11px] font-semibold border bg-slate-50 border-slate-200 text-slate-700">
            {user.role}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[12px] font-semibold text-slate-500">{t("adminProfile.meta.id")}</div>
            <div className="mt-1 text-[13px] font-medium text-slate-900 break-all">{user.id || "-"}</div>
          </div>

          <div>
            <div className="text-[12px] font-semibold text-slate-500">{t("adminProfile.meta.created")}</div>
            <div className="mt-1 text-[13px] font-medium text-slate-900">
              {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="text-sm font-semibold text-slate-900">{t("adminProfile.sections.data.title")}</div>
        <div className="text-[11px] text-slate-500 mt-1">{t("adminProfile.sections.data.subtitle")}</div>

        <form onSubmit={saveProfile} className="mt-3 grid grid-cols-1 gap-3">
          <label className="grid gap-1">
            <span className="text-[12px] font-semibold text-slate-600">{t("adminProfile.fields.fullName.label")}</span>
            <input
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("adminProfile.fields.fullName.placeholder")}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-[12px] font-semibold text-slate-600">{t("adminProfile.fields.username.label")}</span>
            <input
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("adminProfile.fields.username.placeholder")}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "h-10 px-4 rounded-xl font-semibold text-sm transition",
              loading ? "bg-slate-200 text-slate-600" : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {loading ? t("adminProfile.actions.saving") : t("adminProfile.actions.saveChanges")}
          </button>
        </form>
      </div>

      {/* Security */}
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="text-sm font-semibold text-slate-900">{t("adminProfile.sections.security.title")}</div>
        <div className="text-[11px] text-slate-500 mt-1">{t("adminProfile.sections.security.subtitle")}</div>

        <form onSubmit={changePassword} className="mt-3 grid grid-cols-1 gap-3">
          <label className="grid gap-1">
            <span className="text-[12px] font-semibold text-slate-600">
              {t("adminProfile.fields.currentPassword.label")}
            </span>
            <input
              type="password"
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm"
              value={curPassword}
              onChange={(e) => setCurPassword(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-600">
                {t("adminProfile.fields.newPassword.label")}
              </span>
              <input
                type="password"
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-600">
                {t("adminProfile.fields.repeatPassword.label")}
              </span>
              <input
                type="password"
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm"
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "h-10 px-4 rounded-xl font-semibold text-sm transition",
              loading ? "bg-slate-200 text-slate-600" : "bg-slate-900 text-white hover:bg-black"
            )}
          >
            {loading ? t("adminProfile.actions.changing") : t("adminProfile.actions.changePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}

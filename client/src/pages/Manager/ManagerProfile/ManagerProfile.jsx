// ManagerProfile.jsx
import React from "react";
import { api, getSession, clearSession } from "../../../lib/api";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../../contexts/LanguageContext";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function ManagerProfile() {
  const { t } = useLang();

  const navigate = useNavigate();
  const s = getSession();
  const user = s?.user;

  const [fullName, setFullName] = React.useState(user?.fullName || "");
  const [username] = React.useState(user?.username || "");

  const [newPassword, setNewPassword] = React.useState("");
  const [newPassword2, setNewPassword2] = React.useState("");

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const res = await api.getProfile();
      const u = res?.user;
      if (u?.fullName) setFullName(u.fullName);
    } catch (e) {
      setErr(e?.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setErr("");
    setOk("");

    const fn = String(fullName || "").trim();
    if (!fn) return setErr(t("managerProfile.errors.fullNameRequired"));

    const p1 = String(newPassword || "").trim();
    const p2 = String(newPassword2 || "").trim();

    if (p1 || p2) {
      if (p1.length < 6) return setErr(t("managerProfile.errors.passwordTooShort"));
      if (p1 !== p2) return setErr(t("managerProfile.errors.passwordMismatch"));
    }

    setSaving(true);
    try {
      await api.updateProfile({
        fullName: fn,
        ...(p1 ? { password: p1 } : {}),
      });

      setOk(t("managerProfile.ok.saved"));
      setNewPassword("");
      setNewPassword2("");

      // refresh session user fullName locally (optional)
      try {
        const s2 = getSession();
        if (s2?.user) {
          s2.user.fullName = fn;
          localStorage.setItem("kr_session", JSON.stringify(s2));
        }
      } catch {}
    } catch (e) {
      setErr(e?.message || t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    clearSession();
    navigate("/login");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("managerProfile.headerTitle")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("managerProfile.headerSubtitle")}</p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="h-10 px-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition text-sm font-semibold"
        >
          {t("managerProfile.actions.logout")}
        </button>
      </div>

      {err ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {ok ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {ok}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">{t("managerProfile.form.fullName")}</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder={t("managerProfile.placeholders.fullName")}
              disabled={loading || saving}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">{t("managerProfile.form.username")}</label>
            <input
              value={username}
              readOnly
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none text-slate-600"
            />
            <p className="mt-2 text-[11px] text-slate-500">{t("managerProfile.hints.usernameReadonly")}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">{t("managerProfile.form.newPassword")}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder={t("managerProfile.placeholders.password")}
              autoComplete="new-password"
              disabled={loading || saving}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              {t("managerProfile.form.confirmPassword")}
            </label>
            <input
              type="password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder={t("managerProfile.placeholders.password")}
              autoComplete="new-password"
              disabled={loading || saving}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={load}
            className="h-11 px-5 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
            disabled={saving}
          >
            {t("managerProfile.actions.refresh")}
          </button>

          <button
            type="button"
            onClick={save}
            className={cn(
              "h-11 px-5 rounded-2xl text-white transition text-sm font-semibold",
              saving ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            )}
            disabled={saving}
          >
            {saving ? t("managerProfile.actions.saving") : t("managerProfile.actions.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

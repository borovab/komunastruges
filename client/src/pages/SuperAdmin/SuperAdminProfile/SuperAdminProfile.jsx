// src/pages/admin/AdminProfile/AdminProfile.jsx
import React from "react";
import { api, getSession } from "../../../lib/api";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function SuperAdminProfile() {
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

    if (!fullName.trim()) return setErr("Shkruaj emrin dhe mbiemrin.");
    if (!username.trim()) return setErr("Shkruaj username.");

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

      setOk("Profili u përditësua.");
    } catch (e2) {
      setErr(e2?.message || "Gabim");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!curPassword.trim()) return setErr("Shkruaj password-in aktual.");
    if (!newPassword.trim()) return setErr("Shkruaj password-in e ri.");
    if (newPassword.length < 6) return setErr("Password-i i ri duhet të ketë së paku 6 karaktere.");
    if (newPassword !== newPassword2) return setErr("Password-i i ri nuk përputhet.");

    setLoading(true);
    try {
      await api.updateUser(user.id, {
        currentPassword: curPassword,
        password: newPassword,
      });

      setCurPassword("");
      setNewPassword("");
      setNewPassword2("");

      setOk("Password-i u ndryshua me sukses.");
    } catch (e2) {
      setErr(e2?.message || "Gabim");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Profili (Admin)</h2>
        <p className="text-[12px] sm:text-sm text-slate-500 mt-1">
          Përditëso të dhënat dhe sigurinë e llogarisë.
        </p>
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
            <div className="text-[12px] font-semibold text-slate-500">ID</div>
            <div className="mt-1 text-[13px] font-medium text-slate-900 break-all">{user.id || "-"}</div>
          </div>

          <div>
            <div className="text-[12px] font-semibold text-slate-500">Krijuar</div>
            <div className="mt-1 text-[13px] font-medium text-slate-900">
              {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="text-sm font-semibold text-slate-900">Të dhënat</div>
        <div className="text-[11px] text-slate-500 mt-1">Ndrysho emrin dhe username-in.</div>

        <form onSubmit={saveProfile} className="mt-3 grid grid-cols-1 gap-3">
          <label className="grid gap-1">
            <span className="text-[12px] font-semibold text-slate-600">Emri dhe mbiemri</span>
            <input
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="p.sh. Beqir Borova"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-[12px] font-semibold text-slate-600">Username</span>
            <input
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="p.sh. u_admin"
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
            {loading ? "Duke ruajtur..." : "Ruaj ndryshimet"}
          </button>
        </form>
      </div>

      {/* Security */}
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="text-sm font-semibold text-slate-900">Siguria</div>
        <div className="text-[11px] text-slate-500 mt-1">Ndrysho password-in.</div>

        <form onSubmit={changePassword} className="mt-3 grid grid-cols-1 gap-3">
          <label className="grid gap-1">
            <span className="text-[12px] font-semibold text-slate-600">Password aktual</span>
            <input
              type="password"
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm"
              value={curPassword}
              onChange={(e) => setCurPassword(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-600">Password i ri</span>
              <input
                type="password"
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-600">Përsërite password-in</span>
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
            {loading ? "Duke ndryshuar..." : "Ndrysho password"}
          </button>
        </form>
      </div>
    </div>
  );
}

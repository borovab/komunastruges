import React from "react";
import { api, getSession } from "../../../lib/api";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function ManagerAddUser() {
  const s = getSession();
  const depId = s?.user?.departmentId || null;

  const [fullName, setFullName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const fn = String(fullName || "").trim();
    const un = String(username || "").trim();
    const pw = String(password || "").trim();

    if (!depId) return setErr("Manager-i nuk ka departmentId. Kontrollo user session.");
    if (!fn || !un || !pw) return setErr("Plotëso fullName, username, password.");
    if (pw.length < 6) return setErr("Password shumë i shkurtër (min 6).");

    setSaving(true);
    try {
      await api.createUser({
        fullName: fn,
        username: un,
        password: pw,
        role: "user",
        departmentId: depId, // ✅ punetori shkon automatikisht te departamenti i manager-it
      });

      setOk("Punëtori u shtua.");
      setFullName("");
      setUsername("");
      setPassword("");
    } catch (e2) {
      setErr(e2?.message || "Gabim");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manager • Shto punëtor</h2>
          <p className="text-sm text-slate-500 mt-1">Krijo punëtor vetëm për departamentin tënd.</p>
        </div>
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
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Emri dhe mbiemri</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="p.sh. Arben X"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="p.sh. arben"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="min 6"
              autoComplete="new-password"
              disabled={saving}
            />
          </div>

          <div className="pt-1 flex items-center justify-end gap-2">
            <button
              type="submit"
              className={cn(
                "h-11 px-5 rounded-2xl text-white transition text-sm font-semibold",
                saving ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              )}
              disabled={saving}
            >
              {saving ? "Duke ruajtur..." : "Shto punëtor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

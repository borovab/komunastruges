// AdminWorkers.jsx (modern list + edit only, NO create form)
import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function AdminWorkers() {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");
  const [users, setUsers] = React.useState([]);

  // edit modal
  const [editing, setEditing] = React.useState(null); // user object
  const [eFullName, setEFullName] = React.useState("");
  const [eUsername, setEUsername] = React.useState("");
  const [ePassword, setEPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    setOkMsg("");
    try {
      const u = await api.listUsers();
      setUsers((u.users || []).filter((x) => x.role === "user"));
    } catch (e) {
      setErr(e?.message || "Gabim");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const openEdit = (u) => {
    setEditing(u);
    setEFullName(u.fullName || "");
    setEUsername(u.username || "");
    setEPassword("");
    setErr("");
    setOkMsg("");
  };

  const closeEdit = () => {
    setEditing(null);
    setEFullName("");
    setEUsername("");
    setEPassword("");
    setSaving(false);
  };

  const saveEdit = async () => {
    if (!editing?.id) return;

    setErr("");
    setOkMsg("");
    setSaving(true);
    try {
      await api.updateUser(editing.id, {
        fullName: eFullName.trim(),
        username: eUsername.trim(),
        password: ePassword ? ePassword : undefined,
      });
      setOkMsg("Punëtori u përditësua.");
      closeEdit();
      await load();
    } catch (e) {
      setErr(e?.message || "Gabim");
      setSaving(false);
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("A je i sigurt që do ta fshish këtë punëtor?")) return;

    setErr("");
    setOkMsg("");
    try {
      await api.deleteUser(id);
      setOkMsg("Punëtori u fshi.");
      await load();
    } catch (e) {
      setErr(e?.message || "Gabim");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Admin • Punëtorët</h2>
          <p className="text-sm text-slate-500 mt-1">Menaxho punëtorët (ndrysho të dhëna / fshij).</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
          >
            Rifresko
          </button>

          <button
            type="button"
            className="h-10 px-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-semibold"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin", { replace: true });
            }}
          >
            Paneli
          </button>
        </div>
      </div>

      {/* Alerts */}
      {err ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {okMsg ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {okMsg}
        </div>
      ) : null}

      {/* List card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold">
              U
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">Lista e punëtorëve</div>
              <div className="text-[12px] text-slate-500">{users.length} punëtorë</div>
            </div>
          </div>

          {loading ? <div className="text-sm text-slate-500">Loading…</div> : null}
        </div>

        {!loading && users.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">S’ka punëtorë.</div>
        ) : null}

        <div className="divide-y divide-slate-200">
          {users.map((u) => (
            <div key={u.id} className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-slate-100 border border-slate-200 grid place-items-center text-slate-700 font-bold">
                    {(u.fullName || "U")
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase())
                      .join("")}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{u.fullName || "-"}</div>
                    <div className="text-[12px] text-slate-500 truncate">@{u.username || "-"}</div>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                  Krijuar: {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(u)}
                  className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => removeUser(u.id)}
                  className="h-10 px-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editing ? (
        <div className="fixed inset-0 z-[999]">
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Ndrysho punëtorin</div>
                  <div className="text-[12px] text-slate-500">@{editing.username}</div>
                </div>

                <button
                  type="button"
                  onClick={closeEdit}
                  className="h-10 w-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition grid place-items-center"
                  aria-label="Mbyll"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path
                      d="M6 6l12 12M18 6 6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Emri dhe mbiemri</label>
                  <input
                    value={eFullName}
                    onChange={(e) => setEFullName(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="p.sh. Arben X"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Username</label>
                  <input
                    value={eUsername}
                    onChange={(e) => setEUsername(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="p.sh. arben"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Password (lëre bosh mos me ndërru)
                  </label>
                  <input
                    type="password"
                    value={ePassword}
                    onChange={(e) => setEPassword(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <p className="mt-2 text-[11px] text-slate-500">
                    Nëse e lë bosh, password-i nuk ndryshohet.
                  </p>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="h-11 px-5 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
                  disabled={saving}
                >
                  Anulo
                </button>

                <button
                  type="button"
                  onClick={saveEdit}
                  className={cn(
                    "h-11 px-5 rounded-2xl text-white transition text-sm font-semibold",
                    saving ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  )}
                  disabled={saving}
                >
                  {saving ? "Duke ruajtur..." : "Ruaj ndryshimet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

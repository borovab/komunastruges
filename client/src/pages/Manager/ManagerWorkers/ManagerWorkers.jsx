import React from "react";
import { api, getSession } from "../../../lib/api";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function ManagerWorkers() {
  const s = getSession();
  const depId = s?.user?.departmentId || null;

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

  // delete confirm
  const [deleting, setDeleting] = React.useState(null); // user object
  const [deletingNow, setDeletingNow] = React.useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    setOkMsg("");
    try {
      const u = await api.listUsers(); // backend already filters for manager, but we keep safe filter too
      const all = u.users || [];

      const onlyWorkers = all.filter((x) => String(x.role || "").toLowerCase() === "user");
      const onlyMyDep = depId ? onlyWorkers.filter((x) => String(x.departmentId || "") === String(depId)) : [];

      setUsers(onlyMyDep);
    } catch (e) {
      setErr(e?.message || "Gabim");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (u) => {
    setErr("");
    setOkMsg("");
    setEditing(u);
    setEFullName(u?.fullName || "");
    setEUsername(u?.username || "");
    setEPassword("");
  };

  const closeEdit = () => {
    setEditing(null);
    setEFullName("");
    setEUsername("");
    setEPassword("");
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    if (!editing?.id) return setErr("Missing user id.");
    if (!eFullName.trim()) return setErr("Plotëso emrin.");
    if (!eUsername.trim()) return setErr("Plotëso username.");
    if (ePassword.trim() && ePassword.trim().length < 6) return setErr("Password shumë i shkurtër (min 6).");

    setSaving(true);
    try {
      await api.updateUser(editing.id, {
        fullName: eFullName.trim(),
        username: eUsername.trim(),
        password: ePassword.trim() ? ePassword.trim() : undefined,
      });

      setOkMsg("Punëtori u përditësua.");
      closeEdit();
      await load();
    } catch (e2) {
      setErr(e2?.message || "Gabim");
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (u) => {
    setErr("");
    setOkMsg("");
    setDeleting(u);
  };

  const closeDelete = () => setDeleting(null);

  const confirmDelete = async () => {
    if (!deleting?.id) return;
    setErr("");
    setOkMsg("");
    setDeletingNow(true);
    try {
      await api.deleteUser(deleting.id);
      setOkMsg("Punëtori u fshi.");
      closeDelete();
      await load();
    } catch (e) {
      setErr(e?.message || "Gabim");
    } finally {
      setDeletingNow(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manager • Punëtorët</h2>
          <p className="text-sm text-slate-500 mt-1">Këtu shfaqen vetëm punëtorët e departamentit tënd.</p>
        </div>

        <button
          type="button"
          onClick={load}
          className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
        >
          Rifresko
        </button>
      </div>

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

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold">U</span>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">Lista e punëtorëve</div>
              <div className="text-[12px] text-slate-500">{users.length} punëtorë</div>
            </div>
          </div>

          {loading ? <div className="text-sm text-slate-500">Loading…</div> : null}
        </div>

        {!loading && users.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">S’ka punëtorë në departament.</div>
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
                    <div className="text-[12px] text-slate-500 truncate flex items-center gap-2">
                      <span>@{u.username || "-"}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-slate-50 text-slate-700 border-slate-200">
                        user
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                  Krijuar: {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span
                  className={cn(
                    "hidden sm:inline-flex px-3 py-1 rounded-full text-[12px] font-semibold border",
                    "bg-blue-50 text-blue-700 border-blue-200"
                  )}
                >
                  Departamenti yt
                </span>

                <button
                  type="button"
                  onClick={() => openEdit(u)}
                  className="h-9 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => openDelete(u)}
                  className="h-9 px-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition text-sm font-semibold"
                >
                  Fshi
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing ? (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-end sm:items-center justify-center p-3">
          <div className="w-full sm:max-w-lg rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Edit punëtorin</div>
              <button
                type="button"
                onClick={closeEdit}
                className="h-9 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
              >
                Mbyll
              </button>
            </div>

            <form onSubmit={saveEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Emri dhe mbiemri</label>
                <input
                  value={eFullName}
                  onChange={(e) => setEFullName(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder="p.sh. Punëtor 1"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Username</label>
                <input
                  value={eUsername}
                  onChange={(e) => setEUsername(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder="p.sh. user1"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Password i ri (opsional)</label>
                <input
                  type="password"
                  value={ePassword}
                  onChange={(e) => setEPassword(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder="Min 6 karaktere"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="h-11 px-5 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
                >
                  Anulo
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={cn(
                    "h-11 px-5 rounded-2xl text-white transition text-sm font-semibold",
                    saving ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {saving ? "Duke ruajtur…" : "Ruaj"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* DELETE MODAL */}
      {deleting ? (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-end sm:items-center justify-center p-3">
          <div className="w-full sm:max-w-md rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Fshi punëtorin</div>
              <button
                type="button"
                onClick={closeDelete}
                className="h-9 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
              >
                Mbyll
              </button>
            </div>

            <div className="p-5">
              <div className="text-sm text-slate-700">
                A je i sigurt që do ta fshish <span className="font-semibold">{deleting.fullName || "punëtorin"}</span>?
              </div>
              <div className="text-[12px] text-slate-500 mt-1">Ky veprim nuk kthehet mbrapsht.</div>

              <div className="mt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeDelete}
                  className="h-11 px-5 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
                >
                  Anulo
                </button>

                <button
                  type="button"
                  disabled={deletingNow}
                  onClick={confirmDelete}
                  className={cn(
                    "h-11 px-5 rounded-2xl border transition text-sm font-semibold",
                    deletingNow
                      ? "border-red-200 bg-red-200 text-red-800 cursor-not-allowed"
                      : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  )}
                >
                  {deletingNow ? "Duke fshirë…" : "Po, fshi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

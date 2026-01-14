// src/pages/manager/ManagerWorkers/ManagerWorkers.jsx (FULL)
// ✅ i18n ready + MK/SQ translations
import React from "react";
import { api, getSession } from "../../../lib/api";
import { useLang } from "../../../contexts/LanguageContext"; // 🔁 ndrysho path sipas projektit

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function ManagerWorkers() {
  const { t } = useLang();

  // ✅ safe translation helper (fallback SQ)
  const tr = React.useCallback(
    (key, fallback, vars) => {
      const v = t(key, vars);
      return v === key ? fallback : v;
    },
    [t]
  );

  const s = getSession();
  const depId = s?.user?.departmentId || null;

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");
  const [users, setUsers] = React.useState([]);

  // edit modal
  const [editing, setEditing] = React.useState(null);
  const [eFullName, setEFullName] = React.useState("");
  const [eUsername, setEUsername] = React.useState("");
  const [ePassword, setEPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);


  const load = async () => {
    setLoading(true);
    setErr("");
    setOkMsg("");
    try {
      const u = await api.listUsers(); // backend already filters for manager, but we keep safe filter too
      const all = u?.users || [];

      const onlyWorkers = all.filter((x) => String(x.role || "").toLowerCase() === "user");
      const onlyMyDep = depId ? onlyWorkers.filter((x) => String(x.departmentId || "") === String(depId)) : [];
      setUsers(onlyMyDep);
    } catch (e) {
      setErr(e?.message || tr("common.errors.generic", "Gabim"));
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

    const fn = String(eFullName || "").trim();
    const un = String(eUsername || "").trim();
    const pw = String(ePassword || "").trim();

    if (!editing?.id) return setErr(tr("managerWorkers.errors.missingUserId", "Missing user id."));
    if (!fn) return setErr(tr("managerWorkers.errors.fillName", "Plotëso emrin."));
    if (!un) return setErr(tr("managerWorkers.errors.fillUsername", "Plotëso username."));
    if (pw && pw.length < 6)
      return setErr(tr("managerWorkers.errors.passwordTooShort", "Password shumë i shkurtër (min 6)."));

    setSaving(true);
    try {
      await api.updateUser(editing.id, {
        fullName: fn,
        username: un,
        ...(pw ? { password: pw } : {}),
      });

      setOkMsg(tr("managerWorkers.ok.updated", "Punëtori u përditësua."));
      closeEdit();
      await load();
    } catch (e2) {
      setErr(e2?.message || tr("common.errors.generic", "Gabim"));
    } finally {
      setSaving(false);
    }
  };

 

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {tr("managerWorkers.headerTitle", "Manager • Punëtorët")}
          </h2>
          <p className="text-[12px] sm:text-sm text-slate-500 mt-1">
            {tr("managerWorkers.headerSubtitle", "Këtu shfaqen vetëm punëtorët e departamentit tënd.")}
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="h-10 w-full sm:w-auto px-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] font-semibold"
        >
          {tr("managerWorkers.actions.refresh", "Rifresko")}
        </button>
      </div>

      {/* Alerts */}
      {err ? (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
          {err}
        </div>
      ) : null}

      {okMsg ? (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[13px] text-emerald-800">
          {okMsg}
        </div>
      ) : null}

      {/* List card */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl sm:rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold">
              U
            </span>
            <div className="leading-tight min-w-0">
              <div className="text-[13px] sm:text-sm font-semibold text-slate-900">
                {tr("managerWorkers.list.title", "Lista e punëtorëve")}
              </div>
              <div className="text-[11px] sm:text-[12px] text-slate-500">
                {tr("managerWorkers.list.count", "{n} punëtorë", { n: users.length })}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-[12px] sm:text-sm text-slate-500">{tr("common.loading", "Loading…")}</div>
          ) : null}
        </div>

        {!loading && users.length === 0 ? (
          <div className="p-5 sm:p-6 text-[13px] sm:text-sm text-slate-500">
            {tr("managerWorkers.list.empty", "S’ka punëtorë në departament.")}
          </div>
        ) : null}

        <div className="divide-y divide-slate-200">
          {users.map((u) => (
            <div
              key={u.id}
              className="px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl sm:rounded-2xl bg-slate-100 border border-slate-200 grid place-items-center text-slate-700 font-bold text-[12px] sm:text-sm">
                    {(u.fullName || "U")
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase())
                      .join("")}
                  </div>

                  <div className="min-w-0">
                    <div className="text-[13px] sm:text-sm font-semibold text-slate-900 truncate">{u.fullName || "-"}</div>
                    <div className="text-[11px] sm:text-[12px] text-slate-500 truncate flex flex-wrap items-center gap-2">
                      <span className="truncate max-w-[180px] sm:max-w-none">@{u.username || "-"}</span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border bg-slate-50 text-slate-700 border-slate-200">
                        {tr("managerWorkers.labels.roleUser", "user")}
                      </span>

                      <span className="sm:hidden px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                        {tr("managerWorkers.labels.myDepartment", "Departamenti yt")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500">
                  {tr("managerWorkers.labels.created", "Krijuar")}:{" "}
                  {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2">
                <span
                  className={cn(
                    "hidden sm:inline-flex px-3 py-1 rounded-full text-[12px] font-semibold border",
                    "bg-blue-50 text-blue-700 border-blue-200"
                  )}
                >
                  {tr("managerWorkers.labels.myDepartment", "Departamenti yt")}
                </span>

             
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing ? (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
          <div
            className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-3"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-none">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="text-[13px] sm:text-sm font-semibold text-slate-900">
                  {tr("managerWorkers.editModal.title", "Edit punëtorin")}
                </div>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] sm:text-sm font-semibold"
                >
                  {tr("managerWorkers.actions.close", "Mbyll")}
                </button>
              </div>

              <form onSubmit={saveEdit} className="p-4 sm:p-5 space-y-3 sm:space-y-4 overflow-auto flex-1">
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-2">
                    {tr("managerWorkers.form.fullName", "Emri dhe mbiemri")}
                  </label>
                  <input
                    value={eFullName}
                    onChange={(e) => setEFullName(e.target.value)}
                    className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder={tr("managerWorkers.placeholders.fullName", "p.sh. Punëtor 1")}
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-2">
                    {tr("managerWorkers.form.username", "Username")}
                  </label>
                  <input
                    value={eUsername}
                    onChange={(e) => setEUsername(e.target.value)}
                    className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder={tr("managerWorkers.placeholders.username", "p.sh. user1")}
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-2">
                    {tr("managerWorkers.form.newPasswordOptional", "Password i ri (opsional)")}
                  </label>
                  <input
                    type="password"
                    value={ePassword}
                    onChange={(e) => setEPassword(e.target.value)}
                    className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder={tr("managerWorkers.placeholders.password", "Min 6 karaktere")}
                    autoComplete="new-password"
                    disabled={saving}
                  />
                  <p className="mt-2 text-[10px] sm:text-[11px] text-slate-500">
                    {tr("managerWorkers.editModal.hint", "Nëse e lë bosh, password-i s’ndryshohet.")}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] sm:text-sm font-semibold"
                    disabled={saving}
                  >
                    {tr("managerWorkers.actions.cancel", "Anulo")}
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className={cn(
                      "h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl text-white transition text-[13px] sm:text-sm font-semibold",
                      saving ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    {saving
                      ? tr("managerWorkers.actions.saving", "Duke ruajtur…")
                      : tr("managerWorkers.actions.save", "Ruaj")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

    
    </div>
  );
}

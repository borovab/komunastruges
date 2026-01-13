// src/pages/Admin/AdminWorkers/AdminWorkers.jsx (FULL)
// ✅ i18n (NO SQ fallback) + dep filter + edit modal + delete
import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import { useLang } from "../../../contexts/LanguageContext"; // 🔁 ndrysho path sipas projektit

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function SuperAdminWorkers() {
  const { t } = useLang();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");
  const [users, setUsers] = React.useState([]);

  // departments filter
  const [departments, setDepartments] = React.useState([]);
  const [depId, setDepId] = React.useState("all"); // "all" | departmentId

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
      const [u, deps] = await Promise.all([api.listUsers(), api.listDepartments()]);
      setUsers(u.users || []);
      setDepartments(deps.departments || []);
    } catch (e) {
      setErr(e?.message || t("superAdminWorkers.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const depNameById = React.useMemo(() => {
    const m = new Map();
    for (const d of departments) m.set(String(d.id), d.name);
    return m;
  }, [departments]);

  const filteredUsers =
    depId === "all"
      ? users
      : users.filter((u) => String(u.departmentId || "").trim() === String(depId).trim());

  const depLabel =
    depId === "all"
      ? t("superAdminWorkers.filter.allDepartments")
      : `${t("superAdminWorkers.filter.department")}: ${depNameById.get(String(depId)) || "—"}`;

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

    if (!eFullName.trim()) return setErr(t("superAdminWorkers.errors.fullNameRequired"));
    if (!eUsername.trim()) return setErr(t("superAdminWorkers.errors.usernameRequired"));
    if (ePassword.trim() && ePassword.trim().length < 6) return setErr(t("superAdminWorkers.errors.passwordShort"));

    setSaving(true);
    try {
      await api.updateUser(editing.id, {
        fullName: eFullName.trim(),
        username: eUsername.trim(),
        password: ePassword.trim() ? ePassword.trim() : undefined,
      });
      setOkMsg(t("superAdminWorkers.ok.updated"));
      closeEdit();
      await load();
    } catch (e) {
      setErr(e?.message || t("superAdminWorkers.errors.generic"));
      setSaving(false);
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm(t("superAdminWorkers.confirm.delete"))) return;

    setErr("");
    setOkMsg("");
    try {
      await api.deleteUser(id);
      setOkMsg(t("superAdminWorkers.ok.deleted"));
      await load();
    } catch (e) {
      setErr(e?.message || t("superAdminWorkers.errors.generic"));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{t("superAdminWorkers.header.title")}</h2>
          <p className="text-[12px] sm:text-sm text-slate-500 mt-1">{t("superAdminWorkers.header.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="h-9 sm:h-10 w-full sm:w-auto px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] font-semibold"
          >
            {t("superAdminWorkers.actions.refresh")}
          </button>

          <button
            type="button"
            className="h-9 sm:h-10 w-full sm:w-auto px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition text-[13px] font-semibold"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin", { replace: true });
            }}
          >
            {t("superAdminWorkers.actions.panel")}
          </button>
        </div>
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

      {/* Filter row */}
      <div className="mb-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="text-[12px] sm:text-sm text-slate-600">{depLabel}</div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-slate-600">{t("superAdminWorkers.filter.label")}</label>
          <select
            value={depId}
            onChange={(e) => setDepId(e.target.value)}
            className="h-9 sm:h-10 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">{t("superAdminWorkers.filter.all")}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List card */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl sm:rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold">
              U
            </span>
            <div className="leading-tight min-w-0">
              <div className="text-[13px] sm:text-sm font-semibold text-slate-900">
                {t("superAdminWorkers.list.title")}
              </div>
              <div className="text-[11px] sm:text-[12px] text-slate-500">
                {filteredUsers.length} {t("superAdminWorkers.list.count")}
                {depId === "all" ? "" : ` (${t("superAdminWorkers.list.filtered")})`}
              </div>
            </div>
          </div>

          {loading ? <div className="text-[12px] sm:text-sm text-slate-500">{t("superAdminWorkers.loading")}</div> : null}
        </div>

        {!loading && filteredUsers.length === 0 ? (
          <div className="p-5 sm:p-6 text-[13px] sm:text-sm text-slate-500">{t("superAdminWorkers.empty")}</div>
        ) : null}

        <div className="divide-y divide-slate-200">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-start sm:items-center gap-2">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl sm:rounded-2xl bg-slate-100 border border-slate-200 grid place-items-center text-slate-700 font-bold text-[12px] sm:text-sm shrink-0">
                    {(u.fullName || "U")
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase())
                      .join("")}
                  </div>

                  <div className="min-w-0">
                    <div className="text-[13px] sm:text-sm font-semibold text-slate-900 truncate">{u.fullName || "—"}</div>

                    <div className="text-[11px] sm:text-[12px] text-slate-500 truncate flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span>@{u.username || "—"}</span>

                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border",
                          (u.role || "").toLowerCase() === "admin" && "bg-rose-50 text-rose-700 border-rose-200",
                          (u.role || "").toLowerCase() === "manager" && "bg-amber-50 text-amber-800 border-amber-200",
                          (u.role || "").toLowerCase() === "user" && "bg-slate-50 text-slate-700 border-slate-200",
                          (u.role || "").toLowerCase() === "superadmin" && "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        {(u.role || "user").toLowerCase()}
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border bg-slate-50 text-slate-700 border-slate-200">
                        {u.departmentName ||
                          (u.departmentId ? depNameById.get(String(u.departmentId)) : null) ||
                          t("superAdminWorkers.labels.noDepartment")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500">
                  {t("superAdminWorkers.labels.created")}: {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => openEdit(u)}
                  className="h-9 sm:h-10 flex-1 sm:flex-none px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] sm:text-sm font-semibold"
                >
                  {t("superAdminWorkers.actions.edit")}
                </button>

                <button
                  type="button"
                  onClick={() => removeUser(u.id)}
                  className="h-9 sm:h-10 flex-1 sm:flex-none px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition text-[13px] sm:text-sm font-semibold"
                >
                  {t("superAdminWorkers.actions.delete")}
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
            <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-sm font-semibold text-slate-900">
                    {t("superAdminWorkers.modal.title")}
                  </div>

                  <div className="text-[11px] sm:text-[12px] text-slate-500 flex flex-wrap items-center gap-2">
                    <span>@{editing.username}</span>

                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border",
                        (editing.role || "").toLowerCase() === "admin" &&
                          "bg-rose-50 text-rose-700 border-rose-200",
                        (editing.role || "").toLowerCase() === "manager" &&
                          "bg-amber-50 text-amber-800 border-amber-200",
                        (editing.role || "").toLowerCase() === "user" && "bg-slate-50 text-slate-700 border-slate-200",
                        (editing.role || "").toLowerCase() === "superadmin" && "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      {(editing.role || "user").toLowerCase()}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border bg-slate-50 text-slate-700 border-slate-200">
                      {editing.departmentName ||
                        (editing.departmentId ? depNameById.get(String(editing.departmentId)) : null) ||
                        t("superAdminWorkers.labels.noDepartment")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeEdit}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition grid place-items-center"
                  aria-label={t("superAdminWorkers.actions.close")}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-2">
                    {t("superAdminWorkers.fields.fullName")}
                  </label>
                  <input
                    value={eFullName}
                    onChange={(e) => setEFullName(e.target.value)}
                    className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder={t("superAdminWorkers.placeholders.fullName")}
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-2">
                    {t("superAdminWorkers.fields.username")}
                  </label>
                  <input
                    value={eUsername}
                    onChange={(e) => setEUsername(e.target.value)}
                    className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder={t("superAdminWorkers.placeholders.username")}
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-2">
                    {t("superAdminWorkers.fields.passwordOptional")}
                  </label>
                  <input
                    type="password"
                    value={ePassword}
                    onChange={(e) => setEPassword(e.target.value)}
                    className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <p className="mt-2 text-[10px] sm:text-[11px] text-slate-500">
                    {t("superAdminWorkers.hints.passwordOptional")}
                  </p>
                </div>
              </div>

              <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] sm:text-sm font-semibold"
                  disabled={saving}
                >
                  {t("superAdminWorkers.actions.cancel")}
                </button>

                <button
                  type="button"
                  onClick={saveEdit}
                  className={cn(
                    "h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl text-white transition text-[13px] sm:text-sm font-semibold",
                    saving ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  )}
                  disabled={saving}
                >
                  {saving ? t("superAdminWorkers.actions.saving") : t("superAdminWorkers.actions.save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// src/pages/SuperAdmin/SuperamdinDepartament/SuperamdinDepartamentWorkers.jsx
// ✅ Pro UI: header + breadcrumbs, stats, search, add worker modal, edit worker modal + DELETE worker
// ✅ Route: /superadmin/departments/:depId
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../lib/api";
import { useLang } from "../../../contexts/LanguageContext";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

function normRole(r) {
  return String(r || "").trim().toLowerCase();
}

function fmtDate(v) {
  if (!v) return "";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return "";
  }
}

async function safeUpdateUser(userId, payload) {
  if (typeof api.updateUser !== "function") throw new Error("api.updateUser is not a function");
  try {
    return await api.updateUser(userId, payload);
  } catch {
    return await api.updateUser({ id: userId, ...payload });
  }
}

async function safeCreateUser(payload) {
  if (typeof api.createUser !== "function") throw new Error("api.createUser is not a function");
  try {
    return await api.createUser(payload);
  } catch {
    try {
      return await api.createUser({ ...payload });
    } catch {
      return await api.createUser(
        payload?.fullName,
        payload?.username,
        payload?.password,
        payload?.role,
        payload?.departmentId
      );
    }
  }
}

async function safeDeleteUser(userId) {
  if (typeof api.deleteUser !== "function") throw new Error("api.deleteUser is not a function");
  try {
    return await api.deleteUser(userId);
  } catch {
    // common variants
    try {
      return await api.deleteUser({ id: userId });
    } catch {
      return await api.deleteUser(String(userId));
    }
  }
}

export default function SuperamdinDepartamentWorkers() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { depId } = useParams();

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const [departments, setDepartments] = React.useState([]);
  const [users, setUsers] = React.useState([]);

  // search
  const [q, setQ] = React.useState("");

  // add worker modal
  const [addOpen, setAddOpen] = React.useState(false);
  const [aFullName, setAFullName] = React.useState("");
  const [aUsername, setAUsername] = React.useState("");
  const [aRole, setARole] = React.useState("user"); // user | manager | admin (superadmin excluded)
  const [aPassword, setAPassword] = React.useState("");
  const [aPassword2, setAPassword2] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  // edit worker modal
  const [workerEditOpen, setWorkerEditOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [eFullName, setEFullName] = React.useState("");
  const [eUsername, setEUsername] = React.useState("");
  const [ePassword, setEPassword] = React.useState("");
  const [savingUser, setSavingUser] = React.useState(false);

  // delete confirm modal
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const [deps, u] = await Promise.all([api.listDepartments(), api.listUsers()]);
      setDepartments(deps?.departments || []);
      setUsers((u?.users || []).filter((x) => normRole(x?.role) !== "superadmin"));
    } catch (e) {
      setErr(e?.message || t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depId]);

  const selectedDep = React.useMemo(() => {
    return departments.find((d) => String(d.id) === String(depId)) || null;
  }, [departments, depId]);

  const workersAll = React.useMemo(() => {
    const dep = String(depId || "").trim();
    return users.filter((u) => String(u.departmentId || "").trim() === dep);
  }, [users, depId]);

  const workers = React.useMemo(() => {
    const s = String(q || "").trim().toLowerCase();
    if (!s) return workersAll;
    return workersAll.filter((u) => {
      const name = String(u?.fullName || "").toLowerCase();
      const un = String(u?.username || "").toLowerCase();
      return name.includes(s) || un.includes(s);
    });
  }, [workersAll, q]);

  const counts = React.useMemo(() => {
    let admins = 0;
    let managers = 0;
    let usersN = 0;
    for (const u of workersAll) {
      const r = normRole(u?.role);
      if (r === "admin") admins += 1;
      else if (r === "manager") managers += 1;
      else usersN += 1;
    }
    return { admins, managers, users: usersN, total: workersAll.length };
  }, [workersAll]);

  const openEditWorker = (u) => {
    setErr("");
    setOk("");
    setEditingUser(u);
    setEFullName(u?.fullName || "");
    setEUsername(u?.username || "");
    setEPassword("");
    setWorkerEditOpen(true);
  };

  const closeEditWorker = () => {
    setWorkerEditOpen(false);
    setEditingUser(null);
    setEFullName("");
    setEUsername("");
    setEPassword("");
    setSavingUser(false);
  };

  const submitEditWorker = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const u = editingUser;
    if (!u?.id) return setErr(t("common.errorGeneric"));

    const fullName = String(eFullName || "").trim();
    const username = String(eUsername || "").trim();
    const password = String(ePassword || "");

    if (!fullName) return setErr(t("superAdminWorkers.errors.fullNameRequired"));
    if (!username) return setErr(t("superAdminWorkers.errors.usernameRequired"));
    if (password && password.length < 6) return setErr(t("superAdminWorkers.errors.passwordShort"));

    const payload = {
      fullName,
      username,
      ...(password ? { password } : {}),
    };

    setSavingUser(true);
    try {
      await safeUpdateUser(u.id, payload);
      setOk(t("superAdminWorkers.ok.updated"));
      closeEditWorker();
      await load();
    } catch (e2) {
      setErr(e2?.message || t("common.errorGeneric"));
      setSavingUser(false);
    }
  };

  const openAdd = () => {
    setErr("");
    setOk("");
    setAFullName("");
    setAUsername("");
    setARole("user");
    setAPassword("");
    setAPassword2("");
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
    setCreating(false);
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const fullName = String(aFullName || "").trim();
    const username = String(aUsername || "").trim();
    const role = normRole(aRole);
    const password = String(aPassword || "");
    const password2 = String(aPassword2 || "");

    if (!fullName) return setErr(t("superAdminAddUser.errors.fullNameRequired"));
    if (!username) return setErr(t("superAdminAddUser.errors.usernameRequired"));
    if (username.length < 3) return setErr(t("superAdminAddUser.errors.usernameMin3"));
    if (!["user", "manager", "admin"].includes(role)) return setErr(t("superAdminAddUser.errors.roleInvalid"));

    if (!password) return setErr(t("superAdminAddUser.errors.passwordRequired"));
    if (password.length < 6) return setErr(t("superAdminAddUser.errors.passwordMin6"));
    if (password !== password2) return setErr(t("superAdminAddUser.errors.passwordMismatch"));

    const payload = {
      fullName,
      username,
      role,
      password,
      ...(role === "admin" ? {} : { departmentId: String(depId) }),
      ...(role === "admin" ? { departmentId: String(depId) } : {}),
    };

    setCreating(true);
    try {
      await safeCreateUser(payload);
      setOk(t("superAdminAddUser.ok.created"));
      closeAdd();
      await load();
    } catch (e2) {
      setErr(e2?.message || t("superAdminAddUser.errors.createFailed"));
      setCreating(false);
    }
  };

  // ✅ DELETE
  const openDelete = (u) => {
    setErr("");
    setOk("");
    setDeletingUser(u);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setDeletingUser(null);
    setDeleting(false);
  };

  const confirmDelete = async () => {
    setErr("");
    setOk("");

    const u = deletingUser;
    if (!u?.id) return setErr(t("common.errorGeneric"));

    setDeleting(true);
    try {
      await safeDeleteUser(u.id);
      setOk(t("superAdminWorkers.ok.deleted")); // ✅ already exists in your dict
      closeDelete();
      await load();
    } catch (e2) {
      setErr(e2?.message || t("common.errorGeneric"));
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-5 sm:py-7">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
            <button
              type="button"
              onClick={() => navigate("/superadmin/departments")}
              className="hover:text-slate-700 underline underline-offset-4"
            >
              {t("superAdminDepartments.headerTitle")}
            </button>
            <span>•</span>
            <span className="truncate">{selectedDep?.name || "—"}</span>
          </div>

          <h2 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 truncate">
            {selectedDep?.name || t("superAdminDepartments.headerTitle")}
          </h2>

          <p className="mt-1 text-[13px] sm:text-sm text-slate-600">
            {t("adminDepartments.workersList.title")} • <b className="text-slate-900">{counts.total}</b>
            <span className="text-slate-500">
              {" "}
              (Admin: {counts.admins} • Manager: {counts.managers} • User: {counts.users})
            </span>
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={openAdd}
            className="h-10 px-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition text-[13px] font-semibold shadow-sm"
          >
            + {t("superAdminAddUser.actions.create")}
          </button>

          <button
            type="button"
            onClick={load}
            className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] font-semibold shadow-sm"
          >
            {t("common.refresh")}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {err ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
          {err}
        </div>
      ) : null}

      {ok ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[13px] text-emerald-800">
          {ok}
        </div>
      ) : null}

      {/* Toolbar */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">{t("adminDepartments.workersList.title")}</div>
            <div className="text-[12px] text-slate-500 mt-1">
              Showing <b className="text-slate-700">{workers.length}</b> / {workersAll.length}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name / username…"
              className="w-full sm:w-72 h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {loading ? <div className="mt-4 text-sm text-slate-500">{t("common.loading")}</div> : null}

        {!loading && workersAll.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">{t("adminDepartments.workersList.empty")}</div>
            <div className="text-[12px] text-slate-500 mt-1">
              Kliko “Create user” për me shtuar punëtor në këtë departament.
            </div>
          </div>
        ) : null}

        {!loading && workersAll.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {workers.map((u) => (
              <div
                key={u.id}
                className="rounded-3xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition"
              >
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-start gap-3">
                    <div className="shrink-0 h-10 w-10 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-sm font-extrabold text-slate-700">
                      {String(u?.fullName || u?.username || "?")
                        .trim()
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{u.fullName || "-"}</div>
                      <div className="text-[12px] text-slate-500 truncate">@{u.username || "-"}</div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border border-slate-200 bg-slate-50 text-slate-700">
                          {normRole(u?.role) || "user"}
                        </span>

                        {u.createdAt ? <span className="text-[11px] text-slate-500">• {fmtDate(u.createdAt)}</span> : null}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditWorker(u)}
                      className="h-9 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[12px] font-semibold shadow-sm"
                    >
                      {t("superAdminWorkers.actions.edit")}
                    </button>

                    <button
                      type="button"
                      onClick={() => openDelete(u)}
                      className="h-9 px-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-[12px] font-semibold shadow-sm"
                    >
                      {t("superAdminWorkers.actions.delete")}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="px-4 py-3 flex items-center justify-between text-[12px] text-slate-500">
                  <span className="truncate">ID: {String(u.id).slice(0, 8)}…</span>
                  <span className="font-semibold text-slate-600">Edit →</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Add Worker Modal */}
      {addOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{t("superAdminAddUser.cardTitle")}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {selectedDep?.name ? `Department: ${selectedDep.name}` : "Department"}
                </div>
              </div>
              <button
                type="button"
                onClick={closeAdd}
                className="h-9 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[12px] font-semibold"
              >
                {t("common.close")}
              </button>
            </div>

            <form onSubmit={submitAdd} className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    {t("superAdminAddUser.form.fullName")}
                  </label>
                  <input
                    value={aFullName}
                    onChange={(e) => setAFullName(e.target.value)}
                    placeholder={t("superAdminAddUser.placeholders.fullName")}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    {t("superAdminAddUser.form.username")}
                  </label>
                  <input
                    value={aUsername}
                    onChange={(e) => setAUsername(e.target.value)}
                    placeholder={t("superAdminAddUser.placeholders.username")}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                  <div className="mt-1 text-[11px] text-slate-500">{t("superAdminAddUser.hints.username")}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    {t("superAdminAddUser.form.role")}
                  </label>
                  <select
                    value={aRole}
                    onChange={(e) => setARole(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="user">{t("superAdminAddUser.roles.user")}</option>
                    <option value="manager">{t("superAdminAddUser.roles.manager")}</option>
                    <option value="admin">{t("superAdminAddUser.roles.admin")}</option>
                  </select>
                  <div className="mt-1 text-[11px] text-slate-500">{t("superAdminAddUser.hints.role")}</div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[11px] font-semibold text-slate-500">{t("superAdminAddUser.form.department")}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 truncate">{selectedDep?.name || "—"}</div>
                  <div className="mt-1 text-[11px] text-slate-500 truncate">ID: {String(depId).slice(0, 10)}…</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    {t("superAdminAddUser.form.password")}
                  </label>
                  <input
                    value={aPassword}
                    onChange={(e) => setAPassword(e.target.value)}
                    type="password"
                    placeholder={t("superAdminAddUser.placeholders.password")}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    {t("superAdminAddUser.form.confirmPassword")}
                  </label>
                  <input
                    value={aPassword2}
                    onChange={(e) => setAPassword2(e.target.value)}
                    type="password"
                    placeholder={t("superAdminAddUser.placeholders.confirmPassword")}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeAdd}
                  className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                >
                  {t("superAdminAddUser.actions.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className={cn(
                    "h-11 px-4 rounded-2xl text-white text-sm font-semibold transition shadow-sm",
                    creating ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {creating ? t("superAdminAddUser.actions.creating") : t("superAdminAddUser.actions.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Edit Worker Modal */}
      {workerEditOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{t("superAdminWorkers.modal.title")}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">@{editingUser?.username || "-"}</div>
              </div>
              <button
                type="button"
                onClick={closeEditWorker}
                className="h-9 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[12px] font-semibold"
              >
                {t("common.close")}
              </button>
            </div>

            <form onSubmit={submitEditWorker} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">{t("superAdminWorkers.fields.fullName")}</label>
                <input
                  value={eFullName}
                  onChange={(e) => setEFullName(e.target.value)}
                  placeholder={t("superAdminWorkers.placeholders.fullName")}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">{t("superAdminWorkers.fields.username")}</label>
                <input
                  value={eUsername}
                  onChange={(e) => setEUsername(e.target.value)}
                  placeholder={t("superAdminWorkers.placeholders.username")}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">{t("superAdminWorkers.fields.passwordOptional")}</label>
                <input
                  value={ePassword}
                  onChange={(e) => setEPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
                <div className="mt-1 text-[11px] text-slate-500">{t("superAdminWorkers.hints.passwordOptional")}</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeEditWorker}
                  className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                >
                  {t("superAdminWorkers.actions.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className={cn(
                    "h-11 px-4 rounded-2xl text-white text-sm font-semibold transition shadow-sm",
                    savingUser ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {savingUser ? t("superAdminWorkers.actions.saving") : t("superAdminWorkers.actions.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete Confirm Modal */}
      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{t("superAdminWorkers.actions.delete")}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">@{deletingUser?.username || "-"}</div>
              </div>
              <button
                type="button"
                onClick={closeDelete}
                className="h-9 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[12px] font-semibold"
              >
                {t("common.close")}
              </button>
            </div>

            <div className="p-4">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3">
                <div className="text-sm font-semibold text-red-800">
                  {t("superAdminWorkers.confirm.delete")}
                </div>
                <div className="mt-1 text-[12px] text-red-700">
                  {deletingUser?.fullName ? deletingUser.fullName : ""}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeDelete}
                  className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                >
                  {t("superAdminWorkers.actions.cancel")}
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className={cn(
                    "h-11 px-4 rounded-2xl text-white text-sm font-semibold transition shadow-sm",
                    deleting ? "bg-red-600/70 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  {deleting ? t("common.loading") : t("superAdminWorkers.actions.delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// src/pages/SuperAdmin/SuperAdminAddUser/SuperAdminAddUser.jsx (FULL)
// ✅ i18n (NO SQ fallback) + translations below
import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import { useLang } from "../../../contexts/LanguageContext"; // 🔁 ndrysho path sipas projektit

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

function needsDepartmentForRole(r) {
  return r === "user" || r === "manager";
}

export default function SuperAdminAddUser() {
  const navigate = useNavigate();
  const { t } = useLang();

  const [fullName, setFullName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [role, setRole] = React.useState("user"); // user | manager | admin | superadmin
  const [departmentId, setDepartmentId] = React.useState("");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [departments, setDepartments] = React.useState([]);
  const [depsLoading, setDepsLoading] = React.useState(true);

  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const needsDepartment = needsDepartmentForRole(role);

  const loadDepartments = async () => {
    setDepsLoading(true);
    try {
      const r = await api.listDepartments();
      const list = r?.departments || [];
      setDepartments(list);

      // auto-select first department for user/manager if empty
      if (!departmentId && list.length && needsDepartmentForRole(role)) {
        setDepartmentId(String(list[0].id));
      }
    } catch (e) {
      setErr(e?.message || t("superAdminAddUser.errors.loadDepartmentsFailed"));
    } finally {
      setDepsLoading(false);
    }
  };

  React.useEffect(() => {
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const nd = needsDepartmentForRole(role);

    // kur kalon në admin/superadmin → mos kërko department + pastro value
    if (!nd) {
      setDepartmentId("");
      // nëse ishte error-i i departmentit, hiqe
      setErr((prev) => (prev === t("superAdminAddUser.errors.pickDepartment") ? "" : prev));
      return;
    }

    // kur kalon në user/manager → auto-select i pari nëse s’ka zgjedhje
    if (nd && !departmentId && departments.length) {
      setDepartmentId(String(departments[0].id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, departments]);

  const validate = () => {
    const u = username.trim();
    const n = fullName.trim();
    const nd = needsDepartmentForRole(role);

    if (!n) return t("superAdminAddUser.errors.fullNameRequired");
    if (!u) return t("superAdminAddUser.errors.usernameRequired");
    if (u.length < 3) return t("superAdminAddUser.errors.usernameMin3");

    if (role !== "admin" && role !== "user" && role !== "manager" && role !== "superadmin") {
      return t("superAdminAddUser.errors.roleInvalid");
    }

    if (nd) {
      if (!departmentId) return t("superAdminAddUser.errors.pickDepartment");
    }

    if (!password) return t("superAdminAddUser.errors.passwordRequired");
    if (password.length < 6) return t("superAdminAddUser.errors.passwordMin6");
    if (password !== confirmPassword) return t("superAdminAddUser.errors.passwordMismatch");

    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setLoading(true);
    try {
      const nd = needsDepartmentForRole(role);

      const payload = {
        fullName: fullName.trim(),
        username: username.trim(),
        password,
        role,
        ...(nd ? { departmentId } : {}),
      };

      await api.createUser(payload);

      setOk(t("superAdminAddUser.ok.created"));
      setFullName("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setRole("user");

      if (departments.length) setDepartmentId(String(departments[0].id));
      else setDepartmentId("");

      setTimeout(() => navigate("/superadmin/workers"), 600);
    } catch (e2) {
      setErr(e2?.message || t("superAdminAddUser.errors.createFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-900">{t("superAdminAddUser.headerTitle")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("superAdminAddUser.headerSubtitle")}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/superadmin/workers")}
          className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
        >
          {t("superAdminAddUser.actions.back")}
        </button>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold">+</span>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">{t("superAdminAddUser.cardTitle")}</div>
              <div className="text-[12px] text-slate-500">{t("superAdminAddUser.cardSubtitle")}</div>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-5">
          {/* Alerts */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-2">
                {t("superAdminAddUser.form.fullName")}
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder={t("superAdminAddUser.placeholders.fullName")}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                {t("superAdminAddUser.form.username")}
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder={t("superAdminAddUser.placeholders.username")}
                autoComplete="off"
              />
              <p className="mt-2 text-[11px] text-slate-500">{t("superAdminAddUser.hints.username")}</p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                {t("superAdminAddUser.form.role")}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={cn(
                    "h-11 rounded-2xl border text-sm font-semibold transition",
                    role === "user"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {t("superAdminAddUser.roles.user")}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("manager")}
                  className={cn(
                    "h-11 rounded-2xl border text-sm font-semibold transition",
                    role === "manager"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {t("superAdminAddUser.roles.manager")}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={cn(
                    "h-11 rounded-2xl border text-sm font-semibold transition",
                    role === "admin"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {t("superAdminAddUser.roles.admin")}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("superadmin")}
                  className={cn(
                    "h-11 rounded-2xl border text-sm font-semibold transition",
                    role === "superadmin"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {t("superAdminAddUser.roles.superadmin")}
                </button>
              </div>

              <p className="mt-2 text-[11px] text-slate-500">{t("superAdminAddUser.hints.role")}</p>
            </div>

            {/* Department (only for user/manager) */}
            <div className={cn(needsDepartment ? "md:col-span-2" : "hidden")}>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                {t("superAdminAddUser.form.department")}
              </label>

              <div className="flex gap-2 items-center">
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={depsLoading || !departments.length}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                >
                  {depsLoading ? <option value="">{t("superAdminAddUser.deps.loading")}</option> : null}

                  {!depsLoading && departments.length === 0 ? (
                    <option value="">{t("superAdminAddUser.deps.empty")}</option>
                  ) : null}

                  {!depsLoading &&
                    departments.map((d) => (
                      <option key={d.id} value={String(d.id)}>
                        {d.name}
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  onClick={loadDepartments}
                  className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
                  title={t("superAdminAddUser.actions.refreshDepartments")}
                >
                  ↻
                </button>
              </div>

              <p className="mt-2 text-[11px] text-slate-500">{t("superAdminAddUser.hints.departments")}</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                {t("superAdminAddUser.form.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder={t("superAdminAddUser.placeholders.password")}
                autoComplete="new-password"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                {t("superAdminAddUser.form.confirmPassword")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder={t("superAdminAddUser.placeholders.confirmPassword")}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={loading}
              className="h-11 px-5 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t("superAdminAddUser.actions.creating") : t("superAdminAddUser.actions.create")}
            </button>

            <button
              type="button"
              onClick={() => navigate("/superadmin/workers")}
              className="h-11 px-5 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
            >
              {t("superAdminAddUser.actions.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

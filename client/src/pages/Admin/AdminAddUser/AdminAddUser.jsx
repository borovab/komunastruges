import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import { useLang } from "../../../contexts/LanguageContext";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function AdminAddUser() {
  const navigate = useNavigate();
  const { t } = useLang();

  const [fullName, setFullName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [departments, setDepartments] = React.useState([]);
  const [depsLoading, setDepsLoading] = React.useState(true);

  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  // ✅ only user allowed
  const role = "user";
  const needsDepartment = true;

  const loadDepartments = async () => {
    setDepsLoading(true);
    try {
      const r = await api.listDepartments();
      const list = r.departments || [];
      setDepartments(list);

      if (!departmentId && list.length) {
        setDepartmentId(String(list[0].id));
      }
    } catch (e) {
      setErr(e?.message || t("adminAddUser.errors.depsFetchFail"));
    } finally {
      setDepsLoading(false);
    }
  };

  React.useEffect(() => {
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const u = username.trim();
    const n = fullName.trim();

    if (!n) return t("adminAddUser.errors.fullNameRequired");
    if (!u) return t("adminAddUser.errors.usernameRequired");
    if (u.length < 3) return t("adminAddUser.errors.usernameMin3");

    if (!departmentId) return t("adminAddUser.errors.departmentRequired");

    if (!password) return t("adminAddUser.errors.passwordRequired");
    if (password.length < 6) return t("adminAddUser.errors.passwordMin6");
    if (password !== confirmPassword) return t("adminAddUser.errors.passwordMismatch");

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
      const payload = {
        fullName: fullName.trim(),
        username: username.trim(),
        password,
        role: "user",
        departmentId,
      };

      await api.createUser(payload);

      setOk(t("adminAddUser.ok.userCreated"));
      setFullName("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      if (departments.length) setDepartmentId(String(departments[0].id));
      else setDepartmentId("");

      setTimeout(() => navigate("/admin/workers"), 600);
    } catch (e2) {
      setErr(e2?.message || t("adminAddUser.errors.createFail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-900">{t("adminAddUser.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("adminAddUser.subtitle")}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/workers")}
          className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
        >
          {t("common.back")}
        </button>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold">
              +
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">{t("adminAddUser.cardTitle")}</div>
              <div className="text-[12px] text-slate-500">{t("adminAddUser.cardNote")}</div>
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
                {t("adminAddUser.fields.fullName.label")}
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder={t("adminAddUser.fields.fullName.placeholder")}
              />
            </div>

            {/* Username */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-2">
                {t("adminAddUser.fields.username.label")}
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder={t("adminAddUser.fields.username.placeholder")}
                autoComplete="off"
              />
              <p className="mt-2 text-[11px] text-slate-500">{t("adminAddUser.fields.username.help")}</p>
            </div>

            {/* Department */}
            <div className={cn(needsDepartment ? "md:col-span-2" : "hidden")}>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                {t("adminAddUser.fields.department.label")}
              </label>

              <div className="flex gap-2 items-center">
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={depsLoading || !departments.length}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                >
                  {depsLoading ? <option value="">{t("adminAddUser.fields.department.loading")}</option> : null}
                  {!depsLoading && departments.length === 0 ? (
                    <option value="">{t("adminAddUser.fields.department.empty")}</option>
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
                  title={t("adminAddUser.fields.department.refreshTitle")}
                >
                  ↻
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                {t("adminAddUser.fields.password.label")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder={t("adminAddUser.fields.password.placeholder")}
                autoComplete="new-password"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                {t("adminAddUser.fields.confirmPassword.label")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder={t("adminAddUser.fields.confirmPassword.placeholder")}
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
              {loading ? t("adminAddUser.actions.creating") : t("adminAddUser.actions.create")}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/workers")}
              className="h-11 px-5 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

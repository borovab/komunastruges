import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function AdminAddUser() {
  const navigate = useNavigate();

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
      setErr(e?.message || "Nuk u arrit me i marrë departamentet.");
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

    if (!n) return "Shkruaj emrin dhe mbiemrin.";
    if (!u) return "Shkruaj username.";
    if (u.length < 3) return "Username duhet të ketë të paktën 3 karaktere.";

    if (!departmentId) return "Zgjidh departamentin.";

    if (!password) return "Shkruaj password.";
    if (password.length < 6) return "Password duhet të ketë të paktën 6 karaktere.";
    if (password !== confirmPassword) return "Password-at nuk përputhen.";

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

      setOk("Përdoruesi u krijua me sukses.");
      setFullName("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      if (departments.length) setDepartmentId(String(departments[0].id));
      else setDepartmentId("");

      setTimeout(() => navigate("/admin/workers"), 600);
    } catch (e2) {
      setErr(e2?.message || "Gabim gjatë krijimit të përdoruesit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Shto përdorues</h1>
          <p className="text-sm text-slate-500 mt-1">Krijo vetëm llogari User (me departament).</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/workers")}
          className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
        >
          Kthehu
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
              <div className="text-sm font-semibold text-slate-900">Add User</div>
              <div className="text-[12px] text-slate-500">Vetëm User</div>
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
              <label className="block text-xs font-medium text-slate-700 mb-2">Emri dhe mbiemri</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder="p.sh. John Doe"
              />
            </div>

            {/* Username */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-2">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder="p.sh. johndoe"
                autoComplete="off"
              />
              <p className="mt-2 text-[11px] text-slate-500">Pa hapësira. Minimum 3 karaktere.</p>
            </div>

            {/* Department */}
            <div className={cn(needsDepartment ? "md:col-span-2" : "hidden")}>
              <label className="block text-xs font-medium text-slate-700 mb-2">Departamenti</label>

              <div className="flex gap-2 items-center">
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={depsLoading || !departments.length}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                >
                  {depsLoading ? <option value="">Duke i ngarkuar…</option> : null}
                  {!depsLoading && departments.length === 0 ? (
                    <option value="">S’ka departamente</option>
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
                  title="Rifresko departamentet"
                >
                  ↻
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder="Minimum 6 karaktere"
                autoComplete="new-password"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Konfirmo password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder="Shkruaje përsëri"
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
              {loading ? "Duke krijuar..." : "Krijo përdorues"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/workers")}
              className="h-11 px-5 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
            >
              Anulo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

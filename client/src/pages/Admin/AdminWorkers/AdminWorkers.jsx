// AdminWorkers.jsx (i18n sq/mk) - modern list ONLY, NO edit, NO delete + hide superadmin
import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import { useLang } from "../../../contexts/LanguageContext";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function AdminWorkers() {
  const { t } = useLang();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");
  const [users, setUsers] = React.useState([]);

  // departments filter
  const [departments, setDepartments] = React.useState([]);
  const [depId, setDepId] = React.useState("all"); // "all" | departmentId

  const load = async () => {
    setLoading(true);
    setErr("");
    setOkMsg("");
    try {
      const [u, deps] = await Promise.all([api.listUsers(), api.listDepartments()]);
      const list = (u.users || []).filter((x) => String(x?.role || "").toLowerCase() !== "superadmin"); // ✅ hide
      setUsers(list);
      setDepartments(deps.departments || []);
    } catch (e) {
      setErr(e?.message || t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const depNameById = React.useMemo(() => {
    const m = new Map();
    for (const d of departments) m.set(String(d.id), d.name);
    return m;
  }, [departments]);

  const filteredUsers =
    depId === "all" ? users : users.filter((u) => String(u.departmentId || "").trim() === String(depId).trim());

  const filterLabel =
    depId === "all"
      ? t("adminWorkers.filter.allDepartments")
      : t("adminWorkers.filter.departmentPrefix", { name: depNameById.get(String(depId)) || "—" });

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{t("adminWorkers.headerTitle")}</h2>
          <p className="text-[12px] sm:text-sm text-slate-500 mt-1">{t("adminWorkers.headerSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="h-9 sm:h-10 w-full sm:w-auto px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] font-semibold"
          >
            {t("common.refresh")}
          </button>

          <button
            type="button"
            className="h-9 sm:h-10 w-full sm:w-auto px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition text-[13px] font-semibold"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin", { replace: true });
            }}
          >
            {t("adminWorkers.actions.dashboard")}
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
        <div className="text-[12px] sm:text-sm text-slate-600">{filterLabel}</div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-slate-600">{t("adminWorkers.filter.label")}</label>
          <select
            value={depId}
            onChange={(e) => setDepId(e.target.value)}
            className="h-9 sm:h-10 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">{t("adminWorkers.filter.allOption")}</option>
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
              <div className="text-[13px] sm:text-sm font-semibold text-slate-900">{t("adminWorkers.list.title")}</div>
              <div className="text-[11px] sm:text-[12px] text-slate-500">
                {t("adminWorkers.list.count", { n: filteredUsers.length })}
                {depId === "all" ? "" : t("adminWorkers.list.filteredSuffix")}
              </div>
            </div>
          </div>

          {loading ? <div className="text-[12px] sm:text-sm text-slate-500">{t("common.loading")}</div> : null}
        </div>

        {!loading && filteredUsers.length === 0 ? (
          <div className="p-5 sm:p-6 text-[13px] sm:text-sm text-slate-500">{t("adminWorkers.list.empty")}</div>
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
                    <div className="text-[13px] sm:text-sm font-semibold text-slate-900 truncate">{u.fullName || "-"}</div>

                    <div className="text-[11px] sm:text-[12px] text-slate-500 truncate flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span>@{u.username || "-"}</span>

                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border",
                          (u.role || "").toLowerCase() === "admin" && "bg-rose-50 text-rose-700 border-rose-200",
                          (u.role || "").toLowerCase() === "manager" && "bg-amber-50 text-amber-800 border-amber-200",
                          (u.role || "").toLowerCase() === "user" && "bg-slate-50 text-slate-700 border-slate-200"
                        )}
                      >
                        {(u.role || "user").toLowerCase()}
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border bg-slate-50 text-slate-700 border-slate-200">
                        {u.departmentName ||
                          (u.departmentId ? depNameById.get(String(u.departmentId)) : null) ||
                          t("adminWorkers.labels.noDepartment")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500">
                  {t("adminWorkers.labels.created")}: {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                </div>
              </div>

              {/* ✅ Actions removed completely */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

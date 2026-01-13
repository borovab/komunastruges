// src/pages/Admin/AdminDepartments/AdminDepartments.jsx (i18n sq/mk)
import React from "react";
import { api } from "../../../lib/api";
import { useLang } from "../../../contexts/LanguageContext";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function AdminDepartments() {
  const { t } = useLang();

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const [departments, setDepartments] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [reports, setReports] = React.useState([]);

  // selected department
  const [selectedDepId, setSelectedDepId] = React.useState(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const [deps, u, r] = await Promise.all([api.listDepartments(), api.listUsers(), api.listReports()]);
      setDepartments(deps.departments || []);
      setUsers((u.users || []).filter((x) => String(x?.role || "").trim().toLowerCase() !== "superadmin"));
      setReports(r.reports || []);
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

  const selectedDep = React.useMemo(() => {
    if (!selectedDepId) return null;
    return departments.find((d) => String(d.id) === String(selectedDepId)) || null;
  }, [departments, selectedDepId]);

  const selectedWorkersCount = React.useMemo(() => {
    if (!selectedDepId) return 0;
    const dep = String(selectedDepId).trim();
    return users.filter((u) => String(u.departmentId || "").trim() === dep).length;
  }, [users, selectedDepId]);

  const selectedReportsCount = React.useMemo(() => {
    if (!selectedDepId) return 0;
    const dep = String(selectedDepId).trim();
    return reports.filter((r) => String(r.departmentId || "").trim() === dep).length;
  }, [reports, selectedDepId]);

  const depStats = React.useMemo(() => {
    const userCountByDep = new Map();
    for (const u of users) {
      const dep = String(u.departmentId || "").trim();
      if (!dep) continue;
      userCountByDep.set(dep, (userCountByDep.get(dep) || 0) + 1);
    }

    const reportCountByDep = new Map();
    for (const r of reports) {
      const dep = String(r.departmentId || "").trim();
      if (!dep) continue;
      reportCountByDep.set(dep, (reportCountByDep.get(dep) || 0) + 1);
    }

    return { userCountByDep, reportCountByDep };
  }, [users, reports]);

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{t("adminDepartments.title")}</h2>
          <p className="text-[12px] sm:text-sm text-slate-500 mt-1">{t("adminDepartments.subtitle")}</p>
        </div>

        <button
          type="button"
          onClick={load}
          className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] font-semibold"
        >
          {t("common.refresh")}
        </button>
      </div>

      {err ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {err}
        </div>
      ) : null}

      {ok ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">
          {ok}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">{t("adminDepartments.list.title")}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {t("adminDepartments.list.total")}:{" "}
                <b className="text-slate-700">{departments.length}</b>
              </div>
            </div>

            {loading ? <div className="text-sm text-slate-500">{t("common.loading")}</div> : null}
          </div>

          {!loading && departments.length === 0 ? (
            <div className="mt-3 text-sm text-slate-500">{t("adminDepartments.list.empty")}</div>
          ) : null}

          <div className="mt-3 grid gap-2">
            {departments.map((d) => {
              const active = String(selectedDepId || "") === String(d.id);
              const workers = depStats.userCountByDep.get(String(d.id)) || 0;
              const reps = depStats.reportCountByDep.get(String(d.id)) || 0;

              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDepId(d.id)}
                  className={cn(
                    "w-full text-left rounded-2xl border p-3 transition",
                    active ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{d.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {d.createdAt ? new Date(d.createdAt).toLocaleString() : ""}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-slate-50 text-slate-700 border-slate-200">
                        {t("adminDepartments.badges.workers", { n: workers })}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-slate-50 text-slate-700 border-slate-200">
                        {t("adminDepartments.badges.reports", { n: reps })}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Details */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="text-sm font-semibold text-slate-900">{t("adminDepartments.details.title")}</div>
          <div className="text-[11px] text-slate-500 mt-1">{t("adminDepartments.details.hint")}</div>

          {!selectedDepId ? (
            <div className="mt-4 text-sm text-slate-500">{t("adminDepartments.details.pickFromLeft")}</div>
          ) : (
            <div className="mt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-bold text-slate-900 truncate">{selectedDep?.name || "—"}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {selectedDep?.createdAt ? new Date(selectedDep.createdAt).toLocaleString() : ""}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDepId(null)}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold"
                >
                  {t("common.close")}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[11px] font-semibold text-slate-500">{t("adminDepartments.cards.workersTitle")}</div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900">{selectedWorkersCount}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{t("adminDepartments.cards.workersSub")}</div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[11px] font-semibold text-slate-500">{t("adminDepartments.cards.reportsTitle")}</div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900">{selectedReportsCount}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{t("adminDepartments.cards.reportsSub")}</div>
                </div>
              </div>

              {/* optional list of workers in that department */}
              <div className="mt-4">
                <div className="text-[12px] font-semibold text-slate-700 mb-2">{t("adminDepartments.workersList.title")}</div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-200">
                    {users
                      .filter((u) => String(u.departmentId || "").trim() === String(selectedDepId).trim())
                      .map((u) => (
                        <div key={u.id} className="px-3 py-2.5 bg-white">
                          <div className="text-[13px] font-semibold text-slate-900 truncate">{u.fullName || "-"}</div>
                          <div className="text-[11px] text-slate-500 truncate">@{u.username || "-"}</div>
                        </div>
                      ))}

                    {selectedWorkersCount === 0 ? (
                      <div className="px-3 py-3 bg-white text-[13px] text-slate-500">
                        {t("adminDepartments.workersList.empty")}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* optional: reports count note */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

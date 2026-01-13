// src/pages/SuperAdmin/SuperAdminDashboard/SuperAdminDashboard.jsx (FULL)
// ✅ i18n (NO SQ fallback) + hide superadmin + export CSV + stats + users list
import React from "react";
import { api } from "../../../lib/api";
import { useLang } from "../../../contexts/LanguageContext"; // 🔁 ndrysho path sipas projektit

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export default function SuperAdminDashboard() {
  const { t } = useLang();

  const [reports, setReports] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");

  // create worker (mbetur nga më parë - nuk e prek)
  const [uFullName, setUFullName] = React.useState("");
  const [uUsername, setUUsername] = React.useState("");
  const [uPassword, setUPassword] = React.useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const [r, u] = await Promise.all([api.listReports(), api.listUsers()]);
      setReports(r?.reports || []);

      // ✅ shfaq userat (pa superadmin)
      setUsers((u?.users || []).filter((x) => String(x?.role || "").trim().toLowerCase() !== "superadmin"));
    } catch (e) {
      setErr(e?.message || t("superAdminDashboard.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    setErr("");
    setOkMsg("");
    try {
      await api.createUser({
        fullName: uFullName,
        username: uUsername,
        password: uPassword,
        role: "user",
      });
      setUFullName("");
      setUUsername("");
      setUPassword("");
      setOkMsg(t("superAdminDashboard.ok.workerAdded"));
      await load();
    } catch (e2) {
      setErr(e2?.message || t("superAdminDashboard.errors.generic"));
    }
  };

  const review = async (id) => {
    setErr("");
    setOkMsg("");
    try {
      await api.reviewReport(id);
      setOkMsg(t("superAdminDashboard.ok.reportReviewed"));
      await load();
    } catch (e) {
      setErr(e?.message || t("superAdminDashboard.errors.generic"));
    }
  };

  const csvEscape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const formatReason = (r) => {
    const choice = String(r?.reasonChoice || r?.reason || "").trim();
    const text = String(r?.reasonText || "").trim();
    if (text) return choice ? `${choice} - ${text}` : text;
    return choice;
  };

  const exportExcel = () => {
    const headers = [
      t("superAdminDashboard.export.headers.fullName"),
      t("superAdminDashboard.export.headers.status"),
      t("superAdminDashboard.export.headers.date"),
      t("superAdminDashboard.export.headers.timeOut"),
      t("superAdminDashboard.export.headers.timeReturn"),
      t("superAdminDashboard.export.headers.department"),
      t("superAdminDashboard.export.headers.reason"),
      t("superAdminDashboard.export.headers.createdAt"),
      t("superAdminDashboard.export.headers.reviewedAt"),
    ];

    const rows = (reports || []).map((r) => [
      r.fullName || "",
      r.status || "",
      r.date || "",
      r.timeOut || "",
      r.timeReturn || "",
      r.departmentName || "",
      formatReason(r),
      r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
      r.reviewedAt ? new Date(r.reviewedAt).toLocaleString() : "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `raportet-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  /* -------------------- STATS -------------------- */
  const totalReports = reports.length;
  const reviewedReports = reports.filter((r) => (r.status || "").trim().toLowerCase() === "reviewed").length;
  const pendingReports = totalReports - reviewedReports;

  const totalUsers = users.length;
  const onlyWorkers = users.filter((u) => (u.role || "").trim().toLowerCase() === "user").length;
  const admins = users.filter((u) => (u.role || "").trim().toLowerCase() === "admin").length;

  const todayISO = new Date().toISOString().slice(0, 10);
  const reportsToday = reports.filter((r) => String(r.date || "").trim().slice(0, 10) === todayISO).length;

  /* -------------------- LAST 7 DAYS (COUNT PER DAY) -------------------- */
  const last7 = (() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      return { key, label: d.toLocaleDateString(), count: 0 };
    });

    for (const r of reports) {
      const key = String(r.date || r.createdAt || r.created_at || "").trim().slice(0, 10);
      const idx = days.findIndex((x) => x.key === key);
      if (idx !== -1) days[idx].count += 1;
    }

    return days;
  })();

  const max7 = Math.max(1, ...last7.map((d) => d.count));

  const StatCard = ({ title, value, sub, tone = "blue" }) => (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-500">{title}</div>
          <div className="mt-0.5 text-xl font-extrabold text-slate-900">{value}</div>
          {sub ? <div className="mt-1 text-[11px] text-slate-500">{sub}</div> : null}
        </div>

        <span
          className={cn(
            "h-9 w-9 rounded-xl grid place-items-center border",
            tone === "blue" && "bg-blue-50 text-blue-700 border-blue-100",
            tone === "emerald" && "bg-emerald-50 text-emerald-700 border-emerald-100",
            tone === "amber" && "bg-amber-50 text-amber-800 border-amber-100",
            tone === "rose" && "bg-rose-50 text-rose-700 border-rose-100"
          )}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
              d="M7 13l3 3 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{t("superAdminDashboard.headerTitle")}</h2>
          <p className="text-[12px] sm:text-sm text-slate-500 mt-1">{t("superAdminDashboard.headerSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:items-center gap-2">
          <button
            type="button"
            className="h-9 sm:h-10 w-full sm:w-auto px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] font-semibold"
            onClick={load}
          >
            {t("superAdminDashboard.actions.refresh")}
          </button>

          <button
            type="button"
            className="h-9 sm:h-10 w-full sm:w-auto px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] font-semibold"
            onClick={exportExcel}
            disabled={loading || reports.length === 0}
            title={reports.length === 0 ? t("superAdminDashboard.actions.exportTitleEmpty") : t("superAdminDashboard.actions.exportTitle")}
          >
            {t("superAdminDashboard.actions.export")}
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

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <StatCard
          title={t("superAdminDashboard.stats.totalReports")}
          value={totalReports}
          sub={t("superAdminDashboard.stats.today", { n: reportsToday })}
          tone="blue"
        />
        <StatCard
          title={t("superAdminDashboard.stats.pending")}
          value={pendingReports}
          sub={t("superAdminDashboard.stats.pendingSub")}
          tone="amber"
        />
        <StatCard
          title={t("superAdminDashboard.stats.reviewed")}
          value={reviewedReports}
          sub={t("superAdminDashboard.stats.reviewedSub")}
          tone="emerald"
        />
        <StatCard
          title={t("superAdminDashboard.stats.workers")}
          value={onlyWorkers}
          sub={t("superAdminDashboard.stats.workersSub", { admins, total: totalUsers })}
          tone="rose"
        />
      </div>

      {/* Mini chart 7 days */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 sm:p-4 mb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[13px] sm:text-sm font-semibold text-slate-900">
            {t("superAdminDashboard.chart.title")}
          </div>
          <div className="text-[11px] text-slate-500">{t("superAdminDashboard.chart.maxPerDay", { n: max7 })}</div>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2 items-end">
          {last7.map((d) => {
            const h = Math.max(6, Math.round((d.count / max7) * 64));
            return (
              <div key={d.key} className="flex flex-col items-center gap-1.5">
                <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700">{d.count}</div>

                <div className="w-full h-[64px] sm:h-[72px] flex items-end rounded-xl bg-slate-50 border border-slate-200 px-1">
                  <div className="w-full rounded-xl bg-blue-600" style={{ height: h }} title={`${d.key}: ${d.count}`} />
                </div>

                <div className="text-[9px] sm:text-[10px] text-slate-500 text-center leading-tight">{d.key.slice(5)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reports list */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] sm:text-sm font-semibold text-slate-900">{t("superAdminDashboard.reports.title")}</h3>
        {loading ? <div className="text-[12px] text-slate-500">{t("common.loading")}</div> : null}
      </div>

      {!loading && reports.length === 0 ? (
        <div className="text-[13px] text-slate-500">{t("superAdminDashboard.reports.empty")}</div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {reports.map((r) => {
          const reviewed = (r.status || "").trim().toLowerCase() === "reviewed";
          return (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-sm font-semibold text-slate-900 truncate">{r.fullName || "—"}</div>
                  <div className="mt-1 text-[11px] sm:text-[12px] text-slate-500">
                    {r.date || "—"} • {r.timeOut || "—"} - {r.timeReturn || "—"}
                    {r.departmentName ? ` • ${r.departmentName}` : ""}
                  </div>
                </div>

                <span
                  className={cn(
                    "shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                    reviewed
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  )}
                >
                  {reviewed ? t("superAdminDashboard.reports.badges.reviewed") : t("superAdminDashboard.reports.badges.pending")}
                </span>
              </div>

              <div className="mt-2.5 text-[13px] sm:text-sm text-slate-700 whitespace-pre-wrap">
                {formatReason(r) || "—"}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                {!reviewed ? (
                  <button
                    type="button"
                    className="h-9 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-[13px] font-semibold"
                    onClick={() => review(r.id)}
                  >
                    {t("superAdminDashboard.reports.actions.verify")}
                  </button>
                ) : (
                  <div className="text-[11px] text-slate-500">
                    {t("superAdminDashboard.reports.reviewedAt")}{" "}
                    {r.reviewedAt ? new Date(r.reviewedAt).toLocaleString() : "—"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Users list */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[13px] sm:text-sm font-semibold text-slate-900">{t("superAdminDashboard.users.title")}</h3>
          <div className="text-[11px] text-slate-500">{t("superAdminDashboard.users.total", { n: users.length })}</div>
        </div>

        {!loading && users.length === 0 ? (
          <div className="text-[13px] text-slate-500">{t("superAdminDashboard.users.empty")}</div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-200">
            {users.map((u) => (
              <div key={u.id} className="px-3 sm:px-5 py-3 sm:py-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-sm font-semibold text-slate-900 truncate">
                    {u.fullName || "—"}
                  </div>
                  <div className="mt-1 text-[11px] sm:text-[12px] text-slate-500 truncate flex flex-wrap items-center gap-2">
                    <span>@{u.username || "—"}</span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border bg-slate-50 text-slate-700 border-slate-200">
                      {(u.role || "user").toLowerCase()}
                    </span>

                    {u.departmentName ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border bg-slate-50 text-slate-700 border-slate-200">
                        {u.departmentName}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500">
                    {t("superAdminDashboard.users.created")}{" "}
                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* mbetur nga më parë - create user form (nuk e prek) */}
      <div className="hidden">
        <form onSubmit={createUser}>
          <input value={uFullName} onChange={(e) => setUFullName(e.target.value)} />
          <input value={uUsername} onChange={(e) => setUUsername(e.target.value)} />
          <input value={uPassword} onChange={(e) => setUPassword(e.target.value)} />
          <button type="submit">create</button>
        </form>
      </div>
    </div>
  );
}

// src/pages/Admin/AdminReports/AdminReports.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

function statusLabel(s) {
  const v = String(s || "").trim().toLowerCase();
  // backend: submitted/reviewed — UI: pending/reviewed
  if (v === "submitted") return "pending";
  return v || "—";
}

function formatReason(r) {
  const choice = String(r?.reasonChoice || r?.reason || "").trim();
  const text = String(r?.reasonText || "").trim();
  if (text) return choice ? `${choice} - ${text}` : text;
  return choice || "—";
}

export default function SuperAdminReports() {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");
  const [reports, setReports] = React.useState([]);

  // departments filter
  const [departments, setDepartments] = React.useState([]);
  const [depId, setDepId] = React.useState("all"); // "all" | departmentId

  const [open, setOpen] = React.useState(null); // report object
  const [acting, setActing] = React.useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    setOkMsg("");
    try {
      const [res, deps] = await Promise.all([api.listReports(), api.listDepartments()]);
      setReports(res?.reports || []);
      setDepartments(deps?.departments || []);
    } catch (e) {
      setErr(e?.message || "Gabim");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const openDetails = (r) => {
    setOpen(r);
    setErr("");
    setOkMsg("");
  };

  const closeDetails = () => {
    setOpen(null);
    setActing(false);
  };

  const deleteReport = async (id) => {
    if (!window.confirm("A je i sigurt që do ta fshish këtë raportim?")) return;

    setErr("");
    setOkMsg("");
    setActing(true);
    try {
      await api.deleteReport(id);
      setOkMsg("Raportimi u fshi.");
      closeDetails();
      await load();
    } catch (e) {
      setErr(e?.message || "Gabim");
      setActing(false);
    }
  };

  const markReviewed = async (id) => {
    setErr("");
    setOkMsg("");
    setActing(true);
    try {
      await api.reviewReport(id);
      setOkMsg("Raportimi u verifikua.");
      closeDetails();
      await load();
    } catch (e) {
      setErr(e?.message || "Gabim");
      setActing(false);
    }
  };

  const filteredReports =
    depId === "all"
      ? reports
      : reports.filter((r) => String(r.departmentId || "").trim() === String(depId).trim());

  const depNameById = React.useMemo(() => {
    const m = new Map();
    for (const d of departments) m.set(String(d.id), d.name);
    return m;
  }, [departments]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Admin • Raportimet</h2>
          <p className="text-[12px] sm:text-sm text-slate-500 mt-1">Shfaq të gjitha raportimet (Excel list).</p>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="h-9 sm:h-10 w-full sm:w-auto px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] font-semibold"
          >
            Rifresko
          </button>

          <button
            type="button"
            className="h-9 sm:h-10 w-full sm:w-auto px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition text-[13px] font-semibold"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin", { replace: true });
            }}
          >
            Paneli
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
        <div className="text-[12px] sm:text-sm text-slate-600">
          {depId === "all" ? "Të gjitha departamentet" : `Departamenti: ${depNameById.get(String(depId)) || "—"}`}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-slate-600">Filtro:</label>
          <select
            value={depId}
            onChange={(e) => setDepId(e.target.value)}
            className="h-9 sm:h-10 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Të gjitha</option>
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
              R
            </span>
            <div className="leading-tight min-w-0">
              <div className="text-[13px] sm:text-sm font-semibold text-slate-900">Lista e raportimeve</div>
              <div className="text-[11px] sm:text-[12px] text-slate-500">
                {filteredReports.length} raportime{depId === "all" ? "" : " (filtruar)"}
              </div>
            </div>
          </div>

          {loading ? <div className="text-[12px] sm:text-sm text-slate-500">Loading…</div> : null}
        </div>

        {!loading && filteredReports.length === 0 ? (
          <div className="p-5 sm:p-6 text-[13px] sm:text-sm text-slate-500">S’ka raportime.</div>
        ) : null}

        {/* EXCEL LIST (vetëm kjo) */}
        <div className="overflow-auto">
          <table className="w-full text-[13px] sm:text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold w-[60px] sm:w-[70px]">#</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Punëtori</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Data</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Time out</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Time return</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Arsye</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Status</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Departamenti</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Krijuar</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-right">Veprime</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredReports.map((r, idx) => (
                <tr
                  key={r.id}
                  onClick={() => openDetails(r)}
                  className="cursor-pointer hover:bg-slate-50 transition"
                  title="Kliko për detaje"
                >
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-500">{idx + 1}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-slate-900">{r.fullName || "—"}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">{r.date || "—"}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">{r.timeOut || "—"}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">{r.timeReturn || "—"}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">
                    <div className="truncate max-w-[220px] sm:max-w-[360px]">{formatReason(r)}</div>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">{statusLabel(r.status)}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">
                    {r.departmentName || depNameById.get(String(r.departmentId)) || "—"}
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                  </td>

                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">
                    {statusLabel(r.status) !== "reviewed" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markReviewed(r.id);
                        }}
                        className={cn(
                          "h-8 sm:h-9 px-3 rounded-xl sm:rounded-2xl text-white transition text-[11px] sm:text-xs font-semibold",
                          acting ? "bg-emerald-600/70 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                        )}
                        disabled={acting}
                      >
                        {acting ? "..." : "Verifikoje"}
                      </button>
                    ) : (
                      <span className="inline-flex items-center h-8 sm:h-9 px-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 text-[11px] sm:text-xs font-semibold">
                        Verified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {open ? (
        <div className="fixed inset-0 z-[999]">
          <div className="absolute inset-0 bg-black/40" onClick={closeDetails} />
          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3">
            <div className="w-full max-w-3xl rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-sm font-semibold text-slate-900 truncate">
                    {open.fullName || "—"} • {open.departmentName || depNameById.get(String(open.departmentId)) || "—"}
                  </div>
                  <div className="text-[11px] sm:text-[12px] text-slate-500 truncate">
                    {open.createdAt ? new Date(open.createdAt).toLocaleString() : "—"} • Status:{" "}
                    <span className="font-semibold text-slate-700">{statusLabel(open.status)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition grid place-items-center"
                  aria-label="Mbyll"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4">
                    <div className="text-[10px] sm:text-[11px] text-slate-500">Punëtori</div>
                    <div className="text-[13px] sm:text-sm font-semibold text-slate-900 mt-1">{open.fullName || "—"}</div>
                  </div>

                  <div className="rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4">
                    <div className="text-[10px] sm:text-[11px] text-slate-500">Departamenti</div>
                    <div className="text-[13px] sm:text-sm font-semibold text-slate-900 mt-1">
                      {open.departmentName || depNameById.get(String(open.departmentId)) || "—"}
                    </div>
                  </div>

                  <div className="rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4">
                    <div className="text-[10px] sm:text-[11px] text-slate-500">Data</div>
                    <div className="text-[13px] sm:text-sm font-semibold text-slate-900 mt-1">{open.date || "—"}</div>
                  </div>

                  <div className="rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4">
                    <div className="text-[10px] sm:text-[11px] text-slate-500">Koha</div>
                    <div className="text-[13px] sm:text-sm font-semibold text-slate-900 mt-1">
                      {open.timeOut || "—"} - {open.timeReturn || "—"}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4">
                  <div className="text-[10px] sm:text-[11px] text-slate-500">Arsye</div>
                  <div className="text-[13px] sm:text-sm text-slate-900 mt-2 whitespace-pre-wrap break-words">
                    {formatReason(open)}
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] sm:text-sm font-semibold"
                  disabled={acting}
                >
                  Mbyll
                </button>

                {statusLabel(open.status) !== "reviewed" ? (
                  <button
                    type="button"
                    onClick={() => markReviewed(open.id)}
                    className={cn(
                      "h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl text-white transition text-[13px] sm:text-sm font-semibold",
                      acting ? "bg-emerald-600/70 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                    )}
                    disabled={acting}
                  >
                    {acting ? "..." : "Verifikoje"}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => deleteReport(open.id)}
                  className={cn(
                    "h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl border transition text-[13px] sm:text-sm font-semibold",
                    acting
                      ? "border-red-200 bg-red-50 text-red-700/70 cursor-not-allowed"
                      : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  )}
                  disabled={acting}
                >
                  Fshi
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

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

export default function AdminReports() {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");
  const [reports, setReports] = React.useState([]);

  const [open, setOpen] = React.useState(null); // report object
  const [acting, setActing] = React.useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    setOkMsg("");
    try {
      const res = await api.listReports(); // alias -> /api/reports
      setReports(res?.reports || []);
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Admin • Raportimet</h2>
          <p className="text-sm text-slate-500 mt-1">Shfaq të gjitha raportimet (Excel list).</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
          >
            Rifresko
          </button>

          <button
            type="button"
            className="h-10 px-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-semibold"
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
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {okMsg ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {okMsg}
        </div>
      ) : null}

      {/* List card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold">
              R
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">Lista e raportimeve</div>
              <div className="text-[12px] text-slate-500">{reports.length} raportime</div>
            </div>
          </div>

          {loading ? <div className="text-sm text-slate-500">Loading…</div> : null}
        </div>

        {!loading && reports.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">S’ka raportime.</div>
        ) : null}

        {/* EXCEL LIST (vetëm kjo) */}
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-4 py-3 font-semibold w-[70px]">#</th>
                <th className="px-4 py-3 font-semibold">Punëtori</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Time left</th>
                <th className="px-4 py-3 font-semibold">Arsye</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Departamenti</th>
                <th className="px-4 py-3 font-semibold">Krijuar</th>
                <th className="px-4 py-3 font-semibold text-right">Veprime</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {reports.map((r, idx) => (
                <tr
                  key={r.id}
                  onClick={() => openDetails(r)}
                  className="cursor-pointer hover:bg-slate-50 transition"
                  title="Kliko për detaje"
                >
                  <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{r.fullName || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{r.date || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{r.timeLeft || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="truncate max-w-[360px]">{r.reason || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{statusLabel(r.status)}</td>
                  <td className="px-4 py-3 text-slate-700">{r.department || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {statusLabel(r.status) !== "reviewed" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markReviewed(r.id);
                        }}
                        className={cn(
                          "h-9 px-3 rounded-2xl text-white transition text-xs font-semibold",
                          acting ? "bg-emerald-600/70 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                        )}
                        disabled={acting}
                      >
                        {acting ? "..." : "Verifikoje"}
                      </button>
                    ) : (
                      <span className="inline-flex items-center h-9 px-3 rounded-2xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold">
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
            <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {open.fullName || "—"} • {open.department || "—"}
                  </div>
                  <div className="text-[12px] text-slate-500 truncate">
                    {open.createdAt ? new Date(open.createdAt).toLocaleString() : "—"} • Status:{" "}
                    <span className="font-semibold text-slate-700">{statusLabel(open.status)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="h-10 w-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition grid place-items-center"
                  aria-label="Mbyll"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path
                      d="M6 6l12 12M18 6 6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-[11px] text-slate-500">Punëtori</div>
                    <div className="text-sm font-semibold text-slate-900 mt-1">{open.fullName || "—"}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-[11px] text-slate-500">Departamenti</div>
                    <div className="text-sm font-semibold text-slate-900 mt-1">{open.department || "—"}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-[11px] text-slate-500">Data</div>
                    <div className="text-sm font-semibold text-slate-900 mt-1">{open.date || "—"}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-[11px] text-slate-500">Time left</div>
                    <div className="text-sm font-semibold text-slate-900 mt-1">{open.timeLeft || "—"}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-[11px] text-slate-500">Arsye</div>
                  <div className="text-sm text-slate-900 mt-2 whitespace-pre-wrap break-words">
                    {open.reason || "—"}
                  </div>
                </div>

                
              </div>

              <div className="px-5 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="h-11 px-5 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
                  disabled={acting}
                >
                  Mbyll
                </button>

                {statusLabel(open.status) !== "reviewed" ? (
                  <button
                    type="button"
                    onClick={() => markReviewed(open.id)}
                    className={cn(
                      "h-11 px-5 rounded-2xl text-white transition text-sm font-semibold",
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
                    "h-11 px-5 rounded-2xl border transition text-sm font-semibold",
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

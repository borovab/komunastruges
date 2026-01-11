// src/pages/User/UserDashboard/UserDashboard.jsx
import React from "react";
import { api } from "../../../lib/api";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

function statusLabel(s) {
  const v = String(s || "").trim().toLowerCase();
  if (v === "submitted") return "pending";
  return v || "—";
}

export default function UserDashboard() {
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");

  const [department, setDepartment] = React.useState("");
  const [date, setDate] = React.useState("");
  const [timeLeft, setTimeLeft] = React.useState("");
  const [reason, setReason] = React.useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await api.getReports();
      setReports(r.reports || []);
    } catch (e) {
      setErr(e?.message || "Gabim");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOkMsg("");
    try {
      await api.createReport({ department, date, timeLeft, reason });
      setDepartment("");
      setDate("");
      setTimeLeft("");
      setReason("");
      setOkMsg("Raporti u dërgua me sukses.");
      await load();
    } catch (e2) {
      setErr(e2?.message || "Gabim");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Raporto dalje më herët</h2>
          <p className="text-sm text-slate-500 mt-1">Plotëso raportin dhe shiko raportet e tua.</p>
        </div>

        <button
          type="button"
          onClick={load}
          className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
        >
          Rifresko
        </button>
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

      {/* Form card */}
      <form
        onSubmit={submit}
        className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="text-sm font-semibold text-slate-900">Dërgo raportim</div>
          <div className="text-[12px] text-slate-500">Plotëso fushat poshtë.</div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Drejtoria/Sektori (opsionale)
              </label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder="p.sh. IT"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Ora e daljes</label>
              <input
                type="time"
                value={timeLeft}
                onChange={(e) => setTimeLeft(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Arsyeja</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[110px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="Shkruaj arsyen..."
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            className={cn(
              "h-11 px-5 rounded-2xl text-white transition text-sm font-semibold",
              loading ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            )}
            type="submit"
            disabled={loading}
          >
            {loading ? "Duke dërguar…" : "Dërgo raportin"}
          </button>
        </div>
      </form>

      {/* My reports */}
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Raportet e mia</div>
            <div className="text-[12px] text-slate-500">{reports.length} raporte</div>
          </div>
          {loading ? <div className="text-sm text-slate-500">Loading…</div> : null}
        </div>

        {!loading && reports.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">S’ka raporte ende.</div>
        ) : null}

        {!loading && reports.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-white">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-semibold w-[70px]">#</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Ora e daljes</th>
                  <th className="px-4 py-3 font-semibold">Arsye</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Sektori</th>
                  <th className="px-4 py-3 font-semibold">Krijuar</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {reports.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-slate-700">{r.date || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{r.timeLeft || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="truncate max-w-[560px]">{r.reason || "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center h-7 px-3 rounded-2xl text-xs font-semibold border",
                          statusLabel(r.status) === "reviewed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.department || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}

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

function formatReason(r) {
  const choice = String(r?.reasonChoice || r?.reason || "").trim();
  const text = String(r?.reasonText || "").trim();
  if (text) return choice ? `${choice} - ${text}` : text;
  return choice || "—";
}

function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const REASONS = ["Detyrë zyrtare", "Dalje në terren", "Pushim personal", "Arsye shëndetësore", "Tjetër"];

export default function ManagerReports() {
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");
  const [reports, setReports] = React.useState([]);

  const [open, setOpen] = React.useState(null);
  const [acting, setActing] = React.useState(false);

  // ✅ manager can create report
  const [createOpen, setCreateOpen] = React.useState(false);
  const [cDate, setCDate] = React.useState(todayYMD());
  const [cTimeOut, setCTimeOut] = React.useState("");
  const [cTimeReturn, setCTimeReturn] = React.useState("");
  const [cReasonChoice, setCReasonChoice] = React.useState("");
  const [cReasonText, setCReasonText] = React.useState("");
  const [cRaport, setCRaport] = React.useState(""); // ✅ NEW (opsionale)

  const resetCreate = () => {
    setCDate(todayYMD());
    setCTimeOut("");
    setCTimeReturn("");
    setCReasonChoice("");
    setCReasonText("");
    setCRaport(""); // ✅ NEW
  };

  const load = async () => {
    setLoading(true);
    setErr("");
    setOkMsg("");
    try {
      const res = await api.listReports(); // backend e filtron per departamentin e manager-it
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

  const closeCreate = () => {
    setCreateOpen(false);
    setActing(false);
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

  const createReport = async (e) => {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    if (!cReasonChoice) return setErr("Zgjidh arsyen.");
    if (!cDate) return setErr("Zgjidh datën.");
    if (!cTimeOut) return setErr("Zgjidh orën e daljes.");

    setActing(true);
    try {
      await api.createReport({
        reasonChoice: cReasonChoice,
        reasonText: cReasonText,
        ...(cRaport ? { raport: cRaport } : {}), // ✅ NEW (opsionale)
        date: cDate,
        timeOut: cTimeOut,
        ...(cTimeReturn ? { timeReturn: cTimeReturn } : {}), // ✅ ora e kthimit opsionale
      });

      setOkMsg("Raporti u dërgua me sukses.");
      resetCreate();
      closeCreate();
      await load();
    } catch (e2) {
      setErr(e2?.message || "Gabim");
      setActing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Manager • Raportimet</h2>
          <p className="text-[12px] sm:text-sm text-slate-500 mt-1">
            Shfaq raportimet e punëtorëve të departamentit tënd.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setErr("");
              setOkMsg("");
              setCreateOpen(true);
            }}
            className="h-10 w-full sm:w-auto px-4 rounded-xl sm:rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition text-[13px] font-semibold"
          >
            Shto raport
          </button>

          <button
            type="button"
            onClick={load}
            className="h-10 w-full sm:w-auto px-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] font-semibold"
          >
            Rifresko
          </button>
        </div>
      </div>

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

      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl sm:rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold">
              R
            </span>
            <div className="leading-tight min-w-0">
              <div className="text-[13px] sm:text-sm font-semibold text-slate-900">Lista e raportimeve</div>
              <div className="text-[11px] sm:text-[12px] text-slate-500">{reports.length} raportime</div>
            </div>
          </div>

          {loading ? <div className="text-[12px] sm:text-sm text-slate-500">Loading…</div> : null}
        </div>

        {!loading && reports.length === 0 ? (
          <div className="p-5 sm:p-6 text-[13px] sm:text-sm text-slate-500">S’ka raportime.</div>
        ) : null}

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
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Raport</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Status</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Departamenti</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Krijuar</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-right">Veprime</th>
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
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-500">{idx + 1}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-slate-900">{r.fullName || "—"}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">{r.date || "—"}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">{r.timeOut || "—"}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">{r.timeReturn || "—"}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">
                    <div className="truncate max-w-[220px] sm:max-w-[360px]">{formatReason(r)}</div>
                  </td>

                  {/* ✅ NEW */}
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">
                    <div className="truncate max-w-[220px] sm:max-w-[360px]">{r.raport || "—"}</div>
                  </td>

                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">{statusLabel(r.status)}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">
                    {r.departmentName || r.department || "—"}
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

      {/* ✅ Create Report Modal (mobile bottom-sheet + dvh + flex body scroll) */}
      {createOpen ? (
        <div className="fixed inset-0 z-[999]">
          <div className="absolute inset-0 bg-black/40" onClick={closeCreate} />
          <div
            className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-3"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <form
              onSubmit={createReport}
              className="w-full sm:max-w-3xl rounded-t-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-none"
            >
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-sm font-semibold text-slate-900 truncate">Shto raport (Manager)</div>
                  <div className="text-[11px] sm:text-[12px] text-slate-500 truncate">
                    Plotëso fushat dhe dërgo raportin.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeCreate}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition grid place-items-center"
                  aria-label="Mbyll"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 overflow-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-2">Data</label>
                    <input
                      type="date"
                      value={cDate}
                      onChange={(e) => setCDate(e.target.value)}
                      className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-2">Ora e daljes</label>
                    <input
                      type="time"
                      value={cTimeOut}
                      onChange={(e) => setCTimeOut(e.target.value)}
                      className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-2">
                      Ora e kthimit (opsionale)
                    </label>
                    <input
                      type="time"
                      value={cTimeReturn}
                      onChange={(e) => setCTimeReturn(e.target.value)}
                      className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-2">Arsyeja e daljes</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {REASONS.map((r) => (
                      <label
                        key={r}
                        className={cn(
                          "flex items-center gap-3 rounded-xl sm:rounded-2xl border px-3 py-2 text-[13px] sm:text-sm cursor-pointer transition",
                          cReasonChoice === r
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        )}
                      >
                        <input
                          type="radio"
                          name="reasonChoiceManager"
                          checked={cReasonChoice === r}
                          onChange={() => setCReasonChoice(r)}
                          className="h-4 w-4"
                        />
                        <span className="text-slate-700">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-2">
                    Shënim (opsionale)
                  </label>
                  <textarea
                    value={cReasonText}
                    onChange={(e) => setCReasonText(e.target.value)}
                    className="w-full min-h-[110px] rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="Shkruaj shënim..."
                  />
                </div>

                {/* ✅ NEW */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-2">
                    Raport (opsionale)
                  </label>
                  <textarea
                    value={cRaport}
                    onChange={(e) => setCRaport(e.target.value)}
                    className="w-full min-h-[110px] rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[13px] sm:text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="Shkruaj raport..."
                  />
                </div>
              </div>

              <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreate}
                  className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition text-[13px] sm:text-sm font-semibold"
                  disabled={acting}
                >
                  Mbyll
                </button>

                <button
                  type="submit"
                  className={cn(
                    "h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl text-white transition text-[13px] sm:text-sm font-semibold",
                    acting ? "bg-blue-600/70 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  )}
                  disabled={acting}
                >
                  {acting ? "Duke dërguar…" : "Dërgo raportin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Details Modal */}
      {open ? (
        <div className="fixed inset-0 z-[999]">
          <div className="absolute inset-0 bg-black/40" onClick={closeDetails} />
          <div
            className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-3"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="w-full sm:max-w-3xl rounded-t-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden max-h-[85dvh] sm:max-h-none flex flex-col">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-sm font-semibold text-slate-900 truncate">
                    {open.fullName || "—"} • {open.departmentName || open.department || "—"}
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

              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 overflow-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4">
                    <div className="text-[10px] sm:text-[11px] text-slate-500">Punëtori</div>
                    <div className="text-[13px] sm:text-sm font-semibold text-slate-900 mt-1">{open.fullName || "—"}</div>
                  </div>

                  <div className="rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4">
                    <div className="text-[10px] sm:text-[11px] text-slate-500">Departamenti</div>
                    <div className="text-[13px] sm:text-sm font-semibold text-slate-900 mt-1">
                      {open.departmentName || open.department || "—"}
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

                {/* ✅ NEW */}
                <div className="rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4">
                  <div className="text-[10px] sm:text-[11px] text-slate-500">Raport</div>
                  <div className="text-[13px] sm:text-sm text-slate-900 mt-2 whitespace-pre-wrap break-words">
                    {open.raport ? String(open.raport) : "—"}
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
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
